// import { HttpClient } from '@sentry/integrations'
// import * as Sentry from '@sentry/react'
import ReactDOM from 'react-dom/client'

// import { VITE_SENTRY_DSN_KEY } from '@/configs/env.ts'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

// Sentry.init({
//   dsn: VITE_SENTRY_DSN_KEY,
//   integrations: [new Sentry.BrowserTracing(), new HttpClient()],
//   sendDefaultPii: true,
//   tracesSampleRate: 1.0,
//   // FIXME: add domain
//   tracePropagationTargets: ['localhost'],
//   debug: import.meta.env.MODE === 'development' ? true : false,
//   environment: import.meta.env.MODE,
// })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
