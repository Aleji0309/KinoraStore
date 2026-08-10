import React from "react";
import "./Menu.css";
const Menu = () => {
  return (
    <div>
      <nav className="header__nav">
        <a href="/">Inicio</a>
        <a href="/categorias">Categorías</a>
        <a href="/nosotros">Nosotros</a>
      </nav>
    </div>
  );
};
export default Menu;
