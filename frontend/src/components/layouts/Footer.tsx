import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Call from "../../assets/call.svg";
import Location from "../../assets/location_on.svg";
import Mail from "../../assets/mail.svg";

const FooterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:border-none">
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 sm:py-0 sm:cursor-default 
                   text-gray-600 font-semibold text-base sm:text-lg transition-colors"
      >
        {title}
        <ChevronDown
          className={`w-5 h-5 text-gray-700 transition-transform sm:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out sm:block ${
          open ? "max-h-96" : "max-h-0 sm:max-h-none"
        }`}
      >
        <div className="sm:mt-2 text-sm text-gray-600 sm:space-y-2 pb-4 sm:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200 overflow-hidden">
      {/* TOP SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Brand */}
        <div>
          <Link to='/' className="text-xl font-bold text-gray-900">
            Detravellers<span className="text-green-600"> RSA</span>
          </Link>
          <p className="italic text-sm mt-1 text-gray-500">Moving Made Simple</p>
          <p className="text-sm mt-3 text-gray-600 leading-relaxed">
            Detravellers is a marketplace connecting customers with trusted movers
            and helpers across South Africa. Transparent quotes, verified providers,
            stress-free moves.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Quick Links */}
        <FooterSection title="Quick Links">
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-green-600">Home</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-green-600">How It Works</Link></li>
            <li><Link to="/providers" className="hover:text-green-600">For Providers</Link></li>
            <li><Link to="/search" className="hover:text-green-600">Request A Quote</Link></li>
            <li><Link to="/signup" className="hover:text-green-600">Sign Up / Login</Link></li>
            <li><Link to="/support" className="hover:text-green-600">Contact Us</Link></li>
          </ul>
        </FooterSection>

        {/* Contact */}
        <FooterSection title="Contact">
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <img src={Location} alt="location" className="h-5 w-auto" />
              <span>22 montrose avenue, Northgate 
                      Randburg 
                      1700</span>
            </li>
            <li className="flex items-center gap-2">
              <img src={Mail} alt="mail" className="h-5 w-auto" />
              <a
                href="mailto:Zimbafx97@gmail.com"
                className="hover:text-green-600"
              >
               Zimbafx97@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <img src={Call} alt="phone" className="fill-#494949 h-5 w-auto" />
              <a href="tel:0795750433" className="hover:text-green-600">
                079 575 0433
              </a>
            </li>
          </ul>
        </FooterSection>
      </div>

      {/* COPYRIGHT BAR */}
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Detravellers RSA. All Rights Reserved | Secure Payments | Verified Providers
      </div>
    </footer>
  );
}
