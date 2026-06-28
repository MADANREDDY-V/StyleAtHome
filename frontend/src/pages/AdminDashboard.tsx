import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, ShoppingCart, DollarSign, Package, TrendingUp, Layers, Store, ClipboardList, CalendarCheck, Plus, X, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { useDbUser } from '../hooks/useDbUser';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = '23eg111a28@anurag.edu.in';
const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'stores', label: 'Stores', icon: Store },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
];

interface ProductForm {
  id?: number; name: string; brand: string; price: string; mrp: string; description: string; image_url: string;
  category_id: string; store_id: string; section: string; color: string; sizes: string; rating: string;
  review_count: string; is_new_arrival: boolean; is_active: boolean;
}
const emptyProduct: ProductForm = { name: '', brand: '', price: '', mrp: '', description: '', image_url: '', category_id: '', store_id: '', section: 'Men', color: '', sizes: 'S, M, L, XL', rating: '4.0', review_count: '0', is_new_arrival: false, is_active: true };

interface CategoryForm { id?: number; name: string; section: string; }
const emptyCategory: CategoryForm = { name: '', section: 'Men' };

interface StoreForm { id?: number; name: string; slug: string; description: string; logo_url: string; banner_url: string; is_active: boolean; }
const emptyStore: StoreForm = { name: '', slug: '', description: '', logo_url: '', banner_url: '', is_active: true };

