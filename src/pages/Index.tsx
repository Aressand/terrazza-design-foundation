import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import MobileContactActions from "@/components/MobileContactActions";
import HeroSection from "@/components/HeroSection";
import RoomsPreview from "@/components/RoomsPreview";
import CompetitiveAdvantages from "@/components/CompetitiveAdvantages";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <SEOHead
        title="Terrazza Santa Chiara B&B - Luxury Accommodation 30m from Basilica | Assisi"
        description="Exclusive B&B just 30 meters from Santa Chiara Basilica in Assisi. 4 unique rooms with private terraces, authentic stone walls, and modern comfort. Book direct and save."
        canonical="https://terrazzasantachiara.com/"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Terrazza Santa Chiara B&B - Luxury Accommodation in Assisi",
          "description": "Exclusive bed and breakfast accommodation just 30 meters from Santa Chiara Basilica in the heart of medieval Assisi",
          "url": "https://terrazzasantachiara.com/",
          "mainEntity": {
            "@type": "LodgingBusiness",
            "name": "Terrazza Santa Chiara B&B",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Via Sermei",
              "addressLocality": "Assisi",
              "addressRegion": "Umbria",
              "postalCode": "06081",
              "addressCountry": "IT"
            }
          }
        }}
      />
      <Header />
      <MobileContactActions />
      <main className="min-h-screen bg-background pb-20 md:pb-0"
            role="main"
            aria-label="Terrazza Santa Chiara B&B homepage">
        <HeroSection />
        
        {/* Rooms Preview */}
        <RoomsPreview />
        
        {/* Competitive Advantages */}
        <CompetitiveAdvantages />
        
        {/* Features Preview */}
        <section className="py-16 lg:py-24" aria-label="Property features">
          <div className="container-bnb">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-feature text-center hover-lift animate-slide-up touch-manipulation">
                <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="Panoramic view icon">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-heading text-xl mb-3">Panoramic Views</h3>
                <p className="text-body text-muted-foreground">
                  Breathtaking terrace views of Umbrian hills and medieval rooftops of historic Assisi
                </p>
              </div>

              <div className="card-feature text-center hover-lift animate-slide-up touch-manipulation" style={{animationDelay: '0.1s'}}>
                <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="Authentic comfort icon">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-heading text-xl mb-3">Authentic Comfort</h3>
                <p className="text-body text-muted-foreground">
                  Refined rooms with period furnishings and all modern comforts for the perfect stay
                </p>
              </div>

              <div className="card-feature text-center hover-lift animate-slide-up touch-manipulation" style={{animationDelay: '0.2s'}}>
                <div className="w-16 h-16 bg-stone rounded-full flex items-center justify-center mx-auto mb-4" role="img" aria-label="Central location icon">
                  <svg className="w-8 h-8 text-stone-dark" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-heading text-xl mb-3">Prime Location</h3>
                <p className="text-body text-muted-foreground">
                  In the heart of medieval Assisi, steps from Santa Chiara Basilica and local attractions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-natural" aria-label="Book your stay">
          <div className="container-narrow text-center">
            <h2 className="text-display text-3xl lg:text-4xl mb-6 text-foreground">
              Experience Authentic Assisi
            </h2>
            <p className="text-body text-lg mb-8 text-muted-foreground">
              Discover the charm of medieval Umbria in an intimate and refined setting
            </p>
            <Button 
              variant="terracotta" 
              size="lg" 
              className="text-lg min-h-[48px] touch-manipulation"
              aria-label="Check room availability and book your stay"
            >
              Check Availability
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;