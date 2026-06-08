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

  // Mock slots since we don't have a slots table in postgres_schema.sql
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
        
        // Save new address
        const { error: addrError } = await supabase.from('addresses').insert({
          user_id: dbUser.id,
          ...newAddress,
          is_default: addresses.length === 0
        }).select().single();
        
        if (addrError) throw addrError;
      }

      // Create booking
      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: dbUser.id,
        session_type: 'home-trial',
        booking_date: selectedDate,
        time_slot: selectedSlot,
        address: addressStr,
        fee: 50,
        payment_method: 'UPI',
        status: 'Confirmed'
      }).select().single();

      if (bookingError) throw bookingError;

      // Clear trial cart
      await supabase.from('trial_cart_items').delete().eq('user_id', dbUser.id);
      await fetchTrialCart(dbUser.id);

      toast.success('Home trial booked successfully!');
      navigate('/'); // Or a confirmation page
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mt-16 sm:mt-24">
      <h1 className="text-3xl font-black text-center mb-2 tracking-tight">Home Trial Booking</h1>
      <p className="text-center text-muted-foreground text-sm mb-10">Experience fashion at your doorstep before you commit</p>

      {/* Progress Steps */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 md:gap-4">
            <div className={`flex items-center gap-2 transition-colors ${i <= step ? 'opacity-100' : 'opacity-50 grayscale'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i === step ? 'bg-purple-600 text-white ring-4 ring-purple-600/20' : 
                i < step ? 'bg-green-500 text-white' : 'bg-black/10 dark:bg-white/10 text-foreground'
              }`}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-purple-600 dark:text-purple-400' : 'text-foreground'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-[2px] bg-border rounded-full" />}
          </div>
        ))}
      </div>

      <div className="glass-card p-6 sm:p-10 min-h-[400px] flex flex-col justify-between overflow-hidden relative">
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
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><CheckCircle size={20} className="text-purple-600" /> Trial Cart Items</h2>
                {trialCart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No items in trial cart.</p>
                    <a href="/products" className="text-purple-600 font-bold hover:underline">Browse products</a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trialCart.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-border">
                        <img src={item.product?.image_url} alt="" className="w-16 h-20 object-cover rounded-lg shadow-sm" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{item.product?.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.product?.brand} | {item.size}</p>
                        </div>
                        <p className="font-black">₹{item.product?.price}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-purple-600/5 rounded-xl border border-purple-600/20 mt-4">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Home Trial Booking Fee</p>
                      <p className="font-black text-purple-600 dark:text-purple-400">₹50</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Calendar size={20} className="text-purple-600" /> Select Date & Time</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Choose Date</label>
                    <input
                      type="date"
                      min={minDateStr}
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                      className="bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                            className={`py-3 px-4 border rounded-xl text-sm font-bold transition-all ${
                              selectedSlot === s 
                                ? 'border-purple-600 bg-purple-600 text-white shadow-md' 
                                : 'bg-background hover:border-purple-400 text-foreground'
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
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><MapPin size={20} className="text-purple-600" /> Delivery Address</h2>
                {addresses.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Saved Addresses</label>
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`block p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id 
                          ? 'border-purple-600 bg-purple-600/5 ring-1 ring-purple-600' 
                          : 'bg-background hover:border-foreground/50'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="mt-1 accent-purple-600" />
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
                      className="bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><CheckCircle size={20} className="text-purple-600" /> Confirm Booking</h2>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 border border-border space-y-4 text-sm">
                  <div className="flex justify-between items-center"><span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Items</span><span className="font-bold text-base">{trialCart.length} products</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Date</span><span className="font-bold text-base">{selectedDate}</span></div>
                  <div className="flex justify-between items-center"><span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Time Slot</span><span className="font-bold text-base">{selectedSlot}</span></div>
                  <div className="flex justify-between items-center pb-4 border-b border-border"><span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Booking Fee</span><span className="font-black text-lg text-purple-600 dark:text-purple-400">₹50</span></div>
                  <div className="pt-2">
                    <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs mb-2">Delivery Address</p>
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
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
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
              className="flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Processing...' : 'Confirm & Pay ₹50'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
