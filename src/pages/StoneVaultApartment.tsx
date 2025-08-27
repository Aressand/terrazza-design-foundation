import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import BookingWidget from "@/components/booking/BookingWidget";

// Import images
import stoneVaultHero from "@/assets/stone-vault.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

const StoneVaultApartment = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  const galleryImages = [
    { src: stoneVaultHero, alt: "Historic stone vault apartment with medieval architecture" },
    { src: gardenRoomInterior, alt: "Stone vault interior with authentic walls" },
    { src: gardenRoomBathroom, alt: "Modern bathroom in historic setting" },
    { src: gardenRoomView, alt: "Original barrel vaults ceiling" },
    { src: gardenRoomDetails, alt: "Subasio pink stone walls detail" },
    { src: stoneVaultHero, alt: "Evening ambiance in historic apartment" }
  ];

  const amenities = [
    "Original 13th century architecture",
    "Authentic Subasio pink stone walls",
    "Can connect for large groups (8 guests total)",
    "King bed + queen sofa bed",
    "Modern amenities discretely integrated",
    "Unmatched historical experience"
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <img 
            src={stoneVaultHero} 
            alt="Historic Stone Vault Apartment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-playfair mb-4">Historic Stone Vault Apartment</h1>
            <p className="text-xl lg:text-2xl">Authentic experience for up to 4 guests</p>
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
                      Sleep Under Original 13th Century Vaults
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Authentic medieval experience for up to 4 guests
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Step back 800 years as you enter your medieval sanctuary. Original barrel vaults soar overhead while authentic Subasio pink stone walls tell stories of centuries past. This unique apartment offers an unmatched historical experience with all modern comforts discretely integrated.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Size:</span>
                        <span className="font-medium">50 sqm historic apartment</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Architecture:</span>
                        <span className="font-medium">Original barrel vaults</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Walls:</span>
                        <span className="font-medium">Authentic Subasio pink stone</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Beds:</span>
                        <span className="font-medium">King bed + queen sofa bed</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Special:</span>
                        <span className="font-medium">Can connect to Modern Apartment</span>
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
                  roomType="stone"
                  roomName="Historic Stone Vault Apartment" 
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

export default StoneVaultApartment;