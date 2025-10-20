'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './RankMapSection.module.css';
import 'leaflet/dist/leaflet.css';
import { showToast } from 'nextjs-toast-notify';

const normalizeDomain = (url: string): string => {
    if (!url) return '';
    try {
        const u = new URL(url.startsWith('http') ? url : 'https://' + url);
        return u.hostname.replace(/^www\./, '');
    } catch {
        return url.replace(/^www\./, '').replace(/https?:\/\//, '');
    }
};

export default function RankMapSection() {
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [domain, setDomain] = useState('');
    const [useDistanceFilter, setUseDistanceFilter] = useState(false);
    const [distance, setDistance] = useState('1000');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [mapData, setMapData] = useState<{ lat: number; lng: number; results: any[] } | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);

    useEffect(() => {
        if (!mapData || !mapRef.current || typeof window === 'undefined') {
            return;
        }

        if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
            const timer = setTimeout(() => {
                setMapData(mapData);
            }, 100);
            return () => clearTimeout(timer);
        }

        if (leafletMap.current) {
            leafletMap.current.remove();
            leafletMap.current = null;
        }

        let mapInstance: { addLayer: any; remove: () => void; } | null = null;
        try {
            const L = require('leaflet');
            mapInstance = L.map(mapRef.current).setView([mapData.lat, mapData.lng], 13);

            if (!mapInstance || typeof mapInstance.addLayer !== 'function') {
                console.error("La instancia de mapa no es válida o no tiene el método addLayer:", mapInstance);
                return;
            }

            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd'
            });

            if (!tileLayer || typeof tileLayer.addTo !== 'function') {
                console.error("La instancia de tileLayer no es válida o no tiene el método addTo:", tileLayer);
                return;
            }

            tileLayer.addTo(mapInstance);
            leafletMap.current = mapInstance;

            setTimeout(() => {
                if (leafletMap.current) {
                    leafletMap.current.invalidateSize();
                    addMarkersToMap(mapData.results, mapInstance, L);
                } else {
                    console.warn("leafletMap.current es null al intentar invalidar tamaño y añadir marcadores.");
                }
            }, 100);

        } catch (error) {
            console.error('Error FATAL en useEffect al inicializar el mapa:', error);
            if (mapInstance) {
                try {
                    mapInstance.remove();
                } catch (cleanupError) {
                    console.error("Error limpiando mapa después de fallo en useEffect:", cleanupError);
                }
            }
            leafletMap.current = null;
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, [mapData]);

    const addMarkersToMap = (results: any[], map: any, L: any) => {
        if (!map) {
            console.warn("addMarkersToMap: Mapa no proporcionado.");
            return;
        }
        results.forEach((place: any, idx: number) => {
            if (place.lat == null || place.lng == null) {
                console.warn(`Marcador ${idx} no tiene coordenadas válidas:`, place);
                return;
            }
            const pos = idx + 1;
            const popup = `
              <b>${place.title || 'Sin título'}</b><br>
              Posición: ${pos}<br>
              ${place.address ? `📍 ${place.address}<br>` : ''}
              ${place.rating ? `⭐ ${place.rating} (${place.reviews || 0} reseñas)<br>` : ''}
              ${place.domain ? `<a href="https://${place.domain}" target="_blank">${place.domain}</a><br>` : ''}
              <a href="https://www.google.com/maps?q=${place.lat},${place.lng}" target="_blank">Ver en Google Maps</a>
            `;
            const markerDiv = L.divIcon({
                className: 'rankmap-marker',
                html: `<div class="rankmap-marker-inner">${pos}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });
            const marker = L.marker([place.lat, place.lng], { icon: markerDiv }).addTo(map);
            marker.bindPopup(popup);
            const el = marker.getElement();
            if (el) {
                const inner = el.querySelector('.rankmap-marker-inner');
                if (inner) {
                    inner.style.backgroundColor = pos <= 3 ? '#d64a6c' : '#6c4ab6';
                    inner.style.color = '#fff';
                    inner.style.borderRadius = '50%';
                    inner.style.display = 'flex';
                    inner.style.alignItems = 'center';
                    inner.style.justifyContent = 'center';
                    inner.style.fontWeight = 'bold';
                    inner.style.fontSize = '14px';
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isProcessing) return;
        if (!keyword.trim() || !location.trim()) {
            showToast.error('Introduce palabra clave y localización.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            return;
        }
        setError('');
        setIsProcessing(true);

        try {
            const res = await fetch('/api/rankmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: keyword.trim(),
                    location: location.trim(),
                    domain: domain.trim(),
                    distanceFilter: useDistanceFilter ? parseInt(distance) : null,
                }),
            });
            const data = await res.json();
            if (!data.success || !data.results?.length) {
                showToast.info(data.message || 'Sin resultados.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
                const container = document.getElementById('rankmapContainer');
                const placeholder = document.getElementById('rankmapPlaceholder');
                if (container && placeholder) {
                    placeholder.style.display = 'flex';
                }
                return;
            }
            showToast.success(`Mostrando ${data.totalResults} resultados.${data.distanceFilter ? ` Filtrados a ${data.distanceFilter} metros.` : ''}`, {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            const statsEl = document.getElementById('rankmapStats');
            if (statsEl) statsEl.style.display = 'block';
            document.getElementById('domainPositionText')!.textContent = data.domainPositionText;
            document.getElementById('avgPosition')!.textContent = data.avgPosition.toFixed(2);
            document.getElementById('avgRating')!.textContent = data.avgRating.toFixed(2);
            document.getElementById('avgReviews')!.textContent = data.avgReviews.toFixed(2);
            const ratingCompEl = document.getElementById('ratingComparison')!;
            const reviewsCompEl = document.getElementById('reviewsComparison')!;
            if (data.isBetterThanCompetitors) {
                ratingCompEl.textContent = data.isBetterThanCompetitors.rating ? 'Mejor' : 'Peor';
                reviewsCompEl.textContent = data.isBetterThanCompetitors.reviews ? 'Mejor' : 'Peor';
                ratingCompEl.className = data.isBetterThanCompetitors.rating ? `${styles.comparisonValue} ${styles.better}` : `${styles.comparisonValue} ${styles.worse}`;
                reviewsCompEl.className = data.isBetterThanCompetitors.reviews ? `${styles.comparisonValue} ${styles.better}` : `${styles.comparisonValue} ${styles.worse}`;
            } else {
                ratingCompEl.textContent = 'No encontrado';
                reviewsCompEl.textContent = 'No encontrado';
                ratingCompEl.className = styles.comparisonValue;
                reviewsCompEl.className = styles.comparisonValue;
            }

            let mapCenterLat = data.results[0]?.lat;
            let mapCenterLng = data.results[0]?.lng;
            const normalizedInputDomain = domain ? normalizeDomain(domain) : null;

            if (data.distanceFilter && data.domainPosition > 0 && normalizedInputDomain) {
                const domainResult = data.results.find((r: any) =>
                    r.domain && normalizeDomain(r.domain) === normalizedInputDomain
                );
                if (domainResult?.lat != null && domainResult?.lng != null) {
                    mapCenterLat = domainResult.lat;
                    mapCenterLng = domainResult.lng;
                }
            }

            if (mapCenterLat != null && mapCenterLng != null) {
                setMapData({ lat: mapCenterLat, lng: mapCenterLng, results: data.results });
            } else {
                console.error("No se pudo obtener coordenadas válidas para centrar el mapa.");
                showToast.error('Error: No se pudo geolocalizar el punto central del mapa.', {
                    duration: 4000,
                    position: 'top-center',
                    transition: 'topBounce',
                    sound: true,
                });
            }

        } catch (err) {
            console.error(err);
            showToast.error('Error al cargar resultados.', {
                duration: 4000,
                position: 'top-center',
                transition: 'topBounce',
                sound: true,
            });
            const container = document.getElementById('rankmapContainer');
            const placeholder = document.getElementById('rankmapPlaceholder');
            if (container && placeholder) {
                placeholder.style.display = 'flex';
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.card}>
            <h2>RankMap – Geolocalización de Negocios</h2>
            <div className={styles.formGroup}>
                <label>🔍 Descubre los mejores negocios cerca de ti con RankMap...</label>
            </div>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Palabra Clave:</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: peluquería, abogado, restaurante"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            if (error) setError('');
                        }}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Localización:</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: Madrid, Calle las Ramblas Barcelona"
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            if (error) setError('');
                        }}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Dominio (Opcional):</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ej: miweb.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    />
                </div>
                <div className={styles.distanceFilter}>
                    <label>
                        <input
                            type="checkbox"
                            checked={useDistanceFilter}
                            onChange={(e) => setUseDistanceFilter(e.target.checked)}
                        /> Filtrar por distancia
                    </label>
                    <select
                        className={styles.select}
                        disabled={!useDistanceFilter}
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                    >
                        <option value="100">100 metros</option>
                        <option value="500">500 metros</option>
                        <option value="1000">1000 metros</option>
                        <option value="3000">3000 metros</option>
                        <option value="5000">5000 metros</option>
                    </select>
                </div>
                <button className={styles.button} type="submit" disabled={isProcessing}>
                    {isProcessing ? 'Buscando...' : 'Buscar'}
                </button>
                {error && <div className={styles.errorMessage}>{error}</div>}
            </form>
            <div className={styles.message} id="rankmapMessage"></div>
            <div id="rankmapStats" style={{ display: 'none' }}>
                <div className={styles.statsContainer}>
                    <div className={styles.statBox}>
                        <div className={styles.statValue} id="domainPositionText">
                            -
                        </div>
                        <div className={styles.statLabel}>Posición de Dominio</div>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.statValue} id="avgPosition">
                            -
                        </div>
                        <div className={styles.statLabel}>Posición Media</div>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.statValue} id="avgRating">
                            -
                        </div>
                        <div className={styles.statLabel}>Rating Promedio</div>
                    </div>
                    <div className={styles.statBox}>
                        <div className={styles.statValue} id="avgReviews">
                            -
                        </div>
                        <div className={styles.statLabel}>Reseñas Promedio</div>
                    </div>
                </div>
                <div className={styles.comparisonBox}>
                    <div className={styles.comparisonItem}>
                        <div className={styles.statLabel}>Rating vs Competidores</div>
                        <div className={styles.comparisonValue} id="ratingComparison">
                            -
                        </div>
                    </div>
                    <div className={styles.comparisonItem}>
                        <div className={styles.statLabel}>Reseñas vs Competidores</div>
                        <div className={styles.comparisonValue} id="reviewsComparison">
                            -
                        </div>
                    </div>
                </div>
            </div>
            <div id="rankmapContainer" style={{ height: '400px', width: '100%', marginTop: '20px', display: 'block' }}>
                <div id="rankmapPlaceholder" style={{ height: '100%', display: 'none' }}>
                </div>
                <div ref={mapRef} style={{ height: '100%', width: '100%', display: 'block' }}></div>
            </div>
        </div>
    );
}