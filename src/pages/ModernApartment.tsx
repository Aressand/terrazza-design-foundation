// src/pages/ModernApartment.tsx - FIXED Layout to match GardenRoom

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { differenceInDays } from "date-fns";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import BookingWidget from "@/components/booking/BookingWidget";
import MobileOptimizedImage from "@/components/MobileOptimizedImage";

// Import images
import modernHero from "@/assets/modern-apartment.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

// 🔴 FIX: Parse dates safely without timezone issues
const parseDateSafely = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-based
};

const ModernApartment = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchParams] = useSearchParams();
  
  // 🔴 FIX: Get URL parameters (same as GardenRoom)
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');  
  const guestsParam = searchParams.get('guests');
  
  // 🔴 FIX: Parse dates safely to avoid 1-day offset
  const presetCheckIn = checkInParam ? parseDateSafely(checkInParam) : undefined;
  const presetCheckOut = checkOutParam ? parseDateSafely(checkOutParam) : undefined;
  const presetGuests = guestsParam ? parseInt(guestsParam) : undefined;

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
      <SEOHead
        title="Contemporary Luxury Apartment - Modern Comfort in Historic Assisi"
        description="Newly renovated luxury apartment with modern amenities, full kitchen, and contemporary design. Perfect for families or groups up to 4 guests in the heart of historic Assisi."
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <MobileOptimizedImage 
            src={modernHero} 
            alt="Contemporary Luxury Apartment with modern design" 
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">Contemporary Luxury Apartment</h1>
            <p className="text-lg md:text-xl lg:text-2xl">Perfect for up to 4 guests</p>
          </div>
          
          {/* Back Navigation */}
          <Link 
            to="/" 
            className="absolute top-4 left-4 md:top-8 md:left-8 bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 text-white hover:bg-white/30 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back to homepage"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
        </section>

        {/* Image Gallery */}
        <section className="py-12 lg:py-16">
          <div className="container-bnb">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Image */}
              <div className="lg:col-span-8">
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-soft">
                  <MobileOptimizedImage 
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
                      className={`aspect-square rounded-lg overflow-hidden shadow-soft transition-all min-w-[44px] min-h-[44px] ${
                        selectedImage === index ? 'ring-2 ring-sage' : 'hover:opacity-80'
                      }`}
                      aria-label={`View ${image.alt}`}
                    >
                      <MobileOptimizedImage 
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
                      Contemporary Luxury in Historic Assisi
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Modern comfort meets authentic medieval atmosphere
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Immerse yourself in contemporary luxury within Assisi's medieval heart. This thoughtfully 
                      renovated apartment combines sleek modern design with the authentic charm of historic 
                      stone walls. Featuring sleek modern design, emotional lighting throughout, and premium 
                      amenities, this space offers a sophisticated retreat in the heart of historic Assisi.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      The apartment comfortably accommodates up to 4 guests with a king bed and queen sofa bed, 
                      making it ideal for families or groups. The full modern kitchen allows you to prepare 
                      meals with local ingredients, while lightning-fast WiFi ensures you stay connected for 
                      work or sharing your Assisi memories.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Size:</span>
                        <span className="font-medium">Full luxury apartment</span>
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
                    <h3 className="text-2xl font-playfair text-sage mb-6">Luxury Amenities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Central Historic Location</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Located in Assisi's medieval heart, you're just steps away from the Basilica of Santa Chiara, 
                      local restaurants, and charming cobblestone streets. This modern sanctuary provides a 
                      perfect base for exploring the spiritual and cultural treasures of this UNESCO World Heritage site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Widget */}
              <div className="lg:col-span-1">
                <BookingWidget
                  roomType="modern"
                  roomName="Contemporary Luxury Apartment"
                  capacity={4}
                  presetCheckIn={presetCheckIn}
                  presetCheckOut={presetCheckOut}
                  presetGuests={presetGuests}
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