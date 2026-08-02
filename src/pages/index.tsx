import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import GameUI from '@/client/components/GameUI';

// Phaser must be loaded client-side only (no SSR)
const GameCanvas = dynamic(() => import('@/client/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-[#0a0a1a]">
      <div className="text-white text-xl animate-pulse">Loading Survivor Royale...</div>
    </div>
  ),
});

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Survivor Royale</title>
        <meta name="description" content="Skill-based auto-shooter with deep hero customization and Web3 integration" />
      </Head>
      <main className="relative w-full h-full">
        <GameCanvas />
        <GameUI />
      </main>
    </>
  );
};

// Disable static generation — this page is purely client-rendered (Phaser game)
export const getServerSideProps = async () => ({ props: {} });

export default Home;
