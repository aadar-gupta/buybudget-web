'use client';

import { useAuth } from '@/contexts/auth-context';
import Landing from '@/components/Landing';
import { Dashboard } from '@/components/Dashboard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { isLoggedIn, loading } = useAuth();

  // Show a loading state while checking authentication
  if (loading) {
    return  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
  </div>
  }

  return isLoggedIn ? <Dashboard /> : <Landing />;
}
