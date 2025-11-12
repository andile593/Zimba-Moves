import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.svg";
import { Menu, X, MessageCircle, LayoutDashboard } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

type ButtonConfig = {
  label: string;
  to?: string;
  anchor?: string;
  onClick?: () => void;
  type: "primary" | "secondary" | "whatsapp" | "dashboard";
  icon?: React.ReactNode;
};

type NavLink = {
  label: string;
  to: string;
  anchor?: string;
  requiresAuth?: boolean;
  allowedRoles?: string[];
  requiresApprovedProvider?: boolean;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useContext(AuthContext);
  const isAuthenticated = !!auth?.user;
  const userRole = auth?.user?.role;
  const providerStatus = auth?.user?.providerStatus;
  const logout = auth?.logout;
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleNavClick = (to: string, anchorId?: string) => {
    if (window.location.pathname !== to) {
      navigate(to, { state: { scrollTo: anchorId } });
    } else if (anchorId) {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(to);
    }
    if (isOpen) toggleMenu();
  };

  const sendWhatsAppMessage = () => {
    const phoneNumber = "27795750433"; 

    const message = `Hi Detravellers RSA! 

I would like to request a quote for moving services.

Could you please contact me as soon as you get this message? I'd love to discuss my moving requirements.

Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, "_blank");

    if (isOpen) toggleMenu();
  };

  const navLinks: NavLink[] = [
    { label: "Home", to: "/" },
    { label: "How it works", to: "/", anchor: "how-it-works" },
    {
      label: "For providers",
      to: "/provider",
      requiresAuth: true,
      allowedRoles: ["PROVIDER"],
      requiresApprovedProvider: true,
    },
    {
      label: "My Bookings",
      to: "/bookings",
      requiresAuth: true,
      allowedRoles: ["CUSTOMER"],
    },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/support" },
  ];

  // Filter nav links based on auth, role, and provider status
  const filteredNavLinks = navLinks.filter((link) => {
    // If link doesn't require auth, show it
    if (!link.requiresAuth) return true;

    // If link requires auth, check if user is authenticated
    if (!isAuthenticated) return false;

    // If link has role restrictions, check user role
    if (link.allowedRoles && link.allowedRoles.length > 0) {
      const hasRole = link.allowedRoles.includes(userRole || "");
      if (!hasRole) return false;
    }

    // Check provider status correctly
    if (link.requiresApprovedProvider && userRole === "PROVIDER") {
      // Only show if provider is approved
      return providerStatus === "APPROVED";
    }

    return true;
  });

  const authButtons: ButtonConfig[] = isAuthenticated
    ? [
        // Show Dashboard for ADMIN, Get Quote for others
        ...(userRole === "ADMIN"
          ? [
              {
                label: "Dashboard",
                to: "/admin",
                type: "dashboard" as const,
                icon: <LayoutDashboard className="w-4 h-4" />,
              },
            ]
          : [
              {
                label: "Get Quote",
                onClick: sendWhatsAppMessage,
                type: "whatsapp" as const,
                icon: <MessageCircle className="w-4 h-4" />,
              },
            ]),
        { label: "Logout", onClick: () => logout?.(), type: "secondary" },
      ]
    : [
        { label: "Login", to: "/login", type: "secondary" },
        { label: "Sign Up", to: "/signup", type: "primary" },
      ];

  const renderButton = (btn: ButtonConfig) => {
    const baseClasses =
      "px-5 py-2 rounded-md transition-all w-auto text-center flex items-center justify-center gap-2";
    const primary =
      "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg";
    const secondary =
      "border border-green-600 text-green-600 hover:bg-green-50";
    const whatsapp =
      "bg-[#00a63e] text-white hover:bg-[#20BA5A] shadow-md hover:shadow-lg";
    const dashboard =
      "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg";

    const getButtonStyle = () => {
      if (btn.type === "whatsapp") return whatsapp;
      if (btn.type === "dashboard") return dashboard;
      if (btn.type === "primary") return primary;
      return secondary;
    };

    if (btn.onClick) {
      return (
        <button
          key={btn.label}
          onClick={() => {
            btn.onClick?.();
            if (isOpen) toggleMenu();
          }}
          className={`${baseClasses} ${getButtonStyle()}`}
        >
          {btn.icon}
          {btn.label}
        </button>
      );
    }

    return (
      <button
        key={btn.label}
        onClick={() => handleNavClick(btn.to!, btn.anchor)}
        className={`${baseClasses} ${getButtonStyle()}`}
      >
        {btn.icon}
        {btn.label}
      </button>
    );
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="ml-4 text-2xl font-bold text-gray-900">
        Detravellars<span className="text-green-600"> RSA</span>
      </Link>

      {/* Desktop NavLinks */}
      <div className="hidden md:flex items-center gap-8 text-gray-700 text-sm font-medium">
        {filteredNavLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => handleNavClick(link.to, link.anchor)}
            className="hover:text-green-600 transition-colors"
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-3">
        {authButtons.map(renderButton)}
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-gray-700 focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 flex flex-col p-6`}
      >
        <div className="flex justify-between items-center mb-6">
          <img src={Logo} alt="Logo" className="h-8" />
          <button onClick={toggleMenu} className="text-gray-700">
            <X size={26} />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col space-y-5 text-gray-700 font-medium mb-10">
          {filteredNavLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.to, link.anchor)}
              className="hover:text-green-600 transition-colors text-left"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col space-y-4">
          {authButtons.map(renderButton)}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
        />
      )}
    </nav>
  );
}