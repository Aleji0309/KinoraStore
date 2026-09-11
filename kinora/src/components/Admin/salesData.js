import { supabase } from "../../lib/supabase";
// Fetch every page so historical totals are not truncated by the API row limit.
export async function loadAllMX(table, columns, order) {
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from(table).select(columns)
      .eq("market", "MX").order(order).range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}
export async function markSalePaid(id) {
  const { data, error } = await supabase.from("sales")
    .update({ payment_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id).eq("market", "MX").eq("payment_status", "pending")
    .eq("sale_status", "sold").select("*").single();
  if (error) throw error;
  return data;
}
// The RPC owns sale creation and stock decrement in one transaction.
export const saleRegistrationEnabled = true;
export async function registerSale(draft) {
  const { data, error } = await supabase.rpc("register_sale", {
    p_product_sku: draft.product_sku,
    p_buyer_name: draft.buyer_name.trim(),
    p_quantity: Number(draft.quantity),
    p_unit_price: Number(draft.unit_price),
    p_payment_status: draft.payment_status,
    p_expected_payment_date: draft.expected_payment_date || null,
    p_sold_by: draft.sold_by.trim() || null,
    p_notes: draft.notes.trim() || null,
  });
  if (error) throw error;
  return data;
}
// Stock reconciliation belongs exclusively to this atomic database RPC.
export async function updateSale(id, draft) {
  const { data, error } = await supabase.rpc("update_sale", {
    p_sale_id: id,
    p_product_sku: draft.product_sku,
    p_buyer_name: draft.buyer_name.trim(),
    p_quantity: Number(draft.quantity),
    p_unit_price: Number(draft.unit_price),
    p_payment_status: draft.payment_status,
    p_expected_payment_date: draft.expected_payment_date || null,
    p_sold_by: draft.sold_by.trim() || null,
    p_notes: draft.notes.trim() || null,
  });
  if (error) throw error;
  return data;
}
export function availableSaleStock(product, sale) {
  return Number(product.stock) + (sale?.product_sku === product.product_sku ? Number(sale.quantity) : 0);
}
export function summarizeSales(sales) {
  return sales.reduce((summary, sale) => {
    if (sale.sale_status === "cancelled") return summary;
    const quantity = Number(sale.quantity);
    const total = quantity * Number(sale.unit_price);
    summary.total += total;
    summary.units += quantity;
    if (sale.payment_status === "paid") summary.paid += total;
    if (sale.payment_status === "pending") summary.pending += total;
    summary.bySku[sale.product_sku] = (summary.bySku[sale.product_sku] || 0) + quantity;
    return summary;
  }, { total: 0, paid: 0, pending: 0, units: 0, bySku: {} });
}
export const validInteger = (value) => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value));
export function validateSale(draft, products, sale = null) {
  const errors = {};
  const product = products.find((item) => item.product_sku === draft.product_sku);
  if (!product) errors.product_sku = "Selecciona un producto de México.";
  if (!draft.buyer_name.trim()) errors.buyer_name = "Escribe el nombre del comprador.";
  if (!validInteger(draft.quantity) || Number(draft.quantity) < 1) errors.quantity = "Usa una cantidad entera de al menos 1.";
  else if (product && Number(draft.quantity) > availableSaleStock(product, sale)) errors.quantity = "La cantidad supera el stock disponible.";
  if (!validInteger(draft.unit_price)) errors.unit_price = "Usa un precio entero de 0 o más.";
  if (!["pending", "paid"].includes(draft.payment_status)) errors.payment_status = "Selecciona el estado de pago.";
  if (draft.expected_payment_date && (!/^\d{4}-\d{2}-\d{2}$/.test(draft.expected_payment_date) || !Number.isFinite(Date.parse(draft.expected_payment_date)))) errors.expected_payment_date = "Indica una fecha válida.";
  return errors;
}
