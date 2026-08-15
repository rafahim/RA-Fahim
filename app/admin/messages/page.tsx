import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import MessagesAdminPage from '../../../admin/pages/MessagesAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <MessagesAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
