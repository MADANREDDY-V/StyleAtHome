import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F9F6F1] flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6"
    >
      <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 text-center relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-100 rounded-full blur-[80px] opacity-50 pointer-events-none" />

        <motion.div 
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
        >
          <XCircle className="text-red-500" size={48} />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-black text-[#3D1202] tracking-tight mb-4 relative z-10">
          Payment Failed
        </h1>
        <p className="text-[#3D1202]/70 font-medium mb-10 relative z-10 max-w-md mx-auto">
          We couldn't process your payment. Your account has not been charged and your order was not placed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full sm:w-auto bg-[#3D1202] hover:bg-[#FF8A00] text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCcw size={18} /> Retry Payment
          </button>
          <Link 
            to="/cart" 
            className="w-full sm:w-auto bg-transparent border-2 border-[#3D1202]/10 hover:border-[#3D1202] text-[#3D1202] px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Cart
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
