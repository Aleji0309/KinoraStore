import "./Actions.css";
import Icon from "../common/Icon/Icon";
import { useCart } from "../../context/cartContext";
import { isCostaRicaMarket } from "../../data/products";
const Actions = () => {
  const currentQuery = new URLSearchParams(window.location.search).get("q") ?? "";
  const { totalItems, openCart } = useCart();
  return (
    <div className="header__actions">
      <search>
        <form className="search-box-pill" action="/buscar" method="get">
          <input
            type="search"
            name="q"
            aria-label="Buscar productos"
            placeholder="¿Qué quieres descubrir?"
            defaultValue={currentQuery}
          />
          <button type="submit" aria-label="Buscar">
            <Icon name="search" className="search-icon" />
          </button>
        </form>
      </search>
      {isCostaRicaMarket && (
        <button type="button" className="header__action-button header__cart-button" aria-label={`Abrir carrito${totalItems > 0 ? `, ${totalItems} artículos` : ""}`} aria-controls="cart-drawer" onClick={openCart}>
          <Icon name="bag" />
          {totalItems > 0 && <span className="header__cart-count" aria-hidden="true">{totalItems}</span>}
        </button>
      )}
    </div>
  );
};
export default Actions;
