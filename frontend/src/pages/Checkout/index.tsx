import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Calendar, MapPin, Truck, Users, CreditCard, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/axios";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const quoteData = location.state;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const bookingInProgress = useRef(false);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (!quoteData) {
      toast.error("No quote data found");
      navigate("/");
      return;
    }
  }, [user, quoteData, navigate]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // Combined mutation: Create booking + Initiate payment
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      // Prevent duplicate submissions
      if (bookingInProgress.current) {
        throw new Error("Booking already in progress");
      }

      bookingInProgress.current = true;

      try {
        // Step 1: Create the booking
        const bookingRes = await api.post("/bookings", bookingData);
        const booking = bookingRes.data;
        
        // Step 2: Initiate payment for this booking (Paystack only)
        const paymentRes = await api.post(
          `/payments/${booking.id}/pay?gateway=paystack`
        );
        
        return { booking, paymentData: paymentRes.data };
      } finally {
        // Reset flag after 3 seconds to allow retry if something goes wrong
        setTimeout(() => {
          bookingInProgress.current = false;
        }, 3000);
      }
    },
    onSuccess: ({ booking, paymentData }) => {
      toast.success("Booking created! Redirecting to payment...");
      
      // Redirect to Paystack payment
      if (paymentData.provider === 'paystack' && paymentData.authorizationUrl) {
        window.location.href = paymentData.authorizationUrl;
      } else {
        // Fallback: go to booking detail page
        navigate(`/bookings/${booking.id}`);
        bookingInProgress.current = false;
      }
    },
    onError: (err: any) => {
      bookingInProgress.current = false;
      const errorMsg = err.response?.data?.error || err.response?.data?.details || err.message || "Failed to create booking";
      toast.error(errorMsg);
      console.error("Booking/Payment Error:", err.response?.data);
    },
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingInProgress.current) {
      toast.error("Please wait, booking is being processed...");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    const dateTime = `${selectedDate}T${selectedTime}`;

    const bookingData = {
      providerId: quoteData.providerId,
      vehicleId: quoteData.vehicleId,
      pickup: quoteData.pickup,
      dropoff: quoteData.dropoff,
      moveType: quoteData.moveType,
      dateTime: new Date(dateTime).toISOString(),
      helpersRequired: quoteData.helpersNeeded || 0,
      helpersProvidedBy: quoteData.provider?.includeHelpers ? "PROVIDER" : "CUSTOMER",
      pricing: {
        total: quoteData.instantEstimate,
        baseRate: quoteData.provider?.vehicles?.find((v: any) => v.id === quoteData.vehicleId)?.baseRate || 0,
        perKmRate: quoteData.provider?.vehicles?.find((v: any) => v.id === quoteData.vehicleId)?.perKmRate || 0,
        loadFee: quoteData.provider?.vehicles?.find((v: any) => v.id === quoteData.vehicleId)?.loadFee || 0,
        distance: quoteData.estimatedDistance,
        distanceCost: (quoteData.estimatedDistance || 0) * (quoteData.provider?.vehicles?.find((v: any) => v.id === quoteData.vehicleId)?.perKmRate || 0),
        helpersCost: 0, // Helpers included at no cost
        moveType: quoteData.moveType,
        paymentMethod: "paystack"
      },
    };

    bookingMutation.mutate(bookingData);
  };

  if (!quoteData) {
    return null;
  }

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow;

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selected >= minDate) {
      setSelectedDate(selected.toISOString().split('T')[0]);
      setShowCalendar(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < minDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selected.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  // Generate time slots (30-minute intervals from 7 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeSlots.push({ value: timeString, label: displayTime });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Complete Your Booking</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Moving Details Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-600" />
                Moving Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-800">{quoteData.pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-500">Dropoff</p>
                    <p className="font-medium text-gray-800">{quoteData.dropoff}</p>
                  </div>
                </div>

                <div className="pt-3 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    <p className="font-medium text-gray-800">{quoteData.estimatedDistance} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Move Type</p>
                    <p className="font-medium text-gray-800 capitalize">
                      {quoteData.moveType.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                </div>

                {quoteData.helpersNeeded > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {quoteData.helpersNeeded} helper{quoteData.helpersNeeded > 1 ? 's' : ''} included at no extra charge
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                Schedule Your Move
              </h2>

              <form onSubmit={handleCheckout}>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Date Picker with Calendar Popup */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 text-left bg-white hover:bg-gray-50 transition"
                      >
                        {formatDisplayDate(selectedDate)}
                      </button>

                      {/* Calendar Popup */}
                      {showCalendar && (
                        <div
                          ref={calendarRef}
                          className="absolute z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80"
                        >
                          {/* Calendar Header */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={goToPreviousMonth}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <div className="font-semibold text-gray-800">
                              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            <button
                              type="button"
                              onClick={goToNextMonth}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>

                          {/* Weekday Headers */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                              <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                              const day = i + 1;
                              const disabled = isDateDisabled(day);
                              const selected = isSelectedDate(day);
                              const today = isToday(day);

                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => !disabled && handleDateSelect(day)}
                                  disabled={disabled}
                                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                    disabled
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : selected
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : today
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>

                          {/* Close button */}
                          <button
                            type="button"
                            onClick={() => setShowCalendar(false)}
                            className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 24 hours in advance
                    </p>
                  </div>

                  {/* Time Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 appearance-none bg-white"
                        required
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Available: 7:00 AM - 6:30 PM
                    </p>
                  </div>
                </div>

                {/* Payment Method - Paystack Only */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Gateway
                  </label>

                  <div className="border-2 border-green-600 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Paystack</p>
                        <p className="text-sm text-gray-600">Card, Bank Transfer, USSD</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="/terms" className="text-green-600 hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and understand that this booking is subject to provider confirmation
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={bookingMutation.isPending || !agreedToTerms || bookingInProgress.current}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingMutation.isPending || bookingInProgress.current ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Pay R{quoteData.instantEstimate.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              {/* Provider Info */}
              {quoteData.provider && (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {quoteData.provider.user.firstName?.[0]?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {`${quoteData.provider.user.firstName} ${quoteData.provider.user.lastName}` || "Moving Company"}
                      </p>
                      <p className="text-sm text-gray-600">{quoteData.provider.city}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-green-700">
                    R{quoteData.instantEstimate.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Final price may vary based on actual conditions
                </p>
                
                {quoteData.helpersNeeded > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {quoteData.helpersNeeded} helper{quoteData.helpersNeeded > 1 ? 's' : ''} included at no extra cost
                    </p>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Secure Booking</span>
                </div>
                <p className="text-xs text-green-700">
                  Your payment is protected. Full refund if provider cancels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}