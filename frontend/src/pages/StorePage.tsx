import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store as StoreIcon, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Store } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (!slug) return;

      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

      if (storeData) {
        setStore(storeData as Store);
        
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .eq('is_active', true);
          
        if (productsData) {
          setProducts(productsData as Product[]);
        }
      }
      setLoading(false);
    }
    
    fetchData();
  }, [slug]);

  const filtered = section
    ? products.filter((p) => p.section === section)
    : products;

  if (loading) return <LoadingSpinner fullPage />;
  if (!store) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <StoreIcon className="text-muted-foreground/30 mb-4" size={48} />
      <h2 className="text-2xl font-bold">Store not found</h2>
      <p className="text-muted-foreground mt-2">We couldn't find the store you're looking for.</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-16 sm:mt-24 space-y-8"
    >
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bento-card !p-0">
        <img src={store.banner_url || `https://picsum.photos/seed/${store.slug}/1200/400`} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bean/80 via-bean/30 to-transparent flex items-end">
          <div className="p-8 flex items-end gap-6 w-full">
            <img src={store.logo_url || `https://picsum.photos/seed/${store.slug}-logo/150/150`} alt="" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background object-cover shadow-2xl" />
            <div className="pb-2">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{store.name}</h1>
              <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl">{store.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['', 'Men', 'Women', 'Kids'].map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                section === s 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-muted/50 text-foreground hover:bg-muted'
              }`}
            >
              {s || 'All Categories'}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{section || 'All'} Products</h2>
          <p className="text-sm font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{filtered.length} items</p>
        </div>
        
        {filtered.length === 0 ? (
          <div className="text-center py-20 bento-card border border-border/50">
            <ShoppingBag className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <p className="text-muted-foreground font-medium">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
