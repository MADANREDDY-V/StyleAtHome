import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';

export default function TrialSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

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
          <h1 className="text-4xl md:text-5xl font-black text-[#3D1202] tracking-tight mb-4">
            Trial Booked!
          </h1>
          <p className="text-lg text-[#3D1202]/70 font-medium">
            Your Home Trial session has been confirmed. Get ready to try our premium collection in the comfort of your home!
          </p>
        </div>

        {/* Order Details Bento Box */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F9F6F1] rounded-2xl p-6 md:p-8 mb-10 border border-black/5"
        >
          <h3 className="font-bold text-sm uppercase tracking-widest text-[#3D1202]/50 mb-6">Booking Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Booking ID</p>
              <p className="font-black text-lg text-[#3D1202]">{bookingId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Payment Status</p>
              <p className="font-black text-lg text-[#3D1202] font-mono">
                Confirmed (UPI)
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3D1202]/50 mb-1">Booking Fee Paid</p>
              <p className="font-black text-2xl text-[#FF8A00]">₹100</p>
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
            <Home size={18} /> Back to Home 
          </Link>
          <Link 
            to="/profile?tab=trials" 
            className="w-full sm:flex-1 bg-white border-2 border-[#3D1202]/10 hover:border-[#3D1202] text-[#3D1202] text-center py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            View My Trials <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
