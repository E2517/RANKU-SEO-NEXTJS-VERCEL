'use client';
import { useState, useEffect } from 'react';
import { showToast } from 'nextjs-toast-notify';

export default function DomainsSection() {
    const [domain, setDomain] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [domainOptions, setDomainOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const res = await fetch('/api/historial-options-domains');
                const data = await res.json();
                if (data.success) {
                    setDomainOptions(data.domains);
                }
            } catch (error) {
                console.error('Error al cargar dominios:', error);
            }
        };
        fetchDomains();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResults([]);
        setIsSubmitting(true);
        try {
            const url = `/api/dominios?dominio=${encodeURIComponent(domain)}${keywordFilter ? `&keywordFilter=${encodeURIComponent(keywordFilter)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setResults(data.historial || []);
                showToast.success('Resultados cargados.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            } else {
                showToast.error(data.message, {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
            showToast.error('Error de conexión con el servidor.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTrend = (trend: any) => {
        if (!trend || trend.diferencia === null) {
            return '—';
        }
        const { diferencia, simbolo, color } = trend;
        return (
            <span style={{ color, fontWeight: 'bold' }}>
                {diferencia > 0 ? '+' : ''}{diferencia} {simbolo}
            </span>
        );
    };

    return (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ color: '#6c4ab6', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Dominios por Palabra Clave</h2>
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                    📊 Consulta el rendimiento de tus Dominios y Palabras Clave.
                </label>
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Seleccionar Dominio:</label>
                    <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                        required
                    >
                        <option value="">Selecciona un dominio</option>
                        {domainOptions.map((d, i) => (
                            <option key={i} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Filtrar por Palabra Clave (opcional):</label>
                    <input
                        type="text"
                        placeholder="Ej: abogado penal"
                        value={keywordFilter}
                        onChange={(e) => setKeywordFilter(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || !domain}
                    style={{
                        padding: '10px 18px',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: isSubmitting || !domain ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        background: isSubmitting || !domain ? '#94a3b8' : 'linear-gradient(to right, #d64a6c, #c53a5d)',
                        color: '#fff',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        marginRight: '8px'
                    }}
                >
                    {isSubmitting ? 'Cargando...' : 'Cargar'}
                </button>
            </form>
            {results.length > 0 && (
                <div style={{ marginTop: '1.5rem', overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>Palabra Clave</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dominio</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>Posición</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>24 horas</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>7 días</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>30 días</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>Buscador</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dispositivo</th>
                                <th style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'left', background: '#f9fafb', fontWeight: '700', color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase' }}>Localización</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r, i) => (
                                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>{r.palabraClave || 'N/A'}</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>{r.dominio || 'N/A'}</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>{r.posicion || '—'}</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>
                                        {renderTrend(r.tendencia24h)}
                                    </td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>
                                        {renderTrend(r.tendencia7d)}
                                    </td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>
                                        {renderTrend(r.tendencia30d)}
                                    </td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>{r.buscador || 'N/A'}</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>
                                        {r.dispositivo === 'google_local' ? (
                                            <div>
                                                Google Local
                                                {r.rating !== null && r.rating !== undefined && (
                                                    <div style={{ marginTop: '4px' }}>
                                                        ⭐ {r.rating} ({r.reviews || 'N/A'})
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            r.dispositivo
                                        )}
                                    </td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '12px' }}>{r.location || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}