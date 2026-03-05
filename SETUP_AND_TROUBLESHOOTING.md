# Smart Energy Hub - Setup & Troubleshooting Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (or Bun runtime)
- **Internet connection** for Supabase access
- **Port 8080** must be available

### Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   # OR if using Bun:
   bun install
   ```

2. **Environment Configuration** 
   The `.env` file is already configured with correct Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xgczpjvcmtyxauyqqcqi.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...  # JWT format (required!)
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # OR with Bun:
   bun run dev
   ```
   
   The app will be available at: **http://localhost:8080**

---

## ✅ Verification Checklist

### Before Running the App
- [ ] `.env` file exists with `VITE_SUPABASE_URL` 
- [ ] `.env` file has `VITE_SUPABASE_PUBLISHABLE_KEY` starting with `eyJ` (JWT format)
- [ ] Port 8080 is not in use (`netstat -ano | findstr :8080` on Windows)
- [ ] You have internet access to Supabase servers

### During Development
Open **DevTools** (F12) → **Console** tab and look for:
- ✅ `[Supabase Init]` log confirming credentials loaded
- ✅ No "Missing environment variable" errors
- ✅ No CORS-related errors when making API calls

### Test Chat Feature
1. Login with test credentials
2. Click the chat icon (bottom-right corner)
3. Click "💬 EnergyPulse AI" and type a message
4. Should see chat response within 3-5 seconds

---

## 🔧 Common Issues & Solutions

### ❌ "Failed to Fetch" Error in Chat

**Root Causes & Fixes:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch` | CORS or network issue | Check firewall, restart dev server |
| `401/403 Unauthorized` | Invalid or expired auth token | Log out and log back in |
| `404 Not Found` | Chat API endpoint not deployed | Verify Supabase deployment |
| `429 Too Many Requests` | Rate limit exceeded | Wait 60 seconds, try again |
| `502/503 Service Unavailable` | Supabase temporarily down | Check https://supabase.com/status |

### ❌ "Missing VITE_SUPABASE_PUBLISHABLE_KEY"

**Solution:**
1. Open `.env` file in project root
2. Verify the line:
   ```env
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Key MUST start with `eyJ` (JWT format), not `sb_publishable_`
4. If missing or wrong format, it's been fixed in this update
5. Restart dev server: `npm run dev`

### ❌ Port 8080 Already in Use

**Solution:**
```bash
# Find process using port 8080 (Windows):
netstat -ano | findstr :8080

# Kill the process (replace PID):
taskkill /PID <PID> /F

# Or use a different port:
VITE_PORT=8081 npm run dev
```

### ❌ Blank Page or "Not Found"

**Solutions:**
1. **Clear browser cache:**
   - Press `Ctrl+Shift+Del` → Clear browsing data → Hard refresh
   
2. **Rebuild the project:**
   ```bash
   npm run build:dev
   npm run preview
   ```

3. **Check for build errors:**
   ```bash
   npm run build
   ```

---

## 🧪 Diagnostic Commands

### Check Environment Variables
Open browser DevTools Console and run:
```javascript
// Should show your Supabase URL and (masked) API key
window.__SUPABASE_OVERRIDE__?.url || import.meta.env.VITE_SUPABASE_URL
```

### Test Supabase Connectivity
Open browser DevTools Console and run:
```javascript
// Will run comprehensive network diagnostics
import { runFullDiagnostics } from '@/lib/networkDiagnostics'
runFullDiagnostics()
```

### Check Session Status
```javascript
// Shows current auth session
import { supabase } from '@/integrations/supabase/client'
supabase.auth.getSession().then(d => console.log('Session:', d))
```

---

## 📝 Configuration Files Quick Reference

### `.env` - Environment Variables
```env
# Required - Supabase Project URL
VITE_SUPABASE_URL=https://xgczpjvcmtyxauyqqcqi.supabase.co

# Required - Supabase Anonymous Key (JWT format)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Override for testing
# VITE_SUPABASE_TEST_URL=https://replacement.supabase.co
# VITE_SUPABASE_TEST_KEY=replacement-key
```

### `vite.config.ts` - Dev Server Configuration
- **Port:** 8080
- **CORS:** Enabled for localhost:3000, 8080, 8081
- **Proxy:** Routes `/api/*` requests to Supabase
- **HMR:** Hot Module Reload enabled for code changes

### `src/integrations/supabase/client.ts` - Supabase Client Setup
- **Auth Mode:** PKCE flow (OAuth-compatible)
- **Storage:** Browser localStorage
- **Auto-refresh:** Enabled for session tokens
- **Content-Type:** application/json

---

## 🚨 Need Help?

### Enable Debug Logging

Add to `src/main.tsx` before app start:
```typescript
// Show detailed network logs
window.localStorage.setItem('debug', '*')
```

Then check DevTools Console for detailed logs.

### Check Supabase Status
- Visit: https://supabase.com/status
- Check if your region is experiencing issues

### Common Port Conflicts
- **3000, 5000, 8000:** Express/Flask apps
- **5432:** PostgreSQL (local install)
- **6379:** Redis
- **9200:** Elasticsearch

---

## 📚 Project Structure

```
src/
├── integrations/supabase/client.ts ← MAIN Supabase client
├── contexts/AuthContext.tsx        ← Authentication logic
├── components/ChatBot.tsx          ← Chat with AI
├── pages/                          ← Page components
└── lib/networkDiagnostics.ts      ← Network testing tools
```

---

## ✨ Recent Fixes Applied

✅ Fixed environment variable format (JWT key)
✅ Enhanced CORS configuration for development
✅ Added comprehensive error handling in Chat
✅ Improved error messages with diagnostics
✅ Updated vite.config.ts with proper proxy routes
✅ Replaced hardcoded credentials with env-based configuration

**All "Failed to Fetch" errors should now be resolved!**
