import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Shield, User } from 'lucide-react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';
import Logo from './Logo';

const ADMIN_EMAIL = '23eg111a28@anurag.edu.in';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { dbUser } = useDbUser();
  const cart = useStore((state) => state.cart);
  const trialCart = useStore((state) => state.trialCart);
  const fetchCart = useStore((state) => state.fetchCart);
  const fetchTrialCart = useStore((state) => state.fetchTrialCart);
  const fetchWishlist = useStore((state) => state.fetchWishlist);

  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL || dbUser?.role === 'ADMIN';

  useEffect(() => {
    if (dbUser) {
      fetchCart(dbUser.id);
      fetchTrialCart(dbUser.id);
      fetchWishlist(dbUser.id);
    }
  }, [dbUser, fetchCart, fetchTrialCart, fetchWishlist]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Men', path: '/products?section=Men' },
    { label: 'Women', path: '/products?section=Women' },
    { label: 'Kids', path: '/products?section=Kids' },
    { label: 'Stores', path: '/stores' },
    { label: 'Home Trial', path: '/trial-booking' },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div 
          layout
          className={`flex items-center justify-between gap-4 px-6 transition-all duration-500 ${
            isScrolled ? 'liquid-glass rounded-[2rem] py-3' : 'bg-transparent py-2'
          }`}
        >
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 12 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <Logo size={28} className="text-primary" />
              </motion.div>
              <h1 className="text-2xl font-black tracking-tighter hidden sm:block">
                Style<span className="text-primary">AtHome</span>
              </h1>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-sm font-bold tracking-tight transition-colors relative group ${isActive ? 'text-primary' : 'text-foreground hover:text-primary'}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full" />
                  )}
                  {!isActive && (
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-primary/30 rounded-full transition-all group-hover:w-full" />
                  )}
                </Link>
              );
            })}
            {/* Admin Link — visible only to admins */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-bold tracking-tight transition-colors relative group flex items-center gap-1.5 ${location.pathname === '/admin' ? 'text-primary' : 'text-cadmium hover:text-primary'}`}
              >
                <Shield size={14} /> Admin
                {location.pathname === '/admin' && (
                  <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 right-0 h-1 bg-primary rounded-full" />
                )}
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 sm:gap-6">
            <form onSubmit={submitSearch} className="relative hidden md:block">
              <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-full px-4 py-2.5 border border-transparent focus-within:border-primary/50 transition-colors w-48 lg:w-64">
                <Search size={16} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent ml-2 text-sm font-medium outline-none placeholder:text-muted-foreground placeholder:font-medium"
                />
              </div>
            </form>

            <SignedIn>
              <div className="flex items-center gap-2">
                <Link to="/profile?tab=wishlist" className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden sm:block hover:text-primary">
                  <Heart size={20} strokeWidth={2} />
                </Link>
                <Link to="/trial-cart" className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hover:text-primary">
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {trialCart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 bg-cadmium text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-bean shadow-sm"
                    >
                      {trialCart.length}
                    </motion.span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hover:text-primary">
                  <ShoppingBag size={20} strokeWidth={2} />
                  {cart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-bean shadow-sm"
                    >
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </motion.span>
                  )}
                </Link>
                {/* Custom profile avatar — routes to /profile */}
                <Link
                  to="/profile"
                  className="ml-2 pl-2 border-l border-border/50 flex items-center gap-2 group"
                  title="My Profile"
                >
                  {user?.imageUrl ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                      <img src={user.imageUrl} alt={user.fullName || 'Profile'} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User size={16} className="text-primary" />
                    </div>
                  )}
                </Link>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-4">
                <Link to="/sign-in" className="text-sm font-bold hover:text-primary transition-colors hidden sm:block">Log in</Link>
                <Link to="/sign-up" className="text-sm font-bold bg-foreground text-background px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-all hover:-translate-y-[1px] active:scale-[0.98] shadow-lg">Get Started</Link>
              </div>
            </SignedOut>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden absolute top-full left-4 right-4 mt-2 overflow-hidden rounded-[2rem] liquid-glass"
          >
            <div className="px-6 py-6 space-y-4">
              <form onSubmit={submitSearch} className="flex items-center bg-black/5 dark:bg-white/10 rounded-full px-4 py-3 mb-6 md:hidden">
                <Search size={18} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent ml-3 text-sm font-medium outline-none"
                />
              </form>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="block py-3 px-4 rounded-xl text-base font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 py-3 px-4 rounded-xl text-base font-bold text-cadmium hover:bg-cadmium/10 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Shield size={16} /> Admin Console
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-3 px-4 rounded-xl text-base font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <User size={16} /> My Profile
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
