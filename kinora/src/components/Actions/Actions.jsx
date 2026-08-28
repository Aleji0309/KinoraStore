import "./Actions.css";
import Icon from "../common/Icon/Icon";
const Actions = () => {
  const currentQuery = new URLSearchParams(window.location.search).get("q") ?? "";
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
    </div>
  );
};
export default Actions;
