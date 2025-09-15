import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { parseISO, differenceInDays } from "date-fns";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import BookingWidget from "@/components/booking/BookingWidget";
import MobileOptimizedImage from "@/components/MobileOptimizedImage";
import Footer from "@/components/Footer";

// Import images
import gardenRoomHero from "@/assets/garden-room.jpg";
import gardenRoomInterior from "@/assets/garden-room-interior.jpg";
import gardenRoomBathroom from "@/assets/garden-room-bathroom.jpg";
import gardenRoomDetails from "@/assets/garden-room-details.jpg";
import gardenRoomView from "@/assets/garden-room-view.jpg";

const GardenRoom = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');  
  const guestsParam = searchParams.get('guests');
  
  // Parse dates if they exist
  const presetCheckIn = checkInParam ? parseISO(checkInParam) : undefined;
  const presetCheckOut = checkOutParam ? parseISO(checkOutParam) : undefined;
  const presetGuests = guestsParam ? parseInt(guestsParam) : undefined;
  
  // Calculate nights and total price if dates are preset
  const nights = presetCheckIn && presetCheckOut ? differenceInDays(presetCheckOut, presetCheckIn) : 0;
  const totalPrice = nights > 0 ? 95 * nights + 25 : 0; // €95/night + €25 cleaning fee

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
      <SEOHead
        title="Garden Room Sanctuary - Private Rooftop Garden with Basilica Views"
        description="Wake up to church bells just 30m from Santa Chiara Basilica. Private rooftop garden, queen bed, luxury amenities. €85-120/night. Book your authentic Assisi experience."
        canonical="https://terrazzasantachiara.com/rooms/garden-room"
        schema={{
          "@context": "https://schema.org",
          "@type": "AccommodationRoom",
          "name": "Garden Room Sanctuary",
          "description": "Private rooftop garden room with panoramic views, just 30 meters from Santa Chiara Basilica",
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": "25",
            "unitCode": "MTK"
          },
          "occupancy": {
            "@type": "QuantitativeValue",
            "maxValue": 2
          },
          "bed": {
            "@type": "BedDetails",
            "typeOfBed": "Queen bed"
          },
          "amenityFeature": [
            {"@type": "LocationFeatureSpecification", "name": "Private garden"},
            {"@type": "LocationFeatureSpecification", "name": "Air conditioning"},
            {"@type": "LocationFeatureSpecification", "name": "Free WiFi"}
          ]
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <section className="relative h-[60vh] overflow-hidden">
          <MobileOptimizedImage 
            src={gardenRoomHero} 
            alt="Garden Room Sanctuary with private rooftop garden and Assisi views" 
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-stone/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair mb-4">Garden Room Sanctuary</h1>
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

              {/* Booking Widget */}
              <div className="lg:col-span-1">
                <BookingWidget
                  roomType="garden"
                  roomName="Garden Room Sanctuary" 
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
      <Footer />
    </>
  );
};

export default GardenRoom;