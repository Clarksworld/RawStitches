'use client';

import { Link } from '../components/router-adapter';
import { Button } from '../components/ui';

export const SIZE_CHART = [
  { size: 'XS', uk: '6', us: '2', bustIn: '31–32', waistIn: '24–25', hipsIn: '34–35', bustCm: '78–82', waistCm: '60–64', hipsCm: '86–90' },
  { size: 'S', uk: '8–10', us: '4–6', bustIn: '33–34', waistIn: '26–27', hipsIn: '36–37', bustCm: '83–87', waistCm: '65–69', hipsCm: '91–95' },
  { size: 'M', uk: '12', us: '8', bustIn: '35–37', waistIn: '28–30', hipsIn: '38–40', bustCm: '88–94', waistCm: '70–76', hipsCm: '96–102' },
  { size: 'L', uk: '14', us: '10', bustIn: '38–40', waistIn: '31–33', hipsIn: '41–43', bustCm: '95–102', waistCm: '77–84', hipsCm: '103–110' },
  { size: 'XL', uk: '16', us: '12', bustIn: '41–43', waistIn: '34–36', hipsIn: '44–46', bustCm: '103–110', waistCm: '85–92', hipsCm: '111–118' },
  { size: 'XXL', uk: '18', us: '14', bustIn: '44–46', waistIn: '37–39', hipsIn: '47–49', bustCm: '111–118', waistCm: '93–100', hipsCm: '119–126' },
];

export default function SizeGuide() {
  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-black text-ivory py-16 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3 font-sans">Measurement Chart</p>
        <h1 className="font-serif text-4xl lg:text-5xl">Size Guide</h1>
        <p className="text-ivory/60 text-sm max-w-md mx-auto mt-3 font-sans">
          Find your perfect silhouette. Raw Stitches garments are tailored to flatter women of all shapes with precision.
        </p>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 lg:px-12 py-16 space-y-16">
        {/* Table */}
        <div className="bg-white border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-2xl text-charcoal">Standard Size Chart</h2>
              <p className="text-xs text-stone font-sans mt-0.5">Measurements shown in inches and centimeters</p>
            </div>
            <div className="text-xs text-stone font-sans bg-ivory px-3 py-1.5 border border-border">
              All dimensions refer to body measurements, not garment measurements.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans min-w-[700px]">
              <thead>
                <tr className="bg-ivory/60 border-b border-border text-left">
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-charcoal font-semibold">Raw Stitches</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">UK</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">US</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-charcoal font-medium">Bust (Inches)</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-charcoal font-medium">Waist (Inches)</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-charcoal font-medium">Hips (Inches)</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Bust (cm)</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Waist (cm)</th>
                  <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Hips (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="hover:bg-ivory/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-gold text-base">{row.size}</td>
                    <td className="px-4 py-3.5 text-stone font-mono">{row.uk}</td>
                    <td className="px-4 py-3.5 text-stone font-mono">{row.us}</td>
                    <td className="px-4 py-3.5 text-charcoal font-medium">{row.bustIn}″</td>
                    <td className="px-4 py-3.5 text-charcoal font-medium">{row.waistIn}″</td>
                    <td className="px-4 py-3.5 text-charcoal font-medium">{row.hipsIn}″</td>
                    <td className="px-4 py-3.5 text-stone text-xs">{row.bustCm}</td>
                    <td className="px-4 py-3.5 text-stone text-xs">{row.waistCm}</td>
                    <td className="px-4 py-3.5 text-stone text-xs">{row.hipsCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to measure */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white border border-border p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm font-mono">1</div>
            <h3 className="font-serif text-lg text-charcoal">Bust</h3>
            <p className="text-xs text-stone font-sans leading-relaxed">
              Measure around the fullest part of your chest, keeping the tape measure horizontal and snug under your arms.
            </p>
          </div>
          <div className="bg-white border border-border p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm font-mono">2</div>
            <h3 className="font-serif text-lg text-charcoal">Waist</h3>
            <p className="text-xs text-stone font-sans leading-relaxed">
              Measure around the narrowest part of your natural waistline, usually located just above your belly button.
            </p>
          </div>
          <div className="bg-white border border-border p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm font-mono">3</div>
            <h3 className="font-serif text-lg text-charcoal">Hips</h3>
            <p className="text-xs text-stone font-sans leading-relaxed">
              Stand with your feet together and measure around the fullest part of your hips and bottom.
            </p>
          </div>
        </div>

        {/* Custom Fit Assistance */}
        <div className="bg-charcoal text-ivory p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-gold text-xs uppercase tracking-widest font-sans">Need Bespoke Advice?</p>
            <h3 className="font-serif text-2xl lg:text-3xl">Between sizes or need custom fit?</h3>
            <p className="text-ivory/70 text-sm font-sans leading-relaxed">
              Our atelier in Uyo offers personalized fittings. Speak with our styling team on WhatsApp for sizing advice before ordering.
            </p>
          </div>
          <a
            href="https://wa.me/2348000000000?text=Hello%20Raw%20Stitches,%20I%20need%20help%20choosing%20my%20size"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="whitespace-nowrap">Chat on WhatsApp →</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
