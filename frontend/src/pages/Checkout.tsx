import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MapPin, CreditCard, ChevronLeft, ArrowRight, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { isSignedIn } = useUser();
  const { dbUser } = useDbUser();
  const cart = useStore((state) => state.cart);
  const fetchCart = useStore((state) => state.fetchCart);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [payment, setPayment] = useState('UPI');
  const [address, setAddress] = useState({
    name: '', mobile: '', flatNo: '', street: '', city: '', state: '', pincode: '',
  });

  useEffect(() => {
    if (dbUser) {
      setAddress((prev) => ({ ...prev, name: dbUser.name || '', mobile: dbUser.mobile || '' }));
      supabase.from('addresses').select('*').eq('user_id', dbUser.id).then(({ data }) => {
        if (data && data.length > 0) {
          const addr = data[0];
          setAddress({
            name: addr.full_name || dbUser.name || '',
            mobile: addr.mobile || dbUser.mobile || '',
            flatNo: addr.flat_no || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
          });
        }
      });
    }
  }, [dbUser]);

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-4xl font-black mb-6 tracking-tight">Identity Required</h2>
        <Link to="/sign-in" className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:-translate-y-1 transition-transform">Authenticate</Link>
      </div>
    );
  }

  const cartTotal = cart.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0);
  const tax = cartTotal * 0.05;
  const total = cartTotal + tax;

  const handleNextStep = () => {
    if (!address.street || !address.pincode || !address.name || !address.mobile || !address.city || !address.state) {
      toast.error('Please complete all delivery coordinates.');
      return;
    }
    setStep(2);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createSupabaseOrder = async (finalPaymentMethod: string) => {
    if (!dbUser) throw new Error('User not authenticated');
    const orderNumber = 'ORD-' + crypto.randomUUID().split('-')[0].toUpperCase();
    
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: dbUser.id,
      total_amount: total,
      payment_method: finalPaymentMethod,
      status: 'Confirmed',
      delivery_name: address.name,
      delivery_mobile: address.mobile,
      delivery_address: `${address.flatNo}, ${address.street}`,
      delivery_city: address.city,
      delivery_state: address.state,
      delivery_pincode: address.pincode,
    }).select().single();

    if (orderError) throw orderError;

    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    await supabase.from('cart_items').delete().eq('user_id', dbUser.id);
    await fetchCart(dbUser.id);

    // Save address for future reuse
    const { data: existingAddr } = await supabase.from('addresses').select('id').eq('user_id', dbUser.id).limit(1);
    if (!existingAddr || existingAddr.length === 0) {
      await supabase.from('addresses').insert({
        user_id: dbUser.id,
        full_name: address.name,
        mobile: address.mobile,
        flat_no: address.flatNo,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: true,
      });
    }
    
    return order;
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Requisition is empty');
      return;
    }
    if (!dbUser) return;

    setLoading(true);

    if (payment !== 'COD') {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      try {
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total })
        });
        
        if (!orderRes.ok) throw new Error('Failed to create Razorpay order');
        const rzpOrder = await orderRes.json();

        const options = {
          key: 'rzp_test_YOUR_KEY', // REPLACE THIS WITH YOUR RAZORPAY TEST KEY ID
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'StyleAtHome',
          description: 'Premium Fashion Purchase',
          order_id: rzpOrder.id,
          handler: async function (response: any) {
             try {
               const verifyRes = await fetch('/api/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(response)
               });
               const verifyData = await verifyRes.json();
               if (verifyData.success) {
                   const order = await createSupabaseOrder(`Razorpay - ${response.razorpay_payment_id}`);
                   toast.success('Payment successful!');
                   navigate(`/payment-success?orderId=${order.order_number}&paymentId=${response.razorpay_payment_id}&amount=${total}`);
               } else {
                   toast.error('Payment verification failed');
                   navigate('/payment-failed');
               }
             } catch (err) {
               console.error(err);
               toast.error('Verification error');
               navigate('/payment-failed');
             }
          },
          prefill: {
            name: address.name,
            email: dbUser.email || '',
            contact: address.mobile
          },
          theme: { color: '#3D1202' },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function () {
           navigate('/payment-failed');
        });
        rzp.open();
      } catch (err: any) {
         console.error(err);
         toast.error(err.message || 'Could not initiate payment');
         setLoading(false);
      }
    } else {
      // COD Flow
      try {
        const order = await createSupabaseOrder('COD');
        toast.success('Order placed successfully!');
        navigate(`/payment-success?orderId=${order.order_number}&paymentId=COD&amount=${total}`);
      } catch (err: any) {
        toast.error(err.message || 'Order placement failed');
        setLoading(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto mt-24 sm:mt-32 mb-24 px-4 sm:px-6"
    >
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft size={16} /> Return to Requisition
      </button>

      <div className="flex items-end justify-between mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
          Secure <br />
          <span className="text-primary">Checkout.</span>
        </h1>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-8">
          
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setStep(1)}
              className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${step === 1 ? 'bg-primary text-white shadow-md' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
            >
              1. Coordinates
            </button>
            <button 
              onClick={() => step === 2 ? setStep(2) : handleNextStep()}
              className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${step === 2 ? 'bg-primary text-white shadow-md' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
            >
              2. Transaction
            </button>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="bento-card border border-border/50"
                >
                  <h3 className="font-black text-2xl mb-8 flex items-center gap-3 tracking-tight">
                    <MapPin className="text-primary" /> Delivery Coordinates
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recipient Name</label>
                      <input placeholder="John Doe" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mobile Contact</label>
                      <input placeholder="+91 9876543210" value={address.mobile} onChange={(e) => setAddress({ ...address, mobile: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Premises / Flat No.</label>
                      <input placeholder="Apt 4B" value={address.flatNo} onChange={(e) => setAddress({ ...address, flatNo: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Street / Sector</label>
                      <input placeholder="Tech Park Avenue" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City</label>
                      <input placeholder="Metropolis" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">State</label>
                        <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pincode</label>
                        <input placeholder="000000" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold transition-colors outline-none font-mono" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10 flex justify-end">
                    <button onClick={handleNextStep} className="bg-foreground hover:bg-primary text-background font-black py-4 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center gap-2 group">
                      Proceed to Payment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step-2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="bento-card border border-border/50"
                >
                  <h3 className="font-black text-2xl mb-8 flex items-center gap-3 tracking-tight">
                    <CreditCard className="text-primary" /> Transaction Protocol
                  </h3>
                  <div className="space-y-4">
                    {['UPI', 'Credit/Debit Card', 'Cash on Delivery (COD)'].map((m) => {
                      const methodValue = m === 'Cash on Delivery (COD)' ? 'COD' : m === 'Credit/Debit Card' ? 'Card' : 'UPI';
                      const isActive = payment === methodValue;
                      return (
                        <label key={m} onClick={() => setPayment(methodValue)} className={`flex items-center gap-6 p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                          isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent bg-muted/20 hover:bg-muted/40'
                        }`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'border-primary' : 'border-muted-foreground'}`}>
                            {isActive && <div className="w-3 h-3 bg-primary rounded-full" />}
                          </div>
                          <span className="font-black text-lg">{m}</span>
                        </label>
                      )
                    })}
                  </div>

                  <div className="mt-10 bg-muted/20 p-6 rounded-2xl border border-border/50">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Delivery To:</h4>
                    <p className="font-black text-foreground">{address.name}</p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{address.flatNo}, {address.street}</p>
                    <p className="text-sm font-medium text-muted-foreground">{address.city}, {address.state} - <span className="font-mono">{address.pincode}</span></p>
                  </div>
                  
                  <div className="mt-10 flex justify-between items-center">
                    <button onClick={() => setStep(1)} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
                      Edit Details
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={loading}
                      className="bg-foreground hover:bg-primary text-background font-black py-4 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 group"
                    >
                      {loading ? 'Processing...' : <><CheckCircle2 size={18} /> Confirm Order</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bento-card sticky top-32 border border-border/50">
            <h3 className="text-xl font-black mb-8 tracking-tight flex items-center gap-2">
              <Package className="text-primary" size={20} /> Order Manifest
            </h3>
            
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide mb-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted/30 shrink-0">
                    <img src={item.product?.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black line-clamp-2 text-foreground leading-snug">{item.product?.name}</p>
                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono font-black text-lg">₹{((item.product?.price || 0) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border/50 pt-8 space-y-4 text-sm font-medium">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="text-foreground font-mono">₹{cartTotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Estimated Tax (5%)</span><span className="text-foreground font-mono">₹{tax.toFixed(0)}</span></div>
              <div className="flex justify-between text-muted-foreground border-b border-border/50 pb-6"><span>Shipping</span><span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">Complimentary</span></div>
              
              <div className="flex justify-between font-black text-2xl pt-2 items-center">
                <span>Total</span>
                <span className="text-primary font-mono text-3xl">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
