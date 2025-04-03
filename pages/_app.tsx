import type { AppProps } from 'next/app';
import SharedLayout from '../components/layouts/SharedLayout';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="3I22XXvbGakzvXR4aAEzfg" async></script>
      </Head>
      <SharedLayout>
        <Component {...pageProps} />
      </SharedLayout>
    </>
  );
}
