import Footer from "../Home/Footer";
import { formatCurrency } from "../../utils/formatCurrency";
import { useCart } from "../../context/cartContext";
import "./ProductDetail.css";
const StockLabel = ({ stock }) => {
  if (stock === 0) return <span className="product-detail__stock product-detail__stock--sold-out">Agotado</span>;
  if (stock === 1 || stock === 2) return <span className="product-detail__stock product-detail__stock--low">¡Últimas unidades!</span>;
  return null;
};
const ProductDetail = ({ product }) => {
  const { items, addToCart, openCart } = useCart();
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
  const cartItem = items.find((item) => item.id === product.id);
  const isAtStockLimit = cartItem?.quantity >= product.stock;
  const isUnavailable = product.stock === 0 || isAtStockLimit;
  const handleAddToCart = () => {
    if (isUnavailable) return;
    addToCart(product);
    openCart();
  };
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
            <strong className="product-detail__price">{formatCurrency(product.price, product.currency)} <span>{product.currency}</span></strong>
            <StockLabel stock={product.stock} />
            <p className="product-detail__description">{product.description}</p>
            <div className="product-detail__tags" aria-label="Características del producto">
              {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <button type="button" className="product-detail__add" disabled={isUnavailable} onClick={handleAddToCart}>
              {product.stock === 0 ? "Agotado" : isAtStockLimit ? "Máximo disponible" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
export default ProductDetail;
