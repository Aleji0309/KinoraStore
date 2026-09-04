import assert from "node:assert/strict";
import test from "node:test";
import { createOrderHandler } from "../../netlify/functions/create-order.js";
const VALID_PAYLOAD = {
  customer: { name: "Ana Pérez", email: "ana@example.com", phone: "8888-8888" },
  shippingAddress: {
    province: "San José",
    canton: "Central",
    district: "Carmen",
    address: "Casa 10, portón azul",
    reference: "Frente al parque",
  },
  items: [{ productId: "KIN-FID-ARTURITO", quantity: 1 }],
};
const makeEvent = (payload = VALID_PAYLOAD, httpMethod = "POST") => ({ httpMethod, body: JSON.stringify(payload) });
const makeSupabaseClient = ({ error = null, throws = false } = {}) => {
  const insertedRows = [];
  const client = {
    from: (table) => {
      assert.equal(table, "orders");
      return {
        insert: (row) => {
          insertedRows.push(row);
          return {
            select: () => ({
              single: async () => {
                if (throws) throw new Error("Supabase unavailable");
                return { data: error ? null : { id: "00000000-0000-4000-8000-000000000001", order_number: row.order_number }, error };
              },
            }),
          };
        },
      };
    },
  };
  return { client, insertedRows };
};
const makeHandler = ({ supabaseOptions, getProductById } = {}) => {
  const { client, insertedRows } = makeSupabaseClient(supabaseOptions);
  const handler = createOrderHandler({
    createClientImpl: () => client,
    env: { SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-only-key" },
    randomUUIDImpl: () => "abcdef00-0000-4000-8000-000000000000",
    ...(getProductById && { getProductById }),
  });
  return { handler, insertedRows };
};
const responseBody = (response) => JSON.parse(response.body);
test("creates a valid CR order and recalculates totals", async () => {
  const { handler, insertedRows } = makeHandler();
  const response = await handler(makeEvent());
  assert.equal(response.statusCode, 201);
  const body = responseBody(response);
  assert.equal(body.success, true);
  assert.equal(body.orderId, "00000000-0000-4000-8000-000000000001");
  assert.match(body.orderNumber, /^KIN-CR-\d{8}-ABCDEF$/);
  assert.equal(body.total, 11500);
  assert.equal(body.currency, "CRC");
  assert.equal(insertedRows[0].market, "CR");
  assert.equal(insertedRows[0].currency, "CRC");
  assert.equal(insertedRows[0].status, "pending");
  assert.equal(insertedRows[0].shipping_amount, 0);
  assert.equal(insertedRows[0].total, insertedRows[0].subtotal);
  assert.deepEqual(insertedRows[0].items, [{ productId: "KIN-FID-ARTURITO", name: "Cubo Mágico de Frijol con Rotación", quantity: 1, unitPrice: 11500, lineTotal: 11500 }]);
});
test("rejects an empty cart", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [] }));
  assert.equal(response.statusCode, 400);
});
test("rejects an invalid productId", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "INVALID", quantity: 1 }] }));
  assert.equal(response.statusCode, 400);
});
test("rejects quantity zero", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-FID-ARTURITO", quantity: 0 }] }));
  assert.equal(response.statusCode, 400);
});
test("rejects quantities above current CR stock", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-FID-ARTURITO", quantity: 5 }] }));
  assert.equal(response.statusCode, 400);
});
test("rejects a product disabled in CR", async () => {
  const { handler } = makeHandler({
    getProductById: () => ({ id: "KIN-TEST-001", name: "Producto deshabilitado", price: 5000, stock: 4, enabled: false, stockStatus: "in_stock" }),
  });
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-TEST-001", quantity: 1 }] }));
  assert.equal(response.statusCode, 400);
});
test("rejects a CR product with stock zero", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-FID-002", quantity: 1 }] }));
  assert.equal(response.statusCode, 400);
});
test("treats null stock with order_only status as no known physical limit, not as one", async () => {
  const { handler, insertedRows } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-FOC-001", quantity: 2 }] }));
  assert.equal(response.statusCode, 201);
  assert.equal(insertedRows[0].items[0].quantity, 2);
  assert.equal(insertedRows[0].total, 97000);
});
test("rejects null stock without order_only status", async () => {
  const { handler } = makeHandler({
    getProductById: () => ({ id: "KIN-TEST-002", name: "Stock inválido", price: 5000, stock: null, enabled: true, stockStatus: "in_stock" }),
  });
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-TEST-002", quantity: 1 }] }));
  assert.equal(response.statusCode, 400);
});
test("rejects an invalid email", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, customer: { ...VALID_PAYLOAD.customer, email: "invalid" } }));
  assert.equal(response.statusCode, 400);
});
test("ignores browser prices and uses the current CR catalog price", async () => {
  const { handler, insertedRows } = makeHandler();
  const response = await handler(makeEvent({ ...VALID_PAYLOAD, items: [{ productId: "KIN-FID-ARTURITO", quantity: 2, price: 1, lineTotal: 2 }], subtotal: 2, total: 2 }));
  assert.equal(response.statusCode, 201);
  assert.equal(insertedRows[0].items[0].unitPrice, 11500);
  assert.equal(insertedRows[0].total, 23000);
});
test("returns a safe 500 when Supabase fails", async () => {
  const { handler } = makeHandler({ supabaseOptions: { throws: true } });
  const response = await handler(makeEvent());
  assert.equal(response.statusCode, 500);
  assert.deepEqual(responseBody(response), { success: false, error: "No pudimos registrar tu pedido." });
});
test("rejects non-POST methods", async () => {
  const { handler } = makeHandler();
  const response = await handler(makeEvent(VALID_PAYLOAD, "GET"));
  assert.equal(response.statusCode, 405);
});
