import { formatCurrency } from "../../utils/formatCurrency";
const CatalogProductCard = ({ product }) => {
  return (
    <article className="catalog-product-card">
      <div className="catalog-product-card__image-wrap">
        <img src={product.image} alt={product.name} className="catalog-product-card__image" />
        {product.stock === 0 && <span className="catalog-product-card__sold-out">Agotado</span>}
        {(product.stock === 1 || product.stock === 2) && <span className="catalog-product-card__low-stock">¡Últimas unidades!</span>}
      </div>
      <div className="catalog-product-card__content">
        <span className="catalog-product-card__category">{product.category}</span>
        <h2>{product.name}</h2>
        <p>{product.shortDescription}</p>
        <div className="catalog-product-card__footer">
          <strong>{formatCurrency(product.price, product.currency)} <span>{product.currency}</span></strong>
          <a className="catalog-product-card__action" href={`/productos/${product.slug}`}>Ver producto</a>
        </div>
      </div>
    </article>
  );
};
export default CatalogProductCard;
