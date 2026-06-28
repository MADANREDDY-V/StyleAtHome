import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useDbUser } from '../hooks/useDbUser';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const STEPS = ['Items', 'Date & Time', 'Address', 'Confirm'];

export default function TrialBooking() {
  const { isSignedIn } = useUser();
  const { dbUser } = useDbUser();
  const trialCart = useStore((state) => state.trialCart);
  const fetchTrialCart = useStore((state) => state.fetchTrialCart);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [newAddress, setNewAddress] = useState({ full_name: '', mobile: '', flat_no: '', street: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);

  const MOCK_SLOTS = ['10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '04:00 PM - 06:00 PM'];

  useEffect(() => {
    if (isSignedIn === false) { navigate('/sign-in'); return; }
    if (trialCart.length === 0 && step === 0) {
      toast.error('Add items to trial cart first');
    }
  }, [isSignedIn, navigate, trialCart.length, step]);

  useEffect(() => {
    if (dbUser) {
      supabase.from('addresses').select('*').eq('user_id', dbUser.id).then(({ data }) => {
        if (data && data.length > 0) {
          setAddresses(data);
          setSelectedAddress(data[0]);
        }
      });
    }
  }, [dbUser]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirm = async () => {
    if (!dbUser) return;
    setLoading(true);
    try {
      let addressStr = '';
      if (selectedAddress) {
        addressStr = `${selectedAddress.flat_no}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;
      } else {
        addressStr = `${newAddress.flat_no}, ${newAddress.street}, ${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`;
        if (!newAddress.street || !newAddress.pincode) {
          toast.error('Please fill address details');
          setLoading(false);
          return;
        }
        
        const { error: addrError } = await supabase.from('addresses').insert({
          user_id: dbUser.id,
          ...newAddress,
          is_default: addresses.length === 0
        }).select().single();
        
        if (addrError) throw addrError;
      }

      const totalFee = 50 * trialCart.length;

      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalFee })
      });
      
      if (!orderRes.ok) throw new Error('Failed to create Razorpay order');
      const rzpOrder = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'StyleAtHome',
        description: 'Home Trial Booking Fee',
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
                const bookingNumber = 'TRL-' + crypto.randomUUID().split('-')[0].toUpperCase();

                const { error: bookingError } = await supabase.from('bookings').insert({
                  booking_number: bookingNumber,
                  user_id: dbUser.id,
                  session_type: 'home-trial',
                  booking_date: selectedDate,
                  time_slot: selectedSlot,
                  address: addressStr,
                  fee: totalFee,
                  payment_method: `Razorpay - ${response.razorpay_payment_id}`,
                  status: 'Confirmed'
                }).select().single();

                if (bookingError) throw bookingError;

                await supabase.from('trial_cart_items').delete().eq('user_id', dbUser.id);
                await fetchTrialCart(dbUser.id);

                toast.success('Home trial booked successfully!');
                navigate('/profile?tab=trials');
             } else {
                 toast.error('Payment verification failed');
                 setLoading(false);
             }
           } catch (err) {
             console.error(err);
             toast.error('Verification error');
             setLoading(false);
           }
        },
        prefill: {
          name: dbUser.name || '',
          email: dbUser.email || '',
          contact: dbUser.mobile || ''
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
         toast.error('Payment failed');
         setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mt-24 sm:mt-32 mb-24">
      <h1 className="text-4xl font-black text-center mb-2 tracking-tight">Home Trial Booking</h1>
      <p className="text-center text-muted-foreground text-sm mb-10">Experience fashion at your doorstep before you commit</p>

      {/* Progress Steps */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 md:gap-4">
            <div className={`flex items-center gap-2 transition-colors ${i <= step ? 'opacity-100' : 'opacity-50 grayscale'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i === step ? 'bg-primary text-white ring-4 ring-primary/20' : 
                i < step ? 'bg-cadmium text-white' : 'bg-muted text-foreground'
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-primary' : 'text-foreground'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-[2px] bg-border rounded-full" />}
          </div>
        ))}
      </div>

      <div className="bento-card border border-border/50 min-h-[400px] flex flex-col justify-between overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h2 className="text-xl font-black flex items-center gap-2 mb-6"><CheckCircle size={20} className="text-primary" /> Trial Cart Items</h2>
                {trialCart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No items in trial cart.</p>
                    <a href="/products" className="text-primary font-bold hover:underline">Browse products</a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trialCart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-muted/30 p-4 rounded-xl border border-border/50">
                        <img src={item.product?.image_url} alt="" className="w-16 h-20 object-cover rounded-lg shadow-sm" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.product?.brand} | {item.size}</p>
                        </div>
                        <p className="font-black font-mono">₹{item.product?.price}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/20 mt-4">
                      <p className="text-sm font-bold text-primary">Home Trial Booking Fee (₹50 × {trialCart.length})</p>
                      <p className="font-black text-primary font-mono">₹{50 * trialCart.length}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-xl font-black flex items-center gap-2 mb-6"><Calendar size={20} className="text-primary" /> Select Date & Time</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Choose Date</label>
                    <input
                      type="date"
                      min={minDateStr}
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                      className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {selectedDate && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 block flex items-center gap-2">
                        <Clock size={14} /> Available Slots
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {MOCK_SLOTS.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSlot(s)}
                            className={`py-3 px-4 border-2 rounded-xl text-sm font-bold transition-all ${
                              selectedSlot === s 
                                ? 'border-primary bg-primary text-white shadow-md' 
                                : 'border-border bg-background hover:border-primary text-foreground'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-black flex items-center gap-2 mb-6"><MapPin size={20} className="text-primary" /> Delivery Address</h2>
                {addresses.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Saved Addresses</label>
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : 'border-border bg-background hover:border-primary/50'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1 accent-primary" />
                          <div>
                            <p className="font-bold text-sm text-foreground">{addr.full_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{addr.flat_no}, {addr.street}, {addr.city} - {addr.pincode}</p>
                            <p className="text-xs text-muted-foreground mt-1">Ph: {addr.mobile}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 block">
                  {addresses.length > 0 ? 'Or Add New Address' : 'Add Address'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['full_name', 'mobile', 'flat_no', 'street', 'city', 'state', 'pincode'].map((field) => (
                    <input
                      key={field}
                      placeholder={field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      value={(newAddress as any)[field]}
                      onChange={(e) => { setSelectedAddress(null); setNewAddress({ ...newAddress, [field]: e.target.value }); }}
                      className="bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-black flex items-center gap-2 mb-6"><CheckCircle size={20} className="text-primary" /> Confirm Booking</h2>
                <div className="bg-muted/20 rounded-2xl p-6 border border-border/50 space-y-4 text-sm">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Items</span><span className="font-bold text-base">{trialCart.length} products</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Date</span><span className="font-bold text-base">{selectedDate}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Time Slot</span><span className="font-bold text-base">{selectedSlot}</span></div>
                  <div className="flex justify-between items-center pb-4 border-b border-border"><span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Booking Fee</span><span className="font-black text-lg text-primary font-mono">₹{50 * trialCart.length}</span></div>
                  <div className="pt-2">
                    <p className="text-muted-foreground font-bold uppercase tracking-wider text-xs mb-2">Delivery Address</p>
                    <p className="font-bold text-foreground leading-relaxed">
                      {selectedAddress
                        ? `${selectedAddress.full_name}\n${selectedAddress.flat_no}, ${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.pincode}`
                        : `${newAddress.full_name}\n${newAddress.flat_no}, ${newAddress.street}, ${newAddress.city} - ${newAddress.pincode}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10 pt-6 border-t border-border/50">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted/30">
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}
          
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 0 && trialCart.length === 0) { toast.error('Add items first'); return; }
                if (step === 1 && (!selectedDate || !selectedSlot)) { toast.error('Select date and time slot'); return; }
                if (step === 2 && !selectedAddress && (!newAddress.street || !newAddress.pincode)) { toast.error('Select or enter full address'); return; }
                setStep(step + 1);
              }}
              className="flex items-center gap-2 bg-foreground hover:bg-primary text-background font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-cadmium text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Processing...' : `Confirm & Pay ₹${50 * trialCart.length}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
