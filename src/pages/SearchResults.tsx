import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { format, differenceInDays, parseISO } from "date-fns";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Mock rooms data
  const mockRooms = [
    {
      id: 1,
      name: "Garden Room Sanctuary",
      capacity: 2,
      basePrice: 95,
      slug: "garden-room"
    },
    {
      id: 2,
      name: "Panoramic Terrace Apartment",
      capacity: 2,
      basePrice: 105,
      slug: "terrace-apartment"
    },
    {
      id: 3,
      name: "Contemporary Luxury Apartment", 
      capacity: 4,
      basePrice: 130,
      slug: "modern-apartment"
    },
    {
      id: 4,
      name: "Historic Stone Vault Apartment",
      capacity: 4,
      basePrice: 140,
      slug: "stone-vault-apartment"
    }
  ];

  // Parse URL parameters
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  // Validate parameters
  const hasValidParams = checkInParam && checkOutParam && guestsParam;
  
  // Parse dates and calculate nights
  let checkInDate: Date | null = null;
  let checkOutDate: Date | null = null;
  let isValidDates = false;
  
  if (checkInParam && checkOutParam) {
    try {
      checkInDate = parseISO(checkInParam);
      checkOutDate = parseISO(checkOutParam);
      isValidDates = !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkOutDate > checkInDate;
    } catch {
      isValidDates = false;
    }
  }

  const guests = guestsParam ? parseInt(guestsParam) : 1;
  const nights = checkInDate && checkOutDate && isValidDates ? differenceInDays(checkOutDate, checkInDate) : 0;

  // Filter available rooms based on guest capacity
  const availableRooms = mockRooms.filter(room => guests <= room.capacity);

  // Format dates for display
  const formattedCheckIn = checkInDate && isValidDates ? format(checkInDate, 'dd MMM yyyy') : '';
  const formattedCheckOut = checkOutDate && isValidDates ? format(checkOutDate, 'dd MMM yyyy') : '';

  // Error messages
  const getErrorMessage = () => {
    if (!hasValidParams) return "Please select your dates and guests";
    if (!isValidDates) return "Invalid dates selected";
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <>
      <SEOHead 
        title="Search Results - Terrazza Santa Chiara B&B Assisi"
        description="Find your perfect room at Terrazza Santa Chiara B&B in Assisi. Compare availability and prices for our luxury accommodations."
      />
      
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {errorMessage ? (
                <div className="text-center">
                  <h1 className="font-playfair text-3xl font-bold text-foreground mb-4">
                    Search Results
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">{errorMessage}</p>
                  <Link to="/">
                    <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                      ← Modify Search
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h1 className="font-playfair text-3xl font-bold text-foreground mb-4">
                    Available Accommodations for {guests} guest{guests !== 1 ? 's' : ''}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-lg text-muted-foreground mb-8">
                    <span>Check-in: <span className="font-medium text-foreground">{formattedCheckIn}</span></span>
                    <span className="hidden sm:inline">•</span>
                    <span>Check-out: <span className="font-medium text-foreground">{formattedCheckOut}</span></span>
                    <span className="hidden sm:inline">•</span>
                    <span><span className="font-medium text-foreground">{nights}</span> night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <Link to="/">
                    <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                      ← Modify Search
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {errorMessage ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                  No Results Found
                </h2>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                  </h2>
                  <p className="text-muted-foreground">
                    Showing accommodations for {guests} guest{guests !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableRooms.map((room) => {
                    const totalPrice = room.basePrice * nights;
                    
                    return (
                      <div 
                        key={room.id}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm transition-shadow duration-300"
                      >
                        {/* Placeholder Image */}
                        <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Room Image</span>
                        </div>
                        
                        {/* Room Details */}
                        <div className="p-6">
                          <h3 className="font-playfair text-xl font-semibold text-card-foreground mb-2">
                            {room.name}
                          </h3>
                          
                          <p className="text-muted-foreground mb-4">
                            Perfect for {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                          </p>
                          
                          <div className="mb-4">
                            <p className="text-lg font-semibold text-foreground">
                              €{room.basePrice}/night
                            </p>
                            {nights > 0 && (
                              <p className="text-sm text-muted-foreground">
                                €{totalPrice} total ({nights} night{nights !== 1 ? 's' : ''})
                              </p>
                            )}
                          </div>
                          
                          <Link to={`/rooms/${room.slug}`}>
                            <Button 
                              variant="terracotta" 
                              className="w-full"
                            >
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {availableRooms.length === 0 && (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                      No rooms available
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      No accommodations can host {guests} guest{guests !== 1 ? 's' : ''}. Please try reducing the number of guests.
                    </p>
                    <Link to="/">
                      <Button variant="outline">
                        ← Modify Search
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchResults;