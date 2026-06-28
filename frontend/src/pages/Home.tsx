import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Star, Truck, ShieldCheck, 
  CheckCircle2, XCircle, ShoppingBag, 
  ArrowDown
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView, animate, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Product, Store } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Animated Counter Component
function Counter({ from = 0, to, duration = 2 }: { from?: number, to: number, duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView && nodeRef.current) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value).toString();
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, inView]);

  return <span ref={nodeRef}>{from}</span>;
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();

  // Parallax values
  const heroImgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const abstractRotate = useTransform(scrollY, [0, 1000], [0, 90]);

  // Hero Carousel State
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroImages = [
    "/hero-img-1.jpg",
    "/hero-img-2.jpg",
    "/hero-img-3.jpg",
    "/hero-img-4.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, storesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_new_arrival', true).eq('is_active', true).limit(5),
        supabase.from('stores').select('*').eq('is_active', true).limit(8)
      ]);
      
      if (productsRes.data) setNewArrivals(productsRes.data as Product[]);
      if (storesRes.data) setStores(storesRes.data as Store[]);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden bg-[#F9F6F1] font-sans">
      
      {/* 1. ULTRA-PREMIUM HERO */}
      <section className="relative w-full min-h-[50vh] lg:min-h-[450px] flex items-center justify-center overflow-hidden pt-32 lg:pt-40 pb-8">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <motion.div 
            style={{ rotate: abstractRotate }}
            className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-[#FF8A00]/20 to-transparent blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-[#6B2D0F]/10 to-transparent blur-[100px]" 
          />
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Hero Typography */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6B2D0F]/20 bg-[#6B2D0F]/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FF8A00] animate-pulse" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#6B2D0F]">The Future of Retail</span>
            </div>
            
            <h1 className="text-[13vw] sm:text-[9vw] lg:text-[7.5rem] font-black leading-[0.85] tracking-tighter text-[#3D1202] mb-6 drop-shadow-sm">
              Try Before<br/>
              <span className="text-[#FF8A00]">You Buy.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#3D1202]/70 font-medium max-w-[450px] leading-relaxed mb-10">
              Transform your living room into a premium fitting room. Curated collections delivered to your door with zero upfront commitment.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link to="/trial-booking" className="w-full sm:w-auto text-center bg-[#3D1202] hover:bg-[#FF8A00] text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-[0_10px_40px_-10px_rgba(61,18,2,0.4)]">
                Book Home Trial
              </Link>
              <Link to="/products" className="w-full sm:w-auto text-center px-10 py-5 rounded-full font-bold text-lg text-[#3D1202] bg-white border border-[#3D1202]/10 hover:border-[#3D1202] transition-colors shadow-sm">
                Shop Collection
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-[#3D1202]/60">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#FF8A00]" /> Free Home Trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#FF8A00]" /> Easy Returns</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-[#FF8A00]" /> Premium Brands</span>
            </div>
          </motion.div>

          {/* Hero Image & Floating Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full relative hidden md:block max-w-xl mx-auto"
          >
            <div className="relative aspect-square lg:aspect-[5/4] rounded-[2rem] overflow-hidden shadow-2xl bg-[#E8E1D9]">
              <AnimatePresence>
                <motion.img 
                  key={heroImageIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  style={{ y: heroImgY }}
                  src={heroImages[heroImageIndex]} 
                  alt="Luxury Fashion Model" 
                  className="absolute inset-0 w-full h-full object-cover origin-top"
                />
              </AnimatePresence>
            </div>
            
            {/* Floating Glassmorphism Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-12 bg-white/80 backdrop-blur-xl border border-white p-5 rounded-2xl shadow-xl w-64 hidden xl:block"
            >
              <div className="flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=100&h=100&fit=crop" className="w-14 h-14 rounded-full object-cover" alt="Avatar"/>
                <div>
                  <div className="flex text-[#FF8A00] mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <p className="text-sm font-bold text-[#3D1202] leading-tight">"The trial experience completely changed how I shop."</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3], y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#3D1202]/40"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
          <ArrowDown size={16} />
        </motion.div>
      </section>

      {/* 2. FEATURED CATEGORIES (EDITORIAL SLIDER) */}
      <section className="py-12 lg:py-12 w-full overflow-hidden bg-white">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#3D1202] tracking-tight">The Collections.</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 font-bold text-[#FF8A00] hover:text-[#6B2D0F] transition-colors">
            View Directory <ArrowRight size={18} />
          </Link>
        </div>

        {/* 3-Column Grid Area */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 pb-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              { name: "Men", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" },
              { name: "Women", img: "/women-collection.png" },
              { name: "Kids", img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800&auto=format&fit=crop" },
            ].map((cat, i) => (
              <Link 
                key={i} 
                to={`/products?section=${cat.name}`} 
                className="group relative w-full aspect-[4/5] md:aspect-[4/4] lg:aspect-[4/5] xl:aspect-[1/1] overflow-hidden rounded-[1.5rem]"
              >
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity" />
              <div className="absolute bottom-8 left-8">
                <span className="text-white text-2xl font-black tracking-wide">{cat.name}</span>
                <div className="w-0 h-0.5 bg-white mt-1 transition-all duration-300 group-hover:w-full" />
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      {/* 3. WHY STYLEATHOME? (ICON CARDS) */}
      <section className="py-12 lg:py-16 bg-[#F9F6F1]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-[#3D1202] mb-6 tracking-tight">The Modern Standard.</h2>
            <p className="text-lg text-[#3D1202]/60 font-medium">We're stripping away the friction of online shopping to give you an uncompromising, premium experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: "Home Trial", desc: "Order multiple sizes. Keep what fits perfectly." },
              { icon: Star, title: "Premium Brands", desc: "Curated selections from the world's finest labels." },
              { icon: Truck, title: "Fast Delivery", desc: "White-glove delivery directly to your doorstep." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "Enterprise-grade security for peace of mind." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-[#F9F6F1] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF8A00] transition-colors duration-300 text-[#3D1202] group-hover:text-white">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#3D1202]">{f.title}</h3>
                <p className="text-[#3D1202]/60 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW HOME TRIAL WORKS (TIMELINE) */}
      <section className="py-12 lg:py-16 bg-[#3D1202] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF8A00]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="mb-20 md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Your Living Room.<br/>Your Fitting Room.</h2>
            <p className="text-lg text-white/60 font-medium">Experience fashion exactly how it should be. Without the guesswork.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-[45px] left-[5%] w-[90%] h-0.5 bg-white/10" />
            
            {[
              { num: "01", title: "Browse Products", desc: "Select up to 5 premium items to add to your Trial Cart." },
              { num: "02", title: "Book Trial", desc: "Choose a convenient date and time for your home trial session." },
              { num: "03", title: "Try At Home", desc: "Our executive waits while you try on the clothes in comfort." },
              { num: "04", title: "Buy What You Love", desc: "Pay only for what you keep. We take back the rest." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/20 flex items-center justify-center backdrop-blur-sm mb-6 text-2xl font-black text-[#FF8A00]">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BRAND SHOWCASE (MARQUEE) */}
      <section className="py-12 bg-white border-b border-black/5 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 mb-10 text-center">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#3D1202]/40">Partnered With Excellence</h2>
        </div>
        
        {/* Infinite CSS Marquee Approach using Framer Motion */}
        <div className="relative w-full flex overflow-x-hidden">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
            className="flex flex-none gap-16 sm:gap-28 px-6 items-center"
          >
            {[...stores, ...stores, ...stores].map((store, i) => (
              <div key={i} className="flex-none flex flex-col items-center gap-3 transition-transform duration-300 hover:scale-110">
                {store.logo_url ? (
                   <img src={store.logo_url} alt={store.name} className="h-14 md:h-20 object-contain" />
                ) : (
                   <div className="h-14 md:h-20 w-14 md:w-20 bg-[#F9F6F1] border border-[#3D1202]/10 rounded-2xl flex items-center justify-center">
                     <span className="text-2xl font-black text-[#3D1202]">{store.name.charAt(0)}</span>
                   </div>
                )}
                <span className="text-sm font-bold text-[#3D1202] uppercase tracking-wider">{store.name}</span>
              </div>
            ))}
            {/* Fallbacks if stores are empty */}
            {stores.length === 0 && [...Array(3)].fill(0).map((_, i) => (
              <div key={`fallback-${i}`} className="flex gap-28 items-center">
                <div className="flex flex-col items-center gap-3"><span className="text-3xl font-black text-[#3D1202]">ZARA</span><span className="text-sm font-bold text-[#3D1202]">ZARA</span></div>
                <div className="flex flex-col items-center gap-3"><span className="text-3xl font-black text-[#3D1202]">H&M</span><span className="text-sm font-bold text-[#3D1202]">H&M</span></div>
                <div className="flex flex-col items-center gap-3"><span className="text-3xl font-black text-[#3D1202]">COS</span><span className="text-sm font-bold text-[#3D1202]">COS</span></div>
                <div className="flex flex-col items-center gap-3"><span className="text-3xl font-black text-[#3D1202]">NIKE</span><span className="text-sm font-bold text-[#3D1202]">NIKE</span></div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. TRENDING PRODUCTS */}
      <section className="py-12 lg:py-16 bg-[#F9F6F1]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-[#3D1202] tracking-tight mb-3">Trending Now.</h2>
              <p className="text-lg text-[#3D1202]/60 font-medium">The most coveted pieces this season.</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 font-bold text-[#3D1202] border-b-2 border-[#3D1202] pb-1 hover:text-[#FF8A00] hover:border-[#FF8A00] transition-colors">
              Explore All
            </Link>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-10">
              {newArrivals.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
             <Link to="/products" className="inline-block px-8 py-4 rounded-full border border-[#3D1202]/20 font-bold text-[#3D1202] w-full text-center">
               View All Products
             </Link>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS (GLASSMORPHISM) */}
      <section className="py-12 lg:py-16 relative bg-[#3D1202] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
           <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover grayscale mix-blend-multiply" alt="Texture" />
        </div>
        
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">The Verdict.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah J.", role: "Fashion Editor", review: "StyleAtHome is a revelation. The ability to touch and try fabrics before committing is exactly what online retail has been missing." },
              { name: "Michael T.", role: "Creative Director", review: "An incredibly frictionless experience. The executives are professional, and the curated collection is second to none." },
              { name: "Priya R.", role: "Entrepreneur", review: "I don't have time for returns. The Home Trial model saves me hours every month while keeping my wardrobe updated." }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 lg:p-10 rounded-3xl"
              >
                <div className="flex text-[#FF8A00] mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg md:text-xl text-white font-medium leading-relaxed mb-8">"{t.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full" />
                  <div>
                    <h4 className="font-bold text-white">{t.name}</h4>
                    <p className="text-sm text-white/50">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. STATISTICS (ANIMATED COUNTERS) */}
      <section className="py-12 bg-white border-b border-black/5">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x-0 md:divide-x divide-black/10">
            {[
              { num: 250, suffix: "+", label: "Premium Brands" },
              { num: 10, suffix: "K+", label: "Home Trials" },
              { num: 50, suffix: "K+", label: "Orders Fulfilled" },
              { num: 99, suffix: "%", label: "Satisfaction Rate" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-5xl md:text-6xl font-black text-[#3D1202] mb-2 tracking-tighter">
                  <Counter to={stat.num} /><span className="text-[#FF8A00]">{stat.suffix}</span>
                </div>
                <div className="text-sm font-bold text-[#3D1202]/50 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHY HOME TRIAL IS BETTER (COMPARISON) */}
      <section className="py-12 lg:py-16 bg-[#F9F6F1]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 w-full order-2 lg:order-1">
            <h2 className="text-3xl md:text-5xl font-black text-[#3D1202] tracking-tight mb-12">The Evolution<br/>of Shopping.</h2>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
              <div className="grid grid-cols-3 pb-6 border-b border-black/5 font-bold text-sm tracking-widest uppercase">
                <div className="col-span-1"></div>
                <div className="col-span-1 text-center text-[#3D1202]/40">Traditional</div>
                <div className="col-span-1 text-center text-[#FF8A00]">StyleAtHome</div>
              </div>
              
              {[
                "Try before paying",
                "Fit guarantee",
                "Instant returns",
                "Zero return hassle"
              ].map((feature, i) => (
                <div key={i} className="grid grid-cols-3 py-6 border-b border-black/5 last:border-0 items-center">
                  <div className="col-span-1 font-bold text-[#3D1202]">{feature}</div>
                  <div className="col-span-1 flex justify-center"><XCircle size={24} className="text-[#3D1202]/20" /></div>
                  <div className="col-span-1 flex justify-center"><CheckCircle2 size={24} className="text-[#FF8A00]" /></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full order-1 lg:order-2">
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop" 
                alt="Editorial" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#3D1202]/10 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION BANNER */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
          <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#3D1202] to-[#6B2D0F] px-8 py-12 text-center shadow-2xl flex flex-col items-center">
            {/* Animated abstract shapes */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] rounded-full border border-white/5 border-dashed"
            />
            
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-8">
                Experience Fashion <br/> <span className="text-[#FF8A00] italic">At Home.</span>
              </h2>
              <p className="text-xl text-white/70 font-medium mb-12 max-w-xl mx-auto">
                Join thousands of users who have upgraded their shopping experience.
              </p>
              
              <Link to="/trial-booking" className="inline-flex items-center gap-3 bg-white text-[#3D1202] hover:bg-[#FF8A00] hover:text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl group">
                Start Your Home Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
