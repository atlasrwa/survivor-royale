import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const chains = [base] as const;

export const config = getDefaultConfig({
  appName: 'Survivor Royale',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains,
  ssr: true,
});
