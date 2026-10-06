'use client';

import React from 'react';

interface StudioMapProps {
  className?: string;
  heightClass?: string;
  showOverlay?: boolean;
  title?: string;
  subtitle?: string;
}

export default function StudioMap({
  className = '',
  heightClass = 'h-72',
  showOverlay = true,
  title = 'Raw Stitches Atelier & Studio',
  subtitle = 'No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria',
}: StudioMapProps) {
  const mapEmbedUrl =
    'https://www.openstreetmap.org/export/embed.html?bbox=7.9240%2C5.0210%2C7.9410%2C5.0340&layer=mapnik&marker=5.027517%2C7.932936';

  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=62+Enwe+Street,+Uyo,+Akwa+Ibom+State,+Nigeria';

  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=62+Enwe+Street,+Uyo,+Akwa+Ibom+State,+Nigeria';

  return (
    <div className={`relative overflow-hidden border border-border bg-charcoal shadow-sm ${className}`}>
      {/* Map iframe */}
      <iframe
        title="Raw Stitches Studio Location - No. 62 Enwe Street, Uyo"
        src={mapEmbedUrl}
        className={`w-full ${heightClass} border-0`}
        loading="lazy"
        allowFullScreen
      />

      {/* Info card overlay / footer */}
      {showOverlay && (
        <div className="bg-black/90 backdrop-blur-sm text-ivory p-4 border-t border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <p className="font-serif text-sm text-ivory font-medium tracking-wide">{title}</p>
            </div>
            <p className="text-xs text-ivory/70 font-sans">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold text-black hover:bg-gold-dark text-xs font-sans font-medium px-3.5 py-1.5 transition-colors inline-flex items-center gap-1.5"
            >
              <span>🧭</span> Get Directions
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ivory/20 hover:border-gold hover:text-gold text-ivory/80 text-xs font-sans px-3 py-1.5 transition-colors inline-flex items-center gap-1"
            >
              Google Maps ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
