import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import Layout from './components/layout/Layout'
import AgeVerification from './components/modals/AgeVerification'

// Pages
import { 
  HomePage,
  HookahsPage, 
  VapesPage, 
  TobaccoPage, 
  AccessoriesPage, 
  SearchPage, 
  CartPage,
  LoginPage,
  RegisterPage,
  CheckoutPage,
  NotFoundPage,
  AuthCallbackPage,
  ProfilePage
} from './pages'
import TailwindTestPage from './pages/TailwindTestPage'
import TestEmailPage from './pages/TestEmailPage'
import OrderSuccessPage from './pages/OrderSuccessPage'

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
            <Route path="/hookahs" element={<HookahsPage />} />
            <Route path="/vapes" element={<VapesPage />} />
            <Route path="/tobacco" element={<TobaccoPage />} />
            <Route path="/accessories" element={<AccessoriesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<OrderSuccessPage />} />
            <Route path="/test" element={<TailwindTestPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/test-email" element={<TestEmailPage />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* Additional routes will be uncommented as we create these pages */}
            {/* 
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            */}
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  )
}

export default App
