'use client';

import { useState, useEffect } from 'react';
import styles from './ProfileSection.module.css';
import { getKeywordLimit, getScanMapBaseLimit } from '@/lib/utils';
import { showToast } from 'nextjs-toast-notify';

export default function ProfileSection() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [keywordUsage, setKeywordUsage] = useState<number>(0);
    const [scanmapUsage, setScanmapUsage] = useState<{ usedThisCycle: number; baseLimit: number; creditsPurchased: number; creditsUsed: number } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user');
                if (res.status === 401) {
                    window.location.href = '/auth';
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Error al cargar el perfil:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchKeywordUsage = async () => {
            try {
                const res = await fetch('/api/keywords');
                if (!res.ok) return;
                const data = await res.json();
                if (data.success) {
                    setKeywordUsage(data.records.length);
                }
            } catch (err) {
                console.error('Error al cargar keywords:', err);
            }
        };

        const fetchScanMapUsage = async () => {
            try {
                const res = await fetch('/api/user-scanmap-usage');
                if (res.status === 401) {
                    window.location.href = '/auth';
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setScanmapUsage(data.usage);
                }
            } catch (err) {
                console.error('Error al cargar uso de ScanMap:', err);
            }
        };

        if (user) {
            fetchKeywordUsage();
            fetchScanMapUsage();
        }
    }, [user]);

    const handlePlanClick = (plan: string) => {
        const subscribe = async () => {
            try {
                const res = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan }),
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    showToast.error(`Error al iniciar la suscripción: ${data.error || data.message || 'Error desconocido.'}`, {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                }
            } catch (e) {
                showToast.error('Error de conexión con el servidor de pago.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        };

        showToast.info(`Redirigiendo a la suscripción del plan ${plan}...`, {
            duration: 2000,
            position: 'top-center',
            transition: 'topBounce',
            sound: true,
        });

        setTimeout(subscribe, 1000);
    };

    const handleCreditsClick = (credits: number) => {
        const buyCredits = async () => {
            try {
                const res = await fetch('/api/scanmap/buy-credits', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: credits }),
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    showToast.error(`Error al iniciar el pago: ${data.error || data.message || 'Error desconocido.'}`, {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                }
            } catch (e) {
                showToast.error('Error de conexión con el servidor de pago.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        };

        buyCredits();
    };

    const handleCancelSubscription = async () => {
        if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
            return;
        }

        try {
            const res = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.success) {
                showToast.success('Suscripción cancelada. Mantendrás acceso hasta la fecha de finalización.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                window.location.reload();
            } else {
                showToast.error(`Error al cancelar: ${data.message || 'Error desconocido.'}`, {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (e) {
            showToast.error('Error de conexión con el servidor.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        }
    };

    if (loading) {
        return <div className={styles.profileCard}>Cargando perfil...</div>;
    }

    if (!user) {
        return <div className={styles.profileCard}>Error al cargar el perfil.</div>;
    }

    const keywordLimit = getKeywordLimit(user.subscriptionPlan);
    const scanMapBaseLimit = getScanMapBaseLimit(user.subscriptionPlan);
    const isSubscribed = user.subscriptionPlan !== 'Gratuito' && !user.isSubscriptionCanceled;

    return (
        <div className={styles.profileCard}>
            <h4>Datos de Usuario</h4>
            <p><strong>Usuario:</strong> <span id="profile-username">{user.username}</span></p>
            <p><strong>Email:</strong> <span id="profile-email">{user.email}</span></p>

            <div className={styles.subscriptionCard}>
                <h4>Mi suscripción</h4>
                <p><strong>Estado:</strong> <span id="profile-subscription-status">{isSubscribed ? 'Activo' : 'No suscrito'}</span></p>
                <p><strong>Plan:</strong> <span id="profile-subscription-plan">{user.subscriptionPlan === 'Gratuito' ? 'Gratuito' : user.subscriptionPlan}</span></p>
                {isSubscribed && user.subscriptionEndDate && (
                    <p><strong>Renueva automáticamente el:</strong> {new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
                )}
                {!isSubscribed && <p><strong>Renueva automáticamente el:</strong> --</p>}
                {/* {user.subscriptionId && (
                    <p><strong>ID de Suscripción:</strong> {user.subscriptionId}</p>
                )} */}
                {/* {user.stripeCustomerId && (
                    <p><strong>ID de Cliente en Stripe:</strong> {user.stripeCustomerId}</p>
                )} */}
                {user.subscriptionPlan !== 'Gratuito' && (
                    <p><strong>Keywords buscadas:</strong> <span id="keyword-usage">{keywordUsage} / {keywordLimit} ({user.subscriptionPlan})</span></p>
                )}
                {scanmapUsage && (
                    <div className={styles.usageInfo}>
                        <p id="scanmap-usage-info">
                            ScanMap: {scanmapUsage.usedThisCycle} / {scanMapBaseLimit} (búsquedas mensuales base)
                            {scanmapUsage.creditsPurchased > 0 ? ` + ${scanmapUsage.creditsUsed} / ${scanmapUsage.creditsPurchased} (créditos comprados)` : ''}
                        </p>
                    </div>
                )}
                {isSubscribed && (
                    <button className={styles.cancelButton} onClick={handleCancelSubscription}>
                        Cancelar Suscripción
                    </button>
                )}
            </div>

            <h2>Elige tu plan</h2>
            <div className={styles.subscriptionPlans}>
                <div className={styles.planCard}>
                    <h3>Básico</h3>
                    <div className={styles.planPrice}>€25<span className={styles.period}>/mes</span></div>
                    <ul>
                        <li>250 keywords trackeadas</li>
                        <li>Análisis multi-dispositivo (Desktop + Mobile + Local)</li>
                        <li>Historial Dominio</li>
                        <li>Historial de búsquedas (palabra clave o dominio)</li>
                        <li>Actualización diaria (24h) y semanal (7 dias)</li>
                        <li>Análisis de competencia</li>
                        <li>✅ RankMap: Posición en Google Maps por ubicación</li>
                        <li>🥷 ScanMap: Visibilidad de dominio según la ubicación del usuario (5 búsquedas/mes)</li>
                        <li>📈 Estadisticas inteligentes</li>
                        <li>Informe en Excel descargable</li>
                        <li>Informe SEO PDF descargable</li>
                    </ul>
                    <button className={styles.checkoutButton} onClick={() => handlePlanClick('Basico')}>Elegir Plan Básico</button>
                </div>

                <div className={styles.planCard}>
                    <h3>Pro</h3>
                    <div className={styles.planPrice}>€50<span className={styles.period}>/mes</span></div>
                    <ul>
                        <li>500 keywords trackeadas</li>
                        <li>Análisis multi-dispositivo (Desktop + Mobile + Local)</li>
                        <li>Historial Dominio</li>
                        <li>Historial de búsquedas (palabra clave o dominio)</li>
                        <li>Actualización diaria (24h) y semanal (7 dias)</li>
                        <li>Análisis de competencia</li>
                        <li>✅ RankMap: Posición en Google Maps por ubicación</li>
                        <li>🥷 ScanMap: Visibilidad de dominio según la ubicación del usuario (15 búsquedas/mes)</li>
                        <li>📈 Estadisticas inteligentes</li>
                        <li>Informe en Excel descargable</li>
                        <li>Informe SEO PDF descargable</li>
                    </ul>
                    <button className={styles.checkoutButton} onClick={() => handlePlanClick('Pro')}>Elegir Plan Pro</button>
                </div>

                <div className={styles.planCard}>
                    <h3>Ultra</h3>
                    <div className={styles.planPrice}>€100<span className={styles.period}>/mes</span></div>
                    <ul>
                        <li>1.000 keywords trackeadas</li>
                        <li>Análisis multi-dispositivo (Desktop + Mobile + Local)</li>
                        <li>Historial Dominio</li>
                        <li>Historial de búsquedas (palabra clave o dominio)</li>
                        <li>Actualización diaria (24h) y semanal (7 dias)</li>
                        <li>Análisis de competencia</li>
                        <li>✅ RankMap: Posición en Google Maps por ubicación</li>
                        <li>🥷 ScanMap: Visibilidad de dominio según la ubicación del usuario (25 búsquedas/mes)</li>
                        <li>📈 Estadisticas inteligentes</li>
                        <li>Informe en Excel descargable</li>
                        <li>Informe SEO PDF descargable</li>
                    </ul>
                    <button className={styles.checkoutButton} onClick={() => handlePlanClick('Ultra')}>Elegir Plan Ultra</button>
                </div>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Créditos adicionales de ScanMap</h2>
            <div className={styles.subscriptionPlans}>
                <div className={styles.planCard}>
                    <h3>5 búsquedas</h3>
                    <div className={styles.planPrice}>€5</div>
                    <button className={styles.creditsButton} onClick={() => handleCreditsClick(5)}>Comprar</button>
                </div>
                <div className={styles.planCard}>
                    <h3>10 búsquedas</h3>
                    <div className={styles.planPrice}>€10</div>
                    <button className={styles.creditsButton} onClick={() => handleCreditsClick(10)}>Comprar</button>
                </div>
                <div className={styles.planCard}>
                    <h3>15 búsquedas</h3>
                    <div className={styles.planPrice}>€15</div>
                    <button className={styles.creditsButton} onClick={() => handleCreditsClick(15)}>Comprar</button>
                </div>
                <div className={styles.planCard}>
                    <h3>25 búsquedas</h3>
                    <div className={styles.planPrice}>€25</div>
                    <button className={styles.creditsButton} onClick={() => handleCreditsClick(25)}>Comprar</button>
                </div>
            </div>
        </div>
    );
}