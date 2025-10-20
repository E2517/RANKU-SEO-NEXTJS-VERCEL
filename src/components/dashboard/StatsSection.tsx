'use client';

import { useState, useEffect } from 'react';
import styles from './StatsSection.module.css';
import { showToast } from 'nextjs-toast-notify';

export default function StatsSection() {
    const [stats, setStats] = useState<any>(null);
    const [detailedStats, setDetailedStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetailed, setLoadingDetailed] = useState(false);
    const [domainFilter, setDomainFilter] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');
    const [availableDomains, setAvailableDomains] = useState<string[]>([]);
    const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<{ desktop: boolean; mobile: boolean; google_local: boolean }>({ desktop: true, mobile: false, google_local: false });

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const res = await fetch('/api/history-options');
                if (res.status === 401) {
                    window.location.href = '/auth';
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setAvailableDomains(data.domains || []);
                    setAvailableKeywords(data.keywords || []);
                }
            } catch (err) {
                console.error('Error al cargar filtros:', err);
            }
        };
        loadFilters();
    }, []);

    const loadStats = async (domain = '', keyword = '') => {
        setLoading(true);
        try {
            const url = `/api/stats?domain=${encodeURIComponent(domain)}&keyword=${encodeURIComponent(keyword)}`;
            const res = await fetch(url);
            if (res.status === 401) {
                window.location.href = '/auth';
                return;
            }
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                if (domain || keyword) {
                    loadDetailedStats(domain, keyword);
                }
            } else {
                console.error('Error al cargar stats:', data.message);
            }
        } catch (err) {
            console.error('Error al cargar stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadDetailedStats = async (domain = '', keyword = '') => {
        setLoadingDetailed(true);
        try {
            const url = `/api/stats-detailed?domain=${encodeURIComponent(domain)}&keyword=${encodeURIComponent(keyword)}`;
            const res = await fetch(url);
            if (res.status === 401) {
                window.location.href = '/auth';
                return;
            }
            const data = await res.json();
            if (data.success) {
                setDetailedStats(data.results || []);
            } else {
                console.error('Error al cargar stats detalladas:', data.message);
            }
        } catch (err) {
            console.error('Error al cargar stats detalladas:', err);
        } finally {
            setLoadingDetailed(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleFilterChange = () => {
        loadStats(domainFilter, keywordFilter);
    };

    const handleDeviceChange = (device: 'desktop' | 'mobile' | 'google_local') => {
        setSelectedDevices(prev => ({
            ...prev,
            [device]: !prev[device]
        }));
    };

    const handleExportExcel = async () => {
        const params = new URLSearchParams();
        if (domainFilter) params.append('domain', domainFilter);
        if (keywordFilter) params.append('keyword', keywordFilter);
        const url = `/api/export-stats-excel${params.toString() ? '?' + params.toString() : ''}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    showToast.error('Error: ' + (errorJson.message || 'No se pudo generar el informe.'), {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                } catch {
                    showToast.error('Error: El servidor devolvió una respuesta no válida.', {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                }
                return;
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                showToast.error('Error: El archivo generado está vacío.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                return;
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `informe_seo_${domainFilter || 'todos'}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Error al descargar Excel:', err);
            showToast.error('Error de red al generar el informe.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        }
    };

    const handleExportPdf = async () => {
        if (!domainFilter) {
            showToast.error('Selecciona un dominio para generar el informe PDF.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            return;
        }

        const devices = [];
        if (selectedDevices.desktop) devices.push('desktop');
        if (selectedDevices.mobile) devices.push('mobile');
        if (selectedDevices.google_local) devices.push('google_local');

        if (devices.length === 0) {
            showToast.error('Selecciona al menos un dispositivo.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            return;
        }

        const params = new URLSearchParams();
        if (domainFilter) params.append('domain', domainFilter);
        if (keywordFilter) params.append('keyword', keywordFilter);
        devices.forEach(d => params.append('device', d));

        const url = `/api/generate-report-pdf?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    showToast.error('Error: ' + (errorJson.message || 'No se pudo generar el informe PDF.'), {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                } catch {
                    showToast.error('Error: El servidor devolvió una respuesta no válida.', {
                        duration: 4000,
                        position: 'top-center',
                        transition: 'topBounce',
                        sound: true,
                    });
                }
                return;
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                showToast.error('Error: El archivo PDF generado está vacío.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                return;
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `informe_seo_${domainFilter || 'todos'}_${keywordFilter || 'todas'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Error al descargar PDF:', err);
            showToast.error('Error de red al generar el informe PDF.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        }
    };

    if (loading) {
        return <div className={styles.card}>Cargando estadísticas...</div>;
    }

    return (
        <div className={styles.card}>
            <h2>Estadísticas Generales</h2>
            <div className={styles.statsContainer} id="generalStatsContainer">
                <div className={styles.statBox}>
                    <div className={styles.statValue} id="totalDomains">{stats?.totalDomains || '-'}</div>
                    <div className={styles.statLabel}>Dominios Únicos</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statValue} id="totalKeywords">{stats?.totalKeywords || '-'}</div>
                    <div className={styles.statLabel}>Keywords Únicas</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statValue} id="improvedPositions">{stats?.improved24h || '-'}</div>
                    <div className={styles.statLabel}>Posiciones Mejoradas (24h)</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statValue} id="worsenedPositions">{stats?.worsened24h || '-'}</div>
                    <div className={styles.statLabel}>Posiciones Empeoradas (24h)</div>
                </div>
            </div>

            <div className={styles.card}>
                <h2>Filtros Detallados</h2>
                <div className={styles.formGroup}>
                    <label htmlFor="statsDomainFilter">Filtrar por Dominio:</label>
                    <select
                        id="statsDomainFilter"
                        className={styles.select}
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                    >
                        <option value="">Todos los dominios</option>
                        {availableDomains.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="statsKeywordFilter">Filtrar por Palabra Clave:</label>
                    <select
                        id="statsKeywordFilter"
                        className={styles.select}
                        value={keywordFilter}
                        onChange={(e) => setKeywordFilter(e.target.value)}
                    >
                        <option value="">Todas las keywords</option>
                        {availableKeywords.map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </div>
                <button className={styles.button} onClick={handleFilterChange}>
                    Cargar Estadísticas
                </button>
                <button
                    type="button"
                    className={styles.downloadButton}
                    id="downloadStatsExcelButton"
                    style={{ display: detailedStats.length > 0 ? 'inline-block' : 'none' }}
                    onClick={handleExportExcel}
                >
                    Descargar Informe (Excel)
                </button>
                <button
                    type="button"
                    className={styles.downloadPdfButton}
                    id="downloadStatsPdfButton"
                    style={{ display: detailedStats.length > 0 ? 'inline-block' : 'none' }}
                    onClick={handleExportPdf}
                >
                    Descargar Informe (PDF)
                </button>
                <div id="statsMessage" style={{ marginTop: '15px', color: '#dc3545' }}></div>
            </div>

            <div className={styles.card}>
                <h2>Dispositivos para el informe PDF:</h2>
                <div className={styles.deviceCheckboxGroup}>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedDevices.desktop}
                            onChange={() => handleDeviceChange('desktop')}
                        /> Desktop
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedDevices.mobile}
                            onChange={() => handleDeviceChange('mobile')}
                        /> Mobile
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedDevices.google_local}
                            onChange={() => handleDeviceChange('google_local')}
                        /> Google Local
                    </label>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table id="statsTable" style={{ display: detailedStats.length > 0 ? 'table' : 'none' }}>
                    <thead>
                        <tr>
                            <th>Palabra Clave</th>
                            <th>Dominio</th>
                            <th>Posición Actual</th>
                            <th>24h</th>
                            <th>7d</th>
                            <th>Buscador</th>
                            <th>Dispositivo</th>
                            <th>Localización</th>
                        </tr>
                    </thead>
                    <tbody id="statsTableBody">
                        {detailedStats.map((row, index) => (
                            <tr key={index}>
                                <td>{row.keyword}</td>
                                <td>{row.domain}</td>
                                <td>{row.position}</td>
                                <td>{row.change24h}</td>
                                <td>{row.change7d}</td>
                                <td>{row.searchEngine}</td>
                                <td>{row.device}</td>
                                <td>{row.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {stats?.topDomains && stats.topDomains.length > 0 && (
                <div className={styles.card}>
                    <h2>Top 3 Dominios por Mejora Reciente</h2>
                    <div className={styles.statsContainer} id="topDomainsContainer">
                        {stats.topDomains.slice(0, 3).map((d: any) => (
                            <div key={d.dominio} className={styles.statBox}>
                                <div className={styles.statValue}>{d.dominio}</div>
                                <div className={styles.statLabel}>Mejora: {d.mejoraAbsoluta > 0 ? '+' : ''}{d.mejoraAbsoluta} pos.</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}