import { useState, useEffect, useRef, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { useStore } from '../store';

// ─── Button ────────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type BtnSize = 'sm' | 'md' | 'lg';

const btnBase = 'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-gold text-black hover:bg-gold-dark active:scale-[0.98]',
  secondary: 'bg-black text-ivory border border-black hover:bg-charcoal active:scale-[0.98]',
  ghost: 'bg-transparent text-charcoal border border-border hover:border-gold hover:text-gold active:scale-[0.98]',
  danger: 'bg-error text-white hover:opacity-90 active:scale-[0.98]',
  success: 'bg-success text-white hover:opacity-90 active:scale-[0.98]',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...rest }: BtnProps) {
  return (
    <button
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Spinner size="sm" color={variant === 'primary' ? 'black' : 'gold'} />}
      {children}
    </button>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'gold' }: { size?: 'sm' | 'md' | 'lg'; color?: 'gold' | 'black' | 'white' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const cl = color === 'gold' ? 'border-gold' : color === 'black' ? 'border-black' : 'border-white';
  return <div className={`${sz} border-2 ${cl} border-t-transparent rounded-full animate-spin`} />;
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'new' | 'sale' | 'bestseller' | 'outofstock' | 'lowstock' | 'paid' | 'pending' | 'failed' | 'refunded' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'active' | 'draft' | 'scheduled' | 'published' | 'success' | 'error' | 'warning' | 'info';

const badgeMap: Record<BadgeVariant, string> = {
  new: 'bg-black text-gold',
  sale: 'bg-gold text-black',
  bestseller: 'bg-charcoal text-ivory',
  outofstock: 'bg-stone text-white',
  lowstock: 'bg-warning text-white',
  paid: 'bg-success/15 text-success border border-success/30',
  pending: 'bg-warning/15 text-warning border border-warning/30',
  failed: 'bg-error/15 text-error border border-error/30',
  refunded: 'bg-info/15 text-info border border-info/30',
  processing: 'bg-gold/15 text-gold-dark border border-gold/30',
  shipped: 'bg-info/15 text-info border border-info/30',
  delivered: 'bg-success/15 text-success border border-success/30',
  cancelled: 'bg-stone/15 text-stone border border-stone/30',
  active: 'bg-success/15 text-success border border-success/30',
  draft: 'bg-stone/15 text-stone border border-stone/30',
  scheduled: 'bg-info/15 text-info border border-info/30',
  published: 'bg-success/15 text-success border border-success/30',
  success: 'bg-success/15 text-success border border-success/30',
  error: 'bg-error/15 text-error border border-error/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  info: 'bg-info/15 text-info border border-info/30',
};

export function Badge({ variant, className = '', children }: { variant: BadgeVariant; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium font-sans uppercase tracking-wider rounded-sm ${badgeMap[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', ...rest }: InputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-charcoal uppercase tracking-widest">{label}</span>}
      <input
        className={`w-full px-4 py-3 text-sm bg-white border ${error ? 'border-error' : 'border-border'} focus:border-gold focus:outline-none transition-colors placeholder:text-stone/60 font-sans ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-error">{error}</span>}
      {hint && !error && <span className="text-xs text-stone">{hint}</span>}
    </label>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...rest }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-charcoal uppercase tracking-widest">{label}</span>}
      <select
        className={`w-full px-4 py-3 text-sm bg-white border ${error ? 'border-error' : 'border-border'} focus:border-gold focus:outline-none transition-colors font-sans appearance-none ${className}`}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="text-xs text-error">{error}</span>}
    </label>
  );
}

// ─── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...rest }: TextareaProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-charcoal uppercase tracking-widest">{label}</span>}
      <textarea
        className={`w-full px-4 py-3 text-sm bg-white border ${error ? 'border-error' : 'border-border'} focus:border-gold focus:outline-none transition-colors placeholder:text-stone/60 font-sans resize-none ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </label>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative bg-ivory w-full ${widths[size]} max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-serif text-lg text-charcoal">{title}</h3>
            <button onClick={onClose} className="text-stone hover:text-charcoal p-1 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Drawer ────────────────────────────────────────────────────────────────────
export function Drawer({ open, onClose, title, children, side = 'right' }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; side?: 'left' | 'right' }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute ${side === 'right' ? 'right-0 top-0 bottom-0' : 'left-0 top-0 bottom-0'} w-full max-w-md bg-ivory shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'} flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <h3 className="font-serif text-lg text-charcoal">{title}</h3>
            <button onClick={onClose} className="text-stone hover:text-charcoal p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Accordion ─────────────────────────────────────────────────────────────────
export function Accordion({ items }: { items: { title: string; content: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between py-4 text-left font-sans text-sm font-medium text-charcoal hover:text-gold transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.title}
            <svg className={`w-4 h-4 text-stone transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {open === i && <div className="pb-4 text-sm text-stone leading-relaxed">{item.content}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex border-b border-border gap-1">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-3 text-xs font-medium uppercase tracking-widest transition-all duration-150 border-b-2 -mb-px font-sans ${active === tab ? 'border-gold text-gold' : 'border-transparent text-stone hover:text-charcoal'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
export function ToastContainer() {
  const { state, dispatch } = useStore();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {state.toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 shadow-xl pointer-events-auto max-w-sm text-sm font-sans animate-fade-in ${t.type === 'success' ? 'bg-black text-ivory' : t.type === 'error' ? 'bg-error text-white' : 'bg-charcoal text-ivory'}`}
        >
          {t.type === 'success' && <span className="text-gold">✓</span>}
          {t.type === 'error' && <span>✕</span>}
          {t.message}
          <button onClick={() => dispatch({ type: 'REMOVE_TOAST', id: t.id })} className="ml-auto opacity-60 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-ivory-dark animate-pulse ${className}`} />;
}

// ─── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && <div className="mb-6 text-stone/40">{icon}</div>}
      <h3 className="font-serif text-xl text-charcoal mb-2">{title}</h3>
      {description && <p className="text-sm text-stone max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-1 font-sans">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="w-8 h-8 flex items-center justify-center border border-border disabled:opacity-30 hover:border-gold text-sm transition-colors">‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center border text-xs transition-colors ${p === page ? 'border-gold bg-gold text-black' : 'border-border hover:border-gold'}`}
        >
          {p}
        </button>
      ))}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="w-8 h-8 flex items-center justify-center border border-border disabled:opacity-30 hover:border-gold text-sm transition-colors">›</button>
    </div>
  );
}

// ─── ConfirmDialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'danger' }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'warning';
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${variant === 'danger' ? 'bg-error/10' : 'bg-warning/10'}`}>
          <svg className={`w-6 h-6 ${variant === 'danger' ? 'text-error' : 'text-warning'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        </div>
        <h3 className="font-serif text-lg text-charcoal mb-2">{title}</h3>
        <p className="text-sm text-stone mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${checked ? 'bg-gold' : 'bg-border'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      {label && <span className="text-sm text-charcoal">{label}</span>}
    </label>
  );
}

// ─── StarRating ────────────────────────────────────────────────────────────────
export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(n => (
          <svg key={n} className={`w-4 h-4 ${n <= Math.round(rating) ? 'text-gold fill-gold' : 'text-border fill-border'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-stone">({count} reviews)</span>}
    </div>
  );
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-stone font-sans">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-border">›</span>}
          {item.href ? <a href={item.href} className="hover:text-gold transition-colors">{item.label}</a> : <span className={i === items.length - 1 ? 'text-charcoal' : ''}>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

// ─── SearchInput ───────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border focus:border-gold focus:outline-none transition-colors font-sans"
      />
    </div>
  );
}

// ─── StatsCard ─────────────────────────────────────────────────────────────────
export function StatsCard({ label, value, sub, icon, trend }: { label: string; value: string; sub?: string; icon?: ReactNode; trend?: { value: string; up: boolean } }) {
  return (
    <div className="bg-white border border-border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-stone">{label}</span>
        {icon && <span className="text-stone/40">{icon}</span>}
      </div>
      <div>
        <div className="font-serif text-2xl text-charcoal">{value}</div>
        {sub && <div className="text-xs text-stone mt-1">{sub}</div>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.up ? 'text-success' : 'text-error'}`}>
          <span>{trend.up ? '↑' : '↓'}</span>
          {trend.value}
        </div>
      )}
    </div>
  );
}

// ─── useClickOutside ───────────────────────────────────────────────────────────
export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
