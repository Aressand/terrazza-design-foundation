// src/pages/SearchResults.tsx - UPDATED with Real Availability

import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEOHead from "@/components/SEOHead";
import { format, differenceInDays, parseISO } from "date-fns";
import { Filter, X, Search, Loader2, AlertCircle, CalendarX } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchAvailability } from "@/hooks/useSearchAvailability";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState("any");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [specialFeatures, setSpecialFeatures] = useState<string[]>([]);

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

  // Use real availability checking
  const { 
    availableRooms, 
    unavailableRooms, 
    loading, 
    error 
  } = useSearchAvailability({ 
    checkIn: checkInDate, 
    checkOut: checkOutDate, 
    guests 
  });

  // Filter logic for available rooms only
  const applyFilters = (rooms: typeof availableRooms) => {
    return rooms.filter(room => {
      // Price range filter
      if (priceRange !== "any") {
        if (priceRange === "low" && (room.base_price < 80 || room.base_price > 120)) return false;
        if (priceRange === "medium" && (room.base_price < 120 || room.base_price > 160)) return false;
        if (priceRange === "high" && room.base_price < 160) return false;
      }
      
      // Room type filter (map our roomType to display categories)
      if (roomTypes.length > 0) {
        const roomCategory = room.roomType === 'garden' ? 'private-room' : 'full-apartment';
        if (!roomTypes.includes(roomCategory)) return false;
      }
      
      // Special features filter (simplified for now)
      if (specialFeatures.length > 0) {
        // This could be enhanced with actual room features from database
        // For now, simple mapping based on room type
        const hasRequestedFeature = specialFeatures.some(feature => {
          switch (feature) {
            case 'private-garden':
              return room.roomType === 'garden';
            case 'panoramic-terrace':
              return room.roomType === 'terrace';
            case 'historic-stone':
              return room.roomType === 'stone';
            case 'modern-luxury':
              return room.roomType === 'modern';
            default:
              return false;
          }
        });
        if (!hasRequestedFeature) return false;
      }
      
      return true;
    });
  };

  // Filter available rooms
  const filteredRooms = applyFilters(availableRooms);

  // Count active filters
  const activeFiltersCount = 
    (priceRange !== "any" ? 1 : 0) + 
    roomTypes.length + 
    specialFeatures.length;

  // Clear all filters
  const clearFilters = () => {
    setPriceRange("any");
    setRoomTypes([]);
    setSpecialFeatures([]);
  };

  // Handle room type change
  const handleRoomTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setRoomTypes([...roomTypes, type]);
    } else {
      setRoomTypes(roomTypes.filter(t => t !== type));
    }
  };

  // Handle special feature change
  const handleSpecialFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setSpecialFeatures([...specialFeatures, feature]);
    } else {
      setSpecialFeatures(specialFeatures.filter(f => f !== feature));
    }
  };

  // Format dates for display
  const formattedCheckIn = checkInDate && isValidDates ? format(checkInDate, 'dd MMM yyyy') : '';
  const formattedCheckOut = checkOutDate && isValidDates ? format(checkOutDate, 'dd MMM yyyy') : '';

  // Error messages
  const getErrorMessage = () => {
    if (!hasValidParams) return "Please select your dates and guests";
    if (!isValidDates) return "Invalid dates selected";
    if (error) return `Unable to check availability: ${error}`;
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
            <div className="max-w-6xl mx-auto">
              {errorMessage ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
                      Available Accommodations
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {isValidDates && (
                        <>
                          <span>{formattedCheckIn} → {formattedCheckOut}</span>
                          <span>•</span>
                          <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{guests} guest{guests !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Loading or Results Summary */}
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">Checking real-time availability...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold">
                        {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
                      </span>
                      {unavailableRooms.length > 0 && (
                        <Badge variant="outline" className="text-orange-600">
                          {unavailableRooms.length} unavailable for selected dates
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="any" />
                        <Label htmlFor="any">Any price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low">€80 - €120</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">€120 - €160</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high">€160+</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Room Type */}
                  <div>
                    <h3 className="font-medium mb-3">Accommodation Type</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="private-room"
                          checked={roomTypes.includes("private-room")}
                          onCheckedChange={(checked) => handleRoomTypeChange("private-room", !!checked)}
                        />
                        <Label htmlFor="private-room">Private Room</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="full-apartment"
                          checked={roomTypes.includes("full-apartment")}
                          onCheckedChange={(checked) => handleRoomTypeChange("full-apartment", !!checked)}
                        />
                        <Label htmlFor="full-apartment">Full Apartment</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Special Features */}
                  <div>
                    <h3 className="font-medium mb-3">Special Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="private-garden"
                          checked={specialFeatures.includes("private-garden")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("private-garden", !!checked)}
                        />
                        <Label htmlFor="private-garden">Private Garden</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="panoramic-terrace"
                          checked={specialFeatures.includes("panoramic-terrace")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("panoramic-terrace", !!checked)}
                        />
                        <Label htmlFor="panoramic-terrace">Panoramic Terrace</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="historic-stone"
                          checked={specialFeatures.includes("historic-stone")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("historic-stone", !!checked)}
                        />
                        <Label htmlFor="historic-stone">Historic Stone Vault</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="modern-luxury"
                          checked={specialFeatures.includes("modern-luxury")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("modern-luxury", !!checked)}
                        />
                        <Label htmlFor="modern-luxury">Modern Luxury</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                      <div className="w-full aspect-video bg-gray-200" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300">
                  {filteredRooms.map((room) => {
                    const totalPrice = room.base_price * nights;
                    
                    return (
                      <div 
                        key={room.id}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm transition-all duration-300 hover:-translate-y-0.5"
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
                              €{room.base_price}/night
                            </p>
                            {nights > 0 && (
                              <p className="text-sm text-muted-foreground">
                                €{totalPrice} total ({nights} night{nights !== 1 ? 's' : ''})
                              </p>
                            )}
                          </div>
                          
                          <Link 
                            to={`/rooms/${room.slug}?checkIn=${searchParams.get('checkIn') || ''}&checkOut=${searchParams.get('checkOut') || ''}&guests=${searchParams.get('guests') || ''}`}
                          >
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
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  {unavailableRooms.length > 0 ? (
                    <>
                      <CalendarX className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                        No rooms available for selected dates
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {unavailableRooms.length} room{unavailableRooms.length !== 1 ? 's are' : ' is'} already booked for your selected dates. Try different dates or adjust your filters.
                      </p>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                        No rooms match your criteria
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your filters to see more results
                      </p>
                    </>
                  )}
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              )}

              {/* Show unavailable rooms for transparency */}
              {unavailableRooms.length > 0 && filteredRooms.length > 0 && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                    Unavailable for Selected Dates ({unavailableRooms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                    {unavailableRooms.map((room) => (
                      <div 
                        key={room.id}
                        className="bg-card border border-border rounded-lg overflow-hidden"
                      >
                        <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Room Image</span>
                        </div>
                        <div className="p-6">
                          <h3 className="font-playfair text-xl font-semibold text-card-foreground mb-2">
                            {room.name}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Perfect for {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                          </p>
                          <div className="mb-4">
                            <p className="text-lg font-semibold text-foreground">
                              €{room.base_price}/night
                            </p>
                          </div>
                          <Button disabled className="w-full" variant="outline">
                            Already Booked
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResults;