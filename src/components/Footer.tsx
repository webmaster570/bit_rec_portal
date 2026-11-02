import React from 'react';
import { Building2, Mail, Phone, MapPin, Globe, Facebook, Twitter, Linkedin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#142D4E] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Institute Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1 rounded shadow-sm">
                <Building2 className="w-8 h-8 text-[#142D4E]" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">BIT Mesra</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Birla Institute of Technology, Mesra, established in 1955, is a premier technical institution committed to academic excellence and research innovation.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="p-2 bg-white/5 hover:bg-[#A77B32] rounded-full transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-[#A77B32] rounded-full transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-[#A77B32] rounded-full transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#A77B32] mb-6">Recruitment Links</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">Current Openings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How to Apply</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Eligibility Criteria</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Important Dates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#A77B32] mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#A77B32]" />
                <span>Mesra, Ranchi, Jharkhand <br />PIN: 835215, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#A77B32]" />
                <span>+91 651 2275444 / 2275896</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#A77B32]" />
                <span>recruitment@bitmesra.ac.in</span>
              </li>
            </ul>
          </div>

          {/* Official Website */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#A77B32] mb-6">Main Portal</h4>
            <div className="bg-white/5 p-6 rounded-lg space-y-4">
              <p className="text-xs text-white/50 italic">For general university information, please visit our official website.</p>
              <a 
                href="https://www.bitmesra.ac.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2 bg-white text-[#142D4E] font-bold text-xs rounded hover:bg-slate-100 transition"
              >
                <span>bitmesra.ac.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs text-white/40 font-medium">
          <div className="flex flex-wrap justify-center gap-6">
            <span>© {currentYear} Birla Institute of Technology, Mesra. All Rights Reserved.</span>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
          <div className="flex items-center space-x-1">
             <span>Developed by</span>
             <span className="text-white/60">Recruitment Systems Division, BIT Mesra</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
