import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-sage/20 mt-auto" style={{ backgroundColor: '#975635' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Column */}
          <div>
            <h3 className="font-medium text-lg mb-4" style={{ color: '#f9f5f0' }}>Contact</h3>
            <div className="space-y-2" style={{ color: '#f9f5f0' }}>
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
            <h3 className="font-medium text-lg mb-4" style={{ color: '#f9f5f0' }}>Our Accommodations</h3>
            <div className="space-y-2">
              <Link 
                to="/rooms/garden-room" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Garden Room Sanctuary
              </Link>
              <Link 
                to="/rooms/stone-vault-apartment" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Historic Stone Vault
              </Link>
              <Link 
                to="/rooms/terrace-apartment" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Panoramic Terrace
              </Link>
              <Link 
                to="/rooms/modern-apartment" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Contemporary Luxury
              </Link>
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-medium text-lg mb-4" style={{ color: '#f9f5f0' }}>Information</h3>
            <div className="space-y-2">
              <Link 
                to="/about" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Contact
              </Link>
              <a 
                href="#" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="block hover:underline transition-colors"
                style={{ color: '#f9f5f0' }}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <p className="text-center text-sm" style={{ color: '#f9f5f0' }}>
            © 2024 Assisi B&B - All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;