import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-sage-light border-t border-sage/20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Column */}
          <div>
            <h3 className="text-stone-dark font-medium text-lg mb-4">Contact</h3>
            <div className="space-y-2 text-stone-dark/80">
              <p className="flex items-center gap-2">
                <span>📍</span>
                Assisi, Italy
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span>
                +39 XXX XXX XXXX
              </p>
              <p className="flex items-center gap-2">
                <span>✉️</span>
                info@assisibnb.com
              </p>
            </div>
          </div>

          {/* Rooms Column */}
          <div>
            <h3 className="text-stone-dark font-medium text-lg mb-4">Our Accommodations</h3>
            <div className="space-y-2">
              <Link 
                to="/rooms/garden-room" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Garden Room Sanctuary
              </Link>
              <Link 
                to="/rooms/stone-vault-apartment" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Historic Stone Vault
              </Link>
              <Link 
                to="/rooms/terrace-apartment" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Panoramic Terrace
              </Link>
              <Link 
                to="/rooms/modern-apartment" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Contemporary Luxury
              </Link>
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-stone-dark font-medium text-lg mb-4">Information</h3>
            <div className="space-y-2">
              <Link 
                to="/about" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Contact
              </Link>
              <a 
                href="#" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="block text-stone-dark/80 hover:text-stone-dark hover:underline transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 pt-8 border-t border-sage/20">
          <p className="text-center text-stone-dark/60 text-sm">
            © 2024 Assisi B&B - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;