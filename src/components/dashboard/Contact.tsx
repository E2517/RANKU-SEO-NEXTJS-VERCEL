import styles from './Contact.module.css';

export default function Contact() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Información Legal</h2>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Aviso Legal</h3>
                    <h4 className={styles.subTitle}>1. Datos de identificación</h4>
                    <p className={styles.text}>
                        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico, a continuación se reflejan los datos identificativos de la empresa:
                    </p>
                    <ul className={styles.infoList}>
                        <li><strong>Titular:</strong> Ranku.es</li>
                        <li><strong>Email:</strong> <a href="mailto:e2517dev@gmail.com" className={styles.link}>e2517dev@gmail.com</a></li>
                        <li><strong>GitHub:</strong> Software Engineer</li>
                    </ul>
                    <p className={styles.text}>
                        Mi mayor satisfacción es ver cómo el software resuelve problemas reales o mejora la vida de las personas o empresas que lo utilizan. "Mi secreto de SEO mejor guardado: ¡Es esta herramienta! Descubre las palabras clave que tu competencia ignora. Empieza a espiar a tu competencia ahora mismo pero resuelve los problemas en casa primero analiza como estas de SEO 😜"
                    </p>
                    <p className={styles.text}>
                        Si notas un bug, o si crees que esta cosa puede ser un 1% más espectacular, escríbeme. Yo me encargo. Mi garantía es simple: si no lo soluciono, te invito a un café ☕
                    </p>
                    <p className={styles.text}>
                        La utilización del sitio web implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Condiciones de Contratación</h3>
                    <h4 className={styles.subTitle}>Contratación de Servicios</h4>
                    <p className={styles.text}>
                        Los servicios ofrecidos a través de esta plataforma consisten en suscripciones a una herramienta de análisis y visualización de resultados de búsqueda orgánica (SEO). El usuario puede contratar uno de los planes disponibles (Básico, Pro, Ultra) mediante un sistema de pago automatizado.
                    </p>
                    <h4 className={styles.subTitle}>Proceso de Contratación</h4>
                    <p className={styles.text}>
                        El proceso de contratación se realiza en línea. El usuario debe registrarse o iniciar sesión, seleccionar un plan, y completar el pago a través de un proveedor de servicios de pago externo (Stripe). La contratación se considera efectiva una vez confirmado el pago.
                    </p>
                    <h4 className={styles.subTitle}>Cancelación del Servicio</h4>
                    <p className={styles.text}>
                        El usuario puede cancelar su suscripción en cualquier momento desde su perfil. La cancelación surtirá efecto al final del periodo de facturación en curso. No se realizarán reembolsos por periodos ya facturados.
                    </p>
                    <h4 className={styles.subTitle}>Acceso a la Plataforma</h4>
                    <p className={styles.text}>
                        Una vez contratado un plan, el usuario tendrá acceso a las funcionalidades asociadas al mismo según las limitaciones descritas en la descripción del plan. El acceso se realiza mediante credenciales personales y no transferibles.
                    </p>
                    <h4 className={styles.subTitle}>Modificación de Condiciones</h4>
                    <p className={styles.text}>
                        El titular de la plataforma se reserva el derecho a modificar en cualquier momento las presentes condiciones generales, así como las características del servicio. Dichas modificaciones serán comunicadas a los usuarios con antelación razonable.
                    </p>
                    <h4 className={styles.subTitle}>Disponibilidad del Servicio</h4>
                    <p className={styles.text}>
                        Se hará lo posible por mantener el servicio disponible, pero no se garantiza la disponibilidad ininterrumpida. El titular no se hace responsable de posibles daños derivados de la falta de disponibilidad del servicio.
                    </p>
                    <h4 className={styles.subTitle}>Limitación de Responsabilidad</h4>
                    <p className={styles.text}>
                        El uso de la herramienta es bajo la responsabilidad exclusiva del usuario. El titular no se responsabiliza de las decisiones tomadas por el usuario basadas en los datos proporcionados por la plataforma.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Protección de Datos</h3>
                    <p className={styles.text}>
                        El tratamiento de datos personales se realiza conforme a la normativa vigente en materia de protección de datos. Consulta nuestra Política de Privacidad para más información.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Propiedad Intelectual</h3>
                    <p className={styles.text}>
                        Todos los contenidos y elementos de la plataforma son propiedad del titular o de terceros, y están protegidos por las leyes de propiedad intelectual. Queda prohibida su reproducción, distribución o uso no autorizado.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Resolución de Litigios</h3>
                    <p className={styles.text}>
                        En caso de conflicto, se intentará resolver de manera amistosa. Para usuarios consumidores, la Comisión Europea facilita una plataforma de resolución de litigios en línea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className={styles.link}>https://ec.europa.eu/consumers/odr</a>
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Aceptación de Condiciones</h3>
                    <p className={styles.text}>
                        Las presentes condiciones generales podrán ser guardadas y reproducidas en cualquier momento por el usuario que realice una compra mediante las opciones de su navegador de internet, y deben ser aceptadas antes de proceder al pago de la contratación.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Cuenta de Usuario y Corrección de Errores</h3>
                    <p className={styles.text}>
                        Para poder realizar contrataciones online en esta plataforma es necesario el registro mediante la creación de una “Cuenta de Usuario”. Podrá registrarse o iniciar sesión en cualquier momento pinchando en el enlace correspondiente.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Formas de Pago</h3>
                    <p className={styles.text}>
                        Se admiten pagos mediante tarjeta de crédito o débito a través del sistema de pago Stripe. Los pagos se procesan de forma segura y no se almacenan datos de tarjetas en nuestros servidores. Puedes pagar con tarjetas pertenecientes a las redes 4B, Red 6000 y Servired. Si tienes alguna duda, contacta con nosotros y te atenderemos para aclarar cualquier inquietud.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Precios, impuestos, tasas y aranceles</h3>
                    <p className={styles.text}>
                        Los precios están expresados en Euros e incluyen IVA, y son válidos salvo error tipográfico. En el caso de que se produzca un error manifiesto en la fijación del precio que aparezca en la ficha de servicio, prevalecerá el precio establecido para dicho servicio en el email informativo que te proporcionaremos cuando detectemos el error.
                    </p>
                </section>

                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Contacto</h3>
                    <p className={styles.text}>
                        Si tiene cualquier duda o necesita soporte, puede contactar con nosotros a través de los siguientes medios:
                    </p>
                    <ul className={styles.infoList}>
                        <li><strong>Email:</strong> <a href="mailto:e2517dev@gmail.com" className={styles.link}>e2517dev@gmail.com</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}