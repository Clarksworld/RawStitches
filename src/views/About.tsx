'use client';

import { Link } from '../components/router-adapter';
import { Button } from '../components/ui';

export default function About() {
  return (
    <div className="bg-ivory">
      {/* Hero */}
      <div className="relative h-96 lg:h-[55vh] bg-charcoal overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&h=900&fit=crop&auto=format&q=80"
          alt="Raw Stitches atelier"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-gold text-xs uppercase tracking-widest mb-3 font-sans">The Brand</p>
          <h1 className="font-serif text-4xl lg:text-6xl text-ivory">Our Story</h1>
        </div>
      </div>

      {/* Our Story */}
      <section className="max-w-screen-lg mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Who We Are</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-6 leading-tight">
              Raw Stitches Nigeria Enterprise
            </h2>
            <div className="space-y-4 text-stone text-sm leading-relaxed font-sans prose-fashion">
              <p>Raw Stitches Nigeria Enterprise is a Nigerian fashion brand creating unique and beautiful clothing for women. Founded and based in Uyo, Akwa Ibom State, we design and produce clothing that celebrates the modern Nigerian woman — her strength, her elegance, and her individuality.</p>
              <p>Every piece we create is made with intention. We believe that clothing is a language, and that what a woman wears tells a story about who she is and where she is going.</p>
              <p>We are committed to producing fashion that is uniquely Nigerian — rooted in our heritage, crafted with care, and designed for women who stand out.</p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&auto=format&q=80"
              alt="Raw Stitches tailored fashion"
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute -bottom-5 -left-5 bg-gold p-5 hidden lg:block">
              <p className="font-serif text-2xl text-black leading-tight">Uyo,<br />Akwa Ibom</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-black py-20 lg:py-28">
        <div className="max-w-screen-lg mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-1">
              <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Our Philosophy</p>
              <h2 className="font-serif text-3xl text-ivory leading-tight">The Way We Think About Fashion</h2>
            </div>
            <div className="lg:col-span-2 space-y-8">
              {[
                { title: 'Craftsmanship First', body: 'We believe every stitch tells a story. Our clothing is produced with careful attention to construction, finish, and detail. Quality is not an afterthought — it is the foundation.' },
                { title: 'Designed for Real Women', body: 'We design clothing for women with full lives. Our pieces move with you, celebrate your form, and make you feel powerful from the moment you put them on.' },
                { title: 'Made in Nigeria', body: 'We are proudly Nigerian. Our designs draw from the richness of Nigerian aesthetics while speaking a contemporary, global fashion language.' },
              ].map(item => (
                <div key={item.title} className="border-l-2 border-gold pl-6">
                  <h3 className="font-serif text-xl text-ivory mb-2">{item.title}</h3>
                  <p className="text-ivory/60 text-sm leading-relaxed font-sans">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Made in Nigeria */}
      <section className="max-w-screen-lg mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=700&fit=crop&auto=format&q=80"
            alt="Fashion making in Nigeria"
            className="w-full aspect-[4/3] object-cover"
          />
          <div>
            <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Made in Nigeria</p>
            <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-6 leading-tight">
              Every Piece, Proudly Made Here
            </h2>
            <p className="text-stone text-sm leading-relaxed font-sans mb-6">
              All Raw Stitches clothing is designed and produced in Nigeria. We believe in the quality of Nigerian craft and the talent of Nigerian artisans. When you wear Raw Stitches, you wear something made with Nigerian hands, for Nigerian women — and women everywhere who appreciate elegance.
            </p>
            <p className="text-stone text-sm leading-relaxed font-sans">
              Our studio is located at No. 62 Enwe Street, Uyo, Akwa Ibom State, where each piece comes to life.
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="bg-ivory-dark py-16 lg:py-24">
        <div className="max-w-screen-lg mx-auto px-6 lg:px-12 text-center max-w-2xl mx-auto">
          <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Our Approach</p>
          <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-6">
            We Create Fashion That Endures
          </h2>
          <p className="text-stone text-base leading-relaxed font-sans mb-8">
            We resist fast fashion. Every piece we release is designed to be worn again and again — to be a wardrobe staple rather than a trend. We focus on thoughtful design, beautiful fabric, and careful construction that stands the test of time.
          </p>
          <Link to="/shop">
            <Button size="lg">Shop the Collection</Button>
          </Link>
        </div>
      </section>

      {/* Location */}
      <section className="bg-black py-16">
        <div className="max-w-screen-lg mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Find Us</p>
              <h2 className="font-serif text-2xl text-ivory mb-4">Visit Our Studio</h2>
              <div className="text-ivory/60 text-sm font-sans space-y-1.5">
                <p className="text-ivory font-medium">Raw Stitches Nigeria Enterprise</p>
                <p>No. 62 Enwe Street</p>
                <p>Uyo, Akwa Ibom State, Nigeria</p>
                <a href="tel:08036895862" className="block text-gold hover:underline mt-3">0803 689 5862</a>
                <a href="https://wa.me/2348036895862" className="block text-gold hover:underline">WhatsApp: +234 803 689 5862</a>
              </div>
              <div className="mt-6">
                <Link to="/contact"><Button variant="ghost" className="border-white/20 text-ivory hover:border-gold hover:text-gold">Get in Touch</Button></Link>
              </div>
            </div>
            <div className="bg-charcoal h-60 lg:h-72 flex items-center justify-center">
              <p className="text-stone/40 text-sm font-sans">Map placeholder</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
