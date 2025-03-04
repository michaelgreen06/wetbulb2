import type { AppProps } from 'next/app';
import SharedLayout from '../components/layouts/SharedLayout';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SharedLayout>
      <Component {...pageProps} />
    </SharedLayout>
  );
}
