import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpayPlugin = (env: any) => ({
  name: 'razorpay-api',
  configureServer(server: any) {
    // Parse JSON bodies
    server.middlewares.use((req: any, _res: any, next: any) => {
      if (req.url?.startsWith('/api/')) {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', () => {
          if (body) {
            try {
              req.body = JSON.parse(body);
            } catch (e) {
              req.body = {};
            }
          }
          next();
        });
      } else {
        next();
      }
    });

    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/api/create-order' && req.method === 'POST') {
        try {
          const instance = new Razorpay({
            key_id: env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
            key_secret: env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET',
          });

          const options = {
            amount: Math.round(req.body.amount * 100), // amount in smallest currency unit
            currency: 'INR',
            receipt: 'receipt_' + Date.now(),
          };

          const order = await instance.orders.create(options);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(order));
        } catch (error) {
          console.error('Error creating order:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to create order' }));
        }
      } else if (req.url === '/api/verify-payment' && req.method === 'POST') {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const secret = env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET';

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature === razorpay_signature) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Invalid signature' }));
        }
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), razorpayPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
