const priceFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
const CatalogProductCard = ({ product }) => {
  return (
    <article className="catalog-product-card">
      <div className="catalog-product-card__image-wrap">
        <img src={product.image} alt={product.name} className="catalog-product-card__image" />
      </div>
      <div className="catalog-product-card__content">
        <span className="catalog-product-card__category">{product.category}</span>
        <h2>{product.name}</h2>
        <p>{product.shortDescription}</p>
        <div className="catalog-product-card__footer">
          <strong>{priceFormatter.format(product.price)} <span>{product.currency}</span></strong>
          <span className="catalog-product-card__action">Ver producto</span>
        </div>
      </div>
    </article>
  );
};
export default CatalogProductCard;
