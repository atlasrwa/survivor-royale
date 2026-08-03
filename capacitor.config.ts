import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.survivorroyale.game',
  appName: 'Survivor Royale',
  webDir: 'out',
  server: {
    // Load from local files (no remote server needed)
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content for local assets
    allowMixedContent: true,
    // WebView settings for game performance
    webContentsDebuggingEnabled: true,
  },
};

export default config;
