import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Catalog from "./components/Catalog/Catalog";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import About from "./components/About/About";
import CartDrawer from "./components/Cart/CartDrawer";
import Checkout from "./components/Checkout/Checkout";
import { marketConfig } from "./config/markets";
import { products } from "./data/products";
function App() {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const productPathMatch = pathname.match(/^\/productos\/([^/]+)\/?$/);
  const productSlug = productPathMatch?.[1];
  const product = productSlug ? products.find((item) => item.slug === productSlug) : null;
  const searchQuery = new URLSearchParams(window.location.search).get("q") ?? "";
  const renderPage = () => {
    if (pathname === "/checkout") {
      if (marketConfig.market !== "CR") {
        window.location.replace("/categorias");
        return null;
      }
      return <Checkout />;
    }
    if (productSlug) return <ProductDetail product={product} />;
    if (pathname === "/categorias") return <Catalog />;
    if (pathname === "/buscar") return <Catalog query={searchQuery} />;
    if (pathname === "/nosotros") return <About />;
    return <Home />;
  };
  return (
    <div>
      <Header />
      {renderPage()}
      {marketConfig.market === "CR" && <CartDrawer />}
    </div>
  );
}
export default App;
