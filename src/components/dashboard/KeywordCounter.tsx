'use client';

import { useState, useEffect } from 'react';
import styles from './KeywordCounter.module.css';
import { showToast } from 'nextjs-toast-notify';

export default function KeywordCounter() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/keywords');
            const data = await res.json();
            if (data.success) {
                setRecords(data.records);
            } else {
                showToast.error('Error: ' + (data.message || 'No se pudo cargar el historial.'), {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (err) {
            console.error(err);
            showToast.error('Error de red al cargar historial.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteRecord = async (id: string) => {
        if (!confirm('¿Eliminar este registro?')) return;
        setDeleting(true);
        try {
            await fetch(`/api/keywords?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            setRecords(records.filter(r => r._id !== id));
        } catch (err) {
            showToast.error('Error al eliminar.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        } finally {
            setDeleting(false);
        }
    };

    const deleteAll = async () => {
        if (!confirm('¿Eliminar todo el historial de keywords? Esta acción no se puede deshacer.')) return;
        setDeleting(true);
        try {
            await fetch('/api/keywords?all=true', { method: 'DELETE' });
            setRecords([]);
        } catch (err) {
            showToast.error('Error al eliminar todo.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    return (
        <div className={styles.card}>
            <h2>Keywords Buscadas</h2>
            <div className={styles.formGroup}>
                <label>🔍 Consulta las keywords que has buscado.</label>
            </div>
            <div className={styles.usageInfo}>
                {records.length > 0
                    ? `Tienes ${records.length} búsquedas guardadas.`
                    : loading
                        ? 'Cargando...'
                        : 'Realiza una búsqueda para cargar tus resultados.'}
            </div>
            <button
                className={styles.button}
                onClick={loadHistory}
                disabled={loading || deleting}
            >
                {loading ? 'Cargando...' : 'Recargar Historial'}
            </button>
            {records.length > 0 && (
                <button
                    className={`${styles.button} ${styles.dangerButton}`}
                    onClick={deleteAll}
                    disabled={deleting}
                    style={{ marginTop: '0.5rem' }}
                >
                    {deleting ? 'Eliminando...' : 'Eliminar Todo'}
                </button>
            )}
            <div className={styles.tableContainer}>
                {records.length > 0 && (
                    <table className={styles.keywordsTable}>
                        <thead>
                            <tr>
                                <th>Palabra Clave</th>
                                <th>Dominio</th>
                                <th>Dispositivo</th>
                                <th>Última Búsqueda</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={record._id || `kw-${index}-${record.palabraClave}-${record.dominioFiltrado}-${record.dispositivo}`}>
                                    <td>{record.palabraClave || '-'}</td>
                                    <td>{record.dominioFiltrado || '-'}</td>
                                    <td>{record.dispositivo || '-'}</td>
                                    <td>
                                        {record.updatedAt
                                            ? new Date(record.updatedAt).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => deleteRecord(record._id)}
                                            disabled={deleting}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}