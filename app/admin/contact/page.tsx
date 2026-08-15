import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import ContactAdminPage from '../../../admin/pages/ContactAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ContactAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
