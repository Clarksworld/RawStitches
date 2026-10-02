import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCart, useStore } from '../store';
import { formatPrice } from '../data';
import { Button, Input, Select } from '../components/ui';
import logo from '../assets/raw-stitches-logo.png';

const STEPS = ['Information', 'Delivery', 'Payment'];
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Debit / Credit Card', sub: 'Visa, Mastercard, Verve — via Paystack' },
  { id: 'bank', label: 'Bank Transfer', sub: 'Pay directly to our bank account' },
  { id: 'ussd', label: 'USSD', sub: 'Use your mobile banking code' },
];

export default function Checkout() {
  const { items, total, dispatch: cartDispatch } = useCart();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  const delivery = total >= 50000 ? 0 : 3500;
  const grandTotal = total + delivery;

  const [form, setForm] = useState({
    name: state.checkoutContact?.name ?? '', email: state.checkoutContact?.email ?? '',
    phone: state.checkoutContact?.phone ?? '', whatsapp: state.checkoutContact?.whatsapp ?? '',
    country: 'Nigeria', state: '', city: '', address: '', note: '',
    deliveryType: 'home',
    payment: 'card',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validateStep0() {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone) e.phone = 'Required';
    return e;
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (form.deliveryType === 'home') {
      if (!form.state) e.state = 'Required';
      if (!form.city) e.city = 'Required';
      if (!form.address) e.address = 'Required';
    }
    return e;
  }

  function next() {
    const e = step === 0 ? validateStep0() : step === 1 ? validateStep1() : {};
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
  }

  async function placeOrder() {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    const orderNum = `RS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    dispatch({ type: 'SET_CHECKOUT_CONTACT', contact: { name: form.name, email: form.email, phone: form.phone, whatsapp: form.whatsapp } });
    cartDispatch({ type: 'CLEAR_CART' });
    navigate(`/confirmation/${orderNum}`);
  }

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-error mt-1 font-sans">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Minimal header */}
      <header className="border-b border-border bg-ivory px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="Raw Stitches" className="h-8" />
        </Link>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-border text-xs">›</span>}
              <span className={`text-xs font-sans uppercase tracking-widest ${i === step ? 'text-gold font-medium' : i < step ? 'text-success' : 'text-stone'}`}>
                {i < step ? '✓ ' : ''}{s}
              </span>
            </span>
          ))}
        </div>
      </header>

      <div className="max-w-screen-lg mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          {/* Form */}
          <div>
            {/* Step 0 — Customer Info */}
            {step === 0 && (
              <div>
                <div className="bg-white border border-border p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-charcoal">Continue as a guest</p>
                    <p className="text-xs text-stone mt-1">No account required. You can create one after your order.</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    dispatch({ type: 'SET_CHECKOUT_CONTACT', contact: { name: form.name, email: form.email, phone: form.phone, whatsapp: form.whatsapp } });
                    navigate('/sign-in?returnTo=%2Fcheckout');
                  }}>Sign in (optional)</Button>
                </div>
                <h2 className="font-serif text-2xl text-charcoal mb-6">Customer Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" error={errors.name} />
                  </div>
                  <div>
                    <Input label="Email Address" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" error={errors.email} />
                  </div>
                  <div>
                    <Input label="Phone Number" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="080XXXXXXXX" error={errors.phone} />
                  </div>
                  <div>
                    <Input label="WhatsApp Number (optional)" type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+234XXXXXXXXXX" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Delivery */}
            {step === 1 && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-6">Delivery</h2>
                {/* Delivery type */}
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {[{ id: 'home', label: 'Home Delivery', sub: 'Delivered to your address' }, { id: 'pickup', label: 'Store Pickup', sub: 'No. 62 Enwe Street, Uyo' }].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => set('deliveryType', opt.id)}
                      className={`border p-4 text-left transition-colors ${form.deliveryType === opt.id ? 'border-gold bg-gold/5' : 'border-border hover:border-stone'}`}
                    >
                      <p className="font-sans font-medium text-sm text-charcoal">{opt.label}</p>
                      <p className="font-sans text-xs text-stone mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
                {form.deliveryType === 'home' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Input label="Country" value={form.country} onChange={e => set('country', e.target.value)} disabled />
                    </div>
                    <div>
                      <Select label="State" value={form.state} onChange={e => set('state', e.target.value)} error={errors.state}
                        options={[{ value: '', label: 'Select state...' }, ...NIGERIAN_STATES.map(s => ({ value: s, label: s }))]} />
                    </div>
                    <div>
                      <Input label="City / Town" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" error={errors.city} />
                    </div>
                    <div className="sm:col-span-2">
                      <Input label="Delivery Address" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, area, landmarks..." error={errors.address} />
                    </div>
                    <div className="sm:col-span-2">
                      <Input label="Delivery Note (optional)" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any special instructions..." />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 — Payment */}
            {step === 2 && (
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-6">Payment</h2>
                <div className="space-y-3 mb-8">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => set('payment', m.id)}
                      className={`w-full border p-4 text-left transition-colors flex items-center gap-4 ${form.payment === m.id ? 'border-gold bg-gold/5' : 'border-border hover:border-stone'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${form.payment === m.id ? 'border-gold' : 'border-stone'}`}>
                        {form.payment === m.id && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <div>
                        <p className="font-sans font-medium text-sm text-charcoal">{m.label}</p>
                        <p className="font-sans text-xs text-stone">{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="bg-ivory-dark border border-border p-4 text-xs text-stone font-sans leading-relaxed">
                  🔒 Your payment is processed securely. Raw Stitches Nigeria does not store your card details. All transactions are processed through certified payment providers.
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>}
              {step < 2 ? (
                <Button size="lg" onClick={next} className="flex-1 sm:flex-none sm:min-w-48">Continue →</Button>
              ) : (
                <Button size="lg" loading={processing} onClick={placeOrder} className="flex-1 sm:flex-none sm:min-w-48">
                  {processing ? 'Processing Payment...' : `Pay ${formatPrice(grandTotal)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary — Desktop */}
          <div className="lg:block">
            {/* Mobile toggle */}
            <button
              onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
              className="lg:hidden w-full flex items-center justify-between bg-black text-ivory px-4 py-3 mb-4 text-sm font-sans"
            >
              <span>{orderSummaryOpen ? 'Hide' : 'Show'} order summary</span>
              <span className="text-gold font-medium">{formatPrice(grandTotal)}</span>
            </button>

            <div className={`${orderSummaryOpen ? 'block' : 'hidden'} lg:block bg-white border border-border p-5`}>
              <h3 className="font-serif text-lg text-charcoal mb-4">Order Summary</h3>
              <div className="space-y-3 border-b border-border pb-4 mb-4">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-16 object-cover bg-ivory-dark" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-stone text-white text-[10px] rounded-full flex items-center justify-center">{item.qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans text-charcoal leading-snug">{item.product.name}</p>
                      <p className="text-[10px] text-stone font-sans">{item.color} / {item.size}</p>
                    </div>
                    <p className="text-xs font-sans font-medium text-charcoal shrink-0">{formatPrice((item.product.salePrice ?? item.product.price) * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm font-sans border-b border-border pb-3 mb-3">
                <div className="flex justify-between text-stone">
                  <span>Subtotal</span><span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Delivery</span><span className={delivery === 0 ? 'text-success' : ''}>{delivery === 0 ? 'Free' : formatPrice(delivery)}</span>
                </div>
              </div>
              <div className="flex justify-between font-serif text-lg text-charcoal">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
