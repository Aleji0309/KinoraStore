import "./Menu.css";
const Menu = () => {
  return (
    <nav className="header__nav" aria-label="Navegación principal">
      <a href="/">Inicio</a>
      <a href="/categorias">Categorías</a>
      <a href="/nosotros">Nosotros</a>
    </nav>
  );
};
export default Menu;
