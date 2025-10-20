'use client';

import { useState, useEffect } from 'react';
import styles from './AdminPanel.module.css';
import { showToast } from 'nextjs-toast-notify';

interface User {
    _id: string;
    username: string;
    email: string;
    subscriptionPlan: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    isSubscriptionCanceled: boolean;
    createdAt: string;
}

export default function AdminPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (!res.ok) {
                    throw new Error('Error al cargar usuarios');
                }
                const data = await res.json();
                if (data.success) {
                    const sortedUsers = data.users.sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setUsers(sortedUsers);
                } else {
                    showToast.error(data.message || 'Error desconocido al cargar usuarios', {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                }
            } catch (err: any) {
                showToast.error(err.message || 'Error de red al cargar usuarios', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleResetLimits = async () => {
        try {
            const res = await fetch('/api/reset-keyword-limits', { method: 'GET' });
            const data = await res.json();
            if (data.success) {
                showToast.success(`Límites reseteados. Usuarios actualizados: ${data.updated}`, {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            } else {
                showToast.error(data.message || 'Error al resetear límites', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (err: any) {
            showToast.error(err.message || 'Error de red al resetear límites', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        }
    };

    const handleUpdateAllKeywords = async () => {
        try {
            const res = await fetch('/api/admin/update-all-keywords', { method: 'GET' });
            const data = await res.json();
            if (data.success) {
                showToast.success(`Keywords actualizadas. Registros procesados: ${data.updated}`, {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            } else {
                showToast.error(data.message || 'Error al actualizar keywords', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (err: any) {
            showToast.error(err.message || 'Error de red al actualizar keywords', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        }
    };

    if (loading) {
        return <div className={styles.card}>Cargando usuarios...</div>;
    }

    return (
        <div className={styles.card}>
            <h2>Panel de Administración</h2>
            <div className={styles.formGroup}>
                <button className={styles.button} onClick={handleResetLimits}>
                    Resetear Límites de Keywords (Manual)
                </button>
                <button className={`${styles.button} ${styles.secondaryButton}`} onClick={handleUpdateAllKeywords}>
                    Actualizar Todas las Keywords (Manual)
                </button>
            </div>
            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Plan</th>
                            <th>Inicio Suscripción</th>
                            <th>Fin Suscripción</th>
                            <th>Cancelado</th>
                            <th>Fecha Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.email}</td>
                                    <td>{user.subscriptionPlan}</td>
                                    <td>
                                        {user.subscriptionStartDate
                                            ? new Date(user.subscriptionStartDate).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>
                                        {user.subscriptionEndDate
                                            ? new Date(user.subscriptionEndDate).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>{user.isSubscriptionCanceled ? 'Sí' : 'No'}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.noData}>No hay usuarios registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}