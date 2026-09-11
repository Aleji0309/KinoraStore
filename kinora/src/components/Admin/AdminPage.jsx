import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import Logo from "../common/Logo/Logo";
import useInactivityLogout from "../../hooks/useInactivityLogout";
import AdminLogin from "./AdminLogin";
import "./AdminPage.css";
import AdminSales from "./AdminSales";
import AdminReviews from "./AdminReviews";
import { loadAllMX, summarizeSales } from "./salesData";
const availability = (product) => !product.enabled ? "disabled" : Number(product.stock) === 0 ? "soldout" : "available";
const labels = { disabled: "Deshabilitado", soldout: "Agotado", available: "Disponible" };
const validInteger = (value) => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value));
function InventoryRow({ product, unitsSold, onSaved }) {
    const [draft, setDraft] = useState({ price: String(product.price), stock: String(product.stock), enabled: product.enabled });
    const [status, setStatus] = useState("idle");
    const saving = useRef(false);
    const valid = validInteger(draft.price) && validInteger(draft.stock);
    const dirty = Number(draft.price) !== Number(product.price) || Number(draft.stock) !== Number(product.stock) || draft.enabled !== product.enabled;
    const name = product.products?.name || product.product_sku;
    const change = (field, value) => { setDraft((previous) => ({ ...previous, [field]: value })); setStatus("idle"); };
    const save = async () => {
        if (!valid || saving.current || !dirty) return;
        saving.current = true;
        setStatus("saving");
        const values = { price: Number(draft.price), stock: Number(draft.stock), enabled: draft.enabled };
        try {
            const { data, error } = await supabase.from("market_products").update(values)
                .eq("product_sku", product.product_sku).eq("market", "MX")
                .select("product_sku, price, stock, enabled").single();
            if (error || !data) throw error || new Error("No updated row");
            onSaved({ ...product, ...data });
            setDraft({ price: String(data.price), stock: String(data.stock), enabled: data.enabled });
            setStatus("saved");
        } catch {
            setStatus("error");
        } finally { saving.current = false; }
    };
    return (
        <tr>
            <td className="admin-product"><strong>{name}</strong><span className="admin-sku">SKU · {product.product_sku}</span></td>
            <td data-label="Stock original">{product.initial_stock ?? "—"}</td>
            <td data-label="Unidades vendidas">{unitsSold}</td>
            {["price", "stock"].map((field) => (
                <td key={field} data-label={field === "price" ? "Precio" : "Stock"}>
                    <div className={`admin-number admin-number--${field}`}>
                        <input type="number" min="0" step="1" inputMode="numeric" aria-label={`${field === "price" ? "Precio" : "Stock"} de ${name}`}
                            value={draft[field]} disabled={status === "saving"} aria-invalid={!validInteger(draft[field])}
                            onChange={(event) => change(field, event.target.value)} />
                        {field === "price" && <span>MXN</span>}
                    </div>
                </td>
            ))}
            <td data-label="Habilitado"><label className="admin-toggle"><input type="checkbox" role="switch" checked={draft.enabled} disabled={status === "saving"} onChange={(event) => change("enabled", event.target.checked)} aria-label={`Habilitar ${name}`} /><span className="admin-toggle-track" /><span>{draft.enabled ? "Sí" : "No"}</span></label></td>
            <td data-label="Disponibilidad"><span className={`admin-badge admin-badge--${availability(product)}`}>{labels[availability(product)]}</span></td>
            <td className="admin-save"><button className="admin-button" disabled={!valid || !dirty || status === "saving"} onClick={save}>{status === "saving" ? "Guardando..." : "Guardar"}</button><div className={`admin-feedback admin-feedback--${status}`} role="status">{!valid ? "Usa enteros de 0 o más." : status === "saved" ? "✓ Guardado" : status === "error" ? "No se guardó. Intenta de nuevo." : dirty ? "Cambios sin guardar" : ""}</div></td>
        </tr>
    );
}
export default function AdminPage() {
    const [section, setSection] = useState("inventory");
    const [sales, setSales] = useState([]);
    const [salesLoading, setSalesLoading] = useState(true);
    const [salesError, setSalesError] = useState("");
    const [salesRetry, setSalesRetry] = useState(0);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState("");
    const [authError, setAuthError] = useState("");
    const [retry, setRetry] = useState(0);
    const [signingOut, setSigningOut] = useState(false);
    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(({ data, error }) => {
            if (!active) return;
            setSession(data.session);
            if (error) setAuthError("No se pudo verificar la sesión. Intenta ingresar de nuevo.");
            setLoading(false);
        }).catch(() => { if (active) { setAuthError("No se pudo verificar la sesión."); setLoading(false); } });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
        });
        return () => { active = false; subscription.unsubscribe(); };
    }, []);
    const userId = session?.user.id;
    useEffect(() => {
        if (!userId) return;
        let active = true;
        const loadProducts = async () => {
            setProductsLoading(true);
            setProductsError("");
            setProducts([]);
            try {
                const data = await loadAllMX("market_products", "product_sku, market, currency, price, initial_stock, stock, enabled, products(name)", "product_sku");
                if (active) setProducts(data ?? []);
            } catch { if (active) setProductsError("No se pudo cargar el inventario. Intenta de nuevo."); }
            finally { if (active) setProductsLoading(false); }
        };
        loadProducts();
        return () => { active = false; };
    }, [userId, retry]);
    useEffect(() => {
        if (!userId) return;
        let active = true;
        const loadSales = async () => {
            setSalesLoading(true);
            setSalesError("");
            setSales([]);
            try {
                const data = await loadAllMX(
                    "sales",
                    "id, market, product_sku, buyer_name, quantity, unit_price, payment_status, sale_status, expected_payment_date, paid_at, sold_by, notes, created_at, products(name)",
                    "id"
                ); if (active) setSales(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            } catch { if (active) setSalesError("No se pudieron cargar las ventas. Usa Actualizar ventas para reintentar."); }
            finally { if (active) setSalesLoading(false); }
        };
        loadSales();
        return () => { active = false; };
    }, [userId, salesRetry]);
    const logout = async (inactivity = false) => {
        setSigningOut(true);
        setAuthError("");
        if (inactivity) {
            setSession(null);
            setProducts([]);
            setSales([]);
            setSection("inventory");
        }
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setProducts([]);
            setSales([]);
            setSession(null);
        } catch {
            if (inactivity) {
                await supabase.auth.signOut({ scope: "local" }).catch(() => {});
                setAuthError("La sesión se cerró por inactividad. Ingresa de nuevo.");
            } else setAuthError("No se pudo cerrar la sesión. Intenta de nuevo.");
        }
        finally { setSigningOut(false); }
    };
    const inactivityWarning = useInactivityLogout(userId, () => logout(true));
    if (loading) return <main className="admin-shell admin-login-shell"><p role="status">Cargando administración...</p></main>;
    if (!session) return <AdminLogin onLogin={setSession} sessionError={authError} />;
    const salesSummary = summarizeSales(sales);
    const counts = products.reduce((totals, product) => { totals[availability(product)]++; return totals; }, { available: 0, soldout: 0, disabled: 0 });
    return (
        <main className="admin-shell"><div className="admin-container">
            <div className="admin-brandbar"><Logo className="admin-logo" /><span className="admin-market">México · MXN</span></div>
            <header className="admin-heading"><div><p className="admin-eyebrow">Administración</p><h1>Administración Kinora</h1><p>Gestiona el inventario, las ventas y los pagos de México.</p></div><div className="admin-account"><span>{session.user.email}</span><button className="admin-button admin-button--secondary" onClick={() => logout()} disabled={signingOut}>{signingOut ? "Cerrando sesión..." : "Cerrar sesión"}</button></div></header>
            {inactivityWarning && <p className="admin-registration-notice" role="status">Tu sesión se cerrará pronto por inactividad.</p>}
            {authError && <p className="admin-error" role="alert">{authError}</p>}
            <nav className="admin-tabs" aria-label="Secciones de administración"><button className="admin-tab" aria-pressed={section === "inventory"} onClick={() => setSection("inventory")}>Inventario</button><button className="admin-tab" aria-pressed={section === "sales"} onClick={() => setSection("sales")}>Ventas</button><button className="admin-tab" aria-pressed={section === "reviews"} onClick={() => setSection("reviews")}>Opiniones</button></nav>
            <div hidden={section !== "inventory"}>
                <section className="admin-summary admin-summary--inventory" aria-label="Resumen del inventario">
                    {[["total", "Total de productos", products.length], ["available", "Disponibles", counts.available], ["soldout", "Agotados", counts.soldout], ["disabled", "Deshabilitados", counts.disabled], ["stock", "Unidades en stock", products.reduce((total, product) => total + Number(product.stock), 0)], ["units", "Unidades vendidas", salesLoading || salesError ? "—" : salesSummary.units]].map(([key, label, count]) => <div className={`admin-stat admin-stat--${key}`} key={key}><span>{label}</span><strong>{productsLoading || productsError ? "—" : count}</strong></div>)}
                </section>
                {salesError && <p className="admin-error" role="alert">No se pudieron calcular las unidades vendidas. Reintenta desde Ventas.</p>}
                <section className="admin-inventory" aria-labelledby="inventory-title"><div className="admin-section-heading"><h2 id="inventory-title">Tus productos</h2><p>Edita cada producto y guarda sus cambios. El resumen refleja el inventario guardado.</p></div>
                    {productsLoading ? <p className="admin-empty" role="status">Cargando inventario...</p> : productsError ? <div className="admin-empty"><p className="admin-error" role="alert">{productsError}</p><button className="admin-button admin-button--secondary" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div> : products.length === 0 ? <p className="admin-empty">Todavía no hay productos para México.</p> :
                        <table className="admin-table"><caption className="admin-sr-only">Inventario de México. Precios en MXN; disponibilidad basada en los valores guardados.</caption><thead><tr>{["Producto / SKU", "Stock original", "Vendidas", "Precio", "Stock actual", "Habilitado", "Disponibilidad", "Acción"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{products.map((product) => <InventoryRow key={`${userId}-${product.product_sku}`} product={product} unitsSold={salesLoading || salesError ? "—" : salesSummary.bySku[product.product_sku] || 0} onSaved={(saved) => setProducts((current) => current.map((item) => item.product_sku === saved.product_sku ? saved : item))} />)}</tbody></table>}
                </section></div>
            <div hidden={section !== "sales"}><AdminSales key={userId} sales={sales} summary={salesSummary} loading={salesLoading} error={salesError} onRegistered={() => { setProductsLoading(true); setSalesLoading(true); setRetry((value) => value + 1); setSalesRetry((value) => value + 1); }} onRetry={() => setSalesRetry((value) => value + 1)} onPaid={(updated) => setSales((current) => current.map((sale) => sale.id === updated.id ? updated : sale))} products={products} productsReady={!productsLoading && !productsError} /></div>
            <div hidden={section !== "reviews"}><AdminReviews key={userId} /></div>
            <p className="admin-footer">Un espacio para cuidar cada detalle de Kinora.</p>
        </div></main>
    );
}
