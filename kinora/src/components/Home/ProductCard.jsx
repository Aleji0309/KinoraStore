import Icon from "../common/Icon/Icon";
const ProductCard = ({ product }) => {
  return (
    <article className="product-card">
      <div className={`product-card__visual product-card__visual--${product.tone}`} aria-hidden="true">
        <span><Icon name={product.visual} /></span>
      </div>
      <div className="product-card__content">
        <span className="product-card__category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-card__footer">
          <strong>{product.price}</strong>
          <span>Próximamente</span>
        </div>
      </div>
    </article>
  );
};
export default ProductCard;
