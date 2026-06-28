import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const instance = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET',
    });

    const bodyPayload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const options = {
      amount: Math.round((bodyPayload.amount || 0) * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await instance.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
}
