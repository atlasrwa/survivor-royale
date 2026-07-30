# Source Code

This directory contains all source code for Survivor Royale.

## Structure

- `client/` - Frontend game code (Phaser.js)
  - `components/` - Reusable game components
  - `scenes/` - Game scenes (Menu, Game, GameOver, etc.)
  - `entities/` - Game entities (Player, Enemy, Weapon)
  - `ui/` - UI components
  - `utils/` - Client utilities

- `server/` - Backend API (optional, for leaderboards/matchmaking)

- `contracts/` - Smart contracts (Solidity)

- `shared/` - Code shared between client and server
  - `types/` - TypeScript types
  - `constants/` - Game constants
  - `utils/` - Shared utilities
