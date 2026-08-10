import "./Actions.css";
const Actions = () => {
  return (
    <div className="header__actions">
      <search>
        <form className="search-box-pill" action="/buscar" method="get">
          <input type="text" placeholder="¿Qué quieres descubrir?" />
          <button>
            <span class="search-icon">🔍</span>
          </button>
        </form>
      </search>
      <button aria-label="Cuenta Usuario"> 👤</button>
      <button aria-label="Carrito">🛒</button>
    </div>
  );
};
export default Actions;
