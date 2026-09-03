import { useEffect, useRef } from "react";
import { useCart } from "../../context/cartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import "./CartDrawer.css";
const CartDrawer = () => {
  const { items, isCartOpen, totalItems, subtotal, updateQuantity, removeItem, clearCart, closeCart } = useCart();
  const closeButtonRef = useRef(null);
  useEffect(() => {
    if (!isCartOpen) return undefined;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);
  if (!isCartOpen) return null;
  const currency = "CRC";
  const handleClearCart = () => {
    if (window.confirm("¿Quieres vaciar el carrito?")) clearCart();
  };
  return (
    <div className="cart-overlay" onMouseDown={(event) => event.target === event.currentTarget && closeCart()}>
      <aside className="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="cart-drawer__header">
          <h2 id="cart-title">Tu carrito</h2>
          <button ref={closeButtonRef} type="button" className="cart-drawer__close" aria-label="Cerrar carrito" onClick={closeCart}>×</button>
        </header>
        <div className="cart-drawer__content">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <p>Tu carrito está vacío</p>
              <span>Explora el catálogo y agrega tus favoritos.</span>
              <a href="/categorias">Explorar productos</a>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li className="cart-item" key={item.productId}>
                  <img src={item.image} alt="" className="cart-item__image" />
                  <div className="cart-item__details">
                    <h3>{item.name}</h3>
                    <span className="cart-item__unit-price">{formatCurrency(item.price, item.currency)}</span>
                    <div className="cart-item__actions">
                      <div className="cart-item__quantity" aria-label={`Cantidad de ${item.name}`}>
                        <button type="button" aria-label={`Disminuir cantidad de ${item.name}`} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" aria-label={`Aumentar cantidad de ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                      </div>
                      <button type="button" className="cart-item__remove" aria-label={`Eliminar ${item.name} del carrito`} onClick={() => removeItem(item.productId)}>Eliminar</button>
                    </div>
                  </div>
                  <strong className="cart-item__subtotal">{formatCurrency(item.price * item.quantity, item.currency)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <footer className="cart-drawer__footer">
            <div className="cart-drawer__summary"><span>Artículos</span><strong>{totalItems}</strong></div>
            <div className="cart-drawer__summary"><span>Subtotal</span><strong>{formatCurrency(subtotal, currency)}</strong></div>
            <div className="cart-drawer__summary"><span>Envío estándar</span><strong>Incluido</strong></div>
            <div className="cart-drawer__summary cart-drawer__summary--total"><span>Total</span><strong>{formatCurrency(subtotal, currency)} <span>{currency}</span></strong></div>
            <p className="cart-drawer__shipping"><strong>Envío estándar incluido dentro de Costa Rica 🇨🇷</strong><span>Algunas zonas de difícil acceso pueden requerir un cargo adicional.</span></p>
            <button type="button" className="cart-drawer__checkout" disabled>Continuar con el pedido</button>
            <span className="cart-drawer__coming-soon">Checkout disponible próximamente</span>
            <button type="button" className="cart-drawer__clear" onClick={handleClearCart}>Vaciar carrito</button>
          </footer>
        )}
      </aside>
    </div>
  );
};
export default CartDrawer;
