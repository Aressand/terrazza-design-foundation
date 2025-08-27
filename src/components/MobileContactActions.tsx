import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileContactActions = () => {
  const handlePhoneCall = () => {
    window.location.href = "tel:+390755551234";
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in booking a room at Terrazza Santa Chiara B&B");
    window.open(`https://wa.me/390755551234?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Booking Inquiry - Terrazza Santa Chiara B&B");
    const body = encodeURIComponent("Hello,\n\nI would like to inquire about availability and pricing for your rooms.\n\nBest regards");
    window.location.href = `mailto:info@terrazzasantachiara.com?subject=${subject}&body=${body}`;
  };

  const handleDirections = () => {
    const address = encodeURIComponent("Via Sermei, 06081 Assisi PG, Italy");
    // Try to open Google Maps app first, fallback to web
    const googleMapsApp = `https://maps.google.com/?q=${address}`;
    const appleMapsApp = `https://maps.apple.com/?address=${address}`;
    
    // Detect iOS for Apple Maps
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(appleMapsApp, '_blank');
    } else {
      window.open(googleMapsApp, '_blank');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border p-4 z-50 md:hidden">
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePhoneCall}
          className="flex flex-col items-center p-2 h-auto min-h-[56px] gap-1 hover:bg-sage hover:text-white transition-colors"
          aria-label="Call us"
        >
          <Phone size={16} />
          <span className="text-xs">Call</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsApp}
          className="flex flex-col items-center p-2 h-auto min-h-[56px] gap-1 hover:bg-green-600 hover:text-white transition-colors"
          aria-label="WhatsApp us"
        >
          <MessageCircle size={16} />
          <span className="text-xs">WhatsApp</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleEmail}
          className="flex flex-col items-center p-2 h-auto min-h-[56px] gap-1 hover:bg-terracotta hover:text-white transition-colors"
          aria-label="Email us"
        >
          <Mail size={16} />
          <span className="text-xs">Email</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDirections}
          className="flex flex-col items-center p-2 h-auto min-h-[56px] gap-1 hover:bg-blue-600 hover:text-white transition-colors"
          aria-label="Get directions"
        >
          <MapPin size={16} />
          <span className="text-xs">Directions</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileContactActions;