# Smart Energy Hub - Live Energy Monitoring System

Includes an example ESP32 sketch (`esp32_supabase.ino`) that collects voltage/current data and posts it to the Supabase `readings` table.

A real-time IoT-based smart energy monitoring system with AI-powered insights, built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or **Bun** runtime
- **Internet connection** (for Supabase)
- **Port 8080** available

### Installation & Setup

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd smart-energy-hub

# 2. Install dependencies
npm install
# OR with Bun:
bun install

# 3. Verify setup (checks environment variables)
node verify-setup.js

# 4. Start development server
npm run dev
```

The app will be available at: **http://localhost:8080**

---

## ⚠️ Important: Environment Configuration

Before starting the app, ensure `.env` file is properly configured:

```env
VITE_SUPABASE_URL=https://xgczpjvcmtyxauyqqcqi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

**Key requirement:** `VITE_SUPABASE_PUBLISHABLE_KEY` must be a JWT token (starts with `eyJ`), not a key starting with `sb_publishable_`.

> **Not sure?** Run `node verify-setup.js` to check automatically!

---

## �️ Backend Setup

The project uses Supabase as its backend. After creating a new Supabase project you should apply the SQL migrations stored under `supabase/migrations/`:

```bash
# make sure you have the Supabase CLI installed: https://supabase.com/docs/guides/cli
supabase login               # authenticate if you haven't already
supabase db push             # run all pending migrations (including the `readings` table)
```

The `readings` table is automatically created by the newest migration and contains the fields required for the ESP32 data flow. Row Level Security policies allow anonymous inserts and public reads.

## 🔧 Troubleshooting


### "Failed to Fetch" Errors?

The most common causes and fixes:

1. **Wrong API key format** → Run `node verify-setup.js`
2. **Port 8080 in use** → Kill the process or use `VITE_PORT=8081 npm run dev`
3. **Supabase offline** → Check https://supabase.com/status
4. **Network/firewall** → Check DevTools Network tab for blocked requests

**For detailed help**, see **[SETUP_AND_TROUBLESHOOTING.md](./SETUP_AND_TROUBLESHOOTING.md)**

---

## 📁 Project Structure

## 📊 Static Telemetry Dashboard
A simple standalone HTML dashboard is available at `public/dashboard.html`. It illustrates how you can read
from the `telemetry` table using the Supabase REST API without running the React app.

1. Copy the file to a server (or open it locally with a web server).
2. Replace `YOUR_PROJECT_ID` and `YOUR_ANON_PUBLIC_KEY` in the `<script>` block with your
   actual Supabase project URL and anon key.
3. The page will show the latest voltage/meter readings and a 10‑point line chart.

The design is responsive, mobile‑friendly, and updates every 5 seconds.

## 📁 Project Structure

```
src/
├── integrations/supabase/    ← Supabase client & configuration
├── contexts/AuthContext.tsx  ← Authentication & user state
├── components/
│   ├── ChatBot.tsx          ← AI chat assistant
│   ├── EnergyCharts.tsx     ← Energy consumption charts
│   └── ...                   ← Other dashboard components
├── pages/                    ← Page routes
└── lib/                      ← Utilities & helpers
```

---

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build locally
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code quality
```

---

## 📋 Features

- ✅ **Real-time Energy Monitoring** - Live voltage, current, power, and energy readings (data stored in Supabase `readings` table)
- ✅ **ESP32 Edge Device** - Example sketch included (`esp32_supabase.ino`) that posts sensor data to Supabase over Wi‑Fi
- ✅ **AI Chat Assistant** - Get energy insights and recommendations
- ✅ **Cost & Carbon Tracking** - Monitor billing and environmental impact
- ✅ **Device Status** - Track connected IoT devices (ESP32, PZEM)
- ✅ **Energy Analytics** - Charts and historical data analysis
- ✅ **Secure Authentication** - Supabase Auth with PKCE flow
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

---

## 📚 Documentation

- [Setup & Troubleshooting Guide](./SETUP_AND_TROUBLESHOOTING.md) - Detailed configuration and common issues
- [Supabase Docs](https://supabase.com/docs) - Backend documentation
- [Vite Docs](https://vitejs.dev/) - Build tool documentation

---

## 🔗 Key Endpoints

| Service | URL |
|---------|-----|
| **Dev Server** | http://localhost:8080 |
| **Supabase Project** | https://xgczpjvcmtyxauyqqcqi.supabase.co |
| **Chat API** | `^${VITE_SUPABASE_URL}/functions/v1/chat` |

---

## 👨‍💻 Development

### Running Tests
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode
```

### Building for Production
```bash
npm run build        # Creates optimized build in dist/
npm run preview      # Test production build locally
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test them
3. Commit with clear messages: `git commit -m "Add feature X"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## ⚡ Recent Updates

✅ Fixed "Failed to Fetch" errors with proper environment configuration
✅ Enhanced CORS settings for development
✅ Improved error handling and diagnostics
✅ Added setup verification script
✅ Updated documentation with troubleshooting guide

---

## 📞 Support

- **Issues?** Check [SETUP_AND_TROUBLESHOOTING.md](./SETUP_AND_TROUBLESHOOTING.md)
- **Need help?** Run `node verify-setup.js` for diagnostic info
- **Report bugs** via GitHub Issues

---

## 📄 Original Project Info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Setting up Supabase ⚡

This app relies on a Supabase backend. ensure you have the following environment variables defined in a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-or-publishable-key>
# optional for testing/debugging
VITE_SUPABASE_TEST_URL=
VITE_SUPABASE_TEST_KEY=
```

The code will validate these values at startup and print diagnostics to the browser console. In development you can also run the network helper function:

```js
// in browser console
window.diagnoseSupabase && window.diagnoseSupabase();
```

If you encounter connection problems, check the logs for errors and verify the `.env` values.  

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
