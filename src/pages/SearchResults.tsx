import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { format, differenceInDays, parseISO } from "date-fns";
import { Filter, X, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [priceRange, setPriceRange] = useState("any");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [specialFeatures, setSpecialFeatures] = useState<string[]>([]);

  // Mock rooms data with filter properties
  const mockRooms = [
    {
      id: 1,
      name: "Garden Room Sanctuary",
      capacity: 2,
      basePrice: 95,
      slug: "garden-room",
      type: "private-room",
      features: ["private-garden"]
    },
    {
      id: 2,
      name: "Panoramic Terrace Apartment",
      capacity: 2,
      basePrice: 105,
      slug: "terrace-apartment",
      type: "full-apartment",
      features: ["panoramic-terrace"]
    },
    {
      id: 3,
      name: "Contemporary Luxury Apartment", 
      capacity: 4,
      basePrice: 130,
      slug: "modern-apartment",
      type: "full-apartment",
      features: ["modern-luxury"]
    },
    {
      id: 4,
      name: "Historic Stone Vault Apartment",
      capacity: 4,
      basePrice: 140,
      slug: "stone-vault-apartment",
      type: "full-apartment",
      features: ["historic-stone"]
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

  // Filter logic
  const applyFilters = (rooms: typeof mockRooms) => {
    return rooms.filter(room => {
      // Guest capacity filter
      if (guests > room.capacity) return false;
      
      // Price range filter
      if (priceRange !== "any") {
        if (priceRange === "low" && (room.basePrice < 80 || room.basePrice > 120)) return false;
        if (priceRange === "medium" && (room.basePrice < 120 || room.basePrice > 160)) return false;
        if (priceRange === "high" && room.basePrice < 160) return false;
      }
      
      // Room type filter
      if (roomTypes.length > 0 && !roomTypes.includes(room.type)) return false;
      
      // Special features filter
      if (specialFeatures.length > 0) {
        const hasFeature = specialFeatures.some(feature => room.features.includes(feature));
        if (!hasFeature) return false;
      }
      
      return true;
    });
  };

  // Filter available rooms
  const availableRooms = applyFilters(mockRooms);

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
                  
                  {/* Mobile Filter Toggle */}
                  <div className="lg:hidden mb-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </Button>
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

        <div className="flex container mx-auto px-4 py-8 max-w-6xl mx-auto">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 pr-8">
            <div className="bg-stone-light/20 border border-border rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-3">Price Range</h3>
                <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="price-any" />
                    <Label htmlFor="price-any">Any price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="price-low" />
                    <Label htmlFor="price-low">€80 - €120 per night</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="price-medium" />
                    <Label htmlFor="price-medium">€120 - €160 per night</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="price-high" />
                    <Label htmlFor="price-high">€160+ per night</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator className="mb-6" />

              {/* Room Type Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-foreground mb-3">Room Type</h3>
                <div className="space-y-3">
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

              <Separator className="mb-6" />

              {/* Special Features Filter */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Special Features</h3>
                <div className="space-y-3">
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
                      id="modern-luxury"
                      checked={specialFeatures.includes("modern-luxury")}
                      onCheckedChange={(checked) => handleSpecialFeatureChange("modern-luxury", !!checked)}
                    />
                    <Label htmlFor="modern-luxury">Modern Luxury</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="historic-stone"
                      checked={specialFeatures.includes("historic-stone")}
                      onCheckedChange={(checked) => handleSpecialFeatureChange("historic-stone", !!checked)}
                    />
                    <Label htmlFor="historic-stone">Historic Stone</Label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-50">
              <div className="bg-background p-6 h-full overflow-y-auto animate-slide-in-right">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Same filter content as desktop but in mobile layout */}
                <div className="space-y-6">
                  {/* Price Range Filter */}
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Price Range</h3>
                    <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="any" id="mobile-price-any" />
                        <Label htmlFor="mobile-price-any">Any price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="mobile-price-low" />
                        <Label htmlFor="mobile-price-low">€80 - €120 per night</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="mobile-price-medium" />
                        <Label htmlFor="mobile-price-medium">€120 - €160 per night</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="mobile-price-high" />
                        <Label htmlFor="mobile-price-high">€160+ per night</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Room Type Filter */}
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Room Type</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-private-room"
                          checked={roomTypes.includes("private-room")}
                          onCheckedChange={(checked) => handleRoomTypeChange("private-room", !!checked)}
                        />
                        <Label htmlFor="mobile-private-room">Private Room</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-full-apartment"
                          checked={roomTypes.includes("full-apartment")}
                          onCheckedChange={(checked) => handleRoomTypeChange("full-apartment", !!checked)}
                        />
                        <Label htmlFor="mobile-full-apartment">Full Apartment</Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Special Features Filter */}
                  <div>
                    <h3 className="font-medium text-foreground mb-3">Special Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-private-garden"
                          checked={specialFeatures.includes("private-garden")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("private-garden", !!checked)}
                        />
                        <Label htmlFor="mobile-private-garden">Private Garden</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-panoramic-terrace"
                          checked={specialFeatures.includes("panoramic-terrace")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("panoramic-terrace", !!checked)}
                        />
                        <Label htmlFor="mobile-panoramic-terrace">Panoramic Terrace</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-modern-luxury"
                          checked={specialFeatures.includes("modern-luxury")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("modern-luxury", !!checked)}
                        />
                        <Label htmlFor="mobile-modern-luxury">Modern Luxury</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-historic-stone"
                          checked={specialFeatures.includes("historic-stone")}
                          onCheckedChange={(checked) => handleSpecialFeatureChange("historic-stone", !!checked)}
                        />
                        <Label htmlFor="mobile-historic-stone">Historic Stone</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button onClick={clearFilters} variant="outline" className="flex-1">
                      Clear All
                    </Button>
                    <Button 
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
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
                    {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} found
                  </h2>
                  <p className="text-muted-foreground">
                    Showing accommodations for {guests} guest{guests !== 1 ? 's' : ''}
                  </p>
                </div>

                {availableRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-6 transition-all duration-300">
                    {availableRooms.map((room) => {
                      const totalPrice = room.basePrice * nights;
                      
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
                ) : (
                  <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                      No rooms match your criteria
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filters to see more results
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default SearchResults;