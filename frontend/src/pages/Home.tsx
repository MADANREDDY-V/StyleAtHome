import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, TrendingUp, ShoppingBag, ShieldCheck, 
  RefreshCcw, Star, Home as HomeIcon, Truck, Users, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Product, Store } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, storesRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_new_arrival', true).eq('is_active', true).limit(8),
        supabase.from('stores').select('*').eq('is_active', true).limit(6)
      ]);
      
      if (productsRes.data) setNewArrivals(productsRes.data as Product[]);
      if (storesRes.data) setStores(storesRes.data as Store[]);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden bg-background">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12">
        {/* Left Side: Typography & CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 space-y-8 z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hidden md:flex w-fit">
            <Logo size={16} className="text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-foreground">StyleAtHome</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.1] tracking-tight text-foreground">
            Elevate Your <span className="text-primary">Style.</span><br />
            <span className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-muted-foreground mt-2 block leading-tight">
              Experience Fashion Like Never Before.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-[500px]">
            Discover curated collections from premium brands. Shop with confidence using our exclusive home trial service.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/products" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-bold transition-all hover:-translate-y-1 shadow-md">
              Discover Collection
            </Link>
            <Link to="/trial-booking" className="px-8 py-4 rounded-full font-bold text-foreground border-2 border-border hover:border-primary transition-colors hover:text-primary">
              Book Home Trial
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-6 text-sm font-semibold text-foreground/80">
            <span className="flex items-center gap-2"><HomeIcon size={16} className="text-primary" /> Free Home Trial</span>
            <span className="flex items-center gap-2"><RefreshCcw size={16} className="text-primary" /> Easy Returns</span>
            <span className="flex items-center gap-2"><Star size={16} className="text-primary" /> Premium Brands</span>
          </div>
        </motion.div>

        {/* Right Side: Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 w-full relative"
        >
          <div className="relative aspect-[4/5] lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop" 
              alt="Fashion Model" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </section>

      {/* 2. Features / Highlights */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: HomeIcon, title: "Home Trial", desc: "Try before you buy with ease." },
              { icon: Star, title: "Premium Brands", desc: "Top global & local fashion brands." },
              { icon: RefreshCcw, title: "Easy Returns", desc: "Hassle-free returns & exchanges." },
              { icon: ShieldCheck, title: "Secure Payments", desc: "100% safe & secure transactions." }
            ].map((f, i) => (
              <div key={i} className="bg-card border border-border/50 p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Popular Categories */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 text-foreground">Shop By Category</h2>
          <p className="text-muted-foreground text-lg">Explore our most popular collections</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { name: "Men", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" },
            { name: "Women", img: "https://images.unsplash.com/photo-1485230895905-ef0e1bb425c2?q=80&w=800&auto=format&fit=crop" },
            { name: "Kids", img: "https://images.unsplash.com/photo-1519238396522-870631622830?q=80&w=800&auto=format&fit=crop" },
            { name: "Footwear", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" },
            { name: "Accessories", img: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=800&auto=format&fit=crop" },
          ].map((cat, i) => (
            <Link key={i} to={`/products?section=${cat.name === 'Kids' || cat.name === 'Footwear' || cat.name === 'Accessories' ? '' : cat.name}`} className="group flex flex-col items-center">
              <div className="w-full aspect-square rounded-full overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-all duration-300 ring-4 ring-transparent group-hover:ring-primary/20">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              </div>
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Why Choose StyleAtHome? */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
              <img src="https://images.unsplash.com/photo-1558769132-cb1fac0840c2?q=80&w=1200&auto=format&fit=crop" alt="Why Choose Us" className="w-full h-full object-cover" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-xl hidden md:block">
              <div className="text-4xl font-black text-primary mb-1">10K+</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Home Trials Completed</div>
            </div>
          </div>
          <div className="flex-1 space-y-10">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-4 text-foreground">Why Choose StyleAtHome?</h2>
              <p className="text-muted-foreground text-lg">We bridge the gap between online convenience and the fitting room experience.</p>
            </div>
            <div className="space-y-8">
              {[
                { icon: ShoppingBag, title: "Curated Selections", desc: "Handpicked styles from top-tier brands tailored to your preferences." },
                { icon: Truck, title: "Lightning Fast Delivery", desc: "Get your trial items delivered to your doorstep within 24 hours." },
                { icon: Users, title: "Personal Styling", desc: "Access to professional fashion advice from our in-house experts." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1 text-foreground">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promo / Offer Banner */}
      <section className="py-12 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#6B2D0F] to-[#FF8A00] px-8 py-16 md:px-16 md:py-24 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1605289982774-9a6fef564df8?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
          <div className="relative z-10 text-white space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">End of Season Sale</h3>
            <h2 className="text-4xl md:text-6xl font-black">UP TO 50% OFF</h2>
            <p className="text-lg md:text-xl text-white/90 font-medium">On 1500+ Premium Styles. Limited Time Only.</p>
          </div>
          <div className="relative z-10">
            <Link to="/products" className="bg-white text-[#6B2D0F] hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 inline-block shadow-lg">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* 6. New Arrivals (using requested PLP grid) */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black mb-2 text-foreground">New Season. New Styles.</h2>
            <p className="text-muted-foreground text-lg">Fresh arrivals for the season.</p>
          </div>
          <Link to="/products?sort=newest" className="hidden md:flex items-center gap-2 font-bold hover:text-primary transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-3 gap-y-4 md:gap-x-[20px] md:gap-y-[16px]">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Trusted Brands / Partners */}
      <section className="py-16 bg-muted/30 border-y border-border/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h3 className="text-center text-sm font-bold tracking-widest text-muted-foreground uppercase mb-10">Trusted By Premium Brands</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center justify-center">
                {store.logo_url ? (
                   <img src={store.logo_url} alt={store.name} className="h-10 md:h-14 object-contain brightness-0 dark:invert transition-all hover:brightness-100" />
                ) : (
                   <span className="text-2xl font-black text-foreground">{store.name}</span>
                )}
              </div>
            ))}
            {/* Fallbacks if stores are empty */}
            {stores.length === 0 && (
              <>
                <span className="text-2xl font-black text-foreground">HIGHLANDER</span>
                <span className="text-2xl font-black text-foreground">ROADSTER</span>
                <span className="text-2xl font-black text-foreground">ZARA</span>
                <span className="text-2xl font-black text-foreground">H&M</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8. Customer Trust / Stats */}
      <section className="py-16 max-w-[1400px] mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
          <div>
            <div className="text-4xl font-black text-foreground mb-2">10K+</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Happy Customers</div>
          </div>
          <div>
            <div className="text-4xl font-black text-foreground mb-2">500+</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Top Brands</div>
          </div>
          <div>
            <div className="text-4xl font-black text-foreground mb-2">99%</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-black text-foreground mb-2">24/7</div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Support</div>
          </div>
        </div>
      </section>

    </div>
  );
}
