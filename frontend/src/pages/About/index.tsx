import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-white py-16 px-6 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-700 mb-4">
            About ZimbaMoves
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            ZimbaMoves is transforming how people move homes, offices, and goods
            across South Africa. We connect you with trusted, verified movers
            who deliver reliability, safety, and transparency every time.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-green-700 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our mission is simple — to make moving easy, transparent, and
              stress-free. Whether you’re relocating your apartment, your
              business, or just need a single item transported, ZimbaMoves helps
              you find the perfect mover at the right price.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We empower local providers with tools to manage bookings,
              payments, and customers efficiently — helping small businesses
              grow while giving customers peace of mind.
            </p>
          </div>
          <div>
            <img
              src="https://i.postimg.cc/W40Frtgf/hiveboxx-Ooi-Wpd-FC0-Rw-unsplash.jpg"
              alt="ZimbaMoves Team"
              className="rounded-xl shadow-sm w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-green-700 text-white py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
            How ZimbaMoves Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "1. Search",
                desc: "Enter your move details and compare trusted movers in seconds.",
              },
              {
                title: "2. Book",
                desc: "Choose a provider that fits your budget and schedule instantly.",
              },
              {
                title: "3. Move",
                desc: "Sit back as verified movers handle your move safely and efficiently.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-green-600/20 p-6 rounded-xl shadow-sm backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-green-100 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-700">
            Our Core Values
          </h2>
          <p className="text-gray-600 mt-3">
            Everything we do is built on three pillars: Trust, Safety, and
            Transparency.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: "🤝",
              title: "Trust",
              desc: "All our providers are verified, rated, and reviewed — so you know who you’re hiring.",
            },
            {
              icon: "🛡️",
              title: "Safety",
              desc: "From secure payments to professional handling, your items are protected every step of the way.",
            },
            {
              icon: "💬",
              title: "Transparency",
              desc: "Clear pricing, real-time tracking, and no hidden costs. Ever.",
            },
          ].map((value, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">{value.icon}</div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-700 py-16 text-center text-white px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
          <p className="text-green-100 mb-6">
            Whether you're looking for reliable movers or want to grow your
            moving business — ZimbaMoves is where you belong.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/provider"
              className="bg-white text-green-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
            >
              Become a Provider
            </Link>
            <Link
              to="/"
              className="border border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition"
            >
              Book a Move
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
