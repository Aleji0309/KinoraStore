import { useCallback, useEffect, useState } from "react";
import { CartContext } from "./cartContext";
import { marketConfig } from "../config/markets";
import { products } from "../data/products";
const CART_STORAGE_KEY = "kinora_cr_cart";
const getAvailableStock = (product) => Number.isInteger(product.stock) && product.stock > 0 ? product.stock : 1;
const loadCart = () => {
  if (marketConfig.market !== "CR") return [];
  try {
    const storedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(storedItems)) return [];
    return storedItems.flatMap((storedItem) => {
      const product = products.find(({ id }) => id === storedItem?.productId);
      if (!product || product.enabled === false || product.stock === 0 || !Number.isInteger(storedItem.quantity) || storedItem.quantity < 1) return [];
      return [{
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        currency: product.currency,
        quantity: Math.min(storedItem.quantity, getAvailableStock(product)),
        stock: getAvailableStock(product),
      }];
    });
  } catch {
    return [];
  }
};
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
    if (marketConfig.market !== "CR") return;
    try {
      if (items.length === 0) localStorage.removeItem(CART_STORAGE_KEY);
      else localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The cart remains usable in memory when storage is unavailable.
    }
  }, [items]);
  const addItem = (product) => {
    if (marketConfig.market !== "CR" || product.enabled === false || product.stock === 0) return;
    const stock = getAvailableStock(product);
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.id);
      if (!existingItem) {
        return [...currentItems, {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          image: product.image,
          quantity: 1,
          stock,
        }];
      }
      if (existingItem.quantity >= existingItem.stock) return currentItems;
      return currentItems.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    });
  };
  const updateQuantity = (productId, quantity) => {
    if (!Number.isFinite(quantity)) return;
    setItems((currentItems) => currentItems.map((item) => {
      if (item.productId !== productId) return item;
      return { ...item, quantity: Math.min(item.stock, Math.max(1, Math.trunc(quantity))) };
    }));
  };
  const removeItem = (productId) => setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // State is still cleared when storage is unavailable.
    }
  };
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  return (
    <CartContext.Provider value={{ items, isCartOpen, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
};
