# YODEX production architecture target

**Frontend**: Next.js / React / TypeScript, wagmi + viem, MetaMask SDK. The current MVP is intentionally framework-free.

**Smart account**: Audited ERC-4337-compatible account, factory, module registry, execution and signature validation, account recovery, nonce separation.

**Policy engine**: On-chain session permission validation, function selector and contract allowlists, per-token and cumulative spending caps, deadlines, revocation, emergency controls.

**Swap**: Aggregator adapter with validated quotes, slippage minimums, token allowlists, allowance hygiene and deadline checks.

**Orders**: Off-chain signed intents with on-chain validation, keeper orchestration, cancellation and replay protection.

**Vaults**: ERC-4626 share accounting, strategy manager, risk and liquidity limits, audit and pause policy that preserves withdrawals where safe.

**Data**: Base RPC, indexed contract events, portfolio valuation oracle, durable order store, event reconciliation and observability.

**Deployment**: Base Sepolia (84532) first, then Base Mainnet (8453) after independent audits. Avoid using unaudited demo logic with real funds.

**Compatibility**: An externally connected MetaMask EOA may own a separate ERC-4337 smart account; do not assume custom accounts automatically appear as native MetaMask accounts. Validate supported signing and account APIs for each MetaMask version.
