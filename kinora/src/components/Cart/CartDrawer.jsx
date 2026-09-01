import { useEffect, useRef } from "react";
import { useCart } from "../../context/cartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { marketConfig } from "../../config/markets";
import "./CartDrawer.css";
const CartDrawer = () => {
  const { items, isCartOpen, subtotal, incrementQuantity, decrementQuantity, removeFromCart, closeCart } = useCart();
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
  const currency = items[0]?.currency ?? marketConfig.currency;
  const locale = items[0]?.locale ?? marketConfig.locale;
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
              <a href="/categorias">Explorar productos</a>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li className="cart-item" key={item.id}>
                  <img src={item.image} alt="" className="cart-item__image" />
                  <div className="cart-item__details">
                    <h3>{item.name}</h3>
                    <span className="cart-item__unit-price">{formatCurrency(item.price, item.currency, item.locale)}</span>
                    <div className="cart-item__actions">
                      <div className="cart-item__quantity" aria-label={`Cantidad de ${item.name}`}>
                        <button type="button" aria-label={`Reducir cantidad de ${item.name}`} disabled={item.quantity <= 1} onClick={() => decrementQuantity(item.id)}>−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button type="button" aria-label={`Aumentar cantidad de ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => incrementQuantity(item.id)}>+</button>
                      </div>
                      <button type="button" className="cart-item__remove" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                    </div>
                  </div>
                  <strong className="cart-item__subtotal">{formatCurrency(item.price * item.quantity, item.currency, item.locale)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer className="cart-drawer__footer">
          <div className="cart-drawer__subtotal">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal, currency, locale)} <span>{currency}</span></strong>
          </div>
          <button type="button" className="cart-drawer__checkout" disabled>Continuar compra</button>
        </footer>
      </aside>
    </div>
  );
};
export default CartDrawer;
