import '@testing-library/jest-dom';

// Mock Phaser game engine - tests should not load the full game engine
jest.mock('phaser', () => ({
  Game: jest.fn(),
  Scene: jest.fn(),
  Physics: {
    Arcade: {
      Sprite: jest.fn(),
      Group: jest.fn(),
      Body: jest.fn(),
    },
  },
  Math: {
    Vector2: jest.fn(),
    Between: jest.fn(),
    Distance: {
      Between: jest.fn(),
    },
  },
  GameObjects: {
    Sprite: jest.fn(),
    Container: jest.fn(),
    Text: jest.fn(),
    Graphics: jest.fn(),
  },
  Input: {
    Keyboard: {
      KeyCodes: {},
    },
  },
  AUTO: 0,
  WEBGL: 1,
  CANVAS: 2,
}));
