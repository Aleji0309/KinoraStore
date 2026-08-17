import Logo from "../common/Logo/Logo";
const Footer = () => {
  return (
    <footer className="home-footer" id="contacto">
      <div className="home-footer__main">
        <div className="home-footer__brand">
          <Logo className="home-footer__logo" />
          <p>Productos elegidos para acompañar distintas formas de vivir, pensar y sentir.</p>
        </div>
        <nav className="home-footer__nav" aria-label="Navegación del pie de página">
          <h2>Explora</h2>
          <a href="#productos">Productos</a>
          <a href="#categorias">Categorías</a>
          <a href="#kinora">Nosotros</a>
        </nav>
        <div className="home-footer__contact">
          <h2>Conecta</h2>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="mailto:contacto@kinora.com">Contacto</a>
        </div>
      </div>
      <div className="home-footer__bottom">
        <p>© 2026 Kinora. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
export default Footer;
