require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { fetchAndSaveDeals } = require('./jobs/fetchDeals');
const dealsRouter = require('./routes/deals');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/deals', dealsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual refresh — call this from a browser or curl to force a new fetch
app.post('/api/refresh', async (req, res) => {
  try {
    const deals = await fetchAndSaveDeals();
    res.json({ success: true, count: deals.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Every night at 02:00 — fetch fresh deals automatically
cron.schedule('0 2 * * *', () => {
  console.log('[cron] Nightly deal fetch starting...');
  fetchAndSaveDeals().catch(console.error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Donnie Discount API running on port ${PORT}`);
  // Fetch on startup so deals.json is never empty
  await fetchAndSaveDeals().catch(console.error);
});

// Deploy to Railway / Render:
// 1. Push this backend/ folder to its own repo (or monorepo subfolder)
// 2. Set env vars: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
//    and optionally BOL_CLIENT_ID, BOL_CLIENT_SECRET
// 3. Start command: node server.js
// 4. Copy the public URL into the app's EXPO_PUBLIC_API_URL env var