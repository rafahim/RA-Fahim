import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components/ui';
import { isSupabaseConfigured } from '../../lib/env';

interface LoginLocationState {
  reason?: 'expired';
}

export default function LoginPage() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  const locationState = location.state as LoginLocationState | null;
  const sessionExpired = locationState?.reason === 'expired';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    navigate('/admin', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071B33] px-4 font-kanit text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <h1 className="mb-1 text-xl font-medium">Admin Sign In</h1>
        <p className="mb-6 text-sm text-white/50">Manage your portfolio content.</p>

        {!isSupabaseConfigured() && (
          <p className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-300">
            Supabase isn't configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to
            enable sign in.
          </p>
        )}

        {sessionExpired && !error && (
          <p className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-300">
            Your session has expired. Please sign in again.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
