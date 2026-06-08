import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles, Truck, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dbUser } = useDbUser();
  const addToCart = useStore((state) => state.addToCart);
  const addToTrialCart = useStore((state) => state.addToTrialCart);
  const toggleWishlistStore = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{ days: string; cod: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      
      const { data: prodData } = await supabase
        .from('products')
        .select('*, store:stores(*)')
        .eq('id', id)
        .single();
        
      if (prodData) {
        setProduct(prodData);
        setSelectedColor(prodData.color || '');
        const sizes = prodData.sizes?.split(',') || [];
        if (sizes.length) setSelectedSize(sizes[0].trim());
        
        // Fetch related products
        const { data: relData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', prodData.category_id)
          .neq('id', id)
          .limit(4);
        if (relData) setRelated(relData as Product[]);
      }

      // Fetch reviews
      const { data: revData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id);
      if (revData) setReviews(revData);

      setLoading(false);
    }
    
    fetchData();
  }, [id]);

  const checkPincode = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({ days: '3-5', cod: true });
      toast.success('Delivery available to this pincode');
    } else {
      toast.error('Enter a valid 6-digit pincode');
    }
  };

  const handleAddToCart = () => {
    if (dbUser) {
      addToCart(dbUser.id, Number(id));
      toast.success('Added to cart');
    } else {
      toast.error("Please sign in to add items to cart");
    }
  };

  const handleAddToTrial = () => {
    if (dbUser) {
      addToTrialCart(dbUser.id, Number(id), selectedSize, selectedColor);
      toast.success('Added to home trial cart');
    } else {
      toast.error("Please sign in to add items for home trial");
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-purple-600 hover:underline">Go Back</button>
    </div>
  );

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const sizes = product.sizes?.split(',') || ['S', 'M', 'L', 'XL'];
  const isInWishlist = wishlist.includes(Number(id));
  
  const handleToggleWishlist = () => {
    if (dbUser) toggleWishlistStore(dbUser.id, Number(id));
    else toast.error("Please sign in to add items to wishlist");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-16 sm:mt-24"
    >
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="glass-card overflow-hidden p-4 sm:p-8 flex items-center justify-center">
          <motion.div 
            className="aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/50"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 cursor-zoom-in"
            />
          </motion.div>
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2 text-foreground tracking-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-4">
            <span className="bg-green-600/10 text-green-700 dark:text-green-400 px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
              {product.rating} <span className="text-xs">★</span>
            </span>
            <span className="text-sm text-muted-foreground">{product.review_count} ratings</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-black text-foreground">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-muted-foreground line-through text-lg">₹{product.mrp}</span>
                <span className="text-destructive font-bold text-sm bg-destructive/10 px-2 py-1 rounded-full shadow-sm">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-base text-muted-foreground mt-6 leading-relaxed">{product.description}</p>

          {product.color && (
            <div className="mt-8">
              <p className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Color: <span className="text-foreground">{selectedColor}</span></p>
              <button className="w-10 h-10 rounded-full ring-2 ring-purple-600 ring-offset-2 ring-offset-background bg-zinc-800 shadow-md" title={product.color} />
            </div>
          )}

          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Size</p>
              <button className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline">Size Guide</button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((s: string) => {
                const size = s.trim();
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${
                      selectedSize === size 
                        ? 'bg-purple-600 text-white ring-2 ring-purple-600/30 ring-offset-1' 
                        : 'bg-background border border-border hover:border-purple-400 text-foreground'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <input
              type="text"
              placeholder="Enter pincode"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button onClick={checkPincode} className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors">Check Delivery</button>
          </div>
          {deliveryInfo && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1.5 font-medium">
              <Truck size={14} /> Delivery in {deliveryInfo.days} business days | COD available
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button
              onClick={handleAddToTrial}
              className="flex-1 flex items-center justify-center gap-2 glass border border-purple-600/30 text-purple-600 dark:text-purple-400 font-bold py-4 rounded-2xl transition-all hover:bg-purple-600/5 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <Sparkles size={20} /> Add to Trial
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center ${
                isInWishlist ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-border hover:border-foreground'
              }`}
            >
              <Heart size={24} fill={isInWishlist ? 'currentColor' : 'none'} className="transition-all" />
            </button>
          </div>

          {product.store && (
            <Link to={`/store/${product.store.slug}`} className="inline-block mt-8 text-sm text-purple-600 font-bold hover:underline">
              Explore more from {product.store.name} &rarr;
            </Link>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-black mb-6 tracking-tight">Customer Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="glass-card p-6">
                <div className="flex items-center gap-2">
                  <span className="bg-green-600/10 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">{r.rating} ★</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-black mb-6 tracking-tight">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </motion.div>
  );
}
