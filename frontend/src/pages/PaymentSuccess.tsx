import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import Logo from '../components/Logo';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const isTrial = searchParams.get('isTrial') === 'true';

  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 mt-24 sm:mt-32"
    >
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={400}
        gravity={0.15}
        colors={['#FF5722', '#E64A19', '#FBE9E7', '#4CAF50', '#81C784']}
      />

      <div className="text-center max-w-2xl mx-auto w-full">
        <Logo size={48} className="text-primary mb-8 mx-auto" />
        
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.1 }}
          className="w-32 h-32 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 relative"
        >
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <CheckCircle2 size={64} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Order Placed Successfully!</h1>
          
          <div className="bg-muted/30 border border-border/50 rounded-3xl p-8 mb-10 inline-block text-left w-full max-w-md backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Order Manifest</p>
            <p className="text-2xl font-black font-mono text-foreground mb-6">{orderId}</p>
            
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Transaction Ref</p>
            <p className="text-sm font-medium font-mono text-foreground mb-6">{paymentId || 'N/A'}</p>

            <div className="bg-primary/10 rounded-2xl p-4 flex items-start gap-4">
              <Package className="text-primary mt-1 shrink-0" size={20} />
              <div>
                <p className="font-black text-primary text-sm uppercase tracking-widest">Estimated Delivery</p>
                <p className="text-sm text-primary/80 font-medium mt-1">3 - 7 Business Days</p>
              </div>
            </div>

            {isTrial && (
              <div className="bg-cadmium/10 rounded-2xl p-4 flex items-start gap-4 mt-4">
                <Home className="text-cadmium mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-black text-cadmium text-sm uppercase tracking-widest">Home Trial Success</p>
                  <p className="text-sm text-cadmium/80 font-medium mt-1">Thank you for using the Home Trial service!</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/products" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background hover:bg-primary font-black py-4 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Continue Shopping
            </Link>
            <Link 
              to="/profile?tab=orders" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border-2 border-border hover:border-foreground text-foreground font-black py-4 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              View My Orders <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
