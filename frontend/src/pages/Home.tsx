import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Compass, ShoppingBag } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Product, Store } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, storesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_new_arrival', true).eq('is_active', true).limit(6),
        supabase.from('stores').select('*').eq('is_active', true).limit(4)
      ]);
      
      if (productsRes.data) setNewArrivals(productsRes.data as Product[]);
      if (storesRes.data) setStores(storesRes.data as Store[]);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden">
      
      {/* Asymmetric Split-Screen Hero */}
      <section className="relative min-h-[100dvh] pt-32 pb-16 flex flex-col lg:flex-row items-center max-w-[1400px] mx-auto px-4 sm:px-6 gap-12 lg:gap-20">
        
        {/* Left Typography Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex-1 w-full z-10 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <Logo size={16} className="text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-foreground">The Enterprise Wardrobe</span>
          </div>
          
          <h1 className="text-6xl md:text-[5rem] lg:text-[6rem] font-black leading-[0.9] tracking-tighter">
            Elevate Your <br />
            <span className="text-primary">Identity.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-[45ch] leading-relaxed font-medium">
            Curated collections from premier boutiques, delivered to your door. Experience fashion through an enterprise-grade home trial ecosystem.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/products" className="group relative overflow-hidden bg-foreground text-background px-8 py-5 rounded-full font-bold flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative z-10">Discover Collection</span>
              <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </Link>
            
            <Link to="/trial-booking" className="px-8 py-5 rounded-full font-bold text-foreground border-2 border-border hover:border-primary transition-colors hover:text-primary">
              Book Home Trial
            </Link>
          </div>

          {/* Perpetual Micro-Animation Stats */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-border/50">
            {[
              { label: "Premium Brands", value: "240+" },
              { label: "Home Trials", value: "10k+" },
              { label: "Happy Clients", value: "99.2%" }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1), type: "spring" }}
              >
                <div className="text-3xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Asset Side (Parallax) */}
        <div className="flex-1 w-full relative h-[60vh] lg:h-[80vh] rounded-[2.5rem] overflow-hidden group">
          <motion.div 
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-[-10%] bg-cover bg-center"
          >
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
              alt="High Fashion" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          {/* Liquid Refraction Overlay */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[2.5rem] pointer-events-none" />
        </div>
      </section>

      {/* Bento Grid Features & Stores */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Curated Hubs</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Explore our premier store partners. Each bringing a unique enterprise aesthetic to your wardrobe.</p>
            </div>
            <Link to="/stores" className="hidden md:flex items-center gap-2 font-bold hover:text-primary transition-colors">
              View All Stores <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stores.map((store, i) => (
                <motion.div 
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                >
                  <Link to={`/store/${store.slug}`} className="block bento-card group hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden h-full">
                    {/* Magnetic-style subtle hover background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="w-16 h-16 bg-background rounded-2xl p-3 shadow-sm mb-8 ring-1 ring-border group-hover:scale-110 transition-transform duration-300">
                        <img src={store.logo_url || `https://picsum.photos/seed/${store.slug}-logo/150/150`} alt={store.name} className="w-full h-full object-contain rounded-xl" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{store.name}</h4>
                        <p className="text-sm font-medium text-muted-foreground line-clamp-2">Discover premium collections from {store.name}.</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Masonry-style New Arrivals */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">The Avant-Garde</h2>
              <p className="text-muted-foreground font-medium mt-2">Latest additions to our enterprise catalog.</p>
            </div>
          </div>
          <Link to="/products?sort=newest" className="font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors">
            Explore Collection
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-3 gap-y-4 md:gap-x-[20px] md:gap-y-[16px]">
            {newArrivals.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: (i % 3) * 0.15, type: "spring", stiffness: 100, damping: 20 }}
                className=""
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Enterprise Features Bento */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 pr-0 lg:pr-12">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight text-white">
                Enterprise <span className="text-primary">Fulfillment.</span>
              </h2>
              <p className="text-lg text-white/70 font-medium max-w-md">
                We've built an infrastructure designed to deliver perfection. From dedicated home trials to seamless logistics.
              </p>
              
              <div className="space-y-6 pt-6">
                {[
                  { icon: Compass, title: 'Precision Logistics', desc: 'Real-time tracking and pinpoint delivery accuracy.' },
                  { icon: ShoppingBag, title: 'Dedicated Wardrobe Trial', desc: 'Try up to 5 items simultaneously at home.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-primary transition-colors duration-300">
                      <item.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-white/60 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Perpetual Dashboard Mockup (Anti-Slop Implementation) */}
            <div className="relative h-[500px] rounded-[2.5rem] bg-bean/50 border border-white/10 overflow-hidden flex items-center justify-center p-8">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                 className="w-full max-w-sm liquid-glass rounded-3xl p-6 shadow-2xl relative z-10"
               >
                 <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                   <div className="h-4 w-24 bg-white/20 rounded-full animate-pulse" />
                   <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
                     <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                   </div>
                 </div>
                 <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 shrink-0" />
                       <div className="space-y-2 w-full">
                         <div className="h-3 w-full bg-white/10 rounded-full" />
                         <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                       </div>
                     </div>
                   ))}
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
