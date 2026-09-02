import type { AppProps } from 'next/app'
import { ErrorBoundary } from '@/modules/core'
import { getLoggedUserId } from '../utils/getLoggedUserId'
import '../styles/globals.css'

export const loggedUserId = getLoggedUserId()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
