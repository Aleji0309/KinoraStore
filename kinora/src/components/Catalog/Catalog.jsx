import { useEffect, useRef, useState } from "react";
import { loadCatalogReviewSummaries } from "../../api/productReviews";
import { marketConfig } from "../../config/markets";
import Footer from "../Home/Footer";
import CatalogProductCard from "./CatalogProductCard";
import "./Catalog.css";
const Catalog = ({ products = [], query = "" }) => {
  const [reviewSummaries, setReviewSummaries] = useState(() => new Map());
  const reviewRequest = useRef(null);
  useEffect(() => {
    if (marketConfig.market !== "MX") return;
    let active = true;
    // Reuse the request during StrictMode's effect replay, without per-card fetches.
    reviewRequest.current ??= loadCatalogReviewSummaries();
    reviewRequest.current.then((summaries) => {
      if (active) setReviewSummaries(summaries);
    }).catch(() => {
      // Reviews are optional; keep shopping available if their request fails.
      if (active) setReviewSummaries(new Map());
    });
    return () => { active = false; };
  }, []);
  const normalizedQuery = query.trim().toLocaleLowerCase("es-MX");
  const matchingProducts = normalizedQuery
    ? products.filter((product) =>
        [
          product.name,
          product.category,
          product.shortDescription,
          product.description,
        ].some((value) =>
          value?.toLocaleLowerCase("es-MX").includes(normalizedQuery)
        )
      )
    : products;
  return (
    <>
      <main className="catalog">
        <header className="catalog__heading">
          <span className="home-eyebrow">
            {normalizedQuery ? "Resultados de búsqueda" : "Descubre Kinora"}
          </span>
          <h1>
            {normalizedQuery
              ? `Resultados para “${query.trim()}”`
              : "Catálogo"}
          </h1>
          <p>
            {normalizedQuery
              ? `${matchingProducts.length} ${
                  matchingProducts.length === 1
                    ? "producto encontrado"
                    : "productos encontrados"
                }.`
              : "Explora nuestra primera selección de juegos, retos y herramientas para acompañar diferentes momentos de tu día."}
          </p>
        </header>
        {matchingProducts.length > 0 ? (
          <div className="catalog__grid">
            {matchingProducts.map((product) => (
              <CatalogProductCard product={product} reviewSummary={reviewSummaries.get(product.id)} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="catalog__empty">
            <h2>No encontramos productos con esa búsqueda.</h2>
            <p>Prueba con otro nombre, categoría o palabra.</p>
            <a href="/categorias">Ver todo el catálogo</a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};
export default Catalog;