import Icon from "../common/Icon/Icon";
const ProductCard = ({ product }) => {
  return (
    <article className="product-card">
      <div className={`product-card__visual product-card__visual--${product.tone}`} aria-hidden="true">
        <span><Icon name={product.visual} /></span>
      </div>
      <div className="product-card__content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card__footer">
          <span>{product.status}</span>
        </div>
      </div>
    </article>
  );
};
export default ProductCard;
