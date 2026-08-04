import Document, { Html, Head, Main, NextScript } from 'next/document';
import type { DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* iOS PWA */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Survivor Royale" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />

          {/* Android PWA */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#0a0a1a" />

          {/* Game-specific: prevent all browser chrome interference */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="msapplication-tap-highlight" content="no" />

          {/* OG/Social sharing defaults */}
          <meta property="og:title" content="Survivor Royale" />
          <meta property="og:description" content="Skill-based auto-shooter. 3 deep heroes, 30 waves, on-chain leaderboard." />
          <meta property="og:type" content="website" />
          <meta property="og:image" content="/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />

          {/* Prevent text selection, touch callouts, safe-area insets */}
          <style dangerouslySetInnerHTML={{ __html: `
            * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
            html, body {
              overflow: hidden;
              position: fixed;
              width: 100%;
              height: 100%;
              touch-action: none;
              /* Safe area padding for notched phones */
              padding:
                env(safe-area-inset-top)
                env(safe-area-inset-right)
                env(safe-area-inset-bottom)
                env(safe-area-inset-left);
            }
            #__next { width: 100%; height: 100%; overflow: hidden; }
            /* Ensure buttons/interactive elements have minimum touch targets */
            button, [role="button"], a { min-height: 44px; min-width: 44px; }
          `}} />
        </Head>
        <body className="bg-[#0a0a1a]">
          <Main />
          <NextScript />
          {/* Service Worker registration */}
          <script dangerouslySetInnerHTML={{ __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
