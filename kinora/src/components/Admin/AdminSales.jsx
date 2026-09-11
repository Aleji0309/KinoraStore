import { useRef, useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { markSalePaid } from "./salesData";
import SaleForm from "./SaleForm";
const money = (value) => `${formatCurrency(value, "MXN")} MXN`;
const date = (value) => {
  if (!value) return "—";
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("es-MX");
};
function SaleRow({ sale, onPaid, onEdit, editingDisabled }) {
  const [status, setStatus] = useState("idle");
  const saving = useRef(false);
  const pay = async () => {
    if (saving.current) return;
    saving.current = true;
    setStatus("saving");
    try { onPaid({ ...sale, ...await markSalePaid(sale.id) }); setStatus("saved"); }
    catch { setStatus("error"); }
    finally { saving.current = false; }
  };
  return <tr>
    <td data-label="Fecha / Comprador"><strong>{sale.buyer_name || "Sin nombre"}</strong><span className="admin-detail">{date(sale.created_at)}</span></td>
    <td className="admin-product" data-label="Producto"><strong>{sale.products?.name || sale.product_sku}</strong><span className="admin-sku">SKU · {sale.product_sku}</span></td>
    <td data-label="Cantidad / Precio"><strong>{sale.quantity} unidades</strong><span className="admin-detail">{money(sale.unit_price)} c/u</span></td>
    <td data-label="Total"><strong>{money(Number(sale.quantity) * Number(sale.unit_price))}</strong></td>
    <td data-label="Pago / Venta"><span className={`admin-badge admin-badge--${sale.payment_status === "paid" ? "available" : "soldout"}`}>{({ paid: "Pagado", pending: "Pendiente" })[sale.payment_status] || "Sin estado"}</span><span className={`admin-badge admin-badge--${sale.sale_status === "cancelled" ? "disabled" : "available"}`}>{({ sold: "Vendido", cancelled: "Cancelado" })[sale.sale_status] || "Sin estado"}</span></td>
    <td data-label="Seguimiento"><span>Vendido por: {sale.sold_by || "—"}</span><span className="admin-detail">Pago esperado: {date(sale.expected_payment_date)}</span><details><summary>Notas</summary><p className="admin-sale-notes">{sale.notes || "Sin notas"}</p></details></td>
    <td data-label="Acciones">{sale.sale_status !== "cancelled" && <button className="admin-button admin-button--secondary" disabled={editingDisabled || status === "saving"} onClick={() => onEdit(sale)}>Editar</button>}{sale.payment_status === "pending" && sale.sale_status === "sold" ? <button className="admin-button" onClick={pay} disabled={status === "saving" || editingDisabled}>{status === "saving" ? "Guardando..." : "Marcar como pagado"}</button> : <span className="admin-detail">{sale.sale_status === "cancelled" ? "Venta cancelada" : "Sin acciones pendientes"}</span>}<p className={`admin-feedback admin-feedback--${status}`} role="status">{status === "error" ? "No se actualizó el pago. Reintenta; si persiste, actualiza las ventas." : status === "saved" ? "✓ Pago registrado" : ""}</p></td>
  </tr>;
}
export default function AdminSales({ sales, summary, loading, error, onRetry, onPaid, onRegistered, products, productsReady }) {
  const [editingSale, setEditingSale] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const registerButton = useRef(null);
  return <>
    <section className="admin-summary" aria-label="Resumen de ventas">{[["total", "Total vendido", money(summary.total)], ["available", "Total pagado", money(summary.paid)], ["soldout", "Pendiente por cobrar", money(summary.pending)], ["disabled", "Unidades vendidas", summary.units]].map(([key, label, value]) => <div key={key} className={`admin-stat admin-stat--${key}`}><span>{label}</span><strong>{loading || error ? "—" : value}</strong></div>)}</section>
    <div className="admin-sales-toolbar"><p>Los totales excluyen las ventas canceladas.</p><button ref={registerButton} className="admin-button" disabled={!productsReady || saving} aria-expanded={formOpen} onClick={() => { setRegistered(false); setUpdated(false); setEditingSale(null); setFormOpen((open) => !open); }}>Registrar venta</button></div>
    {!productsReady && <p className="admin-error">El formulario requiere cargar el inventario. Revisa la sección Inventario.</p>}
    {updated && <p className="admin-feedback--saved" role="status">✓ Venta actualizada. Se consultan de nuevo el inventario y los totales.</p>}
    {registered && <p className="admin-feedback--saved" role="status">✓ Venta registrada. El inventario y las ventas se consultan de nuevo para actualizar los totales.</p>}
    {formOpen && productsReady && <SaleForm key={editingSale?.id ?? "new"} sale={editingSale} products={products} saving={saving} onSavingChange={setSaving} onRegistered={() => { setFormOpen(false); setRegistered(!editingSale); setUpdated(Boolean(editingSale)); setEditingSale(null); registerButton.current?.focus(); onRegistered(); }} onClose={() => { setEditingSale(null); setFormOpen(false); registerButton.current?.focus(); }} />}
    <section className="admin-inventory" aria-labelledby="sales-title"><div className="admin-section-heading admin-section-actions"><div><h2 id="sales-title">Historial de ventas</h2><p>Ventas y pagos de México.</p></div><button className="admin-button admin-button--secondary" onClick={onRetry} disabled={loading || saving}>Actualizar ventas</button></div>
      {loading ? <p className="admin-empty" role="status">Cargando ventas...</p> : error ? <p className="admin-empty admin-error" role="alert">{error}</p> : !sales.length ? <p className="admin-empty">Todavía no hay ventas registradas en México.</p> : <table className="admin-table admin-sales-table"><caption className="admin-sr-only">Historial de ventas de México</caption><thead><tr>{["Fecha / Comprador", "Producto / SKU", "Cantidad / Precio", "Total", "Pago / Venta", "Seguimiento", "Acciones"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{sales.map((sale) => <SaleRow key={sale.id} sale={sale} onPaid={onPaid} editingDisabled={saving || !productsReady || Boolean(editingSale)} onEdit={(selected) => { setEditingSale(selected); setRegistered(false); setUpdated(false); setFormOpen(true); }} />)}</tbody></table>}
    </section>
  </>;
}
