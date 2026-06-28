import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Shirt, Truck, ChevronLeft, Star, Send } from 'lucide-react';
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
  const { dbUser, isLoading: isUserLoading } = useDbUser();
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
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      
      const { data: prodData } = await supabase
        .from('products')
        .select('*, store:stores(*)')
        .eq('id', id)
        .eq('is_active', true)
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
          .eq('is_active', true)
          .neq('id', id)
          .limit(4);
        if (relData) setRelated(relData as Product[]);
      }

      // Fetch reviews
      const { data: revData } = await supabase
        .from('reviews')
        .select('*, user:users(name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      if (revData) setReviews(revData);

      setLoading(false);
    }
    
    fetchData();
  }, [id]);

  const checkPincode = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({ days: '3-7', cod: true });
      toast.success('Delivery typically available across India');
    } else {
      toast.error('Enter a valid 6-digit pincode');
    }
  };

  const handleAddToCart = () => {
    if (dbUser) {
      addToCart(dbUser.id, product.id);
      toast.success('Added to cart');
    } else if (isUserLoading) {
      toast.error('Please wait, syncing your profile...');
    } else {
      toast.error("Please sign in to add items to cart");
    }
  };

  const handleAddToTrial = () => {
    if (dbUser) {
      addToTrialCart(dbUser.id, product.id, selectedSize, selectedColor);
      toast.success('Added to home trial cart');
    } else if (isUserLoading) {
      toast.error('Please wait, syncing your profile...');
    } else {
      toast.error("Please sign in to add items for home trial");
    }
  };

  const handleSubmitReview = async () => {
    if (isUserLoading) { toast.error("Please wait, syncing your profile..."); return; }
    if (!dbUser) { toast.error("Sign in to write a review"); return; }
    if (!reviewText.trim()) { toast.error("Write something first"); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: Number(id),
      user_id: dbUser.id,
      rating: reviewRating,
      comment: reviewText.trim(),
    });
    if (!error) {
      toast.success('Review submitted');
      setReviewText('');
      setReviewRating(5);
      // Refetch reviews
      const { data } = await supabase.from('reviews').select('*, user:users(name)').eq('product_id', id).order('created_at', { ascending: false });
      if (data) setReviews(data);
    } else {
      toast.error('Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline font-bold">Go Back</button>
    </div>
  );

  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const sizes = product.sizes?.split(',') || ['S', 'M', 'L', 'XL'];
  const isInWishlist = wishlist.includes(Number(id));
  
  const handleToggleWishlist = () => {
    if (dbUser) toggleWishlistStore(dbUser.id, Number(id));
    else if (isUserLoading) toast.error("Please wait, syncing your profile...");
    else toast.error("Please sign in to add items to wishlist");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-16 sm:mt-24"
    >
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors font-bold">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bento-card overflow-hidden p-4 sm:p-8 flex items-center justify-center border border-border/50">
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
            <span className="bg-cadmium/10 text-cadmium px-2.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
              {product.rating} <Star size={12} fill="currentColor" />
            </span>
            <span className="text-sm text-muted-foreground font-medium">{product.review_count} ratings</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-black text-foreground font-mono">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-muted-foreground line-through text-lg font-mono">₹{product.mrp}</span>
                <span className="text-destructive font-bold text-sm bg-destructive/10 px-2 py-1 rounded-full shadow-sm">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-base text-muted-foreground mt-6 leading-relaxed">{product.description}</p>

          {product.color && (
            <div className="mt-8">
              <p className="text-sm font-bold mb-3 uppercase tracking-wider text-muted-foreground">Color: <span className="text-foreground">{selectedColor}</span></p>
              <button className="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background bg-foreground shadow-md" title={product.color} />
            </div>
          )}

          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Size</p>
              <button className="text-xs text-primary font-bold hover:underline">Size Guide</button>
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
                        ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-1' 
                        : 'bg-background border border-border hover:border-primary text-foreground'
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
              className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            />
            <button onClick={checkPincode} className="text-sm font-bold text-primary hover:text-cadmium transition-colors">Check Delivery</button>
          </div>
          {deliveryInfo && (
            <p className="text-xs text-cadmium mt-2 flex items-center gap-1.5 font-bold">
              <Truck size={14} /> Delivery in {deliveryInfo.days} business days | COD available
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background hover:bg-primary font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button
              onClick={handleAddToTrial}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-primary/30 text-primary font-bold py-4 rounded-2xl transition-all hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <Shirt size={20} /> Add to Trial
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center ${
                isInWishlist ? 'border-cadmium text-cadmium bg-cadmium/10' : 'border-border hover:border-foreground'
              }`}
            >
              <Heart size={24} fill={isInWishlist ? 'currentColor' : 'none'} className="transition-all" />
            </button>
          </div>

          {product.store && (
            <Link to={`/store/${product.store.slug}`} className="inline-block mt-8 text-sm text-primary font-bold hover:underline">
              Explore more from {product.store.name} &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Review Submission */}
      <section className="mt-20">
        <h2 className="text-2xl font-black mb-6 tracking-tight">Write a Review</h2>
        <div className="bento-card border border-border/50 space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Rating:</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)} className={`transition-colors ${n <= reviewRating ? 'text-cadmium' : 'text-border'}`}>
                  <Star size={20} fill={n <= reviewRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-medium transition-colors outline-none resize-none"
          />
          <button
            onClick={handleSubmitReview}
            disabled={submittingReview}
            className="bg-foreground hover:bg-primary text-background font-bold py-3 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={16} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-black mb-6 tracking-tight">Customer Reviews ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bento-card p-6 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-cadmium/10 text-cadmium text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">{r.rating} <Star size={10} fill="currentColor" /></span>
                    <span className="text-sm font-bold text-foreground">{r.user?.name || 'Anonymous'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{new Date(r.created_at).toLocaleDateString()}</span>
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
