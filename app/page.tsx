'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TopBar from '@/components/layout/TopBar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const [trialInfo, setTrialInfo] = useState<{ show: boolean; days: number }>({ show: false, days: 0 });

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        const res = await fetch('/api/trial-status');
        if (res.ok) {
          const data = await res.json();
          setTrialInfo({
            show: data.show === true,
            days: typeof data.days === 'number' ? data.days : 0,
          });
        }
      } catch (err) {
        // Silently fail; trial message remains hidden
      }
    };

    fetchTrialStatus();
  }, []);

  return (
    <>
      <TopBar />
      <div className="container">
        <header className="header">
          <h1>El Futuro del SEO y la Búsqueda de Palabras Clave</h1>
          <p>
            Una herramienta de vanguardia para analizar y visualizar resultados de búsqueda orgánica, ayudándote a
            dominar el SEO y a superar a tu competencia.
          </p>
        </header>

        <div className="contenedor">
          <Image
            src="/assets/mapa.webp"
            alt="Dashboard"
            width={1200}
            height={600}
            className="imagen-responsive"
          />
        </div>

        <section className="how-it-works-section">
          <h2>
            ¿Cómo funciona <strong>Ranku</strong>?
          </h2>
          <p>
            Olvídate de trackear solo URLs como en la Edad de Piedra del SEO. En Ranku pensamos en <strong>negocios reales</strong>, no en enlaces sueltos.
          </p>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>🧠 Negocio ≠ URL</h3>
              <p>
                Trackeamos tu <strong>ficha de Google Business</strong> + tus <strong>URLs web</strong> (¡sí, todas!) como una sola entidad inteligente.
              </p>
              <div className="example">
                Tu negocio “Café Luna” tiene web, menú online y ficha en Google. Ranku las une en un solo perfil SEO.
              </div>
            </div>
            <div className="benefit-card">
              <h3>📱 3 Universos, 1 Negocio</h3>
              <p>
                Medimos tu posición en <strong>Desktop</strong>, <strong>Mobile</strong> y <strong>Google Maps</strong> por separado. Porque sí, Google te ve distinto en cada uno.
              </p>
              <div className="example">
                En móvil apareces en el top 3, pero en desktop estás en la página 2. ¡Sin Ranku, nunca lo sabrías!
              </div>
            </div>
            <div className="benefit-card">
              <h3>🗺️ RankMap: SEO Geolocalizado</h3>
              <p>
                ¿Sabes en qué posición aparece tu ficha en el <em>Map Pack</em> desde el barrio de tu competencia? Con <strong>RankMap</strong>, sí. Búsquedas geolocalizadas con precisión quirúrgica.
              </p>
              <div className="example">
                “fontanero en Madrid Centro” → ¿Estás en el top 3 del mapa… o en el olvido?
              </div>
            </div>
            <div className="benefit-card">
              <h3>📊 Datos que Hablan</h3>
              <p>
                No solo te decimos <em>dónde estás</em>, sino <em>cómo te mueves</em> frente a tu competencia en tiempo real. SEO con cerebro, no con suerte.
              </p>
              <div className="example">
                Tu competencia subió 5 posiciones en “seguros de coche en Barcelona”. Ranku te muestra el resultado antes de que pierdas tráfico. Ves que un despacho en Bilbao está ganando visibilidad con la keyword “abogado laboralista Bilbao”. Tú no estabas optimizando para esa búsqueda. Ranku te lo señala antes de que pierdas posicionamiento frente a tu competencia.
              </div>
            </div>
            <div className="benefit-card">
              <h3>🕵️‍♂️ Competencia bajo la lupa</h3>
              <p>
                Analizamos no solo tu rendimiento, sino el de competidores directos. Porque ganar en SEO es relativo… ¡y tú quieres ganar!
              </p>
              <div className="example">
                Ves que “Panadería Sol” usa una keyword que tú ignorabas: “pan sin gluten cerca de mí”. Ahora puedes actuar. Descubres que “Café Aroma” está posicionándose muy bien con la keyword “desayuno saludable en el centro”. Tú no habías considerado esa frase clave en tu estrategia. Ahora puedes actuar e incorporarla en tu contenido, publicidad o SEO local.
              </div>
            </div>
            <div className="benefit-card">
              <h3>⚡ Informes descargables en Excel o PDF</h3>
              <p>
                ¿Tu ficha desapareció del Map Pack? ¿Tu web bajó 10 puestos? Descarga informes en Excel con los resultados o en PDF para entregarselo a tu cliente.
              </p>
              <div className="example">
                Google actualiza su algoritmo un viernes por la noche y tu posición cae. Ranku te permite descargar informes en Excel para que los analices con Looker Studio Google o en PDF para que no tengas que redactarselo a tu cliente.
              </div>
            </div>
          </div>
        </section>

        <section className="scanmap-hero-section">
          <div className="container">
            <div className="scanmap-content">
              <h2>
                🥷 <strong>ScanMap</strong>: La Revolución del SEO Local Geolocalizado
              </h2>
              <p>
                ¿Sabes cómo te ve Google <em>desde el barrio de tu competencia</em>? Con <strong>ScanMap</strong>, descubres la visibilidad real de cualquier dominio en función de la ubicación exacta del usuario. No es magia… es <strong>inteligencia geográfica aplicada al SEO</strong>.
              </p>
              <div className="scanmap-preview">
                <Image
                  src="/assets/scanmap.webp"
                  alt="ScanMap - Visualización geolocalizada del SEO"
                  width={900}
                  height={500}
                  className="imagen-responsive"
                />
              </div>
              <p>
                Simula búsquedas en cualquier punto de la ciudad, define radios de acción y franjas de precisión, y observa en tiempo real cómo cambia tu presencia en Google Maps. <strong>Porque el SEO local ya no es “más o menos cerca”… es “exactamente aquí”.</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <h2>🧠 Estadísticas Inteligentes: Tu GPS en el Caos de Google</h2>
          <p>
            En RANKU no acumulamos datos: los <strong>transformamos en decisiones</strong>. Nuestras estadísticas eliminan el ruido y te entregan solo lo que importa: <strong>palabras clave únicas por contexto</strong>, sin duplicados falsos que te hagan perder el foco.
          </p>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>🔍 Una Keyword, Un Contexto</h3>
              <p>
                Cada combinación de palabra clave + ubicación + dispositivo + buscador se cuenta una sola vez. Así evitas la ilusión de “miles de keywords” cuando en realidad son repeticiones vacías.
              </p>
            </div>
            <div className="stat-card">
              <h3>📈 Tendencias Reales, No Ruido</h3>
              <p>
                Comparamos la última posición registrada con la anterior para mostrarte si mejoras o empeoras. Sin datos obsoletos ni promedios engañosos.
              </p>
            </div>
            <div className="stat-card">
              <h3>🏆 Top Dominios con Sentido</h3>
              <p>
                Vemos qué dominios acumulan más mejora absoluta en sus keywords. Así sabes quién está ganando terreno… y quién se está quedando atrás.
              </p>
            </div>
            <div className="stat-card">
              <h3>📥 Excel Limpio, Acción Inmediata</h3>
              <p>
                Al exportar, recibes solo filas únicas. Cada línea es una oportunidad real. Ideal para presentar a clientes o alimentar tus propios dashboards.
              </p>
            </div>
            <div className="stat-card">
              <h3>⚡ SEO con Memoria Inteligente</h3>
              <p>
                RANKU no olvida: compara automáticamente la posición actual con la anterior para mostrarte si ganas o pierdes terreno. Tú te enfocas en actuar, no en calcular.
              </p>
            </div>
            <div className="stat-card">
              <h3>🎯 PDF, directo para tu Cliente</h3>
              <p>
                Descarga un informe SEO profesional en PDF para entregar a tu cliente con toda la información clave sobre su visibilidad online.
              </p>
            </div>
          </div>
        </section>

        <section className="pricing-section">
          <h2>Nuestros Planes de Suscripción</h2>
          <p>
            Suscripción <strong>mensual</strong>, sin letras pequeñas.
            <br />
            <strong>Entra cuando quieras, sal cuando quieras.</strong> Sin permanencia. Sin drama. Solo SEO puro.
          </p>
          <div className="pricing-cards">
            <div className="card">
              <div className="card-header">
                <h3>Básico</h3>
                <div className="card-price">
                  <span className="currency">€</span>25<span className="period">/mes</span>
                </div>
              </div>
              <ul className="card-features">
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
              <Link href="/auth" className="login-button">
                Subscribirse
              </Link>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Pro</h3>
                <div className="card-price">
                  <span className="currency">€</span>50<span className="period">/mes</span>
                </div>
              </div>
              <ul className="card-features">
                <li>500 keywords trackeadas</li>
                <li>Análisis multi-dispositivo (Desktop + Mobile + Local)</li>
                <li>Historial Dominio</li>
                <li>Historial de búsquedas (palabra clave o dominio)</li>
                <li>Actualización diaria (24h) y semanal (7 dias)</li>
                <li>Análisis de competencia</li>
                <li>✅ RankMap: Posición en Google Maps por ubicación</li>
                <li>🥷 ScanMap: Visibilidad de dominio según la ubicación del usuario (10 búsquedas/mes)</li>
                <li>📈 Estadisticas inteligentes</li>
                <li>Informe en Excel descargable</li>
                <li>Informe SEO PDF descargable</li>
              </ul>
              <Link href="/auth" className="login-button">
                Subscribirse
              </Link>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>Ultra</h3>
                <div className="card-price">
                  <span className="currency">€</span>100<span className="period">/mes</span>
                </div>
              </div>
              <ul className="card-features">
                <li>1.000 keywords trackeadas</li>
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
              <Link href="/auth" className="login-button">
                Subscribirse
              </Link>
            </div>
          </div>
          {trialInfo.show && trialInfo.days > 0 && (
            <div style={{
              textAlign: 'center',
              margin: '1.5rem auto',
              padding: '12px 20px',
              backgroundColor: '#f8f9fa',
              color: '#6c4ab6',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              maxWidth: '600px'
            }}>
              ✨ <strong>Subscríbete</strong> a un Plan <span>{trialInfo.days}-días Gratuito</span> 🎁.
            </div>
          )}
        </section>

        <section className="seo-importance-section">
          <h2>¿Por Qué el SEO es <strong>Crucial</strong>?</h2>
          <p className="subtitle">Dominar el SEO no es opcional, es el motor de crecimiento en la era digital.</p>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Visibilidad Máxima</h3>
              <p>
                Estar en la <strong>primera página</strong> significa que el 90% de los usuarios te encontrará a ti, no a tu competencia.
              </p>
              <div className="example">Posición 1 en Google ≈ 30% de los clics.</div>
            </div>
            <div className="benefit-card">
              <h3>Tráfico de Calidad</h3>
              <p>
                Atraemos a usuarios que buscan <strong>exactamente lo que ofreces</strong>. No es publicidad, es relevancia.
              </p>
              <div className="example">
                Imagina: Alguien busca &quot;Mejor SEO Tool&quot; y encuentra <em>tu</em> web.
              </div>
            </div>
            <div className="benefit-card">
              <h3>Confianza y Autoridad</h3>
              <p>
                Google te ve como una fuente <strong>confiable</strong>. Posiciones altas = mayor credibilidad para tu marca.
              </p>
              <div className="example">Una web en la cima transmite profesionalismo y seguridad.</div>
            </div>
            <div className="benefit-card">
              <h3>Crecimiento Sostenible</h3>
              <p>
                Una vez posicionado, el tráfico orgánico es <strong>gratuito y constante</strong>, a diferencia de la publicidad pagada.
              </p>
              <div className="example">Inversión inicial vs. beneficio continuo. El SEO gana a largo plazo.</div>
            </div>
            <div className="benefit-card">
              <h3>Inteligencia Artificial</h3>
              <p>
                ChatGPT u otros analizan datos de internet como el SEO, sino apareces en el SEO no aparecerás en la IA, así de claro.
              </p>
              <div className="example">
                Tu posición Orgánica en el SEO determinará mejores resultados en búsquedas por IA ChatGPT, Perplexity, Gemini, etc.
              </div>
            </div>
            <div className="benefit-card">
              <h3>Preparado para Móviles</h3>
              <p>
                El 70% de las búsquedas son en móvil. Un buen SEO asegura que tu web se vea y funcione perfecta en cualquier dispositivo.
              </p>
              <div className="example">
                Si tu web no es <em>mobile-friendly</em>, Google ignora tu contenido en 7 de cada 10 búsquedas.
              </div>
            </div>
          </div>

          <div className="testimonials-section">
            <div className="testimonial-card">
              <div className="testimonial-logo">
                <Image src="/assets/ewheel.webp" alt="Logo SEO Local" width={48} height={48} />
              </div>
              <div className="testimonial-quote">
                “Para <Link href="https://ewheel.es" target="_blank" rel="nofollow" className="text-primary">eWheel</Link> el posicionamiento SEO fue la clave para pivotar hacia un modelo de distribuidor. Logramos posicionarnos rápidamente gracias a Ranku y analizar a nuestra competencia impulsando nuestro modelo de negocio.”
              </div>
              <div className="testimonial-author">
                <Image src="/assets/ewheel.webp" alt="eWheel" width={50} height={50} className="rounded-full" />
                <div className="testimonial-author-info">
                  <div className="testimonial-author-name">eWheel</div>
                  <div className="testimonial-author-title">Ecommerce Patinetes, eBikes</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-logo">
                <Image src="/assets/coweb.webp" alt="Logo SEO Orgánico" width={48} height={48} />
              </div>
              <div className="testimonial-quote">
                “RANKU fue la elección clara para nosotros. Las sólidas capacidades de análisis orgánico y el equipo de <Link href="https://coweb.es" target="_blank" rel="nofollow" className="text-primary">Coweb.es</Link> que estuvo involucrado en posicionarnos en multitud de palabras clave, Google Local ... nada más que lo mejor.”
              </div>
              <div className="testimonial-author">
                <Image src="/assets/cr.webp" alt="CR" width={50} height={50} className="rounded-full" />
                <div className="testimonial-author-info">
                  <div className="testimonial-author-name">CR</div>
                  <div className="testimonial-author-title">Abogado & Software Engineer</div>
                </div>
              </div>
            </div>
          </div>

          <div className="how-it-works-section">
            <p>
              Con Ranku (datos reales NO Humo 🥇): Gracias a búsquedas de Google Local y RankMap, descubrió que su ficha de Google Business no tenía reseñas recientes en esas zonas y que su competencia sí usaba palabras clave locales en la descripción (“abogado delitos informáticos”). Tras actualizar su perfil con contenido geolocalizado y pedir reseñas específicas, en 3 semanas subió al top 1. <strong>Resultado real: +37% llamadas desde Google Maps en un mes.</strong> Pecado mágico. Solo datos.
            </p>
            <Image
              src="/assets/carloscr.webp"
              alt="consultor-seo"
              width={1200}
              height={600}
              className="imagen-responsive"
            />
          </div>

          <div className="cta-banner">
            <p className="main-message">¿Listo para <strong>superar</strong> a tu competencia?</p>
            <p className="subtitle-message">¡Deja de adivinar y empieza a dominar la búsqueda hoy mismo!</p>
            <Link href="/auth" className="login-button cta-button">
              Subscríbete a un Plan
            </Link>
          </div>

          {trialInfo.show && trialInfo.days > 0 && (
            <div style={{
              textAlign: 'center',
              margin: '1.5rem auto',
              padding: '12px 20px',
              backgroundColor: '#f8f9fa',
              color: '#6c4ab6',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              maxWidth: '600px'
            }}>
              ✨ <strong>Subscríbete</strong> a un Plan <span>{trialInfo.days}-días Gratuito</span> 🎁.
            </div>
          )}

        </section>
      </div>
      <Footer />
    </>
  );
}