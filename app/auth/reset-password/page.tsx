'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './reset-password.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodeURIComponent(token), password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Contraseña actualizada correctamente.', type: 'success' });
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      } else {
        setMessage({ text: data.message || 'Error al restablecer la contraseña.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error de conexión.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return null;

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h1>Restablecer Contraseña</h1>
        <form id="resetForm" onSubmit={handleSubmit}>
          <input type="hidden" id="token" value={decodeURIComponent(token)} />
          <label htmlFor="password">Nueva contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
        {message && (
          <div
            id="message"
            className={message.type === 'success' ? 'message-success' : 'message-error'}
            style={{ marginTop: '10px', padding: '8px', borderRadius: '4px' }}
          >
            {message.text}
          </div>
        )}
        <div className="switch-form">
          <a href="/auth">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
