import { useCallback, useState } from "react";
import { CartContext } from "./cartContext";
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const addToCart = (product) => {
    if (product.stock === 0) return;
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      if (!existingItem) {
        return [...currentItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          image: product.image,
          quantity: 1,
          stock: product.stock,
        }];
      }
      if (existingItem.quantity >= existingItem.stock) return currentItems;
      return currentItems.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    });
  };
  const incrementQuantity = (productId) => {
    setItems((currentItems) => currentItems.map((item) => {
      if (item.id !== productId || item.quantity >= item.stock) return item;
      return { ...item, quantity: item.quantity + 1 };
    }));
  };
  const decrementQuantity = (productId) => {
    setItems((currentItems) => currentItems.map((item) => {
      if (item.id !== productId || item.quantity <= 1) return item;
      return { ...item, quantity: item.quantity - 1 };
    }));
  };
  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  return (
    <CartContext.Provider value={{ items, isCartOpen, cartCount, subtotal, addToCart, incrementQuantity, decrementQuantity, removeFromCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
};
