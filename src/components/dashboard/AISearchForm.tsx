'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from 'nextjs-toast-notify';
import styles from './AISearchForm.module.css';

export default function AISearchForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        keywords: '',
        business: '',
        domain: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setResults(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.keywords.trim()) {
            showToast.error('La consulta es obligatoria.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            return;
        }
        if (!formData.business.trim()) {
            showToast.error('El nombre del negocio es obligatorio.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            return;
        }
        if (!formData.domain.trim()) {
            showToast.error('El dominio es obligatorio.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            return;
        }

        setIsSubmitting(true);
        setResults(null);

        try {
            const res = await fetch('/api/ai-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywords: formData.keywords.trim(),
                    business: formData.business.trim(),
                    domain: formData.domain.trim(),
                }),
            });
            const data = await res.json();

            if (data.success) {
                setResults(data.results);
                showToast.success(data.message, {
                    duration: 5000,
                    position: 'bottom-center',
                    transition: 'topBounce',
                    progress: true,
                    sound: true,
                });
            } else if (data.redirectTo) {
                showToast.warning(data.message, {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    progress: true,
                    sound: true,
                });
                setTimeout(() => router.push(data.redirectTo), 4000);
            } else {
                showToast.error(data.message, {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }
        } catch (error) {
            console.error('Error al enviar la búsqueda IA:', error);
            showToast.error('Error de conexión con el servidor.', {
                duration: 4000,
                position: 'top-right',
                transition: 'topBounce',
                sound: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const highlightBusiness = (text: string, business: string): string => {
        if (!business) return text;
        const escapedBusiness = business.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedBusiness})`, 'gi');
        return text.replace(regex, '<span class="' + styles.highlight + '">$1</span>');
    };

    const renderHighlightedBlocks = (blocks: any[], business: string) => {
        return blocks.map((block, i) => {
            if (block.type === 'paragraph') {
                const highlighted = highlightBusiness(block.snippet || '', business);
                return <p key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />;
            } else if (block.type === 'list') {
                return (
                    <ul key={i} className={styles.nestedList}>
                        {block.list?.map((item: any, j: number) => {
                            const itemHighlighted = highlightBusiness(item.snippet || '', business);
                            return (
                                <li key={j}>
                                    <span dangerouslySetInnerHTML={{ __html: itemHighlighted }} />
                                    {item.list && renderHighlightedBlocks(item.list, business)}
                                </li>
                            );
                        })}
                    </ul>
                );
            }
            return null;
        });
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Búsqueda con Inteligencia Artificial</h2>
            <div className={styles.formGroup}>
                <label>
                    🤖 Introduce una consulta natural. Indica el nombre del negocio y su dominio. Si te encuentra la IA buen trabajo en SEO.
                </label>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Consulta IA (palabras clave):</label>
                    <textarea
                        rows={4}
                        placeholder="Ej: Las 5 mejores empresas de diseño web en Murcia"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Nombre del negocio (obligatorio):</label>
                    <input
                        type="text"
                        placeholder="Ej: Tu Negocio"
                        name="business"
                        value={formData.business}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Dominio (obligatorio):</label>
                    <input
                        type="text"
                        placeholder="Ej: tuweb.com"
                        name="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.button}
                >
                    {isSubmitting ? 'Analizando con IA...' : 'Buscar con IA'}
                </button>
            </form>

            {results && (
                <div className={styles.results}>
                    <h3 className={styles.resultsTitle}>Resultados de IA</h3>
                    <div className={styles.positionBox}>
                        <div><strong>Negocio:</strong> {results.business}</div>
                        <div><strong>Dominio:</strong> {results.domain}</div>
                        {results.businessPosition !== null && (
                            <div><strong>Encontrado:</strong> ✓</div>
                        )}
                        {results.domainPosition !== null && (
                            <div><strong>Posición por dominio:</strong> #{results.domainPosition}</div>
                        )}
                        {results.businessPosition === null && results.domainPosition === null && (
                            <div><strong>Encontrado:</strong> ✗</div>
                        )}
                    </div>

                    <div className={styles.fullResponse}>
                        <strong>Respuesta completa de la IA:</strong>
                        <div className={styles.aiContent}>
                            {renderHighlightedBlocks(results.rawTextBlocks, results.business)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}