import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/authContext";
import { ThemeProvider } from "./services/themeContext";

import Chatbot from "./pages/Chatbot";
import UserManagement from "./pages/UserManagement";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import DailyForecast from "./pages/dashboards/DailyForecast";
import HourlyForecast from "./pages/dashboards/HourlyForecast";
import Home from "./pages/dashboards/Home";
import axios from "axios";

// ✅ Define type for a single meter reading
export interface MeterReading {
  FR: number;
  FV: number;
  LocalTimeCol: string;
  MeterCode: string;
  NetTotal: number;
  [key: string]: any; // allows extra unknown fields
}





const App: React.FC = () => {


  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<MeterReading[] | null>(null);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);



  // ✅ Fetch last processed data every 30 sec + initial load
  useEffect(() => {
    const fetchLastProcessed = () => {
      axios.get<MeterReading[]>('http://localhost:5000/api/last_processed')
        .then(res => {
          setTableData(res.data);
        })
        .catch(err => console.error(err));
    };

    fetchLastProcessed();
    const interval = setInterval(fetchLastProcessed, 30000);
    return () => clearInterval(interval);
  }, []);



  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard/home" replace />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/dashboard/daily"
                  element={
                    <DailyForecast />
                  }
                />

                <Route
                  path="/dashboard/hourly"
                  element={
                    <HourlyForecast />
                  }
                />

                <Route
                  path="/dashboard/home"
                  element={
                    <Home
                      tableData={tableData ?? []}
                    />
                  }
                />

                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute requiredRoles={["analyst", "admin"]}>
                      <Chatbot />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRoles={["admin"]}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
