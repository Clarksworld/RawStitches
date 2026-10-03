'use client';

import { Link } from '../components/router-adapter';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-ivory flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-serif text-[8rem] text-charcoal/10 leading-none select-none">404</p>
        <h1 className="font-serif text-3xl text-charcoal mb-3 -mt-8">Page Not Found</h1>
        <p className="text-stone text-sm font-sans mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist. It may have been moved or removed.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/"><Button variant="secondary">Go Home</Button></Link>
          <Link to="/shop"><Button variant="ghost">Shop Collection</Button></Link>
        </div>
      </div>
    </div>
  );
}
