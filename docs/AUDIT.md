# Review of YODEX_230M_18D_Allocations (23 Oct 2026)

This is an internal code review of the uploaded package, not an independent security audit. The contracts still need a professional audit before they hold anything of value.

## Verdict

The 230,000,000 YDXT / 18-decimal allocation logic is correct. The six allocations add up exactly to the supply (230,000,000 is divisible by 100, so there's no rounding dust). Zero and duplicate wallets are rejected, and there is no way to mint more later. The package had one failing test, docs that contradicted the code, and a web folder that would have rolled back the new dashboard design. All three are fixed in this merge.

## How it was checked

- `forge test` with solc 0.8.24, as pinned in `foundry.toml`. Before the fixes: **6 passed, 1 failed**. After: **10 passed, 0 failed**.
- `forge script script/Deploy.s.sol:Deploy` simulated locally with six test wallet addresses. All five contracts deployed.
- `wrangler dev`: `/api/health` and `/api/config` return the expected JSON, unknown `/api/*` routes return 404, and the security headers are served.
- Every file was read line by line.

## Findings

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | High (process) | `testOnlyOwnerExecution` always failed. It called `execute()` with empty calldata on the token, which has no fallback, so the call reverted. | Fixed: the test now does a real token transfer through the account and checks that a non-owner can't call `execute()`. |
| 2 | Medium | The docs contradicted the code. `SECURITY.md` said the token has a "privileged minter". `ARCHITECTURE.md` and the README said "admin-mintable". `TOKENOMICS.md` said "all minted to treasury" and "allocations NOT specified". The code has no minter and splits the supply across six wallets. | Fixed in `docs/` (ARCHITECTURE renamed to `ONCHAIN.md`). |
| 3 | Medium | `web/public` contained the old blue design (`app.js` and `style.css` byte-identical to the pre-redesign files). Copying it in would have reverted the live dashboard. | Not copied. The Base Sepolia connect feature was ported into the new design's Smart Wallet page instead. |
| 4 | Medium | `web/` was set up for Cloudflare **Pages** (`pages_build_output_dir`, Pages Functions, project `yodex-demo`). The live site runs as a Cloudflare **Worker** with static assets, where Pages Functions don't run. | `/api/health` and `/api/config` were moved into `src/worker.js` and wired into `wrangler.jsonc`. |
| 5 | Medium | The CSP in `web/public/_headers` added `script-src 'unsafe-inline'`, which isn't needed and weakens XSS protection. | Not adopted. The existing strict CSP is kept and the page works under it. |
| 6 | Low | The deploy instructions pass `--private-key` on the command line, which leaves the key in shell history. | Docs and script comment now use an encrypted keystore (`--account`). |
| 7 | Info | The token has no `name`/`symbol` change path, no pause and no blacklist. That suits a fixed-supply token, but **key custody of the six wallets is the whole risk**. Use multisigs (e.g. Safe) for treasury, liquidity and pre-sale. | Noted in `SECURITY.md`. |
| 8 | Info | `YodexFactory.create` can be called by anyone for any owner and salt. A third party can pre-deploy a user's account, which then makes the user's own `create` revert. Funds are not at risk, because the owner is still the intended owner. | Unchanged. Consider making `create` idempotent before production. |
| 9 | Info | `approve` has the standard ERC-20 allowance-change race. `YodexAccount.transferOwnership` is single-step and emits no event. `YodexSwapAdapter` admin is immutable. | Unchanged. Acceptable for a testnet prototype; revisit before production. |
| 10 | Legal | A 15% "public pre-sale" allocation exists, but there is no sale contract, vesting, eligibility check or refund path. In the UK, promoting a cryptoasset sale is a regulated financial promotion. | `TOKENOMICS.md` and the dashboard state that the pre-sale is not live and needs FCA-compliant approval. |

## Allocation check

| Wallet | Share | YDXT | Raw units (×10¹⁸) |
|---|---:|---:|---:|
| Liquidity | 30% | 69,000,000 | 69,000,000 × 10¹⁸ |
| Community | 15% | 34,500,000 | 34,500,000 × 10¹⁸ |
| Treasury | 25% | 57,500,000 | 57,500,000 × 10¹⁸ |
| Development | 10% | 23,000,000 | 23,000,000 × 10¹⁸ |
| Team | 5% | 11,500,000 | 11,500,000 × 10¹⁸ |
| Public pre-sale | 15% | 34,500,000 | 34,500,000 × 10¹⁸ |
| **Total** | **100%** | **230,000,000** | **2.3 × 10²⁶** |

The test suite checks each balance and checks that their sum equals `totalSupply()`.
