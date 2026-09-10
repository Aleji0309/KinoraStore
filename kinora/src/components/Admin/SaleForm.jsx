import { useState } from "react";
import { registerSale, saleRegistrationEnabled, validateSale } from "./salesData";
export default function SaleForm({ products, onClose }) {
  const [draft, setDraft] = useState({ product_sku: "", buyer_name: "", quantity: "1", unit_price: "", payment_status: "pending", expected_payment_date: "", sold_by: "", notes: "" });
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState("");
  const errors = validateSale(draft, products);
  const selected = products.find((product) => product.product_sku === draft.product_sku);
  const change = (field, value) => {
    setReviewed(false);
    setMessage("");
    setDraft((previous) => ({ ...previous, [field]: value, ...(field === "product_sku" ? { unit_price: String(products.find((product) => product.product_sku === value)?.price ?? "") } : {}) }));
  };
  const submit = async (event) => {
    event.preventDefault();
    setReviewed(true);
    if (Object.keys(errors).length) return;
    if (!saleRegistrationEnabled) { setMessage("Datos válidos. El registro de nuevas ventas aún no está disponible. No se ha guardado esta venta."); return; }
    try {
      await registerSale({ ...draft, market: "MX", quantity: Number(draft.quantity), unit_price: Number(draft.unit_price), buyer_name: draft.buyer_name.trim(), sold_by: draft.sold_by.trim(), sale_status: "sold", expected_payment_date: draft.payment_status === "pending" ? draft.expected_payment_date : null, paid_at: draft.payment_status === "paid" ? new Date().toISOString() : null });
    } catch (error) { setMessage(error.message); }
  };
  const fieldProps = (field) => ({ id: `sale-${field}`, value: draft[field], onChange: (event) => change(field, event.target.value), "aria-invalid": reviewed && Boolean(errors[field]), "aria-describedby": reviewed && errors[field] ? `error-${field}` : undefined });
  const errorFor = (field) => reviewed && errors[field] && <span id={`error-${field}`} className="admin-error">{errors[field]}</span>;
  return <section className="admin-inventory admin-sale-form-panel" aria-labelledby="sale-form-title"><div className="admin-section-heading admin-section-actions"><div><h2 id="sale-form-title">Registrar venta</h2><p>Completa los datos de la venta.</p></div><button className="admin-button admin-button--secondary" onClick={onClose}>Cerrar formulario</button></div><form className="admin-sale-form" onSubmit={submit} noValidate>
    <label className="admin-form-wide" htmlFor="sale-product_sku">Producto<select {...fieldProps("product_sku")} autoFocus><option value="">Selecciona un producto</option>{products.map((product) => <option key={product.product_sku} value={product.product_sku}>{product.products?.name || product.product_sku} · {product.product_sku}</option>)}</select>{errorFor("product_sku")}<small>Stock disponible: {selected ? selected.stock : "—"} unidades</small></label>
    <label htmlFor="sale-buyer_name">Comprador<input {...fieldProps("buyer_name")} autoComplete="off" required />{errorFor("buyer_name")}</label>
    <label htmlFor="sale-sold_by">Vendido por<input {...fieldProps("sold_by")} required />{errorFor("sold_by")}</label>
    <label htmlFor="sale-quantity">Cantidad<input {...fieldProps("quantity")} type="number" min="1" max={selected?.stock} step="1" inputMode="numeric" required />{errorFor("quantity")}</label>
    <label htmlFor="sale-unit_price">Precio unitario · MXN<input {...fieldProps("unit_price")} type="number" min="0" step="1" inputMode="numeric" required />{errorFor("unit_price")}</label>
    <label htmlFor="sale-payment_status">Estado de pago<select {...fieldProps("payment_status")}><option value="pending">Pendiente</option><option value="paid">Pagado</option></select>{errorFor("payment_status")}</label>
    <label htmlFor="sale-expected_payment_date">Fecha esperada de pago{draft.payment_status === "paid" && " (opcional)"}<input {...fieldProps("expected_payment_date")} type="date" required={draft.payment_status === "pending"} />{errorFor("expected_payment_date")}</label>
    <label className="admin-form-wide" htmlFor="sale-notes">Notas (opcional)<textarea {...fieldProps("notes")} rows="3" /></label>
    <div className="admin-form-wide admin-registration-notice"><p id="registration-notice">El registro de nuevas ventas estará disponible próximamente. Puedes revisar los datos, pero todavía no se guardarán ni cambiarán las existencias.</p><div className="admin-form-actions"><button className="admin-button admin-button--secondary" type="submit">Validar datos</button><button className="admin-button" type="button" disabled aria-describedby="registration-notice">Guardar venta</button></div><p role="status">{message || (reviewed && Object.keys(errors).length ? "Revisa los campos indicados." : "")}</p></div>
  </form></section>;
}
