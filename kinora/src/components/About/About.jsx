import Footer from "../Home/Footer";
import "./About.css";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.2-4.3a8.5 8.5 0 1 1 15.8-4.4Z" />
    <path d="M9 8.1c.2-.4.4-.4.7-.4h.4c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.2.7l-.6.7c.8 1.5 1.9 2.5 3.4 3.2l.7-.9c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.6 0 .8-.4 1.5-1.1 1.9-.6.4-1.5.5-2.2.3-1.5-.4-3.3-1.4-4.8-2.9-1.4-1.4-2.4-3.1-2.7-4.4-.2-.7 0-1.3.4-1.8Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.4" cy="6.8" r=".7" className="about__icon-dot" />
  </svg>
);

const About = () => (
  <>
    <main className="about">
      <span className="home-eyebrow">Nosotros</span>
      <h1>Jugar también es una forma de pensar diferente.</h1>
      <div className="about__body">
        <p>En Kinora nos gustan los juegos que despiertan la curiosidad y hacen que quieras intentar una vez más.</p>
        <p>Seleccionamos retos de lógica, memoria, concentración y exploración pensados para disfrutar a tu propio ritmo.</p>
        <p>Desde pequeños rompecabezas hasta desafíos más complejos, buscamos cosas entretenidas, diferentes y que valga la pena tener cerca.</p>
      </div>
      <strong className="about__closing">Para mentes que van a su manera.</strong>
      <div className="about__contact" aria-label="Opciones de contacto">
        <a className="about__contact-card about__contact-card--whatsapp" href="https://wa.me/525652069271" target="_blank" rel="noopener noreferrer">
          <span className="about__contact-icon"><WhatsAppIcon /></span>
          <span className="about__contact-copy"><strong>WhatsApp</strong><span>Pregúntanos por un producto</span><small>+52 56 5206 9271</small></span>
        </a>
        <a className="about__contact-card about__contact-card--instagram" href="https://www.instagram.com/kinoraneurostore/" target="_blank" rel="noopener noreferrer">
          <span className="about__contact-icon"><InstagramIcon /></span>
          <span className="about__contact-copy"><strong>Instagram</strong><span>@kinoraneurostore</span></span>
        </a>
      </div>
    </main>
    <Footer />
  </>
);

export default About;
