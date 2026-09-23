import { Navigate, Route, Routes } from "react-router-dom";
import { HapticsFallback } from "./components/HapticsFallback";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Onboarding } from "./features/onboarding/Onboarding";
import { PlateView } from "./features/today/PlateView";
import { Profile } from "./features/profile/Profile";

export default function App() {
  return (
    <>
      <HapticsFallback />
      <Routes>
        {/* The dashboard is the front door. There is no onboarding gate. */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/plate/:hallId" element={<PlateView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
