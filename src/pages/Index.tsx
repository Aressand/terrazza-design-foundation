import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RoomsPreview from "@/components/RoomsPreview";
import CompetitiveAdvantages from "@/components/CompetitiveAdvantages";

const Index = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <HeroSection />
        
        {/* Rooms Preview */}
        <RoomsPreview />
        
        {/* Competitive Advantages */}
        <CompetitiveAdvantages />
        
        {/* Features Preview */}
        <section className="py-16 lg:py-24">
          <div className="container-bnb">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card-feature text-center hover-lift animate-slide-up">
                <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-heading text-xl mb-3">Vista panoramica</h3>
                <p className="text-body text-muted-foreground">
                  Terrazza con vista mozzafiato sulle colline toscane e sui tetti del centro storico
                </p>
              </div>

              <div className="card-feature text-center hover-lift animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-heading text-xl mb-3">Comfort autentico</h3>
                <p className="text-body text-muted-foreground">
                  Camere raffinate con arredi d'epoca e tutti i comfort moderni per un soggiorno perfetto
                </p>
              </div>

              <div className="card-feature text-center hover-lift animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="w-16 h-16 bg-stone rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-stone-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-heading text-xl mb-3">Posizione centrale</h3>
                <p className="text-body text-muted-foreground">
                  Nel cuore del centro storico, a pochi passi da monumenti, ristoranti e boutique locali
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-natural">
          <div className="container-narrow text-center">
            <h2 className="text-display text-3xl lg:text-4xl mb-6 text-foreground">
              Vivi un'esperienza autentica
            </h2>
            <p className="text-body text-lg mb-8 text-muted-foreground">
              Lasciati conquistare dal fascino della Toscana in un ambiente intimo e raffinato
            </p>
            <Button variant="terracotta" size="lg" className="text-lg">
              Richiedi disponibilità
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;