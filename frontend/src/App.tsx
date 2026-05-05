import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import LandingPage from "./pages/landing/LandingPage";
import FarmLogin from "./pages/landing/FarmLogin";
import FarmSignup from "./pages/landing/FarmSignup";
import MAOLogin from "./pages/landing/MAOLogin";
import VetLogin from "./pages/landing/VetLogin";
import VetSignup from "./pages/landing/VetSignup";
import PAOLogin from "./pages/landing/PAOLogin";

import FarmDashboard from "./pages/farm/FarmDashboard";
import FarmRegistration from "./pages/farm/FarmRegistration";
import FarmDiseaseReport from "./pages/farm/FarmDiseaseReport";
import FarmMapView from "./pages/farm/FarmMapView";
import FarmPermits from "./pages/farm/FarmPermits";
import FarmProfile from "./pages/farm/FarmProfile";

import MAODashboard from "./pages/mao/MAODashboard";
import MAOFarms from "./pages/mao/MAOFarms";
import MAODiseases from "./pages/mao/MAODiseases";
import MAOMap from "./pages/mao/MAOMap";
import MAOPermits from "./pages/mao/MAOPermits";
import MAOPrescriptive from "./pages/mao/MAOPrescriptive";
import MAOReports from "./pages/mao/MAOReports";
import MAOTrainingData from "./pages/mao/MAOTrainingData";

import PAODashboard from "./pages/pao/PAODashboard";
import PAOSupply from "./pages/pao/PAOSupply";
import PAODiseases from "./pages/pao/PAODiseases";
import PAOMap from "./pages/pao/PAOMap";
import PAOReports from "./pages/pao/PAOReports";

import VetDashboard from "./pages/vet/VetDashboard";
import VetInspections from "./pages/vet/VetInspections";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isSignedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/farm-login" element={<FarmLogin />} />
      <Route path="/farm-signup" element={<FarmSignup />} />
      <Route path="/mao-login" element={<MAOLogin />} />
      <Route path="/vet-login" element={<VetLogin />} />
      <Route path="/vet-signup" element={<VetSignup />} />
      <Route path="/PAO-login" element={<PAOLogin />} />

      {/* Farm Owner */}
      <Route path="/farm" element={<ProtectedRoute><FarmDashboard /></ProtectedRoute>} />
      <Route path="/farm/register" element={<ProtectedRoute><FarmRegistration /></ProtectedRoute>} />
      <Route path="/farm/report" element={<ProtectedRoute><FarmDiseaseReport /></ProtectedRoute>} />
      <Route path="/farm/map" element={<ProtectedRoute><FarmMapView /></ProtectedRoute>} />
      <Route path="/farm/permits" element={<ProtectedRoute><FarmPermits /></ProtectedRoute>} />
      <Route path="/farm/profile" element={<ProtectedRoute><FarmProfile /></ProtectedRoute>} />

      {/* MAO */}
      <Route path="/mao" element={<ProtectedRoute><MAODashboard /></ProtectedRoute>} />
      <Route path="/mao/farms" element={<ProtectedRoute><MAOFarms /></ProtectedRoute>} />
      <Route path="/mao/diseases" element={<ProtectedRoute><MAODiseases /></ProtectedRoute>} />
      <Route path="/mao/map" element={<ProtectedRoute><MAOMap /></ProtectedRoute>} />
      <Route path="/mao/permits" element={<ProtectedRoute><MAOPermits /></ProtectedRoute>} />
      <Route path="/mao/prescriptive" element={<ProtectedRoute><MAOPrescriptive /></ProtectedRoute>} />
      <Route path="/mao/reports" element={<ProtectedRoute><MAOReports /></ProtectedRoute>} />
      <Route path="/mao/training-data" element={<ProtectedRoute><MAOTrainingData /></ProtectedRoute>} />

      {/* PAO */}
      <Route path="/pao" element={<ProtectedRoute><PAODashboard /></ProtectedRoute>} />
      <Route path="/pao/supply" element={<ProtectedRoute><PAOSupply /></ProtectedRoute>} />
      <Route path="/pao/diseases" element={<ProtectedRoute><PAODiseases /></ProtectedRoute>} />
      <Route path="/pao/map" element={<ProtectedRoute><PAOMap /></ProtectedRoute>} />
      <Route path="/pao/reports" element={<ProtectedRoute><PAOReports /></ProtectedRoute>} />

      {/* Veterinarian */}
      <Route path="/vet" element={<ProtectedRoute><VetDashboard /></ProtectedRoute>} />
      <Route path="/vet/inspections" element={<ProtectedRoute><VetInspections /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
