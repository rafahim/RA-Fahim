export interface AdminUser {
  id: string;
  email: string | null;
}

export interface AuthState {
  user: AdminUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}
