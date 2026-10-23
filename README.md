# YODEX — Dashboard and Base Sepolia prototypes

A Cloudflare Pages-ready version of the YODEX browser-only MVP. The deployable directory is `public/`.

## Quick deploy without CLI

1. Sign in to Cloudflare and open **Workers & Pages**.
2. Create a **Pages** project using **Direct Upload**.
3. Upload the **contents of `public/`** (or zip `public/` itself as appropriate to the upload UI). Make sure `index.html` is at the published root.
4. Open the assigned `*.pages.dev` URL over HTTPS.

## Git deployment

Push this folder to a GitHub repository, then connect it as a Pages project. Set:
- Framework preset: **None**
- Build command: **none** (leave empty)
- Build output directory: **public**
- Root directory: repository root (or this folder if within a monorepo)

## CLI deployment

Requires Node.js and Cloudflare login:

```sh
npm install
npx wrangler login
npm run dev
npm run deploy
```

`npm run deploy` runs `wrangler deploy`, which publishes `public/` as Worker static assets using `wrangler.jsonc`. Cloudflare's Git integration (Workers Builds) runs the same command. There is no `_redirects` file: `/` serves `public/index.html` by default, and a `/ /index.html` rule is rejected as an infinite loop.

## Design (v2 redesign)

- Black / grey / mint palette, UK-first: GBP display by default (USD toggle), en-GB number and date formats, British spelling.
- Persistent FCA-style high-risk cryptoasset warning strip with a 2-minute risk summary screen. This is demo wording: have it reviewed by a compliance adviser before any real UK financial promotion.
- Responsive: sidebar on desktop, sticky top bar and bottom tab bar on phones (safe-area aware, 16px inputs to avoid iOS zoom).
- System font stack only, so no Google Fonts request (the previous `@import` was blocked by the CSP anyway) and no third-party data transfer.
- GBP values use a fixed illustrative rate (`FX` in `app.js`), not live FX.

## Notes

- Static HTML, CSS and JavaScript. No server, database, Worker secrets, or API tokens required.
- MetaMask connection uses an injected wallet provider when available; test in a browser with MetaMask installed. HTTPS via Pages supports secure-context requirements.
- `public/_headers` applies security headers. The CSP deliberately prevents external scripts and network requests; update it carefully if adding third-party wallet SDKs, RPC calls, analytics, or live API integrations.
- The dashboard, swaps, orders, vaults and permissions are simulations using browser `localStorage`; data is device/browser-specific.
- The demo does **not** create an ERC-4337 smart account, transfer assets, send real transactions, or execute DeFi contracts.
- No real funds should be entrusted to this demo.

## Files

- `public/index.html` — application entry point
- `public/style.css` — styling
- `public/app.js` — demo interactions
- `public/_headers` — Pages response headers
- `wrangler.jsonc` — Workers static-assets config (deploys `public/`)
- `public/favicon.svg` — app icon
- `package.json` — optional local development and CLI deployment
- `src/worker.js` — `/api/health` and `/api/config` endpoints
- `contracts/` — Solidity prototypes, Foundry tests and deploy script
- `.env.example` — Base Sepolia RPC and the six allocation wallet variables
- `docs/ARCHITECTURE.md` — architecture notes

## On-chain prototypes (Base Sepolia, unaudited)

`contracts/` holds Solidity prototypes and Foundry tests: an owner-controlled contract wallet with a CREATE2 factory, a 1:1 share vault, an escrow-and-cancel order book, a swap-router allowlist scaffold, and the **YDXT** test token.

- **YDXT:** 230,000,000 fixed supply with 18 decimals, minted once at deployment across six distinct wallets: 30% liquidity, 25% treasury, 15% community, 15% public pre-sale, 10% development and 5% team. There is no mint, burn, vesting or sale contract. See `docs/TOKENOMICS.md`.
- **Test:** `cd contracts && forge test` (10 tests).
- **Deploy (testnet only):** see `docs/DEPLOY.md`. Nothing has been deployed, and `/api/config` returns `null` contract addresses until it is.
- **Status:** the contracts are unaudited and must not hold real value. See `docs/SECURITY.md` and `docs/ONCHAIN.md`.

The Smart Wallet page can connect MetaMask to Base Sepolia and shows the YDXT allocation. Swaps, orders and vaults in the dashboard remain browser simulations. `src/worker.js` serves `/api/health` and `/api/config`.
