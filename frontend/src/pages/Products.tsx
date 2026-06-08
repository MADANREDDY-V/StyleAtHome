import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popularity');
  const [filters, setFilters] = useState<any>({
    section: searchParams.get('section') || null,
    search: searchParams.get('search') || null,
    brand: searchParams.get('brand') || null,
  });

  useEffect(() => {
    setFilters((f: any) => ({
      ...f,
      section: searchParams.get('section') || null,
      search: searchParams.get('search') || null,
      brand: searchParams.get('brand') || null,
    }));
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch categories
      let catQuery = supabase.from('categories').select('*');
      if (filters.section) catQuery = catQuery.eq('section', filters.section);
      const { data: catData } = await catQuery;
      if (catData) setCategories(catData as Category[]);

      // Fetch products
      let query = supabase.from('products').select('*');
      
      if (filters.section) query = query.eq('section', filters.section);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.brand) query = query.eq('brand', filters.brand);
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.color) query = query.eq('color', filters.color);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.minRating) query = query.gte('rating', filters.minRating);

      if (sort === 'price_low') query = query.order('price', { ascending: true });
      else if (sort === 'price_high') query = query.order('price', { ascending: false });
      else if (sort === 'newest') query = query.order('created_at', { ascending: false });
      else query = query.order('review_count', { ascending: false }); // popularity

      const { data: prodData } = await query;
      if (prodData) {
        setProducts(prodData as Product[]);
        // Extract unique brands from the current section
        const uniqueBrands = Array.from(new Set(prodData.map((p) => p.brand))).filter(Boolean);
        setBrands(uniqueBrands);
      }

      setLoading(false);
    }
    
    fetchData();
  }, [filters, sort]);

  const title = filters.section || (filters.search ? `Results for "${filters.search}"` : 'All Products');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16 sm:mt-24"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-black/5 dark:bg-white/5 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none min-w-[160px] cursor-pointer"
        >
          <option value="popularity">Sort by: Popularity</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 flex-shrink-0">
          <ProductFilters filters={filters} onChange={setFilters} brands={brands} categories={categories} />
        </div>
        <div className="flex-1">
          {loading ? (
             <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria</p>
              <button 
                onClick={() => setFilters({ section: filters.section })}
                className="mt-6 text-purple-600 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
            >
              {products.map((p) => (
                <motion.div 
                  key={p.id} 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                  }}
                  layout
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
