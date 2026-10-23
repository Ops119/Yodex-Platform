# Security / outstanding work

**UNAUDITED. TESTNET EDUCATIONAL USE ONLY.** This repo intentionally does not implement ERC-4337, real swaps, oracle-priced fills, or yield vaults. The ERC-20 utility token has no minter: the full 230,000,000 YDXT supply is minted once at deployment across six wallets, so wallet key custody (ideally multisig) is the main token risk. The account owner can call arbitrary external contracts and has no social recovery. Vault assumes plain ERC-20 semantics; tokens with rebasing, hooks, or blacklisting are unsupported. Never use for real-value custody.

Before launch: formal threat model; OpenZeppelin audited dependencies; access-control review; comprehensive invariant/fuzz/property tests; fee-on-transfer/rebasing behavior tests; malicious ERC-20 simulations; independent audits; immutable or timelocked upgrade governance; restricted automation permissions; on-chain price/slippage protections; incident response; and legal review of token distribution.
