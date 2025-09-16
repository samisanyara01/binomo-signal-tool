// server.js
// Simple Express server that fetches 1m data from Yahoo Finance and computes EMA crossover signals.
// Symbols supported: EURUSD, GBPUSD, XAUUSD (mapped to Yahoo symbols).
// Install: npm install express node-fetch@2 cors
// Run: node server.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const LIMIT = 200;

// map friendly symbol to Yahoo Finance symbol
const SYMBOL_MAP = {
  'EURUSD': 'EURUSD=X',
  'GBPUSD': 'GBPUSD=X',
  'XAUUSD': 'XAUUSD=X'
};

function ema(values, period) {
  const k = 2 / (period + 1);
  let emaArray = new Array(values.length).fill(null);
  if (values.length < period) return emaArray;
  // seed with SMA for first EMA value at index period-1
  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  let prev = sum / period;
  emaArray[period-1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = (values[i] - prev) * k + prev;
    emaArray[i] = prev;
  }
  return emaArray;
}

app.get('/signals/:symbol', async (req, res) => {
  try {
    const sym = (req.params.symbol || 'EURUSD').toUpperCase();
    const yahoo = SYMBOL_MAP[sym];
    if (!yahoo) return res.status(400).json({ error: 'Unsupported symbol' });
    // Yahoo Finance chart endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1m&range=1d`;
    const r = await fetch(url, { timeout: 10000 });
    if (!r.ok) return res.status(502).json({ error: 'Failed to fetch data from Yahoo' });
    const j = await r.json();
    const result = j.chart && j.chart.result && j.chart.result[0];
    if (!result) return res.status(502).json({ error: 'No chart data available' });
    const timestamps = result.timestamp || [];
    const indicators = result.indicators || {};
    const quote = indicators.quote && indicators.quote[0];
    if (!quote || !quote.close) return res.status(502).json({ error: 'No close prices' });
    const closes = quote.close.map(v => v === null ? NaN : v).filter(v => !isNaN(v));
    if (closes.length < 30) return res.status(502).json({ error: 'Not enough data points' });

    const emaShort = ema(closes, 8);
    const emaLong = ema(closes, 21);
    const n = closes.length - 1;
    const prevIdx = n - 1;
    const prevShort = emaShort[prevIdx];
    const prevLong = emaLong[prevIdx];
    const currShort = emaShort[n];
    const currLong = emaLong[n];

    let signal = 'neutral';
    if (prevShort != null && prevLong != null && currShort != null && currLong != null) {
      if (prevShort <= prevLong && currShort > currLong) signal = 'buy';
      else if (prevShort >= prevLong && currShort < currLong) signal = 'sell';
      else signal = 'hold';
    }

    res.json({
      symbol: sym,
      yahoo_symbol: yahoo,
      time: new Date().toISOString(),
      lastClose: closes[n],
      signal,
      emaShort: currShort,
      emaLong: currLong
    });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'internal error', detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
