import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../components/layouts/MainLayout";

import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import Home from "../pages/Home";
import Contact from "../pages/Contact/Contact";
import QuoteRequest from "../pages/QuoteRequest";
import Checkout from "../pages/Checkout";
import PaymentStatusPage from "../pages/PaymentStatus";
import PaymentSuccess from "../pages/Payment/PaymentSuccess";
import BookingHistory from "../pages/Bookings";
import BookingDetail from "../pages/Bookings/BookingDetail";
import ComplaintForm from "../pages/Complaint";
import ProviderPage from "../pages/Provider/ProviderPage";
import ProtectedProviderRoute from "../components/ProtectedProviderRoute";
import ProviderBookings from "../pages/Provider/Bookings";
import Vehicles from "../pages/Provider/Vehicles";
import Earnings from "../pages/Provider/Earnings";
import ProviderApplicationForm from "../components/ProviderProfileForm/ProviderProfileForm";
import PendingApproval from "../pages/Provider/PendingApproval";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminUsers from "../pages/Admin/Users";
import AdminProviders from "../pages/Admin/Providers";
import AdminBookings from "../pages/Admin/Bookings";
import AdminPayments from "../pages/Admin/Payments";
import AdminComplaints from "../pages/Admin/Complaints";
import AdminApplications from "../pages/Admin/Applications";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import SearchResults from "../pages/Search/SearchResults";
import ProviderDetail from "../pages/ProviderDetail/index";
import ProviderProfile from "../pages/Provider/ProviderProfile";
import AdminAnalytics from "../pages/Admin/Analytics";
import About from "../pages/About/index";
import AuthCallback from "../pages/Auth/AuthCallback";
import BookingDetails from "@/pages/Provider/BookingDetails";
import ProviderOverview from "@/pages/Provider/ProviderOverview";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />
        <Route path="/complaint" element={<ComplaintForm />} />

        {/* Protected routes that require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/quote-request" element={<QuoteRequest />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route path="/bookings" element={<BookingHistory />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
        </Route>

        {/* Provider Application Routes - For PENDING providers */}
        <Route element={<ProtectedRoute allowedRoles={["PROVIDER"]} />}>
          <Route path="/provider/apply" element={<ProviderApplicationForm />} />
          <Route path="/provider/pending" element={<PendingApproval />} />
        </Route>

        {/* Provider Routes - Only for APPROVED providers */}
        <Route
          path="/provider"
          element={
            <ProtectedProviderRoute>
              <ProviderPage />
            </ProtectedProviderRoute>
          }
        >
          {/* Changed: Now shows overview instead of redirecting to bookings */}
          <Route index element={<ProviderOverview />} />
          <Route path="bookings" element={<ProviderBookings />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="profile" element={<ProviderProfile />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
