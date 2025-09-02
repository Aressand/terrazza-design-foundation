// src/pages/StoneVaultApartment.tsx - ADDED Auto-populate from URL params

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { differenceInDays } from "date-fns";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import BookingWidget from "@/components/booking/BookingWidget";

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
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Gallery */}
                <section>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative overflow-hidden rounded-lg aspect-square bg-stone-light cursor-pointer group"
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={image.src} 
                          alt={image.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Description */}
                <section className="prose prose-lg max-w-none">
                  <h2 className="text-3xl font-playfair text-sage mb-6">Sleep Within Medieval History</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Experience the extraordinary opportunity to sleep within original 13th century stone vaults, 
                    constructed from authentic Subasio pink stone. These barrel-vaulted ceilings and ancient walls 
                    tell the story of medieval Assisi, offering an unmatched historical immersion that few 
                    travelers ever experience.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The apartment seamlessly blends historical authenticity with modern comfort, featuring 
                    discretely integrated amenities that respect the medieval architecture while ensuring 
                    your stay is comfortable and memorable. Perfect for history enthusiasts and those seeking 
                    a truly unique connection to Assisi's Franciscan heritage.
                  </p>
                </section>

                {/* Amenities */}
                <section>
                  <h3 className="text-2xl font-playfair text-sage mb-6">Historic Features & Modern Comfort</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-sage flex-shrink-0" />
                        <span className="text-muted-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Historical Significance */}
                <section>
                  <h3 className="text-2xl font-playfair text-sage mb-4">Living Medieval History</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These stone vaults have witnessed 800 years of history, from medieval pilgrims to modern 
                    travelers seeking spiritual renewal. The original Subasio pink stone walls connect you 
                    directly to the same materials used in the construction of the Basilicas of Saint Francis 
                    and Santa Chiara. For larger groups, this apartment can connect with our adjacent space 
                    to accommodate up to 8 guests total.
                  </p>
                </section>
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
        </div>
      </main>
    </>
  );
};

export default StoneVaultApartment;