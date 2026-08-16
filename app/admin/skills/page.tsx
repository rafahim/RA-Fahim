import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import SkillsAdminPage from '../../../admin/pages/SkillsAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <SkillsAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
