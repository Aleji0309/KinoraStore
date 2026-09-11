import { useRef, useState } from "react";
import { registerSale, saleRegistrationEnabled, validateSale } from "./salesData";
export default function SaleForm({ products, onClose, onRegistered, saving, onSavingChange }) {
  const [draft, setDraft] = useState({ product_sku: "", buyer_name: "", quantity: "1", unit_price: "", payment_status: "pending", expected_payment_date: "", sold_by: "", notes: "" });
  const submitting = useRef(false);
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
    if (submitting.current || !saleRegistrationEnabled) return;
    setReviewed(true);
    setMessage("");
    if (Object.keys(errors).length) return;
    submitting.current = true;
    onSavingChange(true);
    try {
      await registerSale(draft);
    } catch {
      setMessage("No se pudo registrar la venta. Verifica las existencias y los datos e intenta de nuevo. Si se perdió la conexión, revisa el historial antes de reintentar.");
      return;
    } finally {
      submitting.current = false;
      onSavingChange(false);
    }
    onRegistered();
  };
  const fieldProps = (field) => ({ disabled: saving, id: `sale-${field}`, value: draft[field], onChange: (event) => change(field, event.target.value), "aria-invalid": reviewed && Boolean(errors[field]), "aria-describedby": reviewed && errors[field] ? `error-${field}` : undefined });
  const errorFor = (field) => reviewed && errors[field] && <span id={`error-${field}`} className="admin-error">{errors[field]}</span>;
  return <section className="admin-inventory admin-sale-form-panel" aria-labelledby="sale-form-title"><div className="admin-section-heading admin-section-actions"><div><h2 id="sale-form-title">Registrar venta</h2><p>Completa los datos de la venta.</p></div><button className="admin-button admin-button--secondary" onClick={onClose} disabled={saving}>Cerrar formulario</button></div><form className="admin-sale-form" onSubmit={submit} noValidate>
    <label className="admin-form-wide" htmlFor="sale-product_sku">Producto<select {...fieldProps("product_sku")} autoFocus><option value="">Selecciona un producto</option>{products.map((product) => <option key={product.product_sku} value={product.product_sku}>{product.products?.name || product.product_sku} · {product.product_sku}</option>)}</select>{errorFor("product_sku")}<small>Stock disponible: {selected ? selected.stock : "—"} unidades</small></label>
    <label htmlFor="sale-buyer_name">Comprador<input {...fieldProps("buyer_name")} autoComplete="off" required />{errorFor("buyer_name")}</label>
    <label htmlFor="sale-sold_by">Vendido por (opcional)<input {...fieldProps("sold_by")} />{errorFor("sold_by")}</label>
    <label htmlFor="sale-quantity">Cantidad<input {...fieldProps("quantity")} type="number" min="1" max={selected?.stock} step="1" inputMode="numeric" required />{errorFor("quantity")}</label>
    <label htmlFor="sale-unit_price">Precio unitario · MXN<input {...fieldProps("unit_price")} type="number" min="0" step="1" inputMode="numeric" required />{errorFor("unit_price")}</label>
    <label htmlFor="sale-payment_status">Estado de pago<select {...fieldProps("payment_status")}><option value="pending">Pendiente</option><option value="paid">Pagado</option></select>{errorFor("payment_status")}</label>
    <label htmlFor="sale-expected_payment_date">Fecha esperada de pago (opcional)<input {...fieldProps("expected_payment_date")} type="date" />{errorFor("expected_payment_date")}</label>
    <label className="admin-form-wide" htmlFor="sale-notes">Notas (opcional)<textarea {...fieldProps("notes")} rows="3" /></label>
    <div className="admin-form-wide"><div className="admin-form-actions"><button className="admin-button" type="submit" disabled={saving || !saleRegistrationEnabled}>{saving ? "Guardando..." : "Guardar venta"}</button></div><p className="admin-error" role="alert">{message || (reviewed && Object.keys(errors).length ? "Revisa los campos indicados." : "")}</p></div>
  </form></section>;
}
