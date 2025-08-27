import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import BookingWidget from "@/components/booking/BookingWidget";

// Import images
import modernHero from "@/assets/modern-apartment.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

const ModernApartment = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  const galleryImages = [
    { src: modernHero, alt: "Contemporary luxury apartment interior" },
    { src: gardenRoomInterior, alt: "Modern living space" },
    { src: gardenRoomBathroom, alt: "Spacious bathroom with emotional lighting" },
    { src: gardenRoomView, alt: "Modern kitchen area" },
    { src: gardenRoomDetails, alt: "Contemporary bedroom" },
    { src: modernHero, alt: "Modern apartment evening ambiance" }
  ];

  const amenities = [
    "Recently renovated with attention to detail",
    "Spacious bathroom with emotional lighting", 
    "Full modern kitchen facilities",
    "King bed + queen sofa bed",
    "Lightning-fast WiFi for remote work",
    "Contemporary furnishing throughout"
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <img 
            src={modernHero} 
            alt="Contemporary Luxury Apartment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-playfair mb-4">Contemporary Luxury Apartment</h1>
            <p className="text-xl lg:text-2xl">Spacious for up to 4 guests</p>
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
                      Contemporary Luxury Meets Medieval Assisi
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Spacious comfort for up to 4 guests
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Newly renovated with attention to every detail, this spacious apartment proves that modern comfort and historical charm can coexist beautifully. The innovative bathroom lighting creates an emotional ambiance, while contemporary furnishing provides the luxury today's travelers expect.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Size:</span>
                        <span className="font-medium">45 sqm apartment</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Beds:</span>
                        <span className="font-medium">King bed + queen sofa bed</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Bathroom:</span>
                        <span className="font-medium">Spacious with emotional lighting</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Kitchen:</span>
                        <span className="font-medium">Full modern kitchen</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Capacity:</span>
                        <span className="font-medium">Up to 4 guests</span>
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

              {/* Booking Widget */}
              <div className="lg:col-span-1">
                <BookingWidget
                  roomType="modern"
                  roomName="Contemporary Luxury Apartment" 
                  capacity={4}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ModernApartment;