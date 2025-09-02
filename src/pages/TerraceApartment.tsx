// src/pages/TerraceApartment.tsx - ADDED Auto-populate (CORRECTED)

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
                  <h2 className="text-3xl font-playfair text-sage mb-6">Your Private Sunset Sanctuary</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Experience Assisi's most breathtaking sunsets from your private panoramic terrace. 
                    This romantic apartment features a full kitchen for intimate dinners, an independent 
                    entrance for complete privacy, and unobstructed valley views that stretch to the horizon.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Located in the historic center just steps from Santa Chiara Basilica, you'll enjoy 
                    the perfect blend of authentic medieval atmosphere and modern luxury amenities. 
                    The apartment's elevated position provides a peaceful retreat while keeping you 
                    connected to Assisi's spiritual heart.
                  </p>
                </section>

                {/* Amenities */}
                <section>
                  <h3 className="text-2xl font-playfair text-sage mb-6">What's Included</h3>
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
                  <h3 className="text-2xl font-playfair text-sage mb-4">Perfect Location</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your terrace apartment sits in Assisi's historic heart, offering easy walking 
                    access to the Basilica of Santa Chiara, traditional trattorias, and local artisan 
                    shops. The private entrance ensures you can come and go as you please while 
                    enjoying the tranquility of your elevated sanctuary.
                  </p>
                </section>
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
        </div>
      </main>
    </>
  );
};

export default TerraceApartment;