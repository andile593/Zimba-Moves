import { forwardRef } from "react";
import { FileText, Scale, Users, Truck } from "lucide-react";

const HowItWorks = forwardRef<HTMLDivElement>((_, ref) => {
  const steps = [
    {
      id: 1,
      icon: FileText,
      title: "Tell Us About Your Move",
      description: "Enter your location, date, and what you need moved. Takes less than a minute.",
    },
    {
      id: 2,
      icon: Scale,
      title: "Get Offers from Verified Movers",
      description: "Instantly see available providers, reviews, and transparent pricing. Pick the one that fits your budget and timeline.",
    },
    {
      id: 3,
      icon: Users,
      title: "Choose Your Team",
      description: "Pick the right vehicle and helpers for your move — based on budget, rating, and availability.",
    },
    {
      id: 4,
      icon: Truck,
      title: "Secure Your Move",
      description: "Pay safely online. Your mover shows up on time — no surprises, no hidden fees.",
    },
  ];

  return (
    <section ref={ref} id="how-it-works" className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">
            Book Your Move in 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-700" />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8 italic">
          *Every provider is background-checked and reviewed by real customers.
        </p>
      </div>
    </section>
  );
});

export default HowItWorks;
