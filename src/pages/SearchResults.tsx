// src/pages/SearchResults.tsx - UPDATED with Real Dynamic Pricing (UI/UX unchanged)

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
import Footer from "@/components/Footer";

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

  // Use real availability checking WITH dynamic pricing
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
      // Price range filter - now uses dynamic pricing
      if (priceRange !== "any") {
        const roomPricePerNight = room.pricePerNight || room.base_price;
        if (priceRange === "low" && (roomPricePerNight < 80 || roomPricePerNight > 120)) return false;
        if (priceRange === "medium" && (roomPricePerNight < 120 || roomPricePerNight > 160)) return false;
        if (priceRange === "high" && roomPricePerNight < 160) return false;
      }
      
      // Room type filter (map our roomType to display categories)
      if (roomTypes.length > 0) {
        const roomCategory = room.roomType === 'garden' ? 'private-room' : 'full-apartment';
        if (!roomTypes.includes(roomCategory)) return false;
      }
      
      // Special features filter (placeholder - can be extended later)
      if (specialFeatures.length > 0) {
        // This would need room.features data to be properly implemented
        // For now, just show all rooms if any special features are selected
      }
      
      return true;
    });
  };

  const filteredRooms = applyFilters(availableRooms);

  // Filter handlers
  const handleRoomTypeChange = (roomType: string, checked: boolean) => {
    if (checked) {
      setRoomTypes(prev => [...prev, roomType]);
    } else {
      setRoomTypes(prev => prev.filter(type => type !== roomType));
    }
  };

  const handleSpecialFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setSpecialFeatures(prev => [...prev, feature]);
    } else {
      setSpecialFeatures(prev => prev.filter(f => f !== feature));
    }
  };

  const clearAllFilters = () => {
    setPriceRange("any");
    setRoomTypes([]);
    setSpecialFeatures([]);
  };

  const hasActiveFilters = priceRange !== "any" || roomTypes.length > 0 || specialFeatures.length > 0;

  // Error state
  if (!hasValidParams) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid search parameters. Please return to the homepage and search again with valid dates and guest count.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="terracotta">Return to Homepage</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isValidDates) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-16">
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid dates provided. Check-out date must be after check-in date.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="terracotta">Return to Homepage</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`Available Rooms - ${checkInDate && checkOutDate ? `${format(checkInDate, 'MMM d')} - ${format(checkOutDate, 'MMM d, yyyy')}` : 'Search Results'}`}
        description={`Find the perfect accommodation in Assisi. ${availableRooms.length} rooms available for ${guests} guest${guests !== 1 ? 's' : ''}.`}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-playfair text-sage">Terrazza Santa Chiara</div>
              </Link>
              
              <div className="flex items-center space-x-4">
                {checkInDate && checkOutDate && (
                  <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">{format(checkInDate, 'MMM d')}</span>
                      {' → '}
                      <span className="font-medium">{format(checkOutDate, 'MMM d, yyyy')}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div>{guests} guest{guests !== 1 ? 's' : ''}</div>
                    <Separator orientation="vertical" className="h-4" />
                    <div>{nights} night{nights !== 1 ? 's' : ''}</div>
                  </div>
                )}
                
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    New Search
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-playfair text-foreground mb-2">
              {loading ? 'Searching...' : 
               error ? 'Search Error' :
               `${availableRooms.length + unavailableRooms.length} room${availableRooms.length + unavailableRooms.length !== 1 ? 's' : ''} ${availableRooms.length > 0 ? 'available' : 'found'}`}
            </h1>
            {checkInDate && checkOutDate && (
              <p className="text-muted-foreground">
                {format(checkInDate, 'EEEE, MMMM d')} - {format(checkOutDate, 'EEEE, MMMM d, yyyy')} • {guests} guest{guests !== 1 ? 's' : ''} • {nights} night{nights !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {error && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="any-price" />
                        <Label htmlFor="any-price">Any price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low-price" />
                        <Label htmlFor="low-price">€80 - €120</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium-price" />
                        <Label htmlFor="medium-price">€120 - €160</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high-price" />
                        <Label htmlFor="high-price">€160+</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Accommodation Type */}
                  <div>
                    <h4 className="font-medium mb-3">Accommodation Type</h4>
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
                    <h4 className="font-medium mb-3">Special Features</h4>
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
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full justify-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {[priceRange !== "any" ? 1 : 0, roomTypes.length, specialFeatures.length]
                        .reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </div>

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
                    // 🎯 KEY CHANGE: Use dynamic pricing instead of hardcoded
                    const displayPricePerNight = Math.round(room.pricePerNight || room.base_price);
                    const totalPrice = room.dynamicPrice || (displayPricePerNight * nights);
                    
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
                            {/* 🎯 Show indicator for price overrides */}
                            {room.hasOverrides && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Special Rate
                              </Badge>
                            )}
                          </h3>
                          
                          <p className="text-muted-foreground mb-4">
                            Perfect for {room.capacity} guest{room.capacity !== 1 ? 's' : ''}
                          </p>
                          
                          <div className="mb-4">
                            {/* 🎯 KEY CHANGE: Show dynamic pricing instead of hardcoded */}
                            <p className="text-lg font-semibold text-foreground">
                              €{displayPricePerNight}/night
                            </p>
                            {nights > 0 && (
                              <p className="text-sm text-muted-foreground">
                                €{Math.round(totalPrice)} total ({nights} night{nights !== 1 ? 's' : ''})
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
                      <div className="space-y-2">
                        <Link to="/">
                          <Button variant="terracotta" className="mr-4">
                            Search Different Dates
                          </Button>
                        </Link>
                        {hasActiveFilters && (
                          <Button variant="outline" onClick={clearAllFilters}>
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                        No rooms match your criteria
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your filters or search with different parameters.
                      </p>
                      <div className="space-y-2">
                        {hasActiveFilters && (
                          <Button variant="terracotta" onClick={clearAllFilters} className="mr-4">
                            Clear All Filters
                          </Button>
                        )}
                        <Link to="/">
                          <Button variant="outline">
                            New Search
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Show unavailable rooms if any */}
              {unavailableRooms.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-muted-foreground mb-6">
                    Unavailable for Your Dates ({unavailableRooms.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                    {unavailableRooms.map((room) => {
                      const displayPricePerNight = Math.round(room.pricePerNight || room.base_price);
                      
                      return (
                        <div 
                          key={room.id}
                          className="bg-card border border-border rounded-lg overflow-hidden"
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
                                €{displayPricePerNight}/night
                              </p>
                              <p className="text-sm text-red-500">
                                Not available for selected dates
                              </p>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              disabled
                            >
                              Unavailable
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;