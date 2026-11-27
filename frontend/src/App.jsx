import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, getRoleDashboard } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import CourseManagementPage from "./pages/admin/CourseManagementPage";
import EnrollmentPage from "./pages/admin/EnrollmentPage";
import AlumniActivationPage from "./pages/admin/AlumniActivationPage";
import AnnouncementsPage from "./pages/admin/AnnouncementsPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAcademicsPage from "./pages/student/StudentAcademicsPage";
import StudentAssessmentsPage from "./pages/student/StudentAssessmentsPage";
import StudentSkillsPage from "./pages/student/StudentSkillsPage";
import StudentProjectsPage from "./pages/student/StudentProjectsPage";
import StudentPlacementsPage from "./pages/student/StudentPlacementsPage";
import StudentProfilePage from "./pages/student/StudentProfilePage";

// Trainer Pages
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import TrainerBatchesPage from "./pages/trainer/TrainerBatchesPage";
import TrainerAssessmentsPage from "./pages/trainer/TrainerAssessmentsPage";
import TrainerEvaluationsPage from "./pages/trainer/TrainerEvaluationsPage";
import TrainerStudentsPage from "./pages/trainer/TrainerStudentsPage";

// Placement Pages
import PlacementDashboard from "./pages/placement/PlacementDashboard";
import CompanyManagementPage from "./pages/placement/CompanyManagementPage";
import VacancyManagementPage from "./pages/placement/VacancyManagementPage";
import ApplicationsManagementPage from "./pages/placement/ApplicationsManagementPage";
import PlacementInterviewsPage from "./pages/placement/PlacementInterviewsPage";
import PlacementRecordsPage from "./pages/placement/PlacementRecordsPage";

// Alumni Pages
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfilePage from "./pages/alumni/AlumniProfilePage";
import AlumniMilestonesPage from "./pages/alumni/AlumniMilestonesPage";
import AlumniMentorshipPage from "./pages/alumni/AlumniMentorshipPage";
import AlumniNetworkDirectoryPage from "./pages/alumni/AlumniNetworkDirectoryPage";
import AlumniEventsPage from "./pages/alumni/AlumniEventsPage";
import AlumniHistoryPage from "./pages/alumni/AlumniHistoryPage";

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && user) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }
  return <LandingPage />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserManagementPage /></ProtectedRoute>} />
              <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CourseManagementPage defaultTab="courses" /></ProtectedRoute>} />
              <Route path="/admin/batches" element={<ProtectedRoute allowedRoles={["ADMIN"]}><CourseManagementPage defaultTab="batches" /></ProtectedRoute>} />
              <Route path="/admin/enrollments" element={<ProtectedRoute allowedRoles={["ADMIN"]}><EnrollmentPage /></ProtectedRoute>} />
              <Route path="/admin/alumni-activation" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AlumniActivationPage /></ProtectedRoute>} />
              <Route path="/admin/placements" element={<ProtectedRoute allowedRoles={["ADMIN"]}><PlacementDashboard /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AnnouncementsPage /></ProtectedRoute>} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/academics" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAcademicsPage /></ProtectedRoute>} />
              <Route path="/student/assessments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAssessmentsPage /></ProtectedRoute>} />
              <Route path="/student/skills" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentSkillsPage /></ProtectedRoute>} />
              <Route path="/student/projects" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentProjectsPage /></ProtectedRoute>} />
              <Route path="/student/placements" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentPlacementsPage /></ProtectedRoute>} />
              <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentProfilePage /></ProtectedRoute>} />

              {/* Trainer Routes */}
              <Route path="/trainer/dashboard" element={<ProtectedRoute allowedRoles={["TRAINER"]}><TrainerDashboard /></ProtectedRoute>} />
              <Route path="/trainer/batches" element={<ProtectedRoute allowedRoles={["TRAINER"]}><TrainerBatchesPage /></ProtectedRoute>} />
              <Route path="/trainer/curriculum" element={<ProtectedRoute allowedRoles={["TRAINER"]}><CourseManagementPage defaultTab="courses" /></ProtectedRoute>} />
              <Route path="/trainer/assessments" element={<ProtectedRoute allowedRoles={["TRAINER"]}><TrainerAssessmentsPage /></ProtectedRoute>} />
              <Route path="/trainer/evaluations" element={<ProtectedRoute allowedRoles={["TRAINER"]}><TrainerEvaluationsPage /></ProtectedRoute>} />
              <Route path="/trainer/students" element={<ProtectedRoute allowedRoles={["TRAINER"]}><TrainerStudentsPage /></ProtectedRoute>} />

              {/* Placement Officer Routes */}
              <Route path="/placement/dashboard" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><PlacementDashboard /></ProtectedRoute>} />
              <Route path="/placement/companies" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><CompanyManagementPage /></ProtectedRoute>} />
              <Route path="/placement/vacancies" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><VacancyManagementPage /></ProtectedRoute>} />
              <Route path="/placement/applications" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><ApplicationsManagementPage /></ProtectedRoute>} />
              <Route path="/placement/interviews" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><PlacementInterviewsPage /></ProtectedRoute>} />
              <Route path="/placement/records" element={<ProtectedRoute allowedRoles={["PLACEMENT"]}><PlacementRecordsPage /></ProtectedRoute>} />

              {/* Alumni Routes */}
              <Route path="/alumni/dashboard" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniDashboard /></ProtectedRoute>} />
              <Route path="/alumni/profile" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniProfilePage /></ProtectedRoute>} />
              <Route path="/alumni/milestones" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniMilestonesPage /></ProtectedRoute>} />
              <Route path="/alumni/mentorship" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniMentorshipPage /></ProtectedRoute>} />
              <Route path="/alumni/network" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniNetworkDirectoryPage /></ProtectedRoute>} />
              <Route path="/alumni/events" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniEventsPage /></ProtectedRoute>} />
              <Route path="/alumni/history" element={<ProtectedRoute allowedRoles={["ALUMNI"]}><AlumniHistoryPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
