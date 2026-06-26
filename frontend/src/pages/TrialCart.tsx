import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';
import Logo from '../components/Logo';

const MAX_TRIAL_ITEMS = 5;

export default function TrialCart() {
  const { isSignedIn } = useUser();
  const { isLoading } = useDbUser();
  const trialCart = useStore((state) => state.trialCart);
  const removeFromTrialCart = useStore((state) => state.removeFromTrialCart);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bento-card mt-24 max-w-lg mx-auto border border-border/50">
        <Logo size={48} className="text-primary mb-6" />
        <h2 className="text-2xl font-black mb-2 text-center">Your Trial Cart Awaits</h2>
        <p className="text-muted-foreground text-center mb-8">Sign in to add items to your home trial session and try them before you buy.</p>
        <Link to="/sign-in" className="bg-foreground text-background font-bold px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">Sign In</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="mt-32 text-center text-muted-foreground font-bold animate-pulse uppercase tracking-widest">Loading your trial cart...</div>;
  }

  const count = trialCart.length;
  const progressPct = (count / MAX_TRIAL_ITEMS) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-24 sm:mt-32 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <Logo size={24} className="text-primary" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Home Trial Cart <span className="text-muted-foreground font-medium text-2xl">({count})</span></h1>
      </div>
      <p className="text-base text-muted-foreground mb-6">
        Items in your trial cart are separate from your shopping cart. Book a home trial session to try these products comfortably at home.
      </p>

      {/* Trial Session Progress Bar */}
      <div className="bento-card border border-border/50 mb-8 !p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shirt size={16} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Trial Session Capacity</span>
          </div>
          <span className={`text-sm font-black font-mono ${count >= MAX_TRIAL_ITEMS ? 'text-cadmium' : 'text-primary'}`}>{count} / {MAX_TRIAL_ITEMS}</span>
        </div>
        <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${count >= MAX_TRIAL_ITEMS ? 'bg-cadmium' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-medium">
          {count >= MAX_TRIAL_ITEMS
            ? 'Maximum items reached. Remove an item to add another.'
            : `You can add ${MAX_TRIAL_ITEMS - count} more item${MAX_TRIAL_ITEMS - count !== 1 ? 's' : ''} to this trial session.`}
        </p>
        {/* Trial fee info */}
        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trial Fee</p>
            <p className="text-lg font-black font-mono text-foreground">₹50</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs text-right">
            ₹50 trial fee is adjusted against your purchase price if you keep any items. Fully refunded if you return everything.
          </p>
        </div>
      </div>

      {count === 0 ? (
        <div className="text-center py-20 bento-card border border-border/50">
          <ShoppingBag className="mx-auto text-muted-foreground/30 mb-6" size={64} />
          <h2 className="text-2xl font-bold mb-2">No items in trial cart</h2>
          <p className="text-muted-foreground mb-8">Explore products and add them to your trial cart to start.</p>
          <Link to="/products" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {trialCart.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="bento-card !p-4 sm:!p-6 flex gap-4 sm:gap-6 shadow-sm border-l-4 border-l-primary group"
              >
                <div className="w-20 h-28 sm:w-24 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-muted/30 relative">
                  <img src={item.product?.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shirt size={8} /> Trial
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.product?.brand}</p>
                    <h3 className="font-bold text-base sm:text-lg text-foreground mt-1 line-clamp-2">{item.product?.name}</h3>
                    {item.size && <p className="text-sm font-medium text-muted-foreground mt-1">Size: <span className="text-foreground">{item.size}</span></p>}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button 
                      onClick={() => removeFromTrialCart(item.id)} 
                      className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                    <p className="font-black text-lg font-mono">₹{item.product?.price}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/trial-booking"
            className="flex items-center justify-center gap-3 w-full bg-foreground hover:bg-primary text-background font-black py-5 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl text-lg"
          >
            Book Home Trial Session <ArrowRight size={20} />
          </Link>
        </>
      )}
    </motion.div>
  );
}
