import ProtectedRoute from '../../admin/components/ProtectedRoute';
import AdminLayout from '../../admin/AdminLayout';
import DashboardPage from '../../admin/pages/DashboardPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DashboardPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
