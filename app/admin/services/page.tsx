import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import ServicesAdminPage from '../../../admin/pages/ServicesAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ServicesAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
