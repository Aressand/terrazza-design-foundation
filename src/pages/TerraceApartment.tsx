// src/pages/TerraceApartment.tsx - FIXED Layout to match GardenRoom

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
import terraceHero from "@/assets/terrace-apartment.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

// 🔴 FIX: Parse dates safely without timezone issues
const parseDateSafely = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-based
};

const TerraceApartment = () => {
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
      <SEOHead
        title="Panoramic Terrace Apartment - Sunset Views & Full Kitchen"
        description="Romantic terrace apartment with panoramic valley views, full kitchen, and private entrance. Perfect for couples seeking privacy and authentic Assisi sunsets."
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <MobileOptimizedImage 
            src={terraceHero} 
            alt="Panoramic Terrace Apartment with sunset valley views" 
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">Panoramic Terrace Apartment</h1>
            <p className="text-lg md:text-xl lg:text-2xl">Perfect for 2 guests</p>
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
                      Your Private Sunset Sanctuary
                    </h2>
                    <p className="text-xl text-sage/80 mb-6">
                      Experience Assisi's most breathtaking sunsets from your private panoramic terrace
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Experience Assisi's most breathtaking sunsets from your private panoramic terrace. 
                      This romantic apartment features a full kitchen for intimate dinners, an independent 
                      entrance for complete privacy, and unobstructed valley views that stretch to the horizon.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                      Located in the historic center just steps from Santa Chiara Basilica, you'll enjoy 
                      the perfect blend of authentic medieval atmosphere and modern luxury amenities. 
                      The apartment's elevated position provides a peaceful retreat while keeping you 
                      connected to Assisi's spiritual heart.
                    </p>
                  </div>

                  {/* Room Details */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Size:</span>
                        <span className="font-medium">Full apartment + terrace</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Bed:</span>
                        <span className="font-medium">Queen size luxury mattress</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Kitchen:</span>
                        <span className="font-medium">Full equipped kitchen</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>Terrace:</span>
                        <span className="font-medium">Private panoramic terrace</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span>View:</span>
                        <span className="font-medium">Unobstructed valley views</span>
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

                  {/* Perfect Location */}
                  <div>
                    <h3 className="text-2xl font-playfair text-sage mb-4">Perfect Location</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Your terrace apartment sits in Assisi's historic heart, offering easy walking 
                      access to the Basilica of Santa Chiara, traditional trattorias, and local artisan 
                      shops. The private entrance ensures you can come and go as you please while 
                      enjoying the tranquility of your elevated sanctuary.
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Widget */}
              <div className="lg:col-span-1">
                <BookingWidget
                  roomType="terrace"
                  roomName="Panoramic Terrace Apartment"
                  capacity={2}
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

export default TerraceApartment;