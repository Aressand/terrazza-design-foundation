import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

// Import images
import gardenRoomHero from "@/assets/garden-room.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

const GardenRoom = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  const galleryImages = [
    { src: gardenRoomHero, alt: "Private rooftop garden" },
    { src: gardenRoomInterior, alt: "Garden room interior" },
    { src: gardenRoomBathroom, alt: "Luxury bathroom" },
    { src: gardenRoomView, alt: "Panoramic view from room" },
    { src: gardenRoomDetails, alt: "Room amenities details" },
    { src: gardenRoomHero, alt: "Evening garden ambiance" }
  ];

  const amenities = [
    "Wake up to church bells (30m from Basilica)",
    "Cool summers guaranteed (A/C + heating)",  
    "Lightning-fast WiFi for sharing memories",
    "Freshly laundered luxury linens",
    "Private garden oasis in city center",
    "Coffee & tea making facilities"
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <img 
            src={gardenRoomHero} 
            alt="Garden Room Sanctuary" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-playfair mb-4">Garden Room Sanctuary</h1>
            <p className="text-xl lg:text-2xl">Perfect for 2 guests</p>
          </div>
          
          {/* Back Navigation */}
          <Link 
            to="/" 
            className="absolute top-8 left-8 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </section>

        {/* Image Gallery */}
        <section className="py-12 lg:py-16">
          <div className="container-bnb">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Image */}
              <div className="lg:col-span-8">
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-soft">
                  <img 
                    src={galleryImages[selectedImage].src} 
                    alt={galleryImages[selectedImage].alt}
                    className="w-full h-full object-cover hover-scale cursor-pointer"
                  />
                </div>
              </div>
              
              {/* Thumbnail Grid */}
              <div className="lg:col-span-4">
                <div className="grid grid-cols-2 gap-4">
                  {galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden shadow-soft transition-all ${
                        selectedImage === index ? 'ring-2 ring-sage' : 'hover:opacity-80'
                      }`}
                    >
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Room Description */}
        <section className="py-12 lg:py-16">
          <div className="container-bnb">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-playfair text-sage mb-4">
                      Your Private Rooftop Garden Sanctuary
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Perfect for couples seeking authentic Assisi romance
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Step into your private sanctuary above medieval Assisi's rooftops. As dawn breaks over the Subasio mountains, enjoy morning espresso surrounded by aromatic herbs in your exclusive rooftop garden. The gentle chime of Santa Chiara's bells - just 30 meters away - creates the perfect soundtrack for your authentic Umbrian experience.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Size:</span>
                        <span className="font-medium">25 sqm + private garden</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Bed:</span>
                        <span className="font-medium">Queen size luxury mattress</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Bathroom:</span>
                        <span className="font-medium">Shower, luxury amenities</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Garden:</span>
                        <span className="font-medium">Private rooftop with seating</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>View:</span>
                        <span className="font-medium">Assisi rooftops + basilica glimpse</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-6">What Makes This Special</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8 shadow-elegant">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-playfair text-sage mb-2">
                        Reserve Your Garden Sanctuary
                      </h3>
                      <div className="text-3xl font-bold text-terracotta mb-1">
                        From €95<span className="text-base font-normal text-muted-foreground">/night</span>
                      </div>
                    </div>

                    <Button 
                      variant="terracotta" 
                      size="lg" 
                      className="w-full mb-4"
                    >
                      Check Availability
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      (Full booking system coming next)
                    </p>

                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-4 h-4 text-sage" />
                        <span className="text-sm text-muted-foreground">Free cancellation</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-4 h-4 text-sage" />
                        <span className="text-sm text-muted-foreground">Best rate guarantee</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sage" />
                        <span className="text-sm text-muted-foreground">Instant confirmation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default GardenRoom;