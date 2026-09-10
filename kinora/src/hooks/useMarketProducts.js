import { useEffect, useState } from "react";
import { getMarketProducts } from "../api/getMarketProducts";
import { products as localProducts } from "../data/products";
export const useMarketProducts = () => {
    const [products, setProducts] = useState(localProducts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const marketProducts = await getMarketProducts();
                const commerceBySku = new Map(
                    marketProducts.map((item) => [item.product_sku, item])
                );
                const mergedProducts = localProducts.map((product) => {
                    const commerce = commerceBySku.get(product.id);
                    if (!commerce) {
                        return {
                            ...product,
                            price: null,
                            stock: 0,
                            enabled: false,
                            stockStatus: "out_of_stock",
                        };
                    }
                    return {
                        ...product,
                        price: commerce.price,
                        stock: commerce.stock,
                        currency: commerce.currency,
                        enabled: commerce.enabled,
                        stockStatus:
                            commerce.stock === 0 ? "out_of_stock" : "in_stock",
                    };
                });
                setProducts(mergedProducts);
            } catch (err) {
                console.error("Error loading market products:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);
    return {
        products,
        loading,
        error,
    };
};