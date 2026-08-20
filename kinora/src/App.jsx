import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Catalog from "./components/Catalog/Catalog";
function App() {
  const isCatalog = window.location.pathname === "/categorias";
  return (
    <div>
      <Header />
      {isCatalog ? <Catalog /> : <Home />}
    </div>
  );
}
export default App;
