import { useState } from "react";
import Footer from "../Home/Footer";
import { formatCurrency } from "../../utils/formatCurrency";
import "./ProductDetail.css";
const StockLabel = ({ product }) => {
  if (product.stockStatus === "order_only") return <span className="product-detail__stock product-detail__stock--order">Disponible por encargo</span>;
  const { stock } = product;
  if (stock === 0) return <span className="product-detail__stock product-detail__stock--sold-out">Agotado</span>;
  if (stock === 1 || stock === 2) return <span className="product-detail__stock product-detail__stock--low">¡Últimas unidades!</span>;
  return <span className="product-detail__stock product-detail__stock--available">Disponible</span>;
};
const formatSpecificationValue = (value) => {
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return value;
};
const SpecificationGroup = ({ title, items }) => {
  const visibleItems = items?.filter(({ value }) => value !== "" && value !== null && value !== undefined) ?? [];
  if (visibleItems.length === 0) return null;
  return (
    <section className="product-specifications__group">
      <h3>{title}</h3>
      <dl>
        {visibleItems.map(({ label, value }) => (
          <div className="product-specifications__row" key={label}>
            <dt>{label}</dt>
            <dd>{formatSpecificationValue(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
const ProductDetail = ({ product }) => {
  const galleryImages = product?.images?.length ? product.images : product ? [product.image] : [];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0]);
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
  const inquiryUrl = `https://wa.me/525652069271?text=${encodeURIComponent(inquiryMessage)}`;
  return (
    <>
      <main className="product-detail">
        <a className="product-detail__back" href="/categorias">← Volver al catálogo</a>
        <div className="product-detail__layout">
          <div className="product-detail__gallery">
            <div className={`product-detail__image-wrap${galleryImages.length > 1 ? " product-detail__image-wrap--gallery" : ""}`}>
              <img src={selectedImage} alt={product.name} />
            </div>
            {galleryImages.length > 1 && (
              <div className="product-detail__thumbnails" aria-label={`Galería de ${product.name}`}>
                {galleryImages.map((image, index) => (
                  <button
                    className={`product-detail__thumbnail${selectedImage === image ? " product-detail__thumbnail--selected" : ""}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`Ver imagen ${index + 1} de ${galleryImages.length}`}
                    aria-pressed={selectedImage === image}
                    key={image}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="product-detail__content">
            <span className="product-detail__category">{product.category}</span>
            <h1>{product.name}</h1>
            <strong className="product-detail__price">{formatCurrency(product.price, product.currency)} <span>{product.currency}</span></strong>
            <StockLabel product={product} />
            <dl className="product-detail__metadata">
              <div><dt>Habilidades</dt><dd>{product.skills.join(", ")}</dd></div>
            </dl>
            <div className="product-detail__tags" aria-label="Etiquetas del producto">
              {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <a className="product-detail__add" href={inquiryUrl} target="_blank" rel="noopener noreferrer">{product.stock === 0 ? "Consultar disponibilidad" : "Me interesa"}</a>
          </div>
        </div>
        {product.specifications && (
          <section className="product-specifications" aria-labelledby="product-specifications-title">
            <h2 id="product-specifications-title">Características del producto</h2>
            <div className="product-specifications__grid">
              <SpecificationGroup title="Características principales" items={product.specifications.primary} />
              <SpecificationGroup title="Detalles" items={product.specifications.details} />
            </div>
            <div className="product-specifications__description">
              <h3>Descripción</h3>
              <p>{product.description}</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};
export default ProductDetail;
