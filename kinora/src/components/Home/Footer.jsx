import Logo from "../common/Logo/Logo";
import { marketConfig } from "../../config/markets";
const Footer = () => {
  const { contact } = marketConfig;
  const hasContact = contact.instagramUrl || contact.whatsapp || contact.email;
  return (
    <footer className="home-footer" id="contacto">
      <div className="home-footer__main">
        <div className="home-footer__brand">
          <Logo className="home-footer__logo" />
          <p>Productos elegidos para acompañar distintas formas de vivir, pensar y sentir.</p>
        </div>
        <nav className="home-footer__nav" aria-label="Navegación del pie de página">
          <h2>Explora</h2>
          <a href="/categorias">Productos</a>
          <a href="/categorias">Categorías</a>
          <a href="/nosotros">Nosotros</a>
        </nav>
        {hasContact && <div className="home-footer__contact">
          <h2>Conecta</h2>
          {contact.instagramUrl && <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">{contact.instagramHandle}</a>}
          {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {contact.email && <a href={`mailto:${contact.email}`}>Contacto</a>}
        </div>}
      </div>
      <div className="home-footer__bottom">
        <p>© 2026 Kinora. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
export default Footer;
