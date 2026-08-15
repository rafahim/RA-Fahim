import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import SettingsAdminPage from '../../../admin/pages/SettingsAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <SettingsAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
