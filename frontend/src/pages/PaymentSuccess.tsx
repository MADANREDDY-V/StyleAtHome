import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');

  // Calculate estimated delivery (e.g., 3-5 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const formattedDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F9F6F1] flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6"
    >
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 overflow-hidden relative">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-10 relative z-10">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="text-green-600" size={48} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-[#3D1202] tracking-tight mb-4">Payment Successful!</h1>
          <p className="text-lg text-[#3D1202]/70 font-medium">
            Thank you for shopping with StyleAtHome. Your premium lifestyle upgrade is on its way.
          </p>
        </div>

        {/* Order Details Bento Box */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F9F6F1] rounded-2xl p-6 md:p-8 mb-10 border border-black/5"
        >
          <h3 className="font-bold text-sm uppercase tracking-widest text-[#3D1202]/50 mb-6">Order Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Order ID</p>
              <p className="font-black text-lg text-[#3D1202]">{orderId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Payment Reference</p>
              <p className="font-black text-lg text-[#3D1202] font-mono">{paymentId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Amount Paid</p>
              <p className="font-black text-2xl text-[#FF8A00]">₹{parseFloat(amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Estimated Delivery</p>
              <p className="font-bold text-lg text-[#3D1202]">{formattedDate}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link 
            to="/products" 
            className="w-full sm:flex-1 bg-[#3D1202] hover:bg-[#FF8A00] text-white text-center py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group shadow-lg"
          >
            <ShoppingBag size={18} /> Continue Shopping 
          </Link>
          <Link 
            to="/profile?tab=orders" 
            className="w-full sm:flex-1 bg-white border-2 border-[#3D1202]/10 hover:border-[#3D1202] text-[#3D1202] text-center py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            View My Orders <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
