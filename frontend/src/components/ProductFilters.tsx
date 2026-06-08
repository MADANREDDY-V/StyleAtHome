import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Category } from '../types';

interface FiltersState {
  section?: string | null;
  search?: string | null;
  brand?: string | null;
  categoryId?: string | null;
  color?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  minRating?: string | null;
}

interface ProductFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  brands: string[];
  categories: Category[];
}

export default function ProductFilters({ filters, onChange, brands = [], categories = [] }: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const update = (key: keyof FiltersState, value: string | null) => onChange({ ...filters, [key]: value });

  const FilterContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="font-black text-foreground uppercase tracking-widest text-sm flex items-center gap-2">
          <Filter size={16} className="text-primary" /> Curate
        </h3>
        <button
          onClick={() => onChange({})}
          className="text-xs text-primary font-bold hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</label>
          <div className="relative">
            <select
              value={filters.categoryId || ''}
              onChange={(e) => update('categoryId', e.target.value || null)}
              className="w-full appearance-none bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold text-foreground cursor-pointer transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Brand</label>
          <div className="relative">
            <select
              value={filters.brand || ''}
              onChange={(e) => update('brand', e.target.value || null)}
              className="w-full appearance-none bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold text-foreground cursor-pointer transition-colors"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Color Spectrum</label>
          <div className="flex flex-wrap gap-2">
            {['Black', 'White', 'Blue', 'Red', 'Green', 'Grey', 'Navy', 'Pink'].map((c) => {
               const isActive = filters.color === c;
               return (
                 <button
                   key={c}
                   onClick={() => update('color', isActive ? null : c)}
                   className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                     isActive ? 'bg-primary text-white shadow-md' : 'bg-muted/30 text-foreground hover:bg-muted/50'
                   }`}
                 >
                   {c}
                 </button>
               )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Price Point</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={filters.minPrice || ''}
              onChange={(e) => update('minPrice', e.target.value || null)}
              className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold placeholder:text-muted-foreground/50 transition-colors outline-none"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={filters.maxPrice || ''}
              onChange={(e) => update('maxPrice', e.target.value || null)}
              className="w-full bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold placeholder:text-muted-foreground/50 transition-colors outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Client Rating</label>
          <div className="relative">
            <select
              value={filters.minRating || ''}
              onChange={(e) => update('minRating', e.target.value || null)}
              className="w-full appearance-none bg-muted/20 border-2 border-transparent focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold text-foreground cursor-pointer transition-colors"
            >
              <option value="">Any Rating</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-transform"
        >
          <Filter size={18} /> Show Filters
        </button>
      </div>

      {/* Mobile Off-Canvas Modal */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bean/60 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-background z-[120] p-6 overflow-y-auto md:hidden border-r border-border shadow-2xl"
            >
              <div className="flex justify-end mb-4">
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full bg-muted/30">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar */}
      <div className="hidden md:block sticky top-32 bento-card border border-border/50 shadow-sm p-8">
        <FilterContent />
      </div>
    </>
  );
}
