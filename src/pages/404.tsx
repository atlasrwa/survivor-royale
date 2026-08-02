import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>404 - Survivor Royale</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white">
        <h1 className="text-6xl font-bold text-blue-400 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
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

export default NotFoundPage;
