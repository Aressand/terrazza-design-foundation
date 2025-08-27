import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import MobileContactActions from "@/components/MobileContactActions";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Heart, Phone, MapPin, Mail, Users } from "lucide-react";

// Placeholder image - you would replace with actual owner/property image
import assisiHeroBg from "@/assets/assisi-hero-bg.jpg";

const About = () => {
  const policies = [
    {
      icon: Clock,
      title: "Check-in Times",
      details: "3:00 PM - 8:00 PM (Late arrival €20)"
    },
    {
      icon: Shield,
      title: "Cancellation",
      details: "Free cancellation up to 48 hours before arrival"
    },
    {
      icon: Heart,
      title: "Pet Policy", 
      details: "Small pets welcome (€20/night additional fee)"
    },
    {
      icon: Users,
      title: "Languages",
      details: "English, Italian, basic French & German"
    }
  ];

  const services = [
    "Personal concierge assistance",
    "Restaurant reservations",
    "Local tour booking",
    "Transportation arrangements",
    "Spiritual site guidance",
    "Hidden gems recommendations"
  ];

  return (
    <>
      <SEOHead
        title="About Terrazza Santa Chiara - Our Story & Services"
        description="Discover the story behind Terrazza Santa Chiara B&B, our policies, services, and what makes our location 30m from Santa Chiara Basilica so special."
        canonical="https://terrazzasantachiara.com/about"
      />
      <Header />
      <MobileContactActions />
      <main className="min-h-screen bg-background pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <img 
            src={assisiHeroBg} 
            alt="Terrazza Santa Chiara Property" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone/50" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-4xl lg:text-6xl font-playfair mb-6">Welcome to Terrazza Santa Chiara</h1>
            <p className="text-xl lg:text-2xl max-w-3xl">
              Where History Meets Hospitality in the Heart of Assisi
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 lg:py-24">
          <div className="container-bnb">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-playfair text-sage mb-6">
                  Our Story
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Terrazza Santa Chiara was born from our deep love for Assisi's spiritual energy and architectural beauty. After years of traveling the world, we discovered this extraordinary property - the only accommodation just 30 meters from Santa Chiara Basilica.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We've carefully restored each room to honor its medieval heritage while adding the modern luxuries today's travelers deserve. Our mission is simple: help you experience authentic Assisi like a local, not a tourist.
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="bg-sage-light/20 border-sage/30">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-8 h-8 text-sage mx-auto mb-3" />
                    <h3 className="font-semibold text-lg text-sage mb-2">Prime Location</h3>
                    <p className="text-muted-foreground">
                      Only 30 meters from Santa Chiara Basilica - the closest accommodation to this sacred site
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-terracotta-light/20 border-terracotta/30">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-8 h-8 text-terracotta mx-auto mb-3" />
                    <h3 className="font-semibold text-lg text-terracotta mb-2">Authentic Experience</h3>
                    <p className="text-muted-foreground">
                      Medieval architecture meets modern comfort in every carefully restored room
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Policies & Services */}
        <section className="py-16 lg:py-24 bg-stone-light/30">
          <div className="container-bnb">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-playfair text-sage mb-4">
                Policies & Services
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know for a comfortable and memorable stay
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {policies.map((policy, index) => (
                <Card key={index} className="text-center hover-lift">
                  <CardContent className="p-6">
                    <policy.icon className="w-8 h-8 text-sage mx-auto mb-4" />
                    <h3 className="font-semibold text-lg text-sage mb-2">{policy.title}</h3>
                    <p className="text-sm text-muted-foreground">{policy.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services List */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-playfair text-sage text-center mb-8">
                Complimentary Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-soft">
                    <div className="w-2 h-2 bg-sage rounded-full shrink-0" />
                    <span className="text-muted-foreground">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Times */}
            <div className="mt-12 text-center">
              <Card className="max-w-2xl mx-auto bg-white border-sage/20">
                <CardContent className="p-8">
                  <Clock className="w-12 h-12 text-sage mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-sage mb-4">Check-in & Check-out</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Check-in:</strong> 3:00 PM - 8:00 PM</p>
                    <p><strong>Check-out:</strong> 11:00 AM</p>
                    <p className="text-sm mt-4 pt-4 border-t border-border">
                      Late arrival (after 8:00 PM): €20 surcharge<br/>
                      Late checkout available upon request
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;