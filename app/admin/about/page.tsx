import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import AboutAdminPage from '../../../admin/pages/AboutAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <AboutAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
