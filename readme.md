# CoachLeague Website

This is the ready-to-upload static CoachLeague website.

## What is included
- `index.html` — the website
- `styles.css` — design and mobile responsive layout
- `script.js` — search, sorting, copy CA, live DexScreener loading
- `config.js` — edit this file to add Pump.fun links, contract addresses and social links
- `assets/coaches/` — all 48 coach meme images in the correct order

## How to edit Pump.fun links and live prices
Open `config.js`.

For each coach, fill in:

```js
"contract": "PASTE_COACH_CA_HERE",
"pumpfunUrl": "https://pump.fun/coin/PASTE_COACH_CA_HERE",
"dexPairUrl": ""
```

If `contract` is filled, the site will try to fetch live:
- price
- market cap
- 24H volume

via DexScreener in the browser.

The Trade button goes to `pumpfunUrl`. If `pumpfunUrl` is empty but `contract` is filled, it automatically opens:
`https://pump.fun/coin/YOUR_CONTRACT`

## Uploading
Upload all files to your hosting provider exactly as they are. Keep the folder structure the same.

## Important
The website is in English. Country names are in English.
Buyback and burn tracking is not automated because you said updates will be shared manually on X.
