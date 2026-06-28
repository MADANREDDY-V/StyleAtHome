import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDbUser } from '../hooks/useDbUser';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle2, 
  XCircle, Truck, Store, Download, RefreshCcw, Home, FileText, ChevronRight, 
  Star, ShoppingBag, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dbUser, isLoading: isUserLoading } = useDbUser();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cancelling, setCancelling] = useState(false);
  const [returning, setReturning] = useState(false);
  
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState<'Return' | 'Exchange'>('Return');
  const [returnReason, setReturnReason] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [targetItem, setTargetItem] = useState<any>(null);

  const TIMELINE_STAGES = [
    { id: 'Placed', label: 'Placed', icon: FileText },
    { id: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { id: 'Packed', label: 'Packed', icon: Package },
    { id: 'Shipped', label: 'Shipped', icon: Truck },
    { id: 'Reached Local Hub', label: 'Reached Local Hub', icon: MapPin },
    { id: 'Out For Delivery', label: 'Out For Delivery', icon: Clock },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  useEffect(() => {
    async function fetchOrder() {
      if (!dbUser || !id) return;
      setLoading(true);
      
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*, trial_booking:bookings(id, booking_date, time_slot, booking_number, fee)')
        .eq('id', id)
        .eq('user_id', dbUser.id)
        .single();
        
      if (error || !orderData) {
        toast.error('Order not found');
        navigate('/profile?tab=orders');
        return;
      }
      setOrder(orderData);

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, product:products(id, name, brand, image_url, price, store_id, category_id, store:stores(id, name, slug, logo_url))')
        .eq('order_id', orderData.id);
        
      setItems(itemsData || []);

      if (itemsData && itemsData.length > 0) {
        // Fetch recommendations based on store or category
        const { data: recData } = await supabase
          .from('products')
          .select('*, store:stores(name)')
          .eq('store_id', itemsData[0].product.store_id)
          .neq('id', itemsData[0].product_id)
          .limit(4);
        setRecommendations(recData || []);
      }

      setLoading(false);
    }
    if (!isUserLoading) fetchOrder();
  }, [id, dbUser, isUserLoading, navigate]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    const history = order.status_history || [];
    const newHistory = [...history, { status: 'Cancelled', timestamp: new Date().toISOString() }];
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled', status_history: newHistory, cancel_reason: 'User Cancelled' })
      .eq('id', order.id);
      
    if (!error) {
      toast.success('Order Cancelled Successfully');
      setOrder({ ...order, status: 'Cancelled', status_history: newHistory, cancel_reason: 'User Cancelled' });
    } else {
      toast.error('Failed to cancel order');
    }
    setCancelling(false);
  };

  const handleReturnOrder = async () => {
    if (!order || !returnReason || !pickupDate) {
      toast.error('Please complete all return details');
      return;
    }
    setReturning(true);
    const history = order.status_history || [];
    const newStatus = returnType === 'Return' ? 'Returned' : 'Exchange Requested';
    
    // Store pickup date inside status_history payload to avoid altering DB schema directly here
    const newHistory = [...history, { 
      status: newStatus, 
      timestamp: new Date().toISOString(), 
      reason: returnReason,
      type: returnType,
      pickup_date: pickupDate,
      item_id: targetItem?.id
    }];
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus, 
        status_history: newHistory, 
        return_reason: returnReason, 
        return_status: 'Pickup Scheduled' 
      })
      .eq('id', order.id);
      
    if (!error) {
      toast.success(`${returnType} Initiated. Pickup scheduled for ${pickupDate}.`);
      setOrder({ ...order, status: newStatus, status_history: newHistory, return_reason: returnReason, return_status: 'Pickup Scheduled' });
      setShowReturnModal(false);
    } else {
      toast.error(`Failed to initiate ${returnType.toLowerCase()}`);
    }
    setReturning(false);
  };

  const openReturnModal = (item: any, type: 'Return' | 'Exchange') => {
    setTargetItem(item);
    setReturnType(type);
    setShowReturnModal(true);
  };

  const handlePrintInvoice = () => {
    window.open(`/invoice/${order.id}`, '_blank');
  };

  const generatePickupDates = () => {
    const dates = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto mt-24 sm:mt-32 mb-24 px-4 sm:px-6 space-y-8 animate-pulse">
        <div className="h-10 bg-muted/30 rounded w-1/3"></div>
        <div className="h-40 bg-muted/30 rounded-2xl"></div>
        <div className="h-64 bg-muted/30 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-muted/30 rounded-2xl"></div>
          <div className="h-96 bg-muted/30 rounded-2xl"></div>
        </div>
      </div>
    );
  }
  
  if (!order) return null;

  const currentStatusIndex = TIMELINE_STAGES.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'Cancelled';
  const isReturned = order.status === 'Returned' || order.status === 'Refunded';
  const isExchange = order.status === 'Exchange Requested';
  const isDelivered = order.status === 'Delivered';
  const canCancel = ['Placed', 'Confirmed'].includes(order.status);

  // Find delivery date
  const deliveryHistory = order.status_history?.find((h: any) => h.status === 'Delivered');
  const deliveryDate = deliveryHistory ? new Date(deliveryHistory.timestamp).toLocaleDateString() : 'Pending';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto mt-24 sm:mt-32 mb-24 px-4 sm:px-6"
    >
      <button onClick={() => navigate('/profile?tab=orders')} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to My Orders
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-4">
            Order Details
            <span className={`text-xs px-4 py-1.5 rounded-full uppercase tracking-widest ${
              isCancelled ? 'bg-red-500/10 text-red-600' :
              isReturned ? 'bg-orange-500/10 text-orange-600' :
              isExchange ? 'bg-blue-500/10 text-blue-600' :
              isDelivered ? 'bg-green-500/10 text-green-600' :
              'bg-primary/10 text-primary animate-pulse'
            }`}>{order.status}</span>
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-2 font-mono">ID: {order.order_number}</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrintInvoice} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border/50 bg-background font-bold text-sm shadow-sm hover:border-primary transition-colors">
            <Download size={16} /> Invoice
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-bold text-sm shadow-lg hover:bg-primary transition-colors">
            Support
          </button>
        </div>
      </div>

      {order.trial_booking && (
        <div className="bg-gradient-to-r from-cadmium/10 to-cadmium/5 border border-cadmium/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cadmium/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-cadmium/20 flex items-center justify-center shrink-0 border border-cadmium/30 shadow-inner">
              <Home className="text-cadmium" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-black text-cadmium text-lg tracking-tight">Purchased After Home Trial</h3>
                <span className="bg-cadmium text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest">Premium</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-cadmium/80">
                <span>Booking ID: {order.trial_booking.booking_number}</span>
                <span>•</span>
                <span>Date: {order.trial_booking.booking_date} ({order.trial_booking.time_slot})</span>
                {order.trial_booking.fee > 0 && (
                  <>
                    <span>•</span>
                    <span>Fee: ₹{order.trial_booking.fee}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Link to={`/profile?tab=trials`} className="shrink-0 text-xs font-black uppercase tracking-widest text-cadmium hover:underline flex items-center gap-1 bg-cadmium/10 px-4 py-2 rounded-xl border border-cadmium/20 transition-all hover:bg-cadmium hover:text-white relative z-10">
            View Trial <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* DYNAMIC TIMELINE */}
      {!isCancelled && !isReturned && !isExchange && (
        <div className="bento-card mb-8 overflow-hidden bg-background/50 backdrop-blur-sm border-border/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8">Delivery Tracker</h3>
          <div className="relative flex flex-col md:flex-row justify-between">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-muted -translate-y-1/2 hidden md:block rounded-full" />
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-muted md:hidden rounded-full" />
            
            {TIMELINE_STAGES.map((stage, i) => {
              const isCurrent = currentStatusIndex === i;
              const isCompleted = currentStatusIndex >= i;
              const historyItem = order.status_history?.find((h: any) => h.status === stage.id);
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="relative z-10 flex md:flex-col items-center gap-6 md:gap-3 mb-8 md:mb-0 w-full md:w-24 last:w-auto md:last:w-24">
                  {/* Connective Line Fill */}
                  {i < TIMELINE_STAGES.length - 1 && isCompleted && (
                    <>
                      <div className="absolute top-1/2 left-1/2 w-full h-1 bg-green-500 -translate-y-1/2 hidden md:block -z-10" />
                      <div className="absolute left-6 top-1/2 h-full w-1 bg-green-500 md:hidden -z-10" />
                    </>
                  )}
                  
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                    isCompleted ? 'bg-green-500 border-green-500/20 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 
                    'bg-background border-border text-muted-foreground/50'
                  } ${isCurrent ? 'ring-4 ring-green-500/30 ring-offset-2 animate-pulse scale-110' : ''}`}>
                    <Icon size={isCurrent ? 24 : 20} className={!isCompleted ? 'opacity-50' : ''} />
                  </div>
                  <div className="text-left md:text-center flex-1 md:flex-none mt-1">
                    <p className={`text-xs font-black tracking-tight uppercase ${isCompleted ? 'text-foreground' : 'text-muted-foreground/50'}`}>{stage.label}</p>
                    {historyItem && (
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 leading-tight">
                        {new Date(historyItem.timestamp).toLocaleDateString()} <br className="hidden md:block" /> 
                        {new Date(historyItem.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Returns / Cancellations Cards */}
      {isCancelled && (
        <div className="bento-card mb-8 border-red-500/20 bg-red-500/5 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <XCircle className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="font-black text-red-600 text-lg">Order Cancelled</h3>
              <p className="text-sm font-bold text-red-600/80 mt-1">Reason: {order.cancel_reason}</p>
            </div>
          </div>
        </div>
      )}

      {(isReturned || isExchange) && (
        <div className="bento-card mb-8 border-orange-500/20 bg-orange-500/5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <RefreshCcw className="text-orange-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-black text-orange-600 text-lg">{isExchange ? 'Exchange Requested' : 'Return Initiated'}</h3>
                <p className="text-sm font-bold text-orange-600/80 mt-1">Reason: {order.return_reason}</p>
                <div className="mt-3 flex gap-2 items-center">
                  <span className="text-xs font-black text-orange-600 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 uppercase tracking-widest">{order.return_status}</span>
                  {/* Extract pickup date from latest history item if exists */}
                  {order.status_history?.find((h:any) => h.status === order.status)?.pickup_date && (
                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1"><Calendar size={12}/> Pickup on: {order.status_history?.find((h:any) => h.status === order.status).pickup_date}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-600/60 mb-1">Refund Amount</p>
              <p className="text-2xl font-black font-mono text-orange-600">₹{order.total_amount}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Items in this order</h3>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 border-b border-border/50 pb-6 last:border-0 last:pb-0 group">
                  <div className="w-24 h-32 rounded-xl overflow-hidden bg-muted/30 shrink-0 relative border border-border/50">
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {item.product.store && (
                            <Link to={`/store/${item.product.store.slug}`} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2 hover:underline w-fit">
                              {item.product.store.logo_url ? (
                                <img src={item.product.store.logo_url} className="w-4 h-4 rounded-sm border border-border/50 object-contain bg-white" alt="" />
                              ) : <Store size={12} />}
                              {item.product.store.name}
                            </Link>
                          )}
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{item.product.brand}</p>
                          <Link to={`/product/${item.product.id}`} className="text-base font-black hover:text-primary transition-colors line-clamp-2 leading-snug">{item.product.name}</Link>
                        </div>
                        <p className="text-xl font-black font-mono shrink-0">₹{item.price}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {item.size && <span className="text-[10px] font-bold bg-muted/50 px-2.5 py-1 rounded-md uppercase tracking-wider text-foreground border border-border/50">Size: {item.size}</span>}
                        {item.color && <span className="text-[10px] font-bold bg-muted/50 px-2.5 py-1 rounded-md uppercase tracking-wider text-foreground border border-border/50">Color: {item.color}</span>}
                        <span className="text-[10px] font-bold bg-muted/50 px-2.5 py-1 rounded-md uppercase tracking-wider text-foreground border border-border/50">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    
                    {/* Post-Delivery Actions per item */}
                    {isDelivered && !isReturned && !isExchange && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        <button onClick={() => openReturnModal(item, 'Return')} className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-orange-600 bg-muted/30 hover:bg-orange-500/10 px-3 py-2 rounded-lg transition-colors border border-border/50 flex items-center gap-1">
                          <RefreshCcw size={12} /> Return
                        </button>
                        <button onClick={() => openReturnModal(item, 'Exchange')} className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary bg-muted/30 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors border border-border/50 flex items-center gap-1">
                          <RefreshCcw size={12} /> Exchange
                        </button>
                        <Link to={`/product/${item.product.id}`} className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-cadmium bg-muted/30 hover:bg-cadmium/10 px-3 py-2 rounded-lg transition-colors border border-border/50 flex items-center gap-1">
                          <Star size={12} /> Write Review
                        </Link>
                        <Link to={`/product/${item.product.id}`} className="text-[10px] font-black uppercase tracking-widest text-white bg-foreground hover:bg-primary px-3 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1 ml-auto">
                          <ShoppingBag size={12} /> Buy Again
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information Block */}
          <div className="bento-card border border-border/50 bg-background/50 backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Delivery Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Delivery Partner</p>
                  <p className="text-sm font-black mt-1 flex items-center gap-2"><Truck size={14} className="text-primary"/> Delhivery Logistics</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tracking Number</p>
                  <p className="text-sm font-black mt-1 font-mono">AWB{order.order_number.replace('ORD-', '')}892</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                  <p className={`text-sm font-black mt-1 ${isDelivered ? 'text-green-600' : 'text-primary'}`}>
                    {isDelivered ? `Delivered on ${deliveryDate}` : 'Estimated Delivery: ' + new Date(Date.now() + 86400000*3).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Delivery Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="text-primary shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-black text-foreground text-sm">{order.delivery_name}</p>
                    <p className="text-xs font-bold text-muted-foreground mt-1 leading-relaxed">
                      {order.delivery_address}<br />
                      {order.delivery_city}, {order.delivery_state} - <span className="font-mono">{order.delivery_pincode}</span>
                    </p>
                    <p className="text-xs font-black text-foreground mt-2 flex items-center gap-2">📞 <span className="font-mono">{order.delivery_mobile}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bento-card border border-border/50 bg-background/50 backdrop-blur-sm sticky top-32">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Payment Summary</h3>
            <div className="space-y-4 text-sm font-bold border-b border-border/50 pb-6 mb-6">
              <div className="flex justify-between text-muted-foreground"><span>Item(s) Subtotal</span><span className="text-foreground font-mono">₹{(order.total_amount / 1.05).toFixed(0)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Estimated GST (5%)</span><span className="text-foreground font-mono">₹{(order.total_amount - (order.total_amount / 1.05)).toFixed(0)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-primary font-black uppercase text-[10px] tracking-widest bg-primary/10 px-2 py-0.5 rounded">Free</span></div>
            </div>
            <div className="flex justify-between items-center font-black text-xl mb-6">
              <span>Grand Total</span>
              <span className="text-primary font-mono text-2xl">₹{order.total_amount}</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard className="text-primary" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Method</p>
                <p className="font-black text-sm">{order.payment_method}</p>
              </div>
            </div>

            {/* General Order Actions */}
            {canCancel && (
              <button 
                onClick={handleCancelOrder} 
                disabled={cancelling}
                className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-border font-black text-sm hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50 shadow-sm"
              >
                <XCircle size={18} /> {cancelling ? 'Cancelling...' : 'Cancel Entire Order'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6 tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Return/Exchange Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReturnModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bento-card max-w-md w-full border border-border/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <h3 className="text-xl font-black">{returnType} Request</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-muted-foreground hover:text-foreground bg-muted/50 rounded-full p-2 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
              
              {targetItem && (
                <div className="flex items-center gap-4 mb-6 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <img src={targetItem.product.image_url} className="w-12 h-16 object-cover rounded-lg border border-border/50" alt="" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{targetItem.product.brand}</p>
                    <p className="text-sm font-black line-clamp-1">{targetItem.product.name}</p>
                    <p className="text-xs font-bold text-muted-foreground mt-1">Size: {targetItem.size || 'N/A'}</p>
                  </div>
                </div>
              )}

              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">1. Reason for {returnType}</p>
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                {(returnType === 'Return' ? ['Defective Product', 'Damaged in transit', 'Product differs from image', 'Quality issue', 'Changed mind'] : ['Size too small', 'Size too large', 'Want different color', 'Defective Product']).map(reason => (
                  <label key={reason} className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${returnReason === reason ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                    <input type="radio" name="returnReason" value={reason} checked={returnReason === reason} onChange={(e) => setReturnReason(e.target.value)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${returnReason === reason ? 'border-primary' : 'border-muted-foreground'}`}>
                      {returnReason === reason && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <span className="font-bold text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">2. Select Pickup Date</p>
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {generatePickupDates().map(date => (
                  <label key={date} className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all w-24 ${pickupDate === date ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}>
                    <input type="radio" name="pickupDate" value={date} checked={pickupDate === date} onChange={(e) => setPickupDate(e.target.value)} className="hidden" />
                    <Calendar size={16} className={`mb-2 ${pickupDate === date ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`font-bold text-xs text-center ${pickupDate === date ? 'text-primary' : 'text-muted-foreground'}`}>{date}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowReturnModal(false)} className="flex-1 border-2 border-border font-black py-4 rounded-xl hover:bg-muted/30 transition-colors text-sm">Cancel</button>
                <button onClick={handleReturnOrder} disabled={returning || !returnReason || !pickupDate} className="flex-1 bg-foreground text-background font-black py-4 rounded-xl hover:bg-primary transition-colors text-sm disabled:opacity-50 shadow-lg">
                  {returning ? 'Processing...' : `Confirm ${returnType}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
