import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { VITE_GOOGLE_CLIENT_ID } from '@/configs/env'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Room from '@/pages/Room'

function App() {
  return (
    <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
