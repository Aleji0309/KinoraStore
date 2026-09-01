import Footer from "../Home/Footer";
import CatalogProductCard from "./CatalogProductCard";
import { products } from "../../data/products";
import { marketConfig } from "../../config/markets";
import "./Catalog.css";
const Catalog = ({ query = "" }) => {
  const normalizedQuery = query.trim().toLocaleLowerCase(marketConfig.locale);
  const matchingProducts = normalizedQuery
    ? products.filter((product) => [product.name, product.category, product.shortDescription, product.description]
      .some((value) => value?.toLocaleLowerCase(marketConfig.locale).includes(normalizedQuery)))
    : products;
  return (
    <>
      <main className="catalog">
        <header className="catalog__heading">
          <span className="home-eyebrow">{normalizedQuery ? "Resultados de búsqueda" : "Descubre Kinora"}</span>
          <h1>{normalizedQuery ? `Resultados para “${query.trim()}”` : "Catálogo"}</h1>
          <p>{normalizedQuery ? `${matchingProducts.length} ${matchingProducts.length === 1 ? "producto encontrado" : "productos encontrados"}.` : "Explora nuestra primera selección de juegos, retos y herramientas para acompañar diferentes momentos de tu día."}</p>
        </header>
        {matchingProducts.length > 0
          ? <div className="catalog__grid">{matchingProducts.map((product) => <CatalogProductCard product={product} key={product.id} />)}</div>
          : <div className="catalog__empty"><h2>No encontramos productos con esa búsqueda.</h2><p>Prueba con otro nombre, categoría o palabra.</p><a href="/categorias">Ver todo el catálogo</a></div>}
      </main>
      <Footer />
    </>
  );
};
export default Catalog;
