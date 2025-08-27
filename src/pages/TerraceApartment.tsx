import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import BookingWidget from "@/components/booking/BookingWidget";

// Import images
import terraceHero from "@/assets/terrace-apartment.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

const TerraceApartment = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  const galleryImages = [
    { src: terraceHero, alt: "Panoramic terrace with valley views" },
    { src: gardenRoomInterior, alt: "Terrace apartment interior" },
    { src: gardenRoomBathroom, alt: "Modern bathroom" },
    { src: gardenRoomView, alt: "Sunset views from terrace" },
    { src: gardenRoomDetails, alt: "Kitchen and living area" },
    { src: terraceHero, alt: "Evening terrace ambiance" }
  ];

  const amenities = [
    "Sunset terrace with valley views",
    "Full kitchen for romantic dinners",
    "Independent entrance for privacy",
    "Lightning-fast WiFi for sharing memories",
    "Freshly laundered luxury linens",
    "Coffee & tea making facilities"
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <img 
            src={terraceHero} 
            alt="Panoramic Terrace Apartment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-playfair mb-4">Panoramic Terrace Apartment</h1>
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
                      Panoramic Sunsets Over Umbrian Valley
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Romantic escape for 2 guests
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Every evening becomes a private show as the Umbrian sun sets behind rolling hills, painting your terrace in golden light. This intimate apartment offers the perfect blend of privacy and panoramic beauty, with sweeping views that stretch from Assisi's medieval walls to the distant mountains.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Size:</span>
                        <span className="font-medium">35 sqm + private terrace</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Bed:</span>
                        <span className="font-medium">Queen size + living area</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Terrace:</span>
                        <span className="font-medium">Furnished outdoor seating</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Kitchen:</span>
                        <span className="font-medium">Full kitchenette facilities</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Capacity:</span>
                        <span className="font-medium">2 guests maximum</span>
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
                  roomType="terrace"
                  roomName="Panoramic Terrace Apartment" 
                  capacity={2}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default TerraceApartment;