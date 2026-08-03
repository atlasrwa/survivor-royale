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
          {/* Mobile game optimizations */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#0a0a1a" />
          {/* Prevent text selection and callouts on mobile */}
          <style dangerouslySetInnerHTML={{ __html: `
            * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
            html, body { overflow: hidden; position: fixed; width: 100%; height: 100%; touch-action: none; }
            #__next { width: 100%; height: 100%; overflow: hidden; }
          `}} />
        </Head>
        <body className="bg-[#0a0a1a]">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
