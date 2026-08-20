import Footer from "../Home/Footer";
import CatalogProductCard from "./CatalogProductCard";
import { products } from "../../data/products";
import "./Catalog.css";
const Catalog = () => {
  return (
    <>
      <main className="catalog">
        <header className="catalog__heading">
          <span className="home-eyebrow">Descubre Kinora</span>
          <h1>Catálogo</h1>
          <p>Explora nuestra primera selección de juegos, retos y herramientas para acompañar diferentes momentos de tu día.</p>
        </header>
        <div className="catalog__grid">
          {products.map((product) => <CatalogProductCard product={product} key={product.id} />)}
        </div>
      </main>
      <Footer />
    </>
  );
};
export default Catalog;
