import { Star } from "lucide-react";

export default function Reviews() {
  const reviews = [
    {
      id: 1,
      rating: 5,
      title: "Highly Recommended!",
      text: "The team arrived on time and handled everything carefully. Booking was super easy through ZimbaMoves.",
      author: "Sarah M., Lusaka",
    },
    {
      id: 2,
      rating: 5,
      title: "A Wonderful Experience",
      text: "Helpers were friendly and efficient. My sofa was a nightmare to move, but they managed it without a scratch.",
      author: "John K., Kitwe",
    },
  ];

  return (
    <section className="bg-green-900 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-6xl sm:text-8xl font-bold text-green-800 opacity-20 select-none">
          Reviews
        </h2>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            What Our Customers Say
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-100 rounded-2xl p-6 shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {review.title}
              </h3>

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {review.text}
              </p>

              {/* Author */}
              <p className="text-sm text-gray-600 italic">{review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}