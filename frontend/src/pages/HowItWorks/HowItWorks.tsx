//import React from "react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      title: "Create an Account",
      description:
        "Sign up quickly using your email and start accessing all platform features.",
      icon: "👤",
    },
    {
      title: "Submit Your Details",
      description:
        "Provide the required personal or business information to get verified.",
      icon: "📄",
    },
    {
      title: "Find What You Need",
      description:
        "Search and browse through our network of providers and services.",
      icon: "🔍",
    },
    {
      title: "Connect & Get Started",
      description:
        "Reach out, book services, and manage your experience in one place.",
      icon: "🚀",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 py-16 px-4 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-gray-900 mb-6 text-center"
      >
        How It Works
      </motion.h1>

      {/* Intro Section */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="max-w-3xl text-center text-gray-700 text-lg leading-relaxed mb-12"
      >
        Detravellars RSA is your trusted partner for a smooth and affordable moving
        experience. Whether you're relocating your home, office, or simply need
        transportation for goods, our platform connects you with reliable, vetted,
        and professional moving service providers across South Africa. We simplify
        the moving process by helping you compare, enquire, and book with ease—
        ensuring a seamless journey from start to finish.
      </motion.p>

      {/* Steps Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mb-16">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center"
          >
            <div className="text-5xl mb-4">{step.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h2>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Detailed Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl bg-white p-8 rounded-2xl shadow-md leading-relaxed text-gray-700 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-900">What Detravellars RSA Offers</h2>
        <p>
          Our platform bridges the gap between customers who need reliable moving
          services and providers who offer professional transportation solutions.
          We ensure everything is transparent, simple, and user-friendly—giving you
          full control over your moving experience.
        </p>
        <p>
          Whether you're moving locally or long-distance, transporting a single
          item, or planning a full relocation, we help you find the right service
          provider that matches your needs and budget. You get access to vetted,
          approved providers who meet our quality standards.
        </p>
        <p>
          Providers on our platform undergo verification to ensure their
          professionalism, service quality, and reliability. This means you can
          book with confidence knowing that your belongings are in safe hands.
        </p>

        <h3 className="text-xl font-semibold text-gray-900">Why Choose Us?</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Fast and easy enquiries directly through WhatsApp.</li>
          <li>Verified and approved moving service providers.</li>
          <li>Transparent process with no hidden steps.</li>
          <li>Convenient platform accessible anytime.</li>
          <li>Designed to save you time, effort, and stress.</li>
        </ul>
      </motion.div>
    </div>
  );
}