# EarnRooms Backend Layer

A standalone, plug-and-play bounty & engagement engine tailored natively for the Rooms ecosystem, empowering room owners to incentivize community contributions with tokenized rewards.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication/Identity:** Privy Wallet Mapping

## Architecture Overview
1. **Privy Wallet Synchronization:** Maps Web3 wallets with Web2 social identifiers (X, Discord, Gmail) natively supported by Rooms.
2. **Dynamic Bounty Lifecycles:** Allows automated creation, execution, and state changes for specific micro-tasks.
3. **Token-Weighted Governance:** Calculates real-time snapshot power to allocate weighted voting rights on submissions for holders.
