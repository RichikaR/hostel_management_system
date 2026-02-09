import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentDashboard from "./pages/StudentDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import InfoPage from "./pages/InfoPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeData } from "./lib/storage";

const App = () => {
  useEffect(() => { initializeData(); }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/warden" element={<WardenDashboard />} />
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
