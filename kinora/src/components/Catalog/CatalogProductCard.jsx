import { formatCurrency } from "../../utils/formatCurrency";
const CatalogProductCard = ({ product }) => {
  const availability = product.stockStatus === "order_only"
    ? "Disponible por encargo"
    : product.stock === 0
      ? "Agotado"
      : product.stock <= 2
        ? "¡Últimas unidades!"
        : "Disponible";
  return (
    <article className="catalog-product-card">
      <div className="catalog-product-card__image-wrap">
        <img src={product.image} alt={product.name} className="catalog-product-card__image" />
        <span className={`catalog-product-card__availability catalog-product-card__availability--${product.stockStatus === "order_only" ? "order" : product.stock === 0 ? "sold-out" : "available"}`}>{availability}</span>
      </div>
      <div className="catalog-product-card__content">
        <span className="catalog-product-card__category">{product.category}</span>
        <h2>{product.name}</h2>
        <p>{product.shortDescription}</p>
        <p className="catalog-product-card__skills"><strong>Habilidades:</strong> {product.skills.join(", ")}</p>
        {product.ageRecommendation && <p className="catalog-product-card__age"><strong>Edad:</strong> {product.ageRecommendation}</p>}
        <div className="catalog-product-card__footer">
          <strong>{formatCurrency(product.price, product.currency)} <span>{product.currency}</span></strong>
          <a className="catalog-product-card__action" href={`/productos/${product.slug}`}>Ver producto</a>
        </div>
      </div>
    </article>
  );
};
export default CatalogProductCard;
