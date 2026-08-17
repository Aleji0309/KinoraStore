import "./Actions.css";
import Icon from "../common/Icon/Icon";
const Actions = () => {
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
      <button type="button" className="header__action-button" aria-label="Carrito">
        <Icon name="bag" />
      </button>
    </div>
  );
};
export default Actions;
