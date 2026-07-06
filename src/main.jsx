import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import BrandedLoader from '@/components/BrandedLoader'
import '@/index.css'
import '@/lib/analytics-loader'

// App is lazy so the initial JS bundle is tiny (React + loader + CSS only).
// The branded skeleton in index.html shows instantly, then BrandedLoader
// (identical look) holds until the App chunk loads.
const App = lazy(() => import('@/App.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <Suspense fallback={<BrandedLoader />}>
    <App />
  </Suspense>
)