import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Store } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Stores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      const { data } = await supabase.from('stores').select('*').eq('is_active', true).order('name');
      if (data) setStores(data as Store[]);
      setLoading(false);
    }
    fetchStores();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16 sm:mt-24 space-y-6"
    >
      <div>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Fashion Stores</h1>
        <p className="text-muted-foreground">Browse products from top fashion brands directly connected to you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stores.map((store, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={store.id} 
            className="bento-card !p-0 overflow-hidden group flex flex-col"
          >
            <div className="relative h-40 overflow-hidden bg-muted/30">
              <img src={store.banner_url || `https://picsum.photos/seed/${store.slug}/600/300`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-bean/60 to-transparent" />
              <img src={store.logo_url || `https://picsum.photos/seed/${store.slug}-logo/150/150`} alt={store.name} className="absolute bottom-[-20px] left-6 w-16 h-16 rounded-full border-4 border-background object-cover shadow-lg" />
            </div>
            <div className="pt-8 p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-foreground tracking-tight">{store.name}</h2>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">{store.description || 'Discover amazing products from ' + store.name}</p>
              
              <Link
                to={`/store/${store.slug}`}
                className="mt-6 w-full bg-foreground hover:bg-primary text-background text-sm font-bold px-5 py-3 rounded-xl transition-all duration-300 text-center shadow-sm hover:-translate-y-[1px] active:scale-[0.98]"
              >
                Visit Store
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
