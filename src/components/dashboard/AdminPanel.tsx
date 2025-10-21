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

interface TrialConfig {
    isActive: boolean;
    trialPeriodDays: number;
}

export default function AdminPanel() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [trialConfig, setTrialConfig] = useState<TrialConfig>({ isActive: false, trialPeriodDays: 7 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (res.status === 403) {
                    showToast.error('Acceso denegado. No tienes permisos de administrador.', {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                    setLoading(false);
                    return;
                }
                if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
                const data = await res.json();
                if (data && data.success === true && Array.isArray(data.users)) {
                    const sortedUsers = data.users.sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    setUsers(sortedUsers);
                } else {
                    showToast.error('La respuesta del servidor no es válida. Formato incorrecto.', {
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

        const fetchTrialConfig = async () => {
            try {
                const res = await fetch('/api/admin/update-trial');
                if (res.status === 403) {
                    showToast.error('Acceso denegado. No tienes permisos de administrador.', {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                    return;
                }
                if (!res.ok) throw new Error('Error al cargar configuración de prueba');
                const data = await res.json();
                if (data.success) {
                    setTrialConfig({
                        isActive: data.isActive,
                        trialPeriodDays: data.trialPeriodDays,
                    });
                }
            } catch (err: any) {
                showToast.error(err.message || 'Error al cargar configuración de prueba', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        };

        fetchUsers();
        fetchTrialConfig();
    }, []);

    const handleResetLimits = async () => {
        try {
            const res = await fetch('/api/reset-keyword-limits', { method: 'GET' });
            if (res.status === 403) {
                showToast.error('Acceso denegado. No tienes permisos de administrador.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                return;
            }
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
            if (res.status === 403) {
                showToast.error('Acceso denegado. No tienes permisos de administrador.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                return;
            }
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

    const handleSaveTrialConfig = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/update-trial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: trialConfig.isActive,
                    trialPeriodDays: trialConfig.trialPeriodDays,
                }),
            });
            if (res.status === 403) {
                showToast.error('Acceso denegado. No tienes permisos de administrador.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                setSaving(false);
                return;
            }
            const data = await res.json();
            if (data.success) {
                showToast.success('Configuración del periodo de prueba actualizada.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            } else {
                showToast.error(data.message || 'Error al guardar configuración', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (err: any) {
            showToast.error(err.message || 'Error de red al guardar configuración', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleTrial = () => {
        setTrialConfig((prev) => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1 && value <= 90) {
            setTrialConfig((prev) => ({ ...prev, trialPeriodDays: value }));
        }
    };

    if (loading) {
        return <div className={styles.card}>Cargando usuarios...</div>;
    }

    return (
        <div className={styles.card}>
            <h2>Panel de Administración</h2>
            <div className={styles.actionSection}>
                <div className={styles.buttonGroup}>
                    <button className={styles.primaryButton} onClick={handleResetLimits}>
                        Resetear Límites de Keywords
                    </button>
                    <button className={styles.secondaryButton} onClick={handleUpdateAllKeywords}>
                        Actualizar Todas las Keywords
                    </button>
                </div>
                <p className={styles.hint}>Se ejecuta un Cron en Vercel todos los días a las 00:00 y 03:00 (configurado en vercel.json)</p>
            </div>

            <div className={styles.trialSection}>
                <h3>Configuración del Periodo de Prueba</h3>
                <div className={styles.trialToggle}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={trialConfig.isActive}
                            onChange={handleToggleTrial}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <span>Activar periodo de prueba</span>
                </div>
                <div className={styles.daysInput}>
                    <label>Días de prueba:</label>
                    <input
                        type="number"
                        min="1"
                        max="90"
                        value={trialConfig.trialPeriodDays}
                        onChange={handleDaysChange}
                        disabled={!trialConfig.isActive}
                    />
                </div>
                <button
                    className={styles.saveButton}
                    onClick={handleSaveTrialConfig}
                    disabled={saving}
                >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Plan</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Cancelado</th>
                            <th>Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.email}</td>
                                    <td><span className={`${styles.planTag} ${styles[user.subscriptionPlan.toLowerCase()]}`}>{user.subscriptionPlan}</span></td>
                                    <td>{user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString() : '-'}</td>
                                    <td>{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : '-'}</td>
                                    <td><span className={user.isSubscriptionCanceled ? styles.statusRed : styles.statusGreen}>{user.isSubscriptionCanceled ? 'Sí' : 'No'}</span></td>
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