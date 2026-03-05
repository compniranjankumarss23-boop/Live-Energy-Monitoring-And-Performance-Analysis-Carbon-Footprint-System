#!/usr/bin/env node

/**
 * Smart Energy Hub - Startup Verification Script
 * 
 * Run this before starting the dev server to verify all configurations are correct.
 * Usage: node verify-setup.js
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(type, message) {
  const colors_map = {
    pass: colors.green + "✓" + colors.reset,
    fail: colors.red + "✗" + colors.reset,
    warn: colors.yellow + "⚠" + colors.reset,
    info: colors.blue + "ℹ" + colors.reset,
  };
  console.log(`${colors_map[type] || type} ${message}`);
}

function section(title) {
  console.log(`\n${colors.cyan}═══ ${title} ═══${colors.reset}`);
}

async function verifySetup() {
  let allPassed = true;

  section("ENVIRONMENT VERIFICATION");

  // Check .env file exists
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    log("fail", ".env file not found in project root");
    allPassed = false;
  } else {
    log("pass", ".env file found");

    // Read and check .env contents
    const envContent = fs.readFileSync(envPath, "utf-8");

    // Check VITE_SUPABASE_URL
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
    if (!urlMatch || !urlMatch[1].trim()) {
      log("fail", "VITE_SUPABASE_URL is missing or empty");
      allPassed = false;
    } else {
      const url = urlMatch[1].trim();
      if (!url.startsWith("https://")) {
        log("fail", `VITE_SUPABASE_URL must start with https:// (got: ${url})`);
        allPassed = false;
      } else if (!url.includes(".supabase.co")) {
        log("fail", `VITE_SUPABASE_URL must be a valid Supabase URL (got: ${url})`);
        allPassed = false;
      } else {
        log("pass", `VITE_SUPABASE_URL: ${url}`);
      }
    }

    // Check VITE_SUPABASE_PUBLISHABLE_KEY format
    const keyMatch = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.+)/);
    if (!keyMatch || !keyMatch[1].trim()) {
      log("fail", "VITE_SUPABASE_PUBLISHABLE_KEY is missing or empty");
      allPassed = false;
    } else {
      const key = keyMatch[1].trim();
      if (!key.startsWith("eyJ")) {
        log(
          "fail",
          `VITE_SUPABASE_PUBLISHABLE_KEY must be a JWT token (starts with 'eyJ'). Current format: '${key.substring(0, 15)}...'`
        );
        log("warn", "Expected format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
        allPassed = false;
      } else if (key.includes("sb_publishable_")) {
        log(
          "fail",
          "VITE_SUPABASE_PUBLISHABLE_KEY has wrong format (sb_publishable_* is not a valid anon key)"
        );
        allPassed = false;
      } else if (key.length < 100) {
        log("warn", `VITE_SUPABASE_PUBLISHABLE_KEY seems too short (${key.length} chars, expected 200+)`);
      } else {
        log("pass", `VITE_SUPABASE_PUBLISHABLE_KEY format: valid JWT (${key.length} chars)`);
      }
    }
  }

  section("DEPENDENCIES CHECK");

  // Check package.json exists
  const pkgPath = path.join(__dirname, "package.json");
  if (!fs.existsSync(pkgPath)) {
    log("fail", "package.json not found");
    allPassed = false;
  } else {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

      // Check critical dependencies
      const criticalDeps = ["@supabase/supabase-js", "react", "react-router-dom"];
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      let depsOk = true;
      criticalDeps.forEach((dep) => {
        if (deps[dep]) {
          log("pass", `${dep}: ${deps[dep]}`);
        } else {
          log("fail", `${dep} is missing from dependencies`);
          depsOk = false;
        }
      });

      if (!depsOk) allPassed = false;

      // Check node_modules
      if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
        log("warn", "node_modules directory not found. Run 'npm install' first");
      } else {
        log("pass", "node_modules directory found");
      }
    } catch (e) {
      log("fail", `Error reading package.json: ${e.message}`);
      allPassed = false;
    }
  }

  section("CONFIGURATION FILES");

  // Check vite.config.ts
  if (fs.existsSync(path.join(__dirname, "vite.config.ts"))) {
    log("pass", "vite.config.ts found");
  } else {
    log("fail", "vite.config.ts not found");
    allPassed = false;
  }

  // Check src/integrations/supabase/client.ts
  if (fs.existsSync(path.join(__dirname, "src/integrations/supabase/client.ts"))) {
    log("pass", "src/integrations/supabase/client.ts found");
  } else {
    log("fail", "src/integrations/supabase/client.ts not found");
    allPassed = false;
  }

  // Check vite-env.d.ts
  if (fs.existsSync(path.join(__dirname, "src/vite-env.d.ts"))) {
    log("pass", "src/vite-env.d.ts found");
  } else {
    log("warn", "src/vite-env.d.ts not found (Vite types may be missing)");
  }

  section("PORT AVAILABILITY");

  // Check if port 8080 is mentioned in vite.config.ts
  const viteConfigPath = path.join(__dirname, "vite.config.ts");
  if (fs.existsSync(viteConfigPath)) {
    const viteContent = fs.readFileSync(viteConfigPath, "utf-8");
    if (viteContent.includes("port: 8080")) {
      log("info", "Dev server configured to run on port 8080");
      log("info", "→ App will be available at http://localhost:8080");
    }
  }

  section("SUMMARY & NEXT STEPS");

  if (allPassed) {
    console.log(`\n${colors.green}✓ All checks passed! You're ready to start development.${colors.reset}\n`);
    console.log("Run the following command to start the dev server:\n");
    console.log(`  ${colors.cyan}npm run dev${colors.reset}\n`);
    console.log("Then open your browser to:");
    console.log(`  ${colors.cyan}http://localhost:8080${colors.reset}\n`);
  } else {
    console.log(
      `\n${colors.red}✗ Some issues were found. Please fix them before starting the dev server.${colors.reset}\n`
    );
    console.log("Common fixes:\n");
    console.log("1. If .env is missing or incomplete:");
    console.log(`   cp .env.example .env`);
    console.log("   # Then edit .env with correct values\n");
    console.log("2. If dependencies are missing:");
    console.log(`   npm install\n`);
    console.log("3. For more help, see SETUP_AND_TROUBLESHOOTING.md\n");
  }

  return allPassed ? 0 : 1;
}

// Run verification
verifySetup()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error("Verification script error:", err);
    process.exit(1);
  });
