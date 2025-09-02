// src/pages/ModernApartment.tsx - ADDED Auto-populate from URL params

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
                  <h2 className="text-3xl font-playfair text-sage mb-6">Modern Luxury Meets Historic Charm</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Experience the perfect blend of contemporary comfort and medieval atmosphere in this 
                    recently renovated luxury apartment. Featuring sleek modern design, emotional lighting 
                    throughout, and premium amenities, this space offers a sophisticated retreat in the 
                    heart of historic Assisi.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    The apartment comfortably accommodates up to 4 guests with a king bed and queen sofa bed, 
                    making it ideal for families or groups. The full modern kitchen allows you to prepare 
                    meals with local ingredients, while lightning-fast WiFi ensures you stay connected for 
                    work or sharing your Assisi memories.
                  </p>
                </section>

                {/* Amenities */}
                <section>
                  <h3 className="text-2xl font-playfair text-sage mb-6">Luxury Amenities</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-sage flex-shrink-0" />
                        <span className="text-muted-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Location */}
                <section>
                  <h3 className="text-2xl font-playfair text-sage mb-4">Central Historic Location</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Located in Assisi's medieval heart, you're just steps away from the Basilica of Santa Chiara, 
                    local restaurants, and charming cobblestone streets. This modern sanctuary provides a 
                    perfect base for exploring the spiritual and cultural treasures of this UNESCO World Heritage site.
                  </p>
                </section>
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
        </div>
      </main>
    </>
  );
};

export default ModernApartment;