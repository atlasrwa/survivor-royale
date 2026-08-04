'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:bg-purple-500 hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-500"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 font-mono text-sm text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30 transition-all hover:shadow-blue-500/40 hover:ring-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {/* Base chain icon */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 111 111"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF" />
                    <path
                      d="M55.4 93.5c20.9 0 37.9-17 37.9-37.9 0-20.9-17-37.9-37.9-37.9-19.5 0-35.6 14.8-37.7 33.8h50.1v8.2H17.7c2.1 19 18.2 33.8 37.7 33.8z"
                      fill="white"
                    />
                  </svg>
                  <span>
                    {account.displayName}
                  </span>
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
