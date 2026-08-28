import "./Actions.css";
import Icon from "../common/Icon/Icon";
import { useCart } from "../../context/cartContext";
const Actions = () => {
  const { cartCount, isCartOpen, openCart } = useCart();
  return (
    <div className="header__actions">
      <search>
        <form className="search-box-pill" action="/buscar" method="get">
          <input
            type="search"
            name="q"
            aria-label="Buscar productos"
            placeholder="¿Qué quieres descubrir?"
          />
          <button type="submit" aria-label="Buscar">
            <Icon name="search" className="search-icon" />
          </button>
        </form>
      </search>
      <button type="button" className="header__action-button" aria-label="Cuenta de usuario">
        <Icon name="user" />
      </button>
      <button type="button" className="header__action-button header__cart-button" aria-label={`Carrito${cartCount > 0 ? `, ${cartCount} unidades` : ""}`} aria-controls="cart-drawer" aria-expanded={isCartOpen} onClick={openCart}>
        <Icon name="bag" />
        {cartCount > 0 && <span className="header__cart-count" aria-hidden="true">{cartCount}</span>}
      </button>
    </div>
  );
};
export default Actions;
