import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import TestimonialsAdminPage from '../../../admin/pages/TestimonialsAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <TestimonialsAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
