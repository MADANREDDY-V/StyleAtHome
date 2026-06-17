import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-bean text-white/80 mt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <Logo size={24} className="text-cadmium" />
              <h3 className="text-2xl font-black tracking-tighter text-white">Style<span className="text-cadmium">AtHome</span></h3>
            </Link>
            <p className="text-sm font-medium text-white/50 leading-relaxed max-w-[30ch]">
              Curated collections from premier boutiques, delivered to your door with enterprise-grade precision.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-cadmium mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Men', path: '/products?section=Men' },
                { label: 'Women', path: '/products?section=Women' },
                { label: 'Kids', path: '/products?section=Kids' },
                { label: 'Stores', path: '/stores' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm font-medium text-white/60 hover:text-cadmium transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-cadmium mb-6">Account</h4>
            <ul className="space-y-3">
              {[
                { label: 'Profile', path: '/profile' },
                { label: 'Orders', path: '/profile?tab=orders' },
                { label: 'Wishlist', path: '/profile?tab=wishlist' },
                { label: 'Home Trial', path: '/trial-booking' },
                { label: 'Cart', path: '/cart' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm font-medium text-white/60 hover:text-cadmium transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-cadmium mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-cadmium mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-white/60">support@styleathome.in</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-cadmium mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-white/60">+91 (040) 274-8190</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-cadmium mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-white/60">Anurag University, Venkatapur, Hyderabad 500088</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-white/30">&copy; {new Date().getFullYear()} StyleAtHome. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-white/30">Privacy Policy</span>
            <span className="text-xs font-medium text-white/30">Terms of Service</span>
            <span className="text-xs font-medium text-white/30">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
