# YODEX Tokenomics — testnet specification

| Parameter | Value |
|---|---|
| Testnet name | YODEX Test Utility |
| Testnet symbol | YDXT |
| Network | Base Sepolia (84532) |
| Whole-token fixed supply | 230,000,000 |
| Decimals | 18 |
| Smallest unit | 10^-18 YDXT |
| Raw total supply | 230000000000000000000000000 |
| Minting | All minted at deployment, split across six allocation wallets |
| Future minting | Disabled |
| Transferability | Standard ERC-20-style transfer/approval |

**Security:** unaudited, testnet-only token implementation. 18 decimals is widely supported, but integrations still require testing before production.

**Frontend:** use token `decimals()` for formatting. Never assume 18.

## Fixed genesis allocations

| Allocation | Share | Tokens |
|---|---:|---:|
| Liquidity | 30% | 69,000,000 |
| Community | 15% | 34,500,000 |
| Treasury | 25% | 57,500,000 |
| Development | 10% | 23,000,000 |
| Team | 5% | 11,500,000 |
| Open public pre-sale | 15% | 34,500,000 |
| **Total** | **100%** | **230,000,000** |

The token constructor distributes these amounts to six **distinct, nonzero wallet addresses**. Deployment requires `LIQUIDITY_WALLET`, `COMMUNITY_WALLET`, `TREASURY_WALLET`, `DEVELOPMENT_WALLET`, `TEAM_WALLET`, and `PRESALE_WALLET`. This is a wallet allocation only: no vesting, liquidity provisioning, sale mechanism, buyer protections, price discovery, eligibility checks, refund rights, or claim process are implemented. **Do not represent the public pre-sale as live.** Have any public token sale reviewed for applicable legal and regulatory requirements. In the UK, promoting a cryptoasset sale to the public is a regulated financial promotion under the FCA regime, so marketing for the pre-sale must be approved by an authorised firm (or fall within an exemption) before it is published.
