import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { MapPin, Phone, Mail, MessageCircle, Clock, Car, Utensils, Camera, Church } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guests: "",
    roomPreference: "",
    inquiryType: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Inquiry Sent Successfully!",
      description: "We'll respond to your message within 24 hours.",
    });
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      checkIn: undefined,
      checkOut: undefined,
      guests: "",
      roomPreference: "",
      inquiryType: "",
      message: ""
    });
    
    setIsSubmitting(false);
  };

  const contactMethods = [
    {
      icon: MapPin,
      title: "Address",
      details: "Via Sermei, 06081 Assisi PG, Italy",
      action: "View on Google Maps"
    },
    {
      icon: Phone,
      title: "Phone", 
      details: "+39 075 XXX XXXX",
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email",
      details: "info@terrazzasantachiara.com", 
      action: "Send Email"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: "Message us directly",
      action: "Open WhatsApp"
    }
  ];

  const walkingDirections = [
    {
      from: "Train Station",
      time: "12-minute uphill walk",
      description: "Pleasant walk through medieval streets"
    },
    {
      from: "Basilica San Francesco", 
      time: "15-minute scenic walk",
      description: "Beautiful route through historic center"
    },
    {
      from: "Parcheggio Giovanni Paolo II",
      time: "5-minute walk",
      description: "Closest parking to our property"
    }
  ];

  const localRecommendations = [
    {
      icon: Utensils,
      category: "Restaurants",
      items: ["La Fortezza", "Osteria del Sole", "Trattoria degli Umbri"]
    },
    {
      icon: Camera,
      category: "Hidden Gems", 
      items: ["Rocca Maggiore sunset view", "Via Portica shops", "Medieval fountain square"]
    },
    {
      icon: Church,
      category: "Spiritual Sites",
      items: ["Santa Chiara (30m)", "San Francesco (800m)", "San Rufino Cathedral (400m)"]
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="container-bnb">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-playfair text-sage mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to experience authentic Assisi? We're here to help plan your perfect stay.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-playfair text-sage">
                  Send Us an Inquiry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="italy">Italy</SelectItem>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="france">France</SelectItem>
                        <SelectItem value="spain">Spain</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stay Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon size={16} className="mr-2" />
                            {formData.checkIn ? format(formData.checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkIn}
                            onSelect={(date) => handleInputChange('checkIn', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon size={16} className="mr-2" />
                            {formData.checkOut ? format(formData.checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkOut}
                            onSelect={(date) => handleInputChange('checkOut', date)}
                            disabled={(date) => date < new Date() || (formData.checkIn && date <= formData.checkIn)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Select value={formData.guests} onValueChange={(value) => handleInputChange('guests', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guests" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Guest</SelectItem>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="3">3 Guests</SelectItem>
                          <SelectItem value="4">4 Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room">Room Preference</Label>
                      <Select value={formData.roomPreference} onValueChange={(value) => handleInputChange('roomPreference', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="garden">Garden Room Sanctuary</SelectItem>
                          <SelectItem value="terrace">Panoramic Terrace Apartment</SelectItem>
                          <SelectItem value="modern">Contemporary Luxury Apartment</SelectItem>
                          <SelectItem value="stone">Historic Stone Vault Apartment</SelectItem>
                          <SelectItem value="any">Any Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What can we help you with?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Room Booking</SelectItem>
                        <SelectItem value="availability">Check Availability</SelectItem>
                        <SelectItem value="group">Group Booking</SelectItem>
                        <SelectItem value="services">Local Services & Tours</SelectItem>
                        <SelectItem value="special">Special Occasions</SelectItem>
                        <SelectItem value="other">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us about your perfect Assisi experience..."
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-sage hover:bg-sage/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information & Location */}
            <div className="space-y-8">
              {/* Direct Contact */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-2xl font-playfair text-sage flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Get In Touch Directly
                  </CardTitle>
                  <p className="text-muted-foreground">Available 9:00 AM - 8:00 PM daily</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-stone-light/30 rounded-lg hover:bg-stone-light/50 transition-colors cursor-pointer">
                      <method.icon className="w-5 h-5 text-sage mt-1 shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sage">{method.title}</h3>
                        <p className="text-muted-foreground text-sm">{method.details}</p>
                        <span className="text-xs text-sage hover:text-sage/80">{method.action}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Location & Directions */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-2xl font-playfair text-sage flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    Location & Getting Here
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-stone-light/30 rounded-lg mb-6 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p>Google Maps Integration</p>
                      <p className="text-sm">Via Sermei, Assisi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sage mb-3 flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Walking Directions
                    </h3>
                    {walkingDirections.map((direction, index) => (
                      <div key={index} className="border-l-2 border-sage-light pl-4">
                        <p className="font-medium">{direction.from}</p>
                        <p className="text-sage text-sm">{direction.time}</p>
                        <p className="text-muted-foreground text-sm">{direction.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Local Recommendations */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-2xl font-playfair text-sage">
                    Local Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {localRecommendations.map((category, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-sage mb-3 flex items-center gap-2">
                        <category.icon className="w-5 h-5" />
                        {category.category}
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-sage rounded-full shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Contact;