import React from 'react';
import SearchWidget from './SearchWidget';
import heroBackground from '@/assets/assisi-hero-bg.jpg';

const HeroSection = () => {
  return (
    <section className="relative h-[80vh] lg:h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      
      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Headlines */}
          <div className="mb-12 animate-fade-in">
            <h1 className="font-playfair font-bold text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white leading-tight mb-6">
              Wake Up 30 Meters from
              <span className="block text-stone-light">Santa Chiara Basilica</span>
            </h1>
            
            <p className="font-inter text-lg md:text-xl lg:text-2xl text-stone-light/90 max-w-3xl mx-auto leading-relaxed mb-12">
              Where Authentic Umbrian Stone Meets Modern Luxury
            </p>
          </div>

          {/* Search Widget */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <SearchWidget />
          </div>

          {/* Additional Info */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terracotta rounded-full"></div>
                <span className="text-sm font-medium">Historic Center Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sage rounded-full"></div>
                <span className="text-sm font-medium">Panoramic Terrace Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-stone-light rounded-full"></div>
                <span className="text-sm font-medium">Authentic Italian Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;