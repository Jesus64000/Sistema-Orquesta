import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, error, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="p-8">Cargando sesión...</div>;
  if (user) return <div className="p-8">Sesión activa.</div>;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email.trim(), password);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Iniciar Sesión</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-yellow-300" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-yellow-300" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={submitting} className="w-full bg-yellow-400 hover:bg-yellow-500 transition-colors text-gray-900 font-medium py-2 rounded">
            {submitting ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
