# Contributing to Survivor Royale

First off, thank you for considering contributing to Survivor Royale! This is a solo founder project, but community contributions are welcome and valued.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Your environment (browser, OS, wallet provider)
- Console errors (if any)

### Suggesting Features

Feature suggestions are welcome! Before suggesting:
- Check the [roadmap](./README.md#roadmap) to see if it's planned
- Search existing issues for similar suggestions
- Consider if it aligns with the game's vision (see [GDD](./docs/survivor-royale-gdd.md))

**When suggesting a feature:**
- Explain the problem it solves
- Describe your proposed solution
- Explain why it would benefit the game
- Consider impact on game balance

### Submitting Art/Cosmetic Designs

We're open to community-designed cosmetics!

**Guidelines:**
- Must fit the game's visual style
- Provide concept art or mockups
- Specify which hero it's for
- Include animation notes if applicable
- Understand that selected designs may be minted as NFTs with creator royalties

### Code Contributions

#### First Time Contributors

Good first issues will be tagged with `good-first-issue`. These are typically:
- Documentation improvements
- Small bug fixes
- Test additions
- Code cleanup

#### Development Setup

```bash
# Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/survivor-royale.git
cd survivor-royale

# Install dependencies
npm install

# Create a branch for your feature
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests
npm test

# Run linter
npm run lint

# Commit with clear message
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request
```

#### Code Style

- **Language**: TypeScript (strict mode)
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint (must pass CI)
- **Naming**:
  - Variables/functions: `camelCase`
  - Classes/Components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.ts`

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new enemy type (Summoner)
fix: correct Knight shield damage calculation
docs: update installation instructions
test: add unit tests for weapon system
refactor: simplify enemy spawning logic
style: format code with prettier
chore: update dependencies
```

#### Pull Request Process

1. **Update Documentation**: If your PR changes behavior, update relevant docs
2. **Add Tests**: New features should have test coverage
3. **Pass CI**: All tests and lints must pass
4. **Describe Changes**: Clear PR description explaining what and why
5. **Link Issues**: Reference related issues (e.g., "Fixes #123")
6. **Request Review**: Tag maintainers for review
7. **Be Responsive**: Address feedback promptly

### Writing Tests

- **Unit tests**: For pure functions, game logic
- **Integration tests**: For system interactions
- **E2E tests**: For full gameplay flows (sparingly - they're slow)

```typescript
// Example unit test
describe('Knight', () => {
  it('should gain shield when using Iron Resolve', () => {
    const knight = new Knight();
    knight.useAbility();
    expect(knight.shield).toBe(50);
  });
});
```

### Improving Documentation

Documentation improvements are always welcome!

- Fix typos
- Clarify confusing sections
- Add examples
- Improve formatting
- Translate docs (if applicable)

## 🎨 Design Philosophy

When contributing, keep these principles in mind:

1. **Skill > RNG**: Changes should reward player skill, not luck
2. **Balance First**: New features shouldn't break game balance
3. **Performance Matters**: Game must run at 60 FPS on mid-range devices
4. **Web3 as Enhancement**: Core game must be fun without crypto
5. **Community-Driven**: Players should have a voice in development

## 🚫 What We Won't Accept

- Pay-to-win mechanics
- Features that compromise game balance
- Code that doesn't pass tests/linting
- Breaking changes without discussion
- Plagiarized code or assets
- Malicious code

## 🔒 Security

If you discover a security vulnerability:

- **DO NOT** open a public issue
- Email security concerns to: *(add your secure email)*
- Include steps to reproduce
- You may be eligible for bug bounty rewards (post-token launch)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Your contributions may be included in the game, which includes Web3 integrations and NFT systems. You retain copyright to your original work, but grant the project perpetual rights to use your contributions.

## 🎁 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- In-game credits
- Special Discord role (when Discord launches)
- Potential airdrops for significant contributions (post-token launch)

## 💬 Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open an issue
- **Feature proposals**: Open an issue with `[Feature Request]` prefix
- **Security**: Email privately

---

**Thank you for contributing to Survivor Royale! Every contribution helps build the game the community wants to play.** 🚀
