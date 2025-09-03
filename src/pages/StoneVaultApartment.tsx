// src/pages/StoneVaultApartment.tsx - FIXED Layout to match GardenRoom

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
import stoneVaultHero from "@/assets/stone-vault.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

// 🔴 FIX: Parse dates safely without timezone issues
const parseDateSafely = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-based
};

const StoneVaultApartment = () => {
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
      <SEOHead
        title="Historic Stone Vault Apartment - Authentic 13th Century Architecture"
        description="Sleep within original 13th century stone vaults with authentic Subasio pink stone walls. Unique historical experience with modern amenities, perfect for up to 4 guests."
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <MobileOptimizedImage 
            src={stoneVaultHero} 
            alt="Historic Stone Vault Apartment with authentic medieval architecture" 
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">Historic Stone Vault Apartment</h1>
            <p className="text-lg md:text-xl lg:text-2xl">Authentic experience for up to 4 guests</p>
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
                      Living Medieval History
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Sleep within authentic 13th century stone vaults
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Step back in time in this extraordinary historic apartment featuring original 13th century 
                      stone vaults and authentic Subasio pink stone walls. These barrel-vaulted ceilings and ancient walls 
                      tell the story of medieval Assisi, offering an unmatched historical immersion that few 
                      travelers ever experience.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      The apartment seamlessly blends historical authenticity with modern comfort, featuring 
                      discretely integrated amenities that respect the medieval architecture while ensuring 
                      your stay is comfortable and memorable. Perfect for history enthusiasts and those seeking 
                      a truly unique connection to Assisi's Franciscan heritage.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Period:</span>
                        <span className="font-medium">Original 13th century</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Beds:</span>
                        <span className="font-medium">King bed + queen sofa bed</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Architecture:</span>
                        <span className="font-medium">Stone barrel vaults</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Walls:</span>
                        <span className="font-medium">Authentic Subasio pink stone</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Capacity:</span>
                        <span className="font-medium">Up to 4 guests (8 total if connected)</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-6">Historic Features & Modern Comfort</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {amenities.map((amenity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Significance */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Living Medieval History</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      These stone vaults have witnessed 800 years of history, from medieval pilgrims to modern 
                      travelers seeking spiritual renewal. The original Subasio pink stone walls connect you 
                      directly to the same materials used in the construction of the Basilicas of Saint Francis 
                      and Santa Chiara. For larger groups, this apartment can connect with our adjacent space 
                      to accommodate up to 8 guests total.
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Widget */}
              <div className="lg:col-span-1">
                <BookingWidget
                  roomType="stone"
                  roomName="Historic Stone Vault Apartment"
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

export default StoneVaultApartment;