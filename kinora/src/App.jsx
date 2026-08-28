import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Catalog from "./components/Catalog/Catalog";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import CartDrawer from "./components/Cart/CartDrawer";
import { products } from "./data/products";
function App() {
  const pathname = window.location.pathname;
  const productPathMatch = pathname.match(/^\/productos\/([^/]+)\/?$/);
  const productSlug = productPathMatch?.[1];
  const product = productSlug ? products.find((item) => item.slug === productSlug) : null;
  const renderPage = () => {
    if (productSlug) return <ProductDetail product={product} />;
    if (pathname === "/categorias") return <Catalog />;
    return <Home />;
  };
  return (
    <div>
      <Header />
      {renderPage()}
      <CartDrawer />
    </div>
  );
}
export default App;
