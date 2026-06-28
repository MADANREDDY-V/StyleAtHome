import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, XCircle, Shirt, ShoppingCart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useDbUser } from '../hooks/useDbUser';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const TRIAL_DURATION_MINUTES = 60;

interface BookingItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    image_url: string;
  };
  size?: string;
  decision?: 'keep' | 'return' | null;
}

interface Booking {
  id: number;
  booking_number: string;
  status: string;
  booking_date: string;
  time_slot: string;
  fee: number;
  items?: BookingItem[];
}

export default function TrialSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { dbUser } = useDbUser();
  const addToCart = useStore((state) => state.addToCart);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(TRIAL_DURATION_MINUTES * 60);
  const [decisions, setDecisions] = useState<Record<number, 'keep' | 'return'>>({});
  const [confirming, setConfirming] = useState<{ itemId: number; action: 'keep' | 'return' } | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [allDecided, setAllDecided] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !dbUser || !id) return;
    fetchBooking();
  }, [id, dbUser, isSignedIn]);

  async function fetchBooking() {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('user_id', dbUser!.id)
      .maybeSingle();

    if (!data) {
      toast.error('Trial session not found');
      navigate('/profile?tab=trials');
      return;
    }
    setBooking(data);

    // Fetch trial cart items for this booking
    const { data: cartItems } = await supabase
      .from('trial_cart_items')
      .select('*, product:products(*)')
      .eq('user_id', dbUser!.id);

    setItems((cartItems as BookingItem[]) || []);

    // Calculate time remaining if status is Out For Trial
    if (data.status === 'Out For Trial') {
      const baseTime = new Date(data.created_at).getTime();
      const elapsed = Math.floor((Date.now() - baseTime) / 1000);
      const remaining = Math.max(0, TRIAL_DURATION_MINUTES * 60 - elapsed);
      setSecondsLeft(remaining);
    }

    setLoading(false);
  }

  // Countdown timer
  useEffect(() => {
    if (!booking || booking.status !== 'Out For Trial') return;
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [booking, secondsLeft]);

  useEffect(() => {
    if (items.length > 0 && Object.keys(decisions).length === items.length) {
      setAllDecided(true);
    }
  }, [decisions, items]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const pct = (secondsLeft / (TRIAL_DURATION_MINUTES * 60)) * 100;
  const isUrgent = secondsLeft < 600; // Last 10 mins

  function handleDecision(itemId: number, action: 'keep' | 'return') {
    setConfirming({ itemId, action });
  }

  async function confirmDecision() {
    if (!confirming || !dbUser) return;
    setDecisions((prev) => ({ ...prev, [confirming.itemId]: confirming.action }));
    setConfirming(null);
    toast.success(confirming.action === 'keep' ? '✅ Added to cart for purchase' : '↩️ Marked for return');
  }

  async function finalizeSession() {
    if (!dbUser || !booking) return;
    setFinalizing(true);

    const keptItems = items.filter((i) => decisions[i.id] === 'keep');

    // Add kept items to cart
    for (const item of keptItems) {
      await addToCart(dbUser.id, item.product_id);
    }

    // Update booking status
    const newStatus = keptItems.length > 0 ? 'Purchased' : 'Returned';
    await supabase.from('bookings').update({ status: newStatus }).eq('id', booking.id);

    toast.success(
      keptItems.length > 0
        ? `${keptItems.length} item${keptItems.length > 1 ? 's' : ''} added to cart! Complete purchase in cart.`
        : `All items returned. Your ₹${booking.fee} trial fee will be refunded.`,
      { duration: 5000 }
    );

    if (keptItems.length > 0) {
      navigate('/cart');
    } else {
      navigate('/profile?tab=trials');
    }
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] mt-24">
        <Logo size={48} className="text-primary mb-4" />
        <p className="text-xl font-bold">Please sign in to view your trial session.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="mt-32 text-center text-muted-foreground font-bold animate-pulse uppercase tracking-widest">Loading Trial Session...</div>;
  }

  if (!booking) return null;

  const isActive = booking.status === 'Out For Trial';
  const isCompleted = ['Trial Completed', 'Purchased', 'Returned'].includes(booking.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-24 sm:mt-32 max-w-3xl mx-auto"
    >
      {/* Back */}
      <button onClick={() => navigate('/profile?tab=trials')} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Trials
      </button>

      {/* Header */}
      <div className="bento-card border border-border/50 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shirt size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Trial Session</p>
              <h1 className="text-2xl font-black tracking-tight font-mono">{booking.booking_number}</h1>
            </div>
          </div>
          <span className={`text-xs px-4 py-2 rounded-full font-black uppercase tracking-widest ${
            isActive ? 'bg-green-500/20 text-green-700 dark:text-green-400 animate-pulse' :
            isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {booking.status}
          </span>
        </div>
      </div>

      {/* Timer — only shown when active */}
      {isActive && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bento-card border-2 mb-6 text-center relative overflow-hidden ${isUrgent ? 'border-cadmium' : 'border-primary/30'}`}
        >
          <div className={`absolute inset-0 ${isUrgent ? 'bg-cadmium/5' : 'bg-primary/5'}`} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer size={18} className={isUrgent ? 'text-cadmium' : 'text-primary'} />
              <span className={`text-xs font-black uppercase tracking-widest ${isUrgent ? 'text-cadmium' : 'text-primary'}`}>
                {isUrgent ? '⚠ Time Running Out' : 'Trial Time Remaining'}
              </span>
            </div>

            {/* Big countdown */}
            <div className={`text-8xl sm:text-9xl font-black font-mono tracking-tight mb-4 ${isUrgent ? 'text-cadmium' : 'text-foreground'}`}>
              {minutes}:{seconds}
            </div>

            {/* Progress arc */}
            <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden mb-6">
              <motion.div
                className={`h-full rounded-full transition-colors ${isUrgent ? 'bg-cadmium' : 'bg-primary'}`}
                style={{ width: `${pct}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            {/* Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {[
                { icon: '👗', text: 'Try each item and decide before the timer ends' },
                { icon: '✅', text: "Keep items you love — they'll move to your cart" },
                { icon: '↩️', text: 'Return the rest to the delivery partner before leaving' },
              ].map((rule) => (
                <div key={rule.icon} className="bg-muted/30 rounded-2xl p-3 flex items-start gap-2">
                  <span className="text-lg">{rule.icon}</span>
                  <p className="text-xs font-medium text-muted-foreground">{rule.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending / not started yet */}
      {!isActive && !isCompleted && (
        <div className="bento-card border border-border/50 mb-6 text-center py-12">
          <AlertCircle className="mx-auto text-muted-foreground/40 mb-4" size={48} />
          <h2 className="text-xl font-black mb-2">Trial Not Started Yet</h2>
          <p className="text-muted-foreground">Your trial session will activate when the delivery partner arrives and hands over your items.</p>
          <p className="text-sm font-bold text-primary mt-4">Status: {booking.status}</p>
        </div>
      )}

      {/* Item Decision Cards */}
      {(isActive || isCompleted) && items.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-black tracking-tight">Your Trial Items</h2>
          {items.map((item) => {
            const decision = decisions[item.id];
            return (
              <motion.div
                key={item.id}
                layout
                className={`bento-card !p-5 flex gap-4 border-l-4 transition-colors ${
                  decision === 'keep' ? 'border-l-green-500 bg-green-500/5' :
                  decision === 'return' ? 'border-l-muted-foreground bg-muted/20' :
                  'border-l-primary'
                }`}
              >
                <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-muted/30 relative">
                  <img src={item.product?.image_url} alt="" className="w-full h-full object-cover" />
                  {decision === 'keep' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 size={28} className="text-green-500" />
                    </div>
                  )}
                  {decision === 'return' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <XCircle size={28} className="text-white/70" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.product?.brand}</p>
                    <h3 className="font-bold text-lg text-foreground mt-1 line-clamp-1">{item.product?.name}</h3>
                    {item.size && <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>}
                    <p className="font-black font-mono text-lg mt-2">₹{item.product?.price}</p>
                  </div>

                  {!decision && isActive && (
                    <div className="flex gap-2 mt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleDecision(item.id, 'keep')}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black py-3 rounded-xl transition-colors text-sm"
                      >
                        <CheckCircle2 size={16} /> Keep It
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleDecision(item.id, 'return')}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground font-black py-3 rounded-xl transition-colors text-sm"
                      >
                        <XCircle size={16} /> Return
                      </motion.button>
                    </div>
                  )}

                  {decision && (
                    <div className={`mt-4 flex items-center gap-2 text-sm font-black ${decision === 'keep' ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {decision === 'keep' ? <><CheckCircle2 size={16} /> Keeping — will be added to cart</> : <><XCircle size={16} /> Returning to partner</>}
                      {isActive && (
                        <button onClick={() => setDecisions((prev) => { const d = { ...prev }; delete d[item.id]; return d; })} className="ml-auto text-xs text-primary underline font-bold">
                          Change
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Finalize button */}
      {isActive && allDecided && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={finalizeSession}
          disabled={finalizing}
          className="w-full flex items-center justify-center gap-3 bg-foreground hover:bg-primary text-background font-black py-5 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl text-lg disabled:opacity-60 mt-4"
        >
          <ShoppingCart size={22} />
          {finalizing ? 'Finalizing...' : 'Finalize Trial Session'}
        </motion.button>
      )}

      {isActive && !allDecided && items.length > 0 && (
        <p className="text-center text-sm text-muted-foreground font-medium mt-4">
          Decide on all {items.length - Object.keys(decisions).length} remaining item{items.length - Object.keys(decisions).length !== 1 ? 's' : ''} to finalize your session.
        </p>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirming(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bento-card max-w-sm w-full border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirming.action === 'keep' ? 'bg-green-500/20' : 'bg-muted/40'}`}>
                  {confirming.action === 'keep' ? <CheckCircle2 size={32} className="text-green-600" /> : <XCircle size={32} className="text-muted-foreground" />}
                </div>
                <h3 className="text-xl font-black mb-2">
                  {confirming.action === 'keep' ? 'Keep this item?' : 'Return this item?'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {confirming.action === 'keep'
                    ? "This item will be added to your cart. You'll complete the purchase after the session."
                    : 'This item will be handed back to the delivery partner at the end of the session.'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirming(null)} className="flex-1 border-2 border-border font-bold py-3 rounded-xl transition-colors hover:bg-muted/30">
                    Cancel
                  </button>
                  <button
                    onClick={confirmDecision}
                    className={`flex-1 font-black py-3 rounded-xl transition-colors text-white ${confirming.action === 'keep' ? 'bg-green-600 hover:bg-green-700' : 'bg-foreground hover:bg-muted-foreground'}`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
