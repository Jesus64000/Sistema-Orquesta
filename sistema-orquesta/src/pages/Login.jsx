import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@local');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (!res.ok) setError(res.error || 'Error de autenticación');
    else navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-lg font-semibold mb-4">Iniciar sesión</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <label className="block mb-2 text-sm">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-4" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block mb-2 text-sm">Contraseña</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-6" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-gray-900 text-white py-2 rounded disabled:opacity-50">{loading ? 'Ingresando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
