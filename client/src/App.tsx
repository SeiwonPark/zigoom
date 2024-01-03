import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { PrivacyStatement } from '@/components/Policy/PrivacyStatement'
import { TermsOfUse } from '@/components/Policy/TermsOfUse'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import Register from '@/pages/Register'
import Room from '@/pages/Room'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-statement" element={<PrivacyStatement />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