export default function AdminDashboard() {
  const { user } = useUser();
  const { dbUser } = useDbUser();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState<CategoryForm>(emptyCategory);
  const [editingCat, setEditingCat] = useState(false);

  // Stores state
  const [stores, setStores] = useState<any[]>([]);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeForm, setStoreForm] = useState<StoreForm>(emptyStore);
  const [editingStore, setEditingStore] = useState(false);

  // Orders & Bookings
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL || dbUser?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    fetchOverview();

    // Realtime notifications for new orders & bookings
    const ordersChannel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as any;
        toast(`🛒 New Order: ${order.order_number || 'Order'} — ₹${order.total_amount || 0}`, {
          icon: '📦', duration: 6000,
          style: { background: '#1a1a1a', color: '#fff', fontWeight: 700 },
        });
        fetchOverview();
        if (tab === 'orders') fetchOrders();
      })
      .subscribe();

    const bookingsChannel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const booking = payload.new as any;
        toast(`🏠 New Trial Booking: ${booking.booking_number || 'Booking'}`, {
          icon: '📅', duration: 6000,
          style: { background: '#1a1a1a', color: '#fff', fontWeight: 700 },
        });
        fetchOverview();
        if (tab === 'bookings') fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'products') { fetchProducts(); fetchCategories(); fetchStores(); }
    if (tab === 'categories') fetchCategories();
    if (tab === 'stores') fetchStores();
    if (tab === 'orders') fetchOrders();
    if (tab === 'bookings') fetchBookings();
  }, [tab, isAdmin]);

  async function fetchOverview() {
    const [usersRes, ordersRes, productsRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }),
      supabase.from('orders').select('id, total_amount, delivery_name, order_number, status, delivery_city, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('products').select('*', { count: 'exact' }),
    ]);
    const allOrders = ordersRes.data || [];
    setStats({
      users: usersRes.count || 0, orders: allOrders.length,
      revenue: allOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
      products: productsRes.count || 0,
    });
    setRecentOrders(allOrders.slice(0, 5));
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*, category:categories(name), store:stores(name)').order('created_at', { ascending: false });
    if (data) setProducts(data);
  }
  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('section').order('name');
    if (data) setCategories(data);
  }
  async function fetchStores() {
    const { data } = await supabase.from('stores').select('*').order('name');
    if (data) setStores(data);
  }
  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('id, total_amount, delivery_name, order_number, status, delivery_city, created_at').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }
  async function fetchBookings() {
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (data) setBookings(data);
  }

  // CRUD Product
  async function saveProduct() {
    const payload = { ...productForm, price: parseFloat(productForm.price), mrp: productForm.mrp ? parseFloat(productForm.mrp) : null, category_id: parseInt(productForm.category_id), store_id: parseInt(productForm.store_id), rating: parseFloat(productForm.rating) || 0, review_count: parseInt(productForm.review_count) || 0 };
    const { id, ...rest } = payload;
    if (editingProduct && id) {
      const { error } = await supabase.from('products').update(rest).eq('id', id);
      if (error) { toast.error(error.message); return; }
      toast.success('Product updated');
    } else {
      const { error } = await supabase.from('products').insert(rest);
      if (error) { toast.error(error.message); return; }
      toast.success('Product created');
    }
    setShowProductForm(false); setProductForm(emptyProduct); setEditingProduct(false); fetchProducts(); fetchOverview();
  }
  async function deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Product deleted'); fetchProducts(); fetchOverview(); }
  }

  // CRUD Category
  async function saveCategory() {
    const { id, ...rest } = catForm;
    if (editingCat && id) {
      const { error } = await supabase.from('categories').update(rest).eq('id', id);
      if (error) { toast.error(error.message); return; }
      toast.success('Category updated');
    } else {
      const { error } = await supabase.from('categories').insert(rest);
      if (error) { toast.error(error.message); return; }
      toast.success('Category created');
    }
    setShowCatForm(false); setCatForm(emptyCategory); setEditingCat(false); fetchCategories();
  }
  async function deleteCategory(id: number) {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Category deleted'); fetchCategories(); }
  }

  // CRUD Store
  async function saveStore() {
    const { id, ...rest } = storeForm;
    if (editingStore && id) {
      const { error } = await supabase.from('stores').update(rest).eq('id', id);
      if (error) { toast.error(error.message); return; }
      toast.success('Store updated');
    } else {
      const { error } = await supabase.from('stores').insert(rest);
      if (error) { toast.error(error.message); return; }
      toast.success('Store created');
    }
    setShowStoreForm(false); setStoreForm(emptyStore); setEditingStore(false); fetchStores();
  }
  async function deleteStore(id: number) {
    if (!confirm('Delete this store?')) return;
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Store deleted'); fetchStores(); }
  }

  // Order status update
  async function updateOrderStatus(id: number, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Status updated'); fetchOrders(); }
  }
  async function updateBookingStatus(id: number, status: string) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Status updated'); fetchBookings(); }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Package className="text-muted-foreground/30 mb-6" size={64} />
        <h2 className="text-3xl font-black mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-muted-foreground font-medium">Administrator privileges required.</p>
      </div>
    );
  }

  const inputCls = "w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-sm font-bold transition-colors outline-none";
  const filteredProducts = productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase())) : products;

  return (
    <div className="max-w-[1400px] mx-auto pt-32 pb-24 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <Activity size={16} className="text-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-foreground">Admin Console</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Enterprise Command.</h1>
        </div>
        <p className="text-sm font-bold text-muted-foreground">{user?.fullName || 'System Admin'}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${tab === t.id ? 'bg-primary text-white shadow-md' : 'bg-muted/30 text-foreground hover:bg-muted/50'}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: '+14.5%' },
                  { label: 'Active Orders', value: stats.orders.toString(), icon: ShoppingCart, trend: '+5.2%' },
                  { label: 'Registered Clients', value: stats.users.toString(), icon: Users, trend: '+22.1%' },
                  { label: 'Catalog Size', value: stats.products.toString(), icon: Package, trend: '+2.4%' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: "spring" }} className="bg-white dark:bg-card rounded-[2rem] p-8 group overflow-hidden relative border border-border/60 shadow-[0_4px_24px_-6px_rgba(61,18,2,0.08)]">
                    <div className="absolute -right-4 -top-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"><stat.icon size={120} /></div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6"><stat.icon size={24} /></div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-end gap-3">
                      <h3 className="text-4xl font-black text-foreground font-mono">{stat.value}</h3>
                      <span className="text-sm font-bold text-cadmium mb-1 flex items-center"><TrendingUp size={14} className="mr-1" />{stat.trend}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="bg-white dark:bg-card rounded-[2rem] p-8 border border-border/60 shadow-[0_4px_24px_-6px_rgba(61,18,2,0.08)]">
                <h3 className="text-2xl font-black tracking-tight mb-6">Recent Orders</h3>
                <div className="space-y-3">
                  {recentOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                      <div><p className="font-bold text-foreground">{o.delivery_name || 'Client'}</p><p className="text-xs font-mono text-muted-foreground">{o.order_number}</p></div>
                      <div className="text-right"><p className="font-black font-mono">₹{o.total_amount}</p><p className="text-[10px] font-bold text-cadmium uppercase tracking-widest">{o.status}</p></div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-2 flex-1 max-w-md">
                  <Search size={16} className="text-muted-foreground" />
                  <input placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="bg-transparent text-sm font-bold outline-none flex-1" />
                </div>
                <button onClick={() => { setProductForm(emptyProduct); setEditingProduct(false); setShowProductForm(true); }} className="bg-foreground hover:bg-primary text-background font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"><Plus size={16} /> Add Product</button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bento-card border border-primary/20 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                    <button onClick={() => setShowProductForm(false)} className="p-2 rounded-full bg-muted/30 hover:bg-muted/50"><X size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</label><input className={inputCls} value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Brand</label><input className={inputCls} value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Price</label><input type="number" className={inputCls} value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MRP</label><input type="number" className={inputCls} value={productForm.mrp} onChange={e => setProductForm({...productForm, mrp: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Image URL</label><input className={inputCls} placeholder="Paste image URL or drop link" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Section</label><select className={inputCls} value={productForm.section} onChange={e => setProductForm({...productForm, section: e.target.value})}><option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option></select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</label><select className={inputCls} value={productForm.category_id} onChange={e => setProductForm({...productForm, category_id: e.target.value})}><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}</select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Store</label><select className={inputCls} value={productForm.store_id} onChange={e => setProductForm({...productForm, store_id: e.target.value})}><option value="">Select...</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Color</label><input className={inputCls} value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sizes</label><input className={inputCls} placeholder="S, M, L, XL" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rating</label><input type="number" step="0.1" max="5" className={inputCls} value={productForm.rating} onChange={e => setProductForm({...productForm, rating: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Review Count</label><input type="number" className={inputCls} value={productForm.review_count} onChange={e => setProductForm({...productForm, review_count: e.target.value})} /></div>
                  </div>
                  <div className="space-y-1 sm:col-span-2"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</label><textarea className={inputCls + " resize-none"} rows={2} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></div>
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer"><input type="checkbox" checked={productForm.is_new_arrival} onChange={e => setProductForm({...productForm, is_new_arrival: e.target.checked})} className="accent-primary" /> New Arrival</label>
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer"><input type="checkbox" checked={productForm.is_active} onChange={e => setProductForm({...productForm, is_active: e.target.checked})} className="accent-primary" /> Active</label>
                  </div>
                  {productForm.image_url && <div className="w-24 h-32 rounded-xl overflow-hidden bg-muted/30 border border-border/50"><img src={productForm.image_url} alt="" className="w-full h-full object-cover" /></div>}
                  <div className="flex gap-3 pt-4">
                    <button onClick={saveProduct} className="bg-foreground hover:bg-primary text-background font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"><Upload size={16} /> {editingProduct ? 'Update' : 'Create'}</button>
                    <button onClick={() => setShowProductForm(false)} className="text-muted-foreground font-bold px-4 py-3">Cancel</button>
                  </div>
                </motion.div>
              )}

              {/* Product Table */}
              <div className="bento-card !p-0 border border-border/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/30 text-left">
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Product</th>
                      <th className="px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Brand</th>
                      <th className="px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Price</th>
                      <th className="px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Section</th>
                      <th className="px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Store</th>
                      <th className="px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="px-4 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className={`hover:bg-muted/10 transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-4 flex items-center gap-3"><div className="w-10 h-12 rounded-lg overflow-hidden bg-muted/30 shrink-0">{p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}</div><span className="font-bold text-foreground line-clamp-1">{p.name}</span></td>
                          <td className="px-4 py-4 text-muted-foreground font-medium">{p.brand}</td>
                          <td className="px-4 py-4 font-black font-mono">₹{p.price}</td>
                          <td className="px-4 py-4"><span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">{p.section}</span></td>
                          <td className="px-4 py-4 text-muted-foreground font-medium">{p.store?.name}</td>
                          <td className="px-4 py-4">
                            <button onClick={async () => { await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id); fetchProducts(); fetchOverview(); toast.success(p.is_active ? 'Product hidden' : 'Product visible'); }} className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors ${p.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                              {p.is_active ? 'Active' : 'Hidden'}
                            </button>
                          </td>
                          <td className="px-4 py-4 flex gap-2">
                            <button onClick={() => { setProductForm({ ...p, price: String(p.price), mrp: String(p.mrp || ''), category_id: String(p.category_id), store_id: String(p.store_id), rating: String(p.rating || ''), review_count: String(p.review_count || 0) }); setEditingProduct(true); setShowProductForm(true); }} className="p-2 rounded-lg bg-muted/30 hover:bg-primary/10 text-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg bg-muted/30 hover:bg-destructive/10 text-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-12">No products found.</p>}
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {tab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">Categories ({categories.length})</h2>
                <button onClick={() => { setCatForm(emptyCategory); setEditingCat(false); setShowCatForm(true); }} className="bg-foreground hover:bg-primary text-background font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"><Plus size={16} /> Add Category</button>
              </div>
              {showCatForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card border border-primary/20 space-y-4">
                  <div className="flex items-center justify-between"><h3 className="text-lg font-black">{editingCat ? 'Edit' : 'New'} Category</h3><button onClick={() => setShowCatForm(false)} className="p-2 rounded-full bg-muted/30"><X size={18} /></button></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</label><input className={inputCls} value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Section</label><select className={inputCls} value={catForm.section} onChange={e => setCatForm({...catForm, section: e.target.value})}><option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option></select></div>
                  </div>
                  <button onClick={saveCategory} className="bg-foreground hover:bg-primary text-background font-bold px-6 py-3 rounded-xl transition-colors">{editingCat ? 'Update' : 'Create'}</button>
                </motion.div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bento-card !p-6 flex items-center justify-between border border-border/50">
                    <div><p className="font-bold text-foreground">{c.name}</p><p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">{c.section}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setCatForm(c); setEditingCat(true); setShowCatForm(true); }} className="p-2 rounded-lg bg-muted/30 hover:bg-primary/10 text-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteCategory(c.id)} className="p-2 rounded-lg bg-muted/30 hover:bg-destructive/10 text-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STORES TAB */}
          {tab === 'stores' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight">Stores ({stores.length})</h2>
                <button onClick={() => { setStoreForm(emptyStore); setEditingStore(false); setShowStoreForm(true); }} className="bg-foreground hover:bg-primary text-background font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm"><Plus size={16} /> Add Store</button>
              </div>
              {showStoreForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card border border-primary/20 space-y-4">
                  <div className="flex items-center justify-between"><h3 className="text-lg font-black">{editingStore ? 'Edit' : 'New'} Store</h3><button onClick={() => setShowStoreForm(false)} className="p-2 rounded-full bg-muted/30"><X size={18} /></button></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</label><input className={inputCls} value={storeForm.name} onChange={e => setStoreForm({...storeForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Slug</label><input className={inputCls} value={storeForm.slug} onChange={e => setStoreForm({...storeForm, slug: e.target.value})} /></div>
                    <div className="space-y-1 sm:col-span-2"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</label><textarea className={inputCls + " resize-none"} rows={2} value={storeForm.description} onChange={e => setStoreForm({...storeForm, description: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Logo URL</label><input className={inputCls} value={storeForm.logo_url} onChange={e => setStoreForm({...storeForm, logo_url: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Banner URL</label><input className={inputCls} value={storeForm.banner_url} onChange={e => setStoreForm({...storeForm, banner_url: e.target.value})} /></div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer"><input type="checkbox" checked={storeForm.is_active} onChange={e => setStoreForm({...storeForm, is_active: e.target.checked})} className="accent-primary" /> Active</label>
                  <button onClick={saveStore} className="bg-foreground hover:bg-primary text-background font-bold px-6 py-3 rounded-xl transition-colors">{editingStore ? 'Update' : 'Create'}</button>
                </motion.div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stores.map(s => (
                  <div key={s.id} className="bento-card !p-6 flex items-start justify-between gap-4 border border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/30 shrink-0">{s.logo_url && <img src={s.logo_url} alt="" className="w-full h-full object-cover" />}</div>
                      <div><p className="font-black text-lg text-foreground">{s.name}</p><p className="text-xs font-mono text-muted-foreground mt-0.5">/{s.slug}</p><p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description}</p></div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setStoreForm(s); setEditingStore(true); setShowStoreForm(true); }} className="p-2 rounded-lg bg-muted/30 hover:bg-primary/10 text-foreground hover:text-primary transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteStore(s.id)} className="p-2 rounded-lg bg-muted/30 hover:bg-destructive/10 text-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight mb-6">Orders ({orders.length})</h2>
              {orders.map(o => (
                <div key={o.id} className="bento-card !p-6 border border-border/50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-black font-mono text-lg">{o.order_number}</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">{o.delivery_name} — {o.delivery_city}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black font-mono text-xl">₹{o.total_amount}</p>
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-muted-foreground py-12 bento-card border border-border/50">No orders yet.</p>}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {tab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight mb-6">Trial Bookings ({bookings.length})</h2>
              {bookings.map(b => (
                <div key={b.id} className="bento-card !p-6 border border-border/50 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="font-black font-mono text-lg">{b.booking_number}</p>
                    <p className="text-sm text-muted-foreground mt-1">{b.booking_date} | {b.time_slot}</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm truncate">{b.address}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-black font-mono">₹{b.fee}</p>
                    <select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value)} className="bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {['Pending', 'Confirmed', 'Assigned', 'Out For Trial', 'Trial Completed', 'Purchased', 'Returned', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <p className="text-center text-muted-foreground py-12 bento-card border border-border/50">No bookings yet.</p>}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
