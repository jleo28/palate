import { Navigate, Route, Routes } from "react-router-dom";
import { useProfile } from "./context/ProfileContext";
import { Welcome } from "./features/onboarding/Welcome";
import { Onboarding } from "./features/onboarding/Onboarding";
import { Today } from "./features/today/Today";
import { Profile } from "./features/profile/Profile";

export default function App() {
  const { isOnboarded } = useProfile();

  return (
    <Routes>
      <Route path="/" element={isOnboarded ? <Navigate to="/today" replace /> : <Welcome />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/today"
        element={isOnboarded ? <Today /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={isOnboarded ? <Profile /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
