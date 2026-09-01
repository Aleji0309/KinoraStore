import Footer from "../Home/Footer";
import { formatCurrency } from "../../utils/formatCurrency";
import { marketConfig } from "../../config/markets";
import "./ProductDetail.css";
const StockLabel = ({ product }) => {
  if (product.stockStatus === "order_only") return <span className="product-detail__stock product-detail__stock--order">Disponible por encargo</span>;
  const { stock } = product;
  if (stock === 0) return <span className="product-detail__stock product-detail__stock--sold-out">Agotado</span>;
  if (stock === 1 || stock === 2) return <span className="product-detail__stock product-detail__stock--low">¡Últimas unidades!</span>;
  return <span className="product-detail__stock product-detail__stock--available">Disponible</span>;
};
const ProductDetail = ({ product }) => {
  if (!product) {
    return (
      <>
        <main className="product-not-found">
          <span className="home-eyebrow">Kinora</span>
          <h1>Producto no encontrado</h1>
          <p>El producto que buscas no está disponible en nuestro catálogo.</p>
          <a href="/categorias">Volver al catálogo</a>
        </main>
        <Footer />
      </>
    );
  }
  const orderNote = product.stockStatus === "order_only" ? " Vi que está disponible por encargo." : "";
  const inquiryMessage = `Hola, vi ${product.name} en Kinora y me interesa.${orderNote} ¿Me puedes dar más información?`;
  const inquiryUrl = marketConfig.contact.whatsapp
    ? `https://wa.me/${marketConfig.contact.whatsapp}?text=${encodeURIComponent(inquiryMessage)}`
    : null;
  return (
    <>
      <main className="product-detail">
        <a className="product-detail__back" href="/categorias">← Volver al catálogo</a>
        <div className="product-detail__layout">
          <div className="product-detail__image-wrap">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="product-detail__content">
            <span className="product-detail__category">{product.category}</span>
            <h1>{product.name}</h1>
            <strong className="product-detail__price">{formatCurrency(product.price, product.currency, product.locale)} <span>{product.currency}</span></strong>
            <StockLabel product={product} />
            <p className="product-detail__description">{product.description}</p>
            <dl className="product-detail__metadata">
              <div><dt>Habilidades</dt><dd>{product.skills.join(", ")}</dd></div>
              {product.ageRecommendation && <div><dt>Edad recomendada</dt><dd>{product.ageRecommendation}</dd></div>}
            </dl>
            <div className="product-detail__tags" aria-label="Características del producto">
              {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            {inquiryUrl && <a className="product-detail__add" href={inquiryUrl} target="_blank" rel="noopener noreferrer">{product.stock === 0 ? "Consultar disponibilidad" : "Me interesa"}</a>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
export default ProductDetail;
