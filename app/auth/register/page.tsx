'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './register.css';

export default function RegisterPage() {
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirm-password') as string;

        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: name, email, password }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ text: data.message, type: 'success' });
                setTimeout(() => {
                    window.location.href = '/auth';
                }, 1500);
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            setMessage({ text: 'Error de conexión.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h1>Ranku</h1>
                <p>Crear una cuenta</p>

                {message && (
                    <div
                        className={message.type === 'success' ? 'message-success' : 'message-error'}
                        style={{ marginBottom: '16px', padding: '10px', borderRadius: '4px' }}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Nombre completo:</label>
                    <input type="text" id="name" name="name" required />

                    <label htmlFor="email">Correo Electrónico:</label>
                    <input type="email" id="email" name="email" required />

                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required />

                    <label htmlFor="confirm-password">Confirmar contraseña:</label>
                    <input type="password" id="confirm-password" name="confirm-password" required />

                    <div className="terms">
                        <input type="checkbox" id="terms" name="terms" required />
                        <label htmlFor="terms">
                            <Link href="/legal#condiciones-contratacion" style={{ color: 'var(--secondary-color)', textDecoration: 'none', margin: '0 15px' }}>
                                Acepto las Condiciones de contratación
                            </Link>                        </label>
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                <div className="divider">
                    <span>O regístrate con</span>
                </div>

                <button className="google-button">
                    <Image
                        src="/assets/google-icon.webp"
                        alt="Google"
                        width={20}
                        height={20}
                    />
                    Registrarme con Google
                </button>

                <div className="login-link">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/auth">
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
}