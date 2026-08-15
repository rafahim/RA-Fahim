import { Suspense } from 'react';
import LoginPage from '../../../admin/pages/LoginPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
