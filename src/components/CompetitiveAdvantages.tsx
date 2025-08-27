import { Building, Home, Sunrise, Sparkles, Camera, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Building,
    title: "Unique Location",
    subtitle: "30 Meters from Santa Chiara",
    description: "Walk to prayer in under 1 minute"
  },
  {
    icon: Home,
    title: "Authentic Architecture", 
    subtitle: "Original Subasio Pink Stone",
    description: "Live inside Assisi's medieval history"
  },
  {
    icon: Sunrise,
    title: "Private Outdoor Spaces",
    subtitle: "Exclusive Gardens & Terraces", 
    description: "Your private sanctuary in city center"
  },
  {
    icon: Sparkles,
    title: "Modern Renovation",
    subtitle: "Historical Charm + Today's Comfort",
    description: "A/C, WiFi, luxury amenities"
  },
  {
    icon: Camera,
    title: "Instagram-Worthy Views",
    subtitle: "Panoramic Valley Vistas",
    description: "Sunrise & sunset from your room"
  },
  {
    icon: Heart,
    title: "Spiritual Experience", 
    subtitle: "Gateway to Franciscan Assisi",
    description: "Perfect for meaningful travel"
  }
];

const CompetitiveAdvantages = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container-bnb">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl lg:text-4xl mb-4 text-foreground">
            Why Choose Terrazza Santa Chiara
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience Assisi like never before in our authentic medieval setting with modern luxury
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group hover-lift animate-slide-up bg-cream/50 border-border/30 hover:border-sage/40 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-sage/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-sage" />
                  </div>
                  <h3 className="text-heading text-lg mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sage font-medium text-sm mb-2">
                    {feature.subtitle}
                  </p>
                  <p className="text-body text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Signals Section */}
        <div className="bg-sage/5 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Rating */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className="w-5 h-5 text-terracotta fill-current" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-heading font-semibold text-lg text-foreground">
                4.9/5 stars
              </p>
              <p className="text-body text-sm text-muted-foreground">
                from 127+ guests
              </p>
            </div>

            {/* Testimonial */}
            <div className="text-center">
              <blockquote className="text-body text-foreground/90 italic text-lg leading-relaxed mb-3">
                "The most authentic Assisi experience! Garden room was magical."
              </blockquote>
              <cite className="text-sage font-medium text-sm">
                - Jennifer M., Boston
              </cite>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col items-center lg:items-end space-y-3">
              <div className="flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-sage fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sage text-sm font-medium">Recommended by Assisi Tourism</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-sage fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sage text-sm font-medium">Secure Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveAdvantages;