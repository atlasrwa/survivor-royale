import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const ServerErrorPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>500 - Survivor Royale</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white">
        <h1 className="text-6xl font-bold text-red-400 mb-4">500</h1>
        <p className="text-xl text-gray-400 mb-8">Something went wrong</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold transition-colors"
        >
          Return to Game
        </Link>
      </div>
    </>
  );
};

export default ServerErrorPage;
