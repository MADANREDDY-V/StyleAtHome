import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useUser, UserProfile, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Heart, MapPin, Settings, Package, Activity, Timer, CheckCircle2, XCircle, AlertCircle, LogOut, ShoppingBag, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDbUser } from '../hooks/useDbUser';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'trials', label: 'Trial Bookings', icon: CalendarCheck },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'settings', label: 'Account Settings', icon: Settings }
];

export default function Profile() {
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { dbUser } = useDbUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dbUser) return;
    async function fetchData() {
      setLoading(true);
      const promises = [];
      
      if (['orders', 'overview'].includes(tab)) {
        promises.push(supabase.from('orders').select('*').eq('user_id', dbUser!.id).order('created_at', { ascending: false }).then((r) => setOrders(r.data || [])));
      }
      if (['trials', 'overview'].includes(tab)) {
        promises.push(supabase.from('bookings').select('*').eq('user_id', dbUser!.id).order('created_at', { ascending: false }).then((r) => setBookings(r.data || [])));
      }
      if (['addresses', 'overview'].includes(tab)) {
        promises.push(supabase.from('addresses').select('*').eq('user_id', dbUser!.id).then((r) => setAddresses(r.data || [])));
      }
      if (['wishlist', 'overview'].includes(tab)) {
        promises.push(
          supabase.from('wishlist_items')
            .select('*, product:products(*)')
            .eq('user_id', dbUser!.id)
            .then((r) => setWishlist(r.data || []))
        );
      }

      await Promise.all(promises);
      setLoading(false);
    }
    fetchData();
  }, [tab, dbUser]);

  const setTab = (t: string) => setSearchParams({ tab: t });

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-4xl font-black mb-6 tracking-tight">Identity Required</h2>
        <Link to="/sign-in" className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:-translate-y-1 transition-transform">Authenticate</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 pb-24"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── Sidebar ── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Avatar card */}
          <div className="bento-card flex flex-col items-center text-center p-8 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative mb-5 z-10">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              {clerkUser?.imageUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 bg-muted/30 relative z-10 transition-all duration-500 group-hover:scale-105">
                  <img src={clerkUser.imageUrl} alt={clerkUser.fullName || 'User'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 ring-4 ring-primary/20 flex items-center justify-center relative z-10">
                  <User size={40} className="text-primary" />
                </div>
              )}
            </div>
            <h1 className="text-xl font-black text-foreground tracking-tight z-10 relative">
              {clerkUser?.fullName || clerkUser?.firstName || 'User'}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 z-10 relative">
              {clerkUser?.primaryEmailAddress?.emailAddress}
            </p>
            {dbUser?.mobile && !dbUser.mobile.startsWith('t') && (
              <p className="text-xs text-muted-foreground font-mono mt-1 z-10 relative">{dbUser.mobile}</p>
            )}
            {clerkUser?.createdAt && (
              <p className="text-xs text-muted-foreground/60 mt-3 z-10 relative">
                Member since {new Date(clerkUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Orders', value: orders.length, icon: ShoppingBag, tabId: 'orders' },
              { label: 'Trials', value: bookings.length, icon: CalendarCheck, tabId: 'trials' },
              { label: 'Wishlist', value: wishlist.length, icon: Heart, tabId: 'wishlist' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.label}
                  onClick={() => setTab(stat.tabId)}
                  className="bento-card !p-3 text-center hover:border-primary/40 border border-transparent transition-all group"
                >
                  <Icon size={16} className="mx-auto mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-xl font-black font-mono">{stat.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                </button>
              );
            })}
          </div>

          {/* Nav tabs */}
          <div className="bento-card p-3">
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 scrollbar-hide">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal group relative overflow-hidden ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                    }`}
                  >
                    {isActive && <motion.div layoutId="tab-indicator" className="absolute inset-0 bg-primary -z-10" />}
                    <Icon size={16} className={isActive ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={async () => {
              setSigningOut(true);
              await signOut({ redirectUrl: '/' });
            }}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 border-2 border-border hover:border-cadmium text-muted-foreground hover:text-cadmium font-bold py-3 px-6 rounded-2xl transition-all text-sm disabled:opacity-50"
          >
            <LogOut size={15} />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="bento-card flex justify-center min-h-[500px]">
              <LoadingSpinner />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {tab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                      { label: 'Active Logistics', count: orders.length, tab: 'orders', icon: Package },
                      { label: 'Pending Trials', count: bookings.length, tab: 'trials', icon: CalendarCheck },
                      { label: 'Curated Items', count: wishlist.length, tab: 'wishlist', icon: Heart },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.button 
                          key={card.label} 
                          onClick={() => setTab(card.tab)} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1, type: "spring" }}
                          className="bento-card text-left group relative overflow-hidden h-48 flex flex-col justify-between"
                        >
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon size={80} />
                          </div>
                          <div className={`w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                            <Icon size={24} />
                          </div>
                          <div>
                            <p className="text-5xl font-black text-foreground font-mono">{card.count}</p>
                            <p className="text-xs text-muted-foreground font-bold mt-2 uppercase tracking-widest">{card.label}</p>
                          </div>
                        </motion.button>
                      )
                    })}
                    
                    {/* Live Status Indicator Bento block */}
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 bento-card relative overflow-hidden bg-bean text-white p-8 sm:p-12">
                       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-60" />
                       <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                         <div>
                           <div className="flex items-center gap-3 mb-4">
                             <span className="relative flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cadmium opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-cadmium"></span>
                             </span>
                             <span className="text-xs font-bold uppercase tracking-widest text-cadmium">System Live</span>
                           </div>
                           <h3 className="text-3xl font-black tracking-tight">Enterprise Standing: Premium</h3>
                           <p className="text-white/60 font-medium mt-2 max-w-lg">Your account has priority access to upcoming collections and expedited home trial delivery slots.</p>
                         </div>
                         <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full md:w-auto">
                            <div className="text-sm font-bold text-white/50 mb-1">Total Lifetime Value</div>
                            <div className="text-4xl font-black font-mono">₹{orders.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString()}</div>
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                {tab === 'orders' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black tracking-tight">Logistics</h2>
                    </div>
                    {orders.length === 0 ? (
                      <div className="bento-card py-24 text-center">
                        <Package className="mx-auto text-muted-foreground/30 mb-6" size={64} />
                        <p className="text-xl font-bold text-muted-foreground">No active logistics found.</p>
                        <button onClick={() => window.location.href = '/products'} className="mt-6 bg-foreground text-background font-bold px-8 py-4 rounded-full">Initiate Order</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {orders.map((o) => (
                          <div key={o.id} className="bento-card p-8 border-l-4 border-l-cadmium hover:shadow-xl transition-shadow relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cadmium/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-wrap justify-between items-start gap-4 mb-6">
                              <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Order ID</span>
                                <span className="font-black text-2xl text-foreground font-mono">{o.order_number}</span>
                                <p className="text-sm text-muted-foreground font-medium mt-2">Placed {new Date(o.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className={`text-xs px-4 py-2 rounded-full font-black uppercase tracking-widest ${
                                o.status === 'Delivered' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-cadmium/20 text-cadmium'
                              }`}>{o.status}</span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-border/50">
                              <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Total</span>
                                <p className="font-black text-foreground text-xl font-mono">₹{o.total_amount}</p>
                              </div>
                              <span className="text-xs font-bold bg-muted/50 px-4 py-2 rounded-xl text-foreground uppercase tracking-wider">Via {o.payment_method}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {tab === 'trials' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black tracking-tight">Wardrobe Trials</h2>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="bento-card py-24 text-center">
                        <CalendarCheck className="mx-auto text-muted-foreground/30 mb-6" size={64} />
                        <p className="text-xl font-bold text-muted-foreground">No wardrobe trials scheduled.</p>
                        <Link to="/trial-cart" className="mt-6 inline-block bg-foreground text-background font-bold px-8 py-3 rounded-full">Start a Trial</Link>
                      </div>
                    ) : bookings.map((b) => {
                      const statusSteps = ['Pending', 'Confirmed', 'Assigned', 'Out For Trial', 'Trial Completed'];
                      const currentStep = statusSteps.indexOf(b.status);
                      const isActive = b.status === 'Out For Trial';
                      const isCancellable = ['Pending', 'Confirmed'].includes(b.status);
                      const isReturned = b.status === 'Returned';
                      const isPurchased = b.status === 'Purchased';

                      const handleCancel = () => {
                        setCancellingId(b.id);
                      };

                      return (
                        <div key={b.id} className="bento-card border border-border/50 hover:shadow-xl transition-shadow">
                          {/* Header */}
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                            <div>
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Booking ID</span>
                              <span className="font-black text-2xl text-foreground font-mono">{b.booking_number}</span>
                              <p className="text-sm text-muted-foreground font-medium mt-1">{b.booking_date} · {b.time_slot}</p>
                            </div>
                            <span className={`text-xs px-4 py-2 rounded-full font-black uppercase tracking-widest ${
                              b.status === 'Purchased' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                              b.status === 'Cancelled' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                              b.status === 'Returned' ? 'bg-muted text-muted-foreground' :
                              isActive ? 'bg-primary/20 text-primary animate-pulse' : 'bg-cadmium/20 text-cadmium'
                            }`}>{b.status}</span>
                          </div>

                          {/* Status Stepper — only for active bookings */}
                          {!['Cancelled', 'Returned', 'Purchased'].includes(b.status) && (
                            <div className="mb-6">
                              <div className="flex items-center gap-0">
                                {statusSteps.map((step, i) => {
                                  const done = i <= currentStep;
                                  const isCurrent = i === currentStep;
                                  return (
                                    <div key={step} className="flex items-center flex-1 min-w-0">
                                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-black border-2 transition-colors ${
                                        done ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground bg-background'
                                      } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-1' : ''}`}>
                                        {done ? '✓' : i + 1}
                                      </div>
                                      {i < statusSteps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-1 rounded transition-colors ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex justify-between mt-1">
                                {statusSteps.map((step) => (
                                  <span key={step} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide flex-1 text-center first:text-left last:text-right">
                                    {step.replace('Out For Trial', 'Active').replace('Trial Completed', 'Done')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Address */}
                          <p className="text-sm font-medium text-muted-foreground bg-muted/20 p-4 rounded-2xl border border-border/50 mb-4">{b.address}</p>

                          {/* Fee row */}
                          <div className="flex justify-between items-center pt-4 border-t border-border/50 mb-4">
                            <div>
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Trial Fee</span>
                              <p className="font-black text-foreground text-xl font-mono">₹{b.fee}</p>
                            </div>
                            <span className="text-xs font-bold px-4 py-2 bg-muted/50 rounded-xl text-foreground uppercase tracking-wider">Via {b.payment_method}</span>
                          </div>

                          {/* Trial fee explanation */}
                          {!['Cancelled', 'Returned', 'Purchased'].includes(b.status) && (
                            <p className="text-xs text-muted-foreground mb-4">
                              ₹100 trial fee · adjusted against purchase if you keep items fully refunded
                            </p>
                          )}

                          {/* CTA buttons */}
                          <div className="flex flex-wrap gap-3">
                            {isActive && (
                              <Link
                                to={`/trial-session/${b.id}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-black py-3 px-6 rounded-xl transition-colors text-sm"
                              >
                                <Timer size={16} /> Enter Trial Session
                              </Link>
                            )}
                            {isCancellable && (
                              <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 border-2 border-border hover:border-cadmium text-muted-foreground hover:text-cadmium font-bold py-3 px-6 rounded-xl transition-colors text-sm"
                              >
                                <XCircle size={15} /> Cancel Trial
                              </button>
                            )}
                            {isPurchased && (
                              <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                                <CheckCircle2 size={16} /> Items purchased successfully
                              </div>
                            )}
                            {isReturned && (
                              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                <AlertCircle size={16} /> All items returned · refund processing
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Cancel confirmation dialog */}
                    <AnimatePresence>
                      {cancellingId && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                          onClick={() => setCancellingId(null)}
                        >
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bento-card max-w-sm w-full border border-border/50 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AlertCircle className="mx-auto text-cadmium mb-4" size={48} />
                            <h3 className="text-xl font-black mb-2">Cancel Trial?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              Your ₹100 trial fee will be refunded within 3–5 business days. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <button onClick={() => setCancellingId(null)} className="flex-1 border-2 border-border font-bold py-3 rounded-xl hover:bg-muted/30 transition-colors">Keep Trial</button>
                              <button onClick={() => { const bid = cancellingId; setCancellingId(null); supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', bid).then(() => { setBookings((prev: any[]) => prev.map((bk) => bk.id === bid ? { ...bk, status: 'Cancelled' } : bk)); toast.success('Trial cancelled. ₹100 will be refunded in 3-5 days.'); }); }} className="flex-1 bg-cadmium hover:bg-cadmium/90 text-white font-black py-3 rounded-xl transition-colors">Yes, Cancel</button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {tab === 'wishlist' && (
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-8">Curations</h2>
                    {wishlist.length === 0 ? (
                      <div className="bento-card py-24 text-center">
                        <Heart className="mx-auto text-muted-foreground/30 mb-6" size={64} />
                        <p className="text-xl font-bold text-muted-foreground">Your curation is empty.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {wishlist.map((w) => w.product && <ProductCard key={w.id} product={w.product} />)}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                      <h2 className="text-3xl font-black tracking-tight">Destinations</h2>
                      <button className="text-sm font-bold bg-foreground text-background hover:bg-primary transition-colors px-6 py-3 rounded-full">+ Add New</button>
                    </div>
                    {addresses.length === 0 ? (
                      <div className="bento-card py-24 text-center">
                        <MapPin className="mx-auto text-muted-foreground/30 mb-6" size={64} />
                        <p className="text-xl font-bold text-muted-foreground">No destinations recorded.</p>
                      </div>
                    ) : addresses.map((a) => (
                      <div key={a.id} className="bento-card p-8 flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                            <p className="font-black text-xl text-foreground">{a.full_name}</p>
                            {a.is_default && <span className="bg-primary/20 text-primary text-[10px] uppercase font-black px-3 py-1.5 rounded-full tracking-widest">Default</span>}
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">{a.flat_no}, {a.street}</p>
                          <p className="text-sm font-medium text-muted-foreground">{a.city}, {a.state} - <span className="font-mono">{a.pincode}</span></p>
                          <p className="text-sm font-bold text-foreground mt-4 flex items-center gap-2">📞 <span className="font-mono">{a.mobile}</span></p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button className="flex-1 sm:flex-none text-xs font-bold bg-muted/50 hover:bg-muted text-foreground px-4 py-2 rounded-xl transition-colors">Edit</button>
                          <button className="flex-1 sm:flex-none text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl transition-colors">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'settings' && (
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-8">Account Settings</h2>
                    <div className="bento-card overflow-hidden !p-0">
                      <div className="clerk-profile-container flex justify-center p-4 sm:p-12">
                        <UserProfile appearance={{
                          elements: {
                            rootBox: "w-full max-w-none shadow-none",
                            card: "bg-transparent shadow-none w-full max-w-none",
                            navbar: "hidden md:flex",
                            headerTitle: "text-foreground font-black text-2xl tracking-tight",
                            headerSubtitle: "text-muted-foreground font-medium",
                            profileSectionTitleText: "text-foreground font-bold tracking-tight",
                            badge: "bg-primary/10 text-primary font-bold",
                            formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-xl"
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
