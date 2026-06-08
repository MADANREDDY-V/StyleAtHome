import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Stores from './pages/Stores'
import StorePage from './pages/StorePage'
import Cart from './pages/Cart'
import TrialCart from './pages/TrialCart'
import Checkout from './pages/Checkout'
import TrialBooking from './pages/TrialBooking'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} signUpFallbackRedirectUrl="/" signInFallbackRedirectUrl="/">
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-purple-500/30">
          <Header />
          <Toaster position="top-center" toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }} />
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/store/:slug" element={<StorePage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/trial-cart" element={<TrialCart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/trial-booking" element={<TrialBooking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              {/* Clerk Auth Routes */}
              <Route path="/sign-in/*" element={
                <div className="flex items-center justify-center min-h-[70vh] mt-16"><SignIn routing="path" path="/sign-in" /></div>
              } />
              <Route path="/sign-up/*" element={
                <div className="flex items-center justify-center min-h-[70vh] mt-16"><SignUp routing="path" path="/sign-up" /></div>
              } />
              
              {/* Redirect old routes to /products with filters */}
              <Route path="/new-arrivals" element={<Navigate to="/products?sort=newest" />} />
              <Route path="/brands" element={<Navigate to="/products?brand=true" />} />
              
              <Route path="*" element={
                <div className="text-center py-32 mt-16 glass-card max-w-2xl mx-auto">
                  <h1 className="text-6xl font-black mb-4">404</h1>
                  <p className="text-xl text-muted-foreground mb-8">Page not found</p>
                  <a href="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </ClerkProvider>
  )
}

export default App
