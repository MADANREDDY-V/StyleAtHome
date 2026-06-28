import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingBag } from 'lucide-react';

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      if (!id) return;
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single();
      const { data: itemsData } = await supabase.from('order_items').select('*, product:products(name, brand, store:stores(name, logo_url))').eq('order_id', id);
      setOrder(orderData);
      setItems(itemsData || []);
      setLoading(false);
      
      if (orderData) {
        setTimeout(() => window.print(), 1000);
      }
    }
    fetchInvoice();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!order) return <div className="p-8 text-center text-red-500 font-bold">Invoice not found</div>;

  const subtotal = order.total_amount / 1.05;
  const tax = order.total_amount - subtotal;

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto print:p-0 print:shadow-none" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={32} />
            <h1 className="text-3xl font-black tracking-tighter">StyleAtHome.</h1>
          </div>
          <p className="text-sm font-medium text-gray-600">StyleAtHome E-commerce Pvt. Ltd.<br />123 Fashion Street, Tech Park<br />Hyderabad, Telangana 500081<br />GSTIN: 36ABCDE1234F1Z5</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black mb-2 text-gray-200">INVOICE</h2>
          <p className="text-sm font-bold">Invoice # {order.order_number}</p>
          <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex justify-between mb-12">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Billed To</h3>
          <p className="font-bold text-lg">{order.delivery_name}</p>
          <p className="text-sm text-gray-600 leading-relaxed mt-1">{order.delivery_address}<br />{order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}<br />Mobile: {order.delivery_mobile}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Payment Method</h3>
          <p className="font-bold">{order.payment_method}</p>
          <p className="text-sm text-gray-600 mt-1">Status: <span className="font-bold text-black uppercase">{order.status}</span></p>
        </div>
      </div>

      <table className="w-full mb-12 border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-3 text-xs font-bold uppercase tracking-widest text-gray-400">Description</th>
            <th className="py-3 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Qty</th>
            <th className="py-3 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Unit Price</th>
            <th className="py-3 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-4">
                <p className="font-bold">{item.product.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Brand: {item.product.brand} | Store: {item.product.store?.name}
                  {item.size && ` | Size: ${item.size}`}
                  {item.color && ` | Color: ${item.color}`}
                </p>
              </td>
              <td className="py-4 text-center font-bold">{item.quantity}</td>
              <td className="py-4 text-right font-mono">₹{item.price}</td>
              <td className="py-4 text-right font-mono font-bold">₹{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm text-gray-600"><span>Subtotal:</span><span className="font-mono">₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>IGST @ 5%:</span><span className="font-mono">₹{tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>Shipping:</span><span>₹0.00</span></div>
          <div className="flex justify-between text-xl font-black border-t-2 border-black pt-3 mt-3"><span>Total:</span><span className="font-mono">₹{order.total_amount.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>This is a computer generated invoice and does not require a physical signature.</p>
        <p className="mt-1">Returns and exchanges are valid within 14 days of delivery. Keep this invoice for reference.</p>
      </div>
      
      <div className="fixed top-4 right-4 print:hidden">
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl hover:bg-gray-800 transition-colors">
          Print Invoice
        </button>
      </div>
    </div>
  );
}
