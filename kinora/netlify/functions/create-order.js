import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import { marketConfigs } from "../../src/config/markets.js";
import { catalogProducts } from "../../src/data/products.js";
const ALLOWED_PROVINCES = new Set(["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"]);
const MAX_BODY_BYTES = 50_000;
const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 50;
const getCostaRicaOrderProduct = (productId) => {
  const product = catalogProducts.find(({ id }) => id === productId);
  const commercialData = marketConfigs.CR.commerce[productId];
  if (!product || !commercialData) return null;
  return {
    ...product,
    ...commercialData,
    currency: marketConfigs.CR.currency,
    locale: marketConfigs.CR.locale,
    priceStatus: "final",
  };
};
const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});
const validationError = (message) => jsonResponse(400, { success: false, error: message });
const getString = (value, { min, max }) => {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  return trimmedValue.length >= min && trimmedValue.length <= max ? trimmedValue : null;
};
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return /^\d{8}$/.test(digits) || /^506\d{8}$/.test(digits);
};
const getStockLimit = (product) => {
  if (Number.isInteger(product.stock) && product.stock >= 0) return product.stock;
  if (product.stock === null && product.stockStatus === "order_only") return null;
  return undefined;
};
const createOrderNumber = (randomUUIDImpl) => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUIDImpl().replaceAll("-", "").slice(0, 6).toUpperCase();
  return `KIN-CR-${date}-${suffix}`;
};
const parsePayload = (event) => {
  if (typeof event.body !== "string" || Buffer.byteLength(event.body, "utf8") > MAX_BODY_BYTES) return null;
  try {
    return JSON.parse(event.body);
  } catch {
    return null;
  }
};
export const createOrderHandler = ({ createClientImpl = createClient, env = process.env, randomUUIDImpl = randomUUID, getProductById = getCostaRicaOrderProduct } = {}) => async (event) => {
  if (event.httpMethod !== "POST") return jsonResponse(405, { success: false, error: "Method Not Allowed" });
  const payload = parsePayload(event);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return validationError("Solicitud inválida.");
  const name = getString(payload.customer?.name, { min: 2, max: 100 });
  const email = getString(payload.customer?.email, { min: 3, max: 254 });
  const phone = getString(payload.customer?.phone, { min: 8, max: 30 });
  const province = getString(payload.shippingAddress?.province, { min: 2, max: 20 });
  const canton = getString(payload.shippingAddress?.canton, { min: 2, max: 100 });
  const district = getString(payload.shippingAddress?.district, { min: 2, max: 100 });
  const postalCodeValue = payload.shippingAddress?.postalCode;
  const postalCode = typeof postalCodeValue === "string" && /^\d{5}$/.test(postalCodeValue) ? postalCodeValue : null;
  const address = getString(payload.shippingAddress?.address, { min: 5, max: 500 });
  const referenceValue = payload.shippingAddress?.reference;
  const hasReference = referenceValue !== undefined && referenceValue !== null && referenceValue !== "";
  const reference = hasReference ? getString(referenceValue, { min: 1, max: 500 }) : null;
  if (!name) return validationError("Nombre inválido.");
  if (!email || !isValidEmail(email)) return validationError("Correo inválido.");
  if (!phone || !isValidPhone(phone)) return validationError("Teléfono inválido.");
  if (!province || !ALLOWED_PROVINCES.has(province)) return validationError("Provincia inválida.");
  if (!canton) return validationError("Cantón inválido.");
  if (!district) return validationError("Distrito inválido.");
  if (!postalCode) return validationError("Código postal inválido.");
  if (!address) return validationError("Dirección inválida.");
  if (hasReference && reference === null) return validationError("Referencia de entrega inválida.");
  if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > MAX_ITEMS) return validationError("El pedido debe contener entre 1 y 50 productos.");
  const seenProductIds = new Set();
  const orderItems = [];
  for (const item of payload.items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return validationError("Producto inválido.");
    const productId = getString(item.productId, { min: 1, max: 50 });
    if (!productId || seenProductIds.has(productId)) return validationError("Producto inválido o duplicado.");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) return validationError("Cantidad inválida.");
    const product = getProductById(productId);
    if (!product || product.enabled === false) return validationError("Producto no disponible.");
    const stockLimit = getStockLimit(product);
    if (stockLimit === undefined || stockLimit === 0) return validationError("Producto no disponible.");
    if (stockLimit !== null && item.quantity > stockLimit) return validationError("La cantidad supera el stock disponible.");
    seenProductIds.add(productId);
    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    });
  }
  const subtotal = orderItems.reduce((total, item) => total + item.lineTotal, 0);
  const supabaseUrl = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(500, { success: false, error: "No pudimos registrar tu pedido." });
  try {
    const orderNumber = createOrderNumber(randomUUIDImpl);
    const supabase = createClientImpl(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.from("orders").insert({
      order_number: orderNumber,
      status: "pending",
      market: "CR",
      currency: "CRC",
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      province,
      canton,
      district,
      postal_code: postalCode,
      address,
      delivery_reference: reference,
      subtotal,
      shipping_amount: 0,
      total: subtotal,
      items: orderItems,
    }).select("id, order_number").single();
    if (error) {
      console.error("Supabase create-order insert error:", error);
      return jsonResponse(500, { success: false, error: "No pudimos registrar tu pedido." });
    }
    if (!data?.id || !data?.order_number) {
      console.error("Supabase create-order insert did not return the required order identifiers.");
      return jsonResponse(500, { success: false, error: "No pudimos registrar tu pedido." });
    }
    return jsonResponse(201, { success: true, orderId: data.id, orderNumber: data.order_number, total: subtotal, currency: "CRC" });
  } catch (error) {
    console.error("Unexpected create-order error:", error);
    return jsonResponse(500, { success: false, error: "No pudimos registrar tu pedido." });
  }
};
export const handler = createOrderHandler();
