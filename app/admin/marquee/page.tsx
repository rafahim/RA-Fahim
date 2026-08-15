import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import MarqueeAdminPage from '../../../admin/pages/MarqueeAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <MarqueeAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
