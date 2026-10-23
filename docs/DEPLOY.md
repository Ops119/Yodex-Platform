# Deployment guide

## Cloudflare (Workers static assets)

1. `npm install`, then `npx wrangler login`.
2. `npm run dev` serves `public/` plus the `/api/*` Worker locally.
3. `npm run deploy` runs `wrangler deploy` using `wrangler.jsonc` (Worker name `yodex-platform`).
4. With Git connected (Workers Builds), every merge to `main` deploys automatically. No build command is needed.
5. Map a custom domain under the Worker's Domains & Routes. HTTPS is managed by Cloudflare.

## Base Sepolia

Chain ID 84532; RPC `https://sepolia.base.org`; explorer `https://sepolia.basescan.org`. Get test ETH from an established faucet. Run `cd contracts && forge test`. Set the six `*_WALLET` variables from `.env.example` (six distinct addresses, ideally multisigs). Import a testnet-only signer into an encrypted keystore with `cast wallet import yodex-testnet --interactive`, then run `forge script script/Deploy.s.sol:Deploy --rpc-url "$BASE_SEPOLIA_RPC_URL" --broadcast --account yodex-testnet`. Avoid `--private-key`, which leaves the key in shell history. Record and verify the deployed addresses, then add them to `src/worker.js` (`/api/config`). Review before broadcasting. Do not put private keys in source or frontend.

## Production gate

Replace all prototype contracts with audited implementations and wire actual ABI calls, contract addresses, indexer, wallet permissions, monitoring, and transaction simulation before mainnet. No mainnet deployment is supported by this package.
