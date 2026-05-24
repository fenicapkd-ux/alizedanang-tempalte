"use client";

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Setup queryClient (safe — không dùng browser API)
const queryClient = new QueryClient();

// Chỉ khởi tạo WalletConnect trong browser — indexedDB không tồn tại trong Node.js SSR
let wagmiConfig: any = null;

if (typeof window !== 'undefined') {
  // Lazy import để tránh load WalletConnect trong SSR bundle
  const { createWeb3Modal } = require('@web3modal/wagmi/react');
  const { defaultWagmiConfig } = require('@web3modal/wagmi/react/config');
  const { polygonAmoy, polygon, mainnet } = require('wagmi/chains');

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c3b5bb2be736b43ffb4334fdb3c07659';

  const metadata = {
    name: 'Alize Da Nang Web3',
    description: 'Alize Da Nang Real Estate Tokenization Platform',
    url: 'https://alizedanang.net',
    icons: ['https://alizedanang.net/logo.png']
  };

  const chains = [polygonAmoy, polygon, mainnet] as const;
  wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    auth: {
      email: true,
      socials: ['google', 'x', 'github', 'discord', 'apple'],
      showWallets: true,
      walletFeatures: true
    }
  });

  createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: true,
    enableOnramp: true,
    themeVariables: {
      '--w3m-color-mix': '#D4AF37',
      '--w3m-color-mix-strength': 20,
      '--w3m-accent': '#D4AF37',
    }
  });
}

export function Web3Provider({ children }: { children: ReactNode }) {
  // Trong SSR (build time) hoặc khi wagmiConfig chưa sẵn sàng, render children trực tiếp
  if (!wagmiConfig) {
    return <>{children}</>;
  }

  // Dynamic import trong client để tránh SSR issue với WagmiProvider
  const { WagmiProvider } = require('wagmi');

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
