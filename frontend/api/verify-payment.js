import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bodyPayload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = bodyPayload;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET';

    const verifyBody = String(razorpay_order_id) + '|' + String(razorpay_payment_id);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(verifyBody)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
