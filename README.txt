Binomo Signal Tool
===================

Yeh ek simple ready-to-run tool hai jo 1-minute candles se EMA(8) aur EMA(21) crossover signals banata hai.
Maqsad: aapko **manual** trading signals dikhana — Binomo pe automatically trade nahi karta.

Supported symbols:
- EURUSD (currency)
- GBPUSD (currency)
- XAUUSD (Gold)

Instructions (local):
1. Node.js install karein (v14+ recommended).
2. Folder me jaake:
   npm install
3. Server start karein:
   node server.js
4. Browser me open karein:
   http://localhost:3000
5. Symbol select karein aur signals dekhein. Ye tool Yahoo Finance se data fetch karta hai as price source.

Notes & warnings:
- Ye tool sirf signals provide karta hai — financial advice nahi.
- Binomo ke charts thode different ho sakte hain — hamesha pehle paper-trade/check karen.
- Agar Yahoo endpoint block ho ya data na milay, aapko apni preferred data source ka integration karna padega.

File list in zip:
- server.js
- package.json
- public/index.html
- README.txt (yehi file)

