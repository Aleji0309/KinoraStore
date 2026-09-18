import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
// Exercise the existing data functions with a stub client, never a live database.
const source = readFileSync(new URL("../../src/components/Admin/salesData.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "").replace(/^export \{.*;\n/gm, "").replaceAll("export ", "");
const dataLayer = (supabase) => vm.runInNewContext(`${source}\n({loadSales, loadInvestmentRounds, loadAllMX, registerSale, updateSale})`, { supabase });
test("sales loader paginates MX records, requests frozen cost/round and sorts newest first", async () => {
  const calls = [];
  const rows = Array.from({ length: 501 }, (_, id) => ({ id, created_at: id === 500 ? "2026-02-01" : "2026-01-01" }));
  const layer = dataLayer({ from(table) {
    assert.equal(table, "sales");
    const query = {
      select(columns) { assert.ok(columns.includes("unit_cost")); assert.ok(columns.includes("investment_round_id")); return query; },
      eq(key, value) { assert.equal(key, "market"); assert.equal(value, "MX"); return query; },
      order(key) { assert.equal(key, "id"); return query; },
      async range(start, end) { calls.push([start, end]); return { data: rows.slice(start, end + 1), error: null }; },
    };
    return query;
  } });
  const sales = await layer.loadSales();
  assert.equal(sales.length, 501);
  assert.equal(sales[0].id, 500);
  assert.deepEqual(calls, [[0, 499], [500, 999]]);
});
test("investment loader reads names and amounts from MX rounds and propagates errors", async () => {
  const query = {
    select(columns) { assert.ok(columns.includes("name")); assert.ok(columns.includes("amount")); return query; },
    eq(key, value) { assert.equal(key, "market"); assert.equal(value, "MX"); return query; },
    order() { return query; },
    async range() { return { data: [{id: "b", invested_at: "2026-02-01"}, {id: "a", invested_at: "2026-01-01"}], error: null }; },
  };
  const layer = dataLayer({ from(table) { assert.equal(table, "investment_rounds"); return query; } });
  assert.equal((await layer.loadInvestmentRounds())[0].id, "a");
  query.range = async () => ({data: null, error: new Error("Unavailable")});
  await assert.rejects(layer.loadInvestmentRounds(), /Unavailable/);
});
test("registration and editing retain their RPCs and leave cost and inventory to Supabase", async () => {
  const calls = [];
  const layer = dataLayer({ async rpc(name, args) { calls.push({name, args}); return {data: {id: "sale"}, error: null}; } });
  const draft = {product_sku: "test-product", buyer_name: " Buyer ", quantity: "2", unit_price: "80", payment_status: "pending", expected_payment_date: "", sold_by: "", notes: "", unit_cost: 999, investment_round_id: "ignored"};
  await layer.registerSale(draft);
  await layer.updateSale("sale", draft);
  assert.deepEqual(calls.map(call => call.name), ["register_sale", "update_sale"]);
  for (const {args} of calls) {
    assert.equal(args.p_quantity, 2);
    assert.equal(args.p_unit_price, 80);
    assert.equal(args.p_buyer_name, "Buyer");
    assert.equal(args.p_expected_payment_date, null);
    assert.equal(Object.hasOwn(args, "p_unit_cost"), false);
    assert.equal(Object.hasOwn(args, "p_investment_round_id"), false);
  }
  assert.equal(calls[1].args.p_sale_id, "sale");
});
test("inventory continues using the same paginated MX query helper", async () => {
  const expected = [{product_sku: "test-product", initial_stock: 4, stock: 3, price: 80, enabled: true}];
  const query = {
    select() { return query; }, eq(key, value) { assert.equal(key, "market"); assert.equal(value, "MX"); return query; },
    order(key) { assert.equal(key, "product_sku"); return query; }, async range() { return {data: expected, error: null}; },
  };
  const layer = dataLayer({ from(table) { assert.equal(table, "market_products"); return query; } });
  const rows = await layer.loadAllMX("market_products", "product_sku, initial_stock, stock, price, enabled", "product_sku");
  assert.equal(rows[0], expected[0]);
});
