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
    <div 
      className="group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[12px] p-3 shadow-sm border border-border hover:-translate-y-[5px] hover:shadow-md transition-all duration-300"
    >
      <Link 
        to={`/product/${product.id}`} 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block relative w-full aspect-[4/5] rounded-lg overflow-hidden mb-3 bg-black/5 dark:bg-white/5"
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full h-full relative"
        >
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
          
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-white dark:bg-zinc-800 text-orange-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              {discount}% OFF
            </span>
          )}
          {product.is_new_arrival && (
            <span className="absolute top-2 right-2 bg-white dark:bg-zinc-800 text-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              NEW
            </span>
          )}
          
          {/* Compact Rating Badge */}
          {product.rating && (
            <div className="absolute bottom-2 left-2 h-[22px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-1.5 rounded text-[11px] font-bold text-foreground flex items-center gap-1 shadow-sm z-10">
              {product.rating} <span className="text-green-600 text-[10px]">★</span> <span className="text-muted-foreground font-medium pl-0.5">| {product.review_count}</span>
            </div>
          )}

          {/* Action Buttons Overlay */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
            <button 
              onClick={(e) => { e.preventDefault(); handleAddToCart(); }}
              className="bg-primary text-primary-foreground text-[11px] font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1 hover:scale-105"
            >
              <ShoppingBag size={12} /> Cart
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); handleAddToTrial(); }}
              className="bg-foreground text-background text-[11px] font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1 hover:scale-105"
            >
              <Shirt size={12} /> Try Me
            </button>
          </div>
        </motion.div>
      </Link>

      <div className="flex flex-col flex-1 justify-between">
        <div className="relative">
          <p className="text-[12px] font-[600] text-[#666] dark:text-gray-400 uppercase tracking-wide mb-1 pr-8">
            {product.brand}
          </p>
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className="absolute top-0 right-0 p-1 -mt-1 -mr-1 transition-transform active:scale-90"
          >
            <Heart size={16} fill={isInWishlist ? '#ef4444' : 'none'} className={isInWishlist ? 'text-red-500' : 'text-muted-foreground'} />
          </button>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-[15px] font-[500] text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-[22px] text-foreground">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[15px] font-medium text-gray-500 line-through">₹{product.mrp}</span>
            )}
            {discount > 0 && (
              <span className="text-[14px] font-medium text-orange-500 ml-1">({discount}% OFF)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
