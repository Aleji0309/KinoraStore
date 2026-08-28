import ProductCard from "./ProductCard";
import { featuredProducts } from "../../data/homeData";
const FeaturedProducts = () => {
  return (
    <section className="home-section home-section--paper" id="productos" aria-labelledby="products-title">
      <div className="home-section__heading home-section__heading--left">
        <span className="home-eyebrow">Lo que viene</span>
        <h2 id="products-title">Próximamente en Kinora</h2>
        <p>Estamos preparando nuevas formas de acompañar tu día a día.</p>
      </div>
      <div className="product-grid">
        {featuredProducts.map((product) => <ProductCard product={product} key={product.name} />)}
      </div>
    </section>
  );
};
export default FeaturedProducts;
