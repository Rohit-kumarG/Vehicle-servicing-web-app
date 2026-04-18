import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import GaragesPage from "./pages/GaragesPage";
import VehiclesPage from "./pages/VehiclesPage";
import BookingsPage from "./pages/BookingsPage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminPage from "./pages/AdminPage";
import GarageOwnerPage from "./pages/GarageOwnerPage";
import GarageBookingsPage from "./pages/GarageBookingsPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/garages" element={<GaragesPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/garage/profile" element={<GarageOwnerPage />} />
        <Route path="/garage/bookings" element={<GarageBookingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
