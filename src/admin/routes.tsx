import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsAdminPage from './pages/ProjectsAdminPage';
import ProjectFormPage from './pages/ProjectFormPage';
import ServicesAdminPage from './pages/ServicesAdminPage';
import AboutAdminPage from './pages/AboutAdminPage';
import ContactAdminPage from './pages/ContactAdminPage';
import MessagesAdminPage from './pages/MessagesAdminPage';
import SettingsAdminPage from './pages/SettingsAdminPage';
import { ToastProvider } from '../components/ui';

/**
 * All /admin/* routes. Mounted once from App.tsx. Every route except
 * /admin/login is wrapped in ProtectedRoute, which redirects to the
 * login page when there's no authenticated Supabase session.
 *
 * ToastProvider wraps the whole subtree so any admin page (or the
 * layout itself, e.g. on sign-out) can fire a success/error toast.
 */
export default function AdminRoutes() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          index
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProjectsAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProjectFormPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProjectFormPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="services"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ServicesAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="about"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AboutAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="contact"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ContactAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MessagesAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <SettingsAdminPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ToastProvider>
  );
}
