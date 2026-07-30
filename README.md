# 🎮 Survivor Royale

**Skill-based auto-shooter with deep hero customization, 2-player co-op, and Web3 integration.**

> Think Survivor.io meets Hades with competitive multiplayer and true NFT ownership.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange)]()

---

## 🌟 What Makes This Different?

- **3 Deep Heroes** - Not shallow character spam. Each hero has 4-tier skill trees, active abilities, and ultimates
- **2-Player Co-Op** - What Survivor.io never did. Hero synergies, ultimate combos, duo leaderboards
- **30+ Enemy Types** - Unique mechanics, multi-phase bosses, co-op exclusive enemies
- **True Competitive** - ELO-based ranked ladder, weekend tournaments, skill-based rewards
- **Web3 Done Right** - 100% skill-based, no pay-to-win, cosmetic NFTs, DAO governance

**[Read the Full Game Design Document →](./docs/survivor-royale-gdd.md)**

---

## 🎭 The Three Heroes

### 🗡️ Knight - Melee Tank
Evolving shield ability • Berserker/Guardian/Duelist paths • Titan Form ultimate

### 🏹 Archer - Glass Cannon  
Time-slow precision strikes • Arrow types • Arrow Storm ultimate

### 🔮 Mage - Elemental Master
Fire/Ice/Lightning stances • Element fusion • Cataclysm ultimate

**Each hero has 100+ viable build combinations.**

---

## 🎮 Core Features

### Solo Mode
- Endless wave survival (Waves 1-30+)
- Skill-based progression (dodge mechanics, active abilities, combos)
- Weekly meta rotations (never stale)
- Boss fights every 10 waves
- Global leaderboards

### Co-Op Mode
- 2-player synchronized runs
- Hero synergy bonuses (Knight + Mage, Archer + Mage, etc.)
- Ultimate combos (coordinate for screen-wipes)
- 3 difficulty tiers (Normal, Hard, Nightmare)
- Exclusive co-op enemies and boss mechanics
- Duo leaderboards and matching cosmetics

### Competitive
- ELO-based ranked seasons
- Weekend tournaments
- Spectator mode
- Guild vs Guild battles
- Skill-based token airdrops

### Web3 Integration
- Wallet connect (optional for free players)
- All cosmetics are tradeable NFTs
- $RIFT token for ranked/tournaments
- Marketplace with creator royalties
- DAO governance (community votes on balance)

---

## 🛠️ Tech Stack

### Frontend (Game Client)
- **Game Engine**: Phaser.js 3 (WebGL/Canvas)
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Web3**: ethers.js / wagmi

### Backend (Optional - Leaderboards/Matchmaking)
- **Runtime**: Node.js
- **Database**: PostgreSQL (for leaderboards)
- **Caching**: Redis
- **API**: GraphQL (optional)

### Smart Contracts
- **Language**: Solidity 0.8.x
- **Framework**: Hardhat
- **Network**: Polygon (low gas fees)
- **Standards**: ERC-20 (token), ERC-721 (NFTs)

### Infrastructure
- **Hosting**: Vercel (frontend), Railway (backend)
- **Storage**: IPFS (NFT metadata)
- **CDN**: Cloudflare
- **Analytics**: Mixpanel

---

## 📦 Project Structure

```
survivor-royale/
├── docs/                    # Game design documents
├── src/
│   ├── client/             # Frontend game code
│   │   ├── components/     # React components
│   │   ├── scenes/         # Phaser scenes
│   │   ├── entities/       # Game entities (Player, Enemy)
│   │   ├── ui/             # UI components
│   │   └── utils/          # Client utilities
│   ├── server/             # Backend API (optional)
│   ├── contracts/          # Smart contracts
│   └── shared/             # Shared code (types, constants)
├── assets/                 # Game assets (sprites, audio, fonts)
├── config/                 # Configuration files
├── scripts/                # Build and deployment scripts
├── tests/                  # Test suites
└── .github/workflows/      # CI/CD pipelines
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git
- (Optional) MetaMask or other Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/survivor-royale.git
cd survivor-royale

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # End-to-end tests
npm run test:coverage    # Coverage report

# Smart Contracts
npm run contracts:compile  # Compile contracts
npm run contracts:test     # Test contracts
npm run contracts:deploy   # Deploy to network

# Linting
npm run lint             # Lint code
npm run format           # Format with Prettier
```

---

## 🗓️ Roadmap

### ✅ Phase 0: Planning (Weeks 1-2)
- [x] Game design document
- [x] Differentiation strategy
- [x] Repository setup

### 🔄 Phase 1: Core Solo Mode (Weeks 3-8)
- [ ] Basic game engine setup (Phaser.js)
- [ ] Knight hero with abilities
- [ ] 10 basic enemy types
- [ ] Wave system and leveling
- [ ] First boss (The Titan)
- [ ] Weapon system (5 weapons)

### 📋 Phase 2: Content Expansion (Weeks 9-12)
- [ ] Archer and Mage heroes
- [ ] All 30 enemy types
- [ ] All 3 bosses
- [ ] Weapon evolution system
- [ ] Leaderboards
- [ ] Daily challenges

### 🎮 Phase 3: Co-Op Mode (Weeks 13-16)
- [ ] Netcode and matchmaking
- [ ] Hero synergy systems
- [ ] Co-op enemy scaling
- [ ] Duo leaderboards
- [ ] Communication tools (ping, voice)

### 🪙 Phase 4: Web3 Integration (Weeks 17-20)
- [ ] Wallet connect
- [ ] NFT cosmetic minting
- [ ] Marketplace
- [ ] $RIFT token contracts
- [ ] Ranked seasons
- [ ] Tournament system

### 🌟 Phase 5: Polish & Launch (Weeks 21-24)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Tutorial system
- [ ] Marketing push
- [ ] Public launch

---

## 📖 Documentation

- [Game Design Document](./docs/survivor-royale-gdd.md) - Complete gameplay specification
- [Differentiation Strategy](./docs/differentiation-strategy.md) - Competitive analysis and marketing
- [Feature Summary](./docs/game-features-summary.md) - Quick reference guide
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Technical Architecture](./docs/architecture.md) *(coming soon)*
- [Smart Contract Docs](./docs/contracts.md) *(coming soon)*

---

## 🤝 Contributing

We welcome contributions! This is a solo founder project, but community input is valuable.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 🎨 Submit art/cosmetic designs
- 📝 Improve documentation
- 🧪 Write tests
- 💻 Submit PRs

---

## 📊 Project Status

**Current Phase**: Repository Setup & Planning  
**Version**: 0.0.1-alpha  
**Next Milestone**: Playable Knight prototype (Week 6)

### Metrics Goals

- **Month 3**: 10K DAU
- **Month 6**: 50K DAU (with co-op launch)
- **Month 12**: 100K+ DAU

---

## 🎯 Why This Will Win

| Feature | Survivor.io | Our Game |
|---------|------------|----------|
| Heroes | 20+ shallow | **3 deep with skill trees** |
| Abilities | None | **Active + Ultimates** |
| Multiplayer | ❌ | **✅ 2-player co-op** |
| Enemies | ~10 types | **30+ unique types** |
| Competitive | Static leaderboard | **ELO ranked ladder** |
| Ownership | None | **Full NFT marketplace** |

**Co-op alone could carry this game** - it's what Survivor.io players have begged for.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Discord**: *(coming soon)*
- **Twitter**: *(coming soon)*
- **Website**: *(coming soon)*

---

## 💬 Contact

For inquiries: *(your email/contact)*

---

**Built with ❤️ by a solo founder. Let's make the Web3 game people actually want to play.**
