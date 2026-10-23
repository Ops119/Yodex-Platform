# On-chain architecture

Cloudflare Workers static assets host the UI from `public/`; a small Worker (`src/worker.js`) serves the non-sensitive `/api/health` and `/api/config` endpoints. MetaMask EIP-1193 connects to Base Sepolia. Smart contracts are deployed independently via Foundry. The frontend deliberately has no live transaction execution until contracts, addresses, ABIs and audits are ready.

Modules: (1) owner-controlled wallet prototype and CREATE2 factory; (2) swap router allowlist scaffold; (3) escrow-and-cancel order book; (4) 1:1 share vault; (5) fixed-supply ERC-20 test utility token (230,000,000 YDXT, 18 decimals) minted once at deployment across six allocation wallets.

Production target: audited ERC-4337 wallet implementation, session permission validation, audited swap adapter with exact approvals and slippage/deadline checks, oracle-verified order fills, audited ERC-4626 vault, role-governed token emissions, backend indexer and observability.
