import { Link } from 'react-router-dom';
import { Trash2, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';

export default function Cart() {
  const { isSignedIn } = useUser();
  const { dbUser, isLoading } = useDbUser();
  const cart = useStore((state) => state.cart);
  const addToCart = useStore((state) => state.addToCart);
  const removeFromCart = useStore((state) => state.removeFromCart);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-4xl font-black mb-6 tracking-tight">Identity Required</h2>
        <Link to="/sign-in" className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:-translate-y-1 transition-transform">Authenticate</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="mt-32 text-center text-muted-foreground font-bold animate-pulse uppercase tracking-widest">Loading Requisition...</div>;
  }

  const cartTotal = cart.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0);
  const tax = cartTotal * 0.05;
  const total = cartTotal + tax;

  const updateQuantity = (productId: number, newQty: number, cartItemId: number) => {
    if (newQty < 1) return;
    if (dbUser) addToCart(dbUser.id, productId, newQty - cart.find(i => i.id === cartItemId)!.quantity);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-24 sm:mt-32 mb-24 max-w-[1400px] mx-auto px-4 sm:px-6"
    >
      <div className="flex items-end justify-between mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Current <br />
          <span className="text-primary">Requisition.</span>
        </h1>
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-full">
          {cart.length} Items Selected
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-32 bento-card border border-border/50">
          <ShoppingBag className="mx-auto mb-6 text-muted-foreground/30" size={64} />
          <h2 className="text-2xl font-black mb-2">Requisition Empty</h2>
          <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">You have not selected any items for your current order cycle.</p>
          <Link to="/products" className="bg-primary text-white font-bold px-8 py-4 rounded-full hover:bg-primary/90 transition-colors inline-block shadow-md hover:-translate-y-1 active:translate-y-0">Curate Items</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  key={item.id} 
                  className="bento-card !p-4 sm:!p-6 flex flex-col sm:flex-row gap-6 shadow-sm border border-border/50 group"
                >
                  <div className="w-full sm:w-32 h-48 sm:h-40 shrink-0 rounded-2xl overflow-hidden bg-muted/30 relative">
                    <img src={item.product?.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-2xl pointer-events-none" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{item.product?.brand}</p>
                        <h3 className="font-black text-lg sm:text-xl text-foreground line-clamp-2 leading-tight">{item.product?.name}</h3>
                        <p className="font-mono font-black mt-2 text-xl">₹{item.product?.price}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-muted-foreground hover:text-red-500 bg-muted/30 hover:bg-red-500/10 p-3 rounded-full transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center bg-muted/30 rounded-2xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.id)} className="px-4 py-2 hover:bg-muted/50 active:bg-muted/80 transition-colors font-black text-lg">−</button>
                        <span className="px-4 text-sm font-black w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.id)} className="px-4 py-2 hover:bg-muted/50 active:bg-muted/80 transition-colors font-black text-lg">+</button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Subtotal</p>
                        <p className="font-mono font-black text-xl">₹{((item.product?.price || 0) * item.quantity).toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <div className="bento-card sticky top-32 border border-border/50">
              <h3 className="text-xl font-black mb-8 tracking-tight flex items-center gap-2">
                <ShoppingBag className="text-primary" size={20} /> Checkout Summary
              </h3>
              
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground font-mono">₹{cartTotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Estimated Tax (5%)</span><span className="text-foreground font-mono">₹{tax.toFixed(0)}</span></div>
                <div className="flex justify-between text-muted-foreground border-b border-border/50 pb-6"><span>Shipping</span><span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">Complimentary</span></div>
                
                <div className="flex justify-between font-black text-2xl pt-2">
                  <span>Total</span><span className="font-mono">₹{total.toFixed(0)}</span>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Link
                  to="/checkout"
                  className="flex items-center justify-between w-full bg-foreground hover:bg-primary text-background font-black py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link to="/trial-cart" className="flex items-center justify-center gap-2 text-foreground/70 hover:text-primary text-xs font-black uppercase tracking-widest mt-4 hover:bg-primary/5 py-4 rounded-2xl transition-colors border-2 border-transparent hover:border-primary/20">
                  <Sparkles size={16} /> Switch to Trial Cart
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
