import { BrowserRouter, Routes, Route } from "react-router";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { LearnerDashboard } from "./pages/LearnerDashboard";
import { CoachDashboard } from "./pages/CoachDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/learner" element={<LearnerDashboard />} />
        <Route path="/dashboard/coach" element={<CoachDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}