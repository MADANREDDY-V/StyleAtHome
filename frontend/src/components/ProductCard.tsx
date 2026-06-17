import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Shirt } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import type { Product } from '../types';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { dbUser } = useDbUser();
  const addToCart = useStore((state) => state.addToCart);
  const addToTrialCart = useStore((state) => state.addToTrialCart);
  const toggleWishlistStore = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  
  const isInWishlist = wishlist.includes(product.id);
  const toggleWishlist = (id: number) => {
    if (dbUser) toggleWishlistStore(dbUser.id, id);
    else toast.error("Please sign in to add items to wishlist");
  };

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const handleAddToCart = () => {
    if (dbUser) {
      addToCart(dbUser.id, product.id);
      toast.success(`${product.name} added to cart`);
    } else toast.error("Please sign in to add items to cart");
  };

  const handleAddToTrial = () => {
    if (dbUser) {
      addToTrialCart(dbUser.id, product.id);
      toast.success(`${product.name} added to trial`);
    } else toast.error("Please sign in to book a home trial");
  };

  // Magnetic Physics for Image Container
  const cardRef = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    mouseX.set(mouseXPos / width - 0.5);
    mouseY.set(mouseYPos / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="group flex flex-col h-full">
      <Link 
        to={`/product/${product.id}`} 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-4"
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          <motion.img
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover bg-black/5 dark:bg-white/5"
            loading="lazy"
          />
          {/* Subtle liquid glass overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-bean/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-primary text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-full tracking-wider shadow-md">
              {discount}% OFF
            </span>
          )}
          {product.is_new_arrival && (
            <span className="absolute top-4 right-4 bg-white/90 text-bean text-[10px] uppercase font-black px-3 py-1.5 rounded-full tracking-wider shadow-md backdrop-blur-sm">
              NEW
            </span>
          )}
        </motion.div>
      </Link>

      <div className="flex flex-col flex-1 justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{product.brand}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-base font-bold text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-sm flex items-center gap-1">
              {product.rating} <span>★</span>
            </span>
            <span className="text-xs font-bold text-muted-foreground">({product.review_count} reviews)</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-black text-xl text-foreground font-mono">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm font-bold text-muted-foreground line-through font-mono">₹{product.mrp}</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground hover:bg-primary text-background font-bold py-3 rounded-2xl transition-all hover:-translate-y-[2px] active:scale-[0.98] shadow-sm"
            >
              <ShoppingBag size={16} /> Cart
            </button>
            <button
              onClick={handleAddToTrial}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-border hover:border-primary text-foreground hover:text-primary font-bold py-3 rounded-2xl transition-all hover:-translate-y-[2px] active:scale-[0.98]"
            >
              <Shirt size={16} /> Trial
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 rounded-2xl border-2 transition-all hover:-translate-y-[2px] active:scale-[0.98] ${
                isInWishlist 
                  ? 'text-cadmium border-cadmium bg-cadmium/10' 
                  : 'text-muted-foreground border-border hover:border-foreground hover:text-foreground'
              }`}
            >
              <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} className="transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
