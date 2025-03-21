import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Components
import Layout from './components/layout/Layout'
import AgeVerification from './components/modals/AgeVerification'

// Pages
import HomePage from './pages/HomePage'
import TailwindTestPage from './pages/TailwindTestPage'
import NotFoundPage from './pages/NotFoundPage'

// Initialize React Query client
const queryClient = new QueryClient()

function App() {
  const [ageVerified, setAgeVerified] = useState(
    localStorage.getItem('ageVerified') === 'true'
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {!ageVerified && <AgeVerification onVerify={() => setAgeVerified(true)} />}
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test" element={<TailwindTestPage />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* Additional routes will be uncommented as we create these pages */}
            {/* 
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:category" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            */}
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  )
}

export default App
