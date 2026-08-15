import ProtectedRoute from '../../../../admin/components/ProtectedRoute';
import AdminLayout from '../../../../admin/AdminLayout';
import ProjectFormPage from '../../../../admin/pages/ProjectFormPage';

export default function Page() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ProjectFormPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}
