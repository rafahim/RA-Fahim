import ProtectedRoute from '../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../admin/AdminLayout';
import ProjectsAdminPage from '../../../admin/pages/ProjectsAdminPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ProjectsAdminPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
