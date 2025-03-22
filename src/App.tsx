import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeProvider'

// Components
import Layout from './components/layout/Layout'
import AgeVerification from './components/modals/AgeVerification'
import AdminRouteGuard from './components/auth/AdminRouteGuard'

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
import OAuthDebugPage from './pages/OAuthDebugPage'
import ProductDetailPage from './pages/ProductDetailPage'

// Admin Pages
import ProductsPage from './pages/admin/ProductsPage'
import DashboardPage from './pages/admin/DashboardPage'
import OrdersPage from './pages/admin/OrdersPage'
import AdminLogin from './pages/auth/AdminLogin'

// Initialize React Query client
const queryClient = new QueryClient()

function App() {
  const [ageVerified, setAgeVerified] = useState(
    localStorage.getItem('ageVerified') === 'true'
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/test" element={<TailwindTestPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/test-email" element={<TestEmailPage />} />
              <Route path="/oauth-debug" element={<OAuthDebugPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRouteGuard>
                    <DashboardPage />
                  </AdminRouteGuard>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <AdminRouteGuard>
                    <DashboardPage />
                  </AdminRouteGuard>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <AdminRouteGuard>
                    <ProductsPage />
                  </AdminRouteGuard>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <AdminRouteGuard>
                    <OrdersPage />
                  </AdminRouteGuard>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
