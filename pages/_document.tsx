import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Main />
        <Script src="https://analytics.ahrefs.com/analytics.js" data-key="3I22XXvbGakzvXR4aAEzfg" strategy="afterInteractive" />
        <NextScript />
      </body>
    </Html>
  );
}
