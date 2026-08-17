import ProductCard from "./ProductCard";
import { featuredProducts } from "../../data/homeData";
const FeaturedProducts = () => {
  return (
    <section className="home-section home-section--paper" id="productos" aria-labelledby="products-title">
      <div className="home-section__heading home-section__heading--left">
        <span className="home-eyebrow">Una selección para empezar</span>
        <h2 id="products-title">Productos destacados</h2>
        <p>Opciones prácticas y agradables para sumar apoyo, estructura y disfrute a las rutinas cotidianas.</p>
      </div>
      <div className="product-grid">
        {featuredProducts.map((product) => <ProductCard product={product} key={product.name} />)}
      </div>
    </section>
  );
};
export default FeaturedProducts;
