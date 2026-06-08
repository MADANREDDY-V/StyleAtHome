import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    products: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('products').select('*', { count: 'exact' }),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setStats({
        users: usersRes.count || 0,
        orders: orders.length,
        revenue: totalRevenue,
        products: productsRes.count || 0,
      });
      setRecentOrders(orders.slice(0, 5));
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto pt-32 pb-24 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <Activity size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-foreground">Live Telemetry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Enterprise Command.</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Operator</p>
          <p className="text-lg font-black text-foreground">{user?.fullName || 'System Admin'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: '+14.5%' },
          { label: 'Active Orders', value: stats.orders.toString(), icon: ShoppingCart, trend: '+5.2%' },
          { label: 'Registered Clients', value: stats.users.toString(), icon: Users, trend: '+22.1%' },
          { label: 'Catalog Size', value: stats.products.toString(), icon: Package, trend: '+2.4%' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            className="bento-card p-8 group overflow-hidden relative"
          >
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={120} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-black text-foreground font-mono">{stat.value}</h3>
              <span className="text-sm font-bold text-green-600 dark:text-green-400 mb-1 flex items-center"><TrendingUp size={14} className="mr-1" />{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Data Stream (Perpetual Infinite Loop Carousel) */}
        <div className="lg:col-span-2 bento-card p-8 border border-border/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tight">Active Transmissions</h3>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
          
          <div className="overflow-hidden rounded-2xl bg-muted/20 border border-border/50 relative h-[400px]">
            {/* Fading Edges */}
            <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            
            <motion.div 
              animate={{ y: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 15, repeat: Infinity }}
              className="px-6 py-4 space-y-4"
            >
              {[...recentOrders, ...recentOrders].map((order, idx) => (
                <div key={idx} className="bg-background border border-border/50 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {order.payment_method === 'COD' ? 'COD' : 'UPI'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{order.delivery_name || 'Anonymous Client'}</p>
                      <p className="text-xs font-medium text-muted-foreground font-mono">{order.order_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground font-mono">₹{order.total_amount}</p>
                    <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">{order.status}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Server Status Bento Block */}
        <div className="lg:col-span-1 bento-card bg-bean text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cadmium/40 via-transparent to-transparent opacity-60" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <Activity className="text-cadmium" /> Global Infrastructure
            </h3>

            <div className="space-y-8">
              {[
                { name: 'Database Nodes', status: 'Optimal', usage: '24%' },
                { name: 'Edge CDN', status: 'Routing', usage: '48%' },
                { name: 'Payment Gateway', status: 'Connected', usage: '12ms' },
                { name: 'Authentication', status: 'Secure', usage: '99.9%' }
              ].map((sys) => (
                <div key={sys.name}>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-bold text-white/70 uppercase tracking-widest">{sys.name}</p>
                    <p className="text-xs font-black text-cadmium font-mono">{sys.usage}</p>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: sys.usage.includes('%') ? sys.usage : '100%' }}
                      transition={{ duration: 1.5, type: "spring" }}
                      className="h-full bg-cadmium rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <button className="w-full bg-cadmium text-bean font-black py-4 rounded-xl hover:bg-white hover:text-bean transition-colors uppercase tracking-widest text-xs">
                Run Diagnostics
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
