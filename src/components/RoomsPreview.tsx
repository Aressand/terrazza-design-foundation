import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import gardenRoomImg from "@/assets/garden-room.jpg";
import terraceApartmentImg from "@/assets/terrace-apartment.jpg";
import modernApartmentImg from "@/assets/modern-apartment.jpg";
import stoneVaultImg from "@/assets/stone-vault.jpg";

const rooms = [
  {
    id: 1,
    title: "Garden Room Sanctuary",
    capacity: "Perfect for 2 guests", 
    description: "Private rooftop garden • Sunrise breakfast terrace • 30m from Basilica",
    image: gardenRoomImg,
    alt: "Garden Room with rooftop terrace and sunrise view"
  },
  {
    id: 2,
    title: "Panoramic Terrace Apartment",
    capacity: "Romantic escape for 2",
    description: "Breathtaking valley views • Sunset terrace • Independent entrance", 
    image: terraceApartmentImg,
    alt: "Panoramic terrace with Umbrian valley sunset views"
  },
  {
    id: 3,
    title: "Contemporary Luxury Apartment",
    capacity: "Spacious for up to 4",
    description: "Recently renovated • Emotional lighting • Modern amenities",
    image: modernApartmentImg,
    alt: "Modern luxury apartment interior with contemporary design"
  },
  {
    id: 4,
    title: "Historic Stone Vault Apartment", 
    capacity: "Authentic experience for 4",
    description: "Original 13th century vaults • Subasio pink stone • Medieval charm",
    image: stoneVaultImg,
    alt: "Historic stone vault apartment with medieval architecture"
  }
];

const RoomsPreview = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container-bnb">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl lg:text-4xl mb-4 text-foreground">
            Our Unique Accommodations
          </h2>
          <p className="text-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Each room tells a story of authentic Umbrian heritage, combining historic charm with modern comfort
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room, index) => (
            <Card 
              key={room.id}
              className="group overflow-hidden hover-lift animate-slide-up bg-card border-border/50 hover:border-sage/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={room.image}
                  alt={room.alt}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="text-heading text-sage text-xl mb-1">
                  {room.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  {room.capacity}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-body text-foreground/80 mb-6 leading-relaxed">
                  {room.description}
                </CardDescription>
                
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-sage group-hover:text-sage transition-colors duration-300"
                  aria-label={`Discover ${room.title} details and availability`}
                  asChild
                >
                  <Link to={
                    room.id === 1 ? "/rooms/garden-room" :
                    room.id === 2 ? "/rooms/terrace-apartment" :
                    room.id === 3 ? "/rooms/modern-apartment" :
                    "/rooms/stone-vault-apartment"
                  }>
                    Discover This Room
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomsPreview;