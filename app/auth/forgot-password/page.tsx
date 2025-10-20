'use client';

import { useState } from 'react';
import Link from 'next/link';
import './forgot-password.css';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        // Redirigir después de mostrar el mensaje
        setTimeout(() => {
          window.location.href = '/auth';
        }, 2000);
      } else {
        setMessage({ text: data.message || 'Error al procesar la solicitud.', type: 'error' });
      }
    } catch (error) {
      console.error('Error en forgot-password:', error);
      setMessage({ text: 'Error de conexión.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h1>Ranku</h1>
        <p>Recuperar contraseña</p>

        {message && (
          <div
            className={message.type === 'success' ? 'message-success' : 'message-error'}
            style={{ marginBottom: '16px', padding: '10px', borderRadius: '4px' }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo Electrónico:</label>
          <input type="email" id="email" name="email" required />

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="back-to-login">
          <Link href="/auth">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}