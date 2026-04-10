import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

// Existing pages
import BugDetails from "./pages/BugDetails";
import Bugs from "./pages/Bugs";
import ChangePassword from "./pages/ChangePassword";
import CreateBug from "./pages/CreateBug";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Register from "./pages/Register";

import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

function ProtectedLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bugs" element={<Bugs />} />
        <Route path="/bugs/:id" element={<BugDetails />} />
        <Route path="/create-bug" element={<CreateBug />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
