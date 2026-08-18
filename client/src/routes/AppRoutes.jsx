import {
  Route,
  Routes,
} from "react-router-dom";

import HomePage from "../pages/public/HomePage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import NotFoundPage from "../pages/NotFoundPage";

import StudentLayout from "../layouts/StudentLayout";

import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import QuizListPage from "../pages/student/QuizListPage";
import QuizDetailsPage from "../pages/student/QuizDetailsPage";
import QuizAttemptPage from "../pages/student/QuizAttemptPage";
import QuizResultPage from "../pages/student/QuizResultPage";
import AttemptHistoryPage from "../pages/student/AttemptHistoryPage";
import LeaderboardPage from "../pages/student/LeaderboardPage";
import StudentProgressPage from "../pages/student/StudentProgressPage";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import StudentOnboardingPage from "../pages/student/StudentOnboardingPage";
import StudentProfileEditPage from "../pages/student/StudentProfileEditPage";

import CertificatesPage from "../pages/student/CertificatesPage";
import CertificateDetailsPage from "../pages/student/CertificateDetailsPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminQuizzesPage from "../pages/admin/AdminQuizzesPage";
import AdminQuizFormPage from "../pages/admin/AdminQuizFormPage";
import AdminQuizDetailsPage from "../pages/admin/AdminQuizDetailsPage";
import AdminQuestionsPage from "../pages/admin/AdminQuestionsPage";
import AdminStudentsPage from "../pages/admin/AdminStudentsPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* ===================================================
          PUBLIC ROUTES
      =================================================== */}

      <Route
        path="/"
        element={
          <HomePage />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          <RegisterPage />
        }
      />

      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordPage />
        }
      />

      <Route
        path="/reset-password"
        element={
          <ResetPasswordPage />
        }
      />

      {/* ===================================================
          STUDENT ROUTES
      =================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "STUDENT",
            ]}
          />
        }
      >
        <Route
          element={
            <StudentLayout />
          }
        >
          <Route
            path="/student/dashboard"
            element={
              <StudentDashboardPage />
            }
          />

          <Route
            path="/student/onboarding"
            element={
              <StudentOnboardingPage />
            }
          />

          <Route
            path="/student/quizzes"
            element={
              <QuizListPage />
            }
          />

          <Route
            path="/student/quizzes/:id"
            element={
              <QuizDetailsPage />
            }
          />

          <Route
            path="/student/attempt/:id"
            element={
              <QuizAttemptPage />
            }
          />

          <Route
            path="/student/results/:id"
            element={
              <QuizResultPage />
            }
          />

          <Route
            path="/student/attempts"
            element={
              <AttemptHistoryPage />
            }
          />

          <Route
            path="/student/progress"
            element={
              <StudentProgressPage />
            }
          />

          <Route
            path="/student/leaderboard"
            element={
              <LeaderboardPage />
            }
          />

          <Route
            path="/student/certificates"
            element={
              <CertificatesPage />
            }
          />

          <Route
            path="/student/certificates/:id"
            element={
              <CertificateDetailsPage />
            }
          />

          <Route
            path="/student/profile"
            element={
              <StudentProfilePage />
            }
          />

          <Route
            path="/student/profile/edit"
            element={
              <StudentProfileEditPage />
            }
          />
        </Route>
      </Route>

      {/* ===================================================
          ADMIN ROUTES
      =================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "ADMIN",
            ]}
          />
        }
      >
        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboardPage />
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AdminCategoriesPage />
          }
        />

        <Route
          path="/admin/quizzes"
          element={
            <AdminQuizzesPage />
          }
        />

        <Route
          path="/admin/quizzes/new"
          element={
            <AdminQuizFormPage />
          }
        />

        <Route
          path="/admin/quizzes/:id"
          element={
            <AdminQuizDetailsPage />
          }
        />

        <Route
          path="/admin/quizzes/:id/edit"
          element={
            <AdminQuizFormPage />
          }
        />

        <Route
          path="/admin/quizzes/:quizId/questions"
          element={
            <AdminQuestionsPage />
          }
        />

        <Route
          path="/admin/students"
          element={
            <AdminStudentsPage />
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminAnalyticsPage />
          }
        />

        <Route
          path="/admin/settings"
          element={
            <AdminSettingsPage />
          }
        />
      </Route>

      {/* ===================================================
          404
      =================================================== */}

      <Route
        path="*"
        element={
          <NotFoundPage />
        }
      />
    </Routes>
  );
}

export default AppRoutes;