import assert from "node:assert/strict";
import test from "node:test";
import { saleFinancials, summarizeInvestments, summarizeSales } from "../../src/components/Admin/salesMetrics.js";
// Fixtures are only for isolated calculations; no test data is sent to Supabase.
const sale = (overrides = {}) => ({ market: "MX", product_sku: "test-product", sale_status: "sold", payment_status: "paid", quantity: 2, unit_price: "50.25", unit_cost: "20.10", investment_round_id: "a", ...overrides });
const round = (id = "a", amount = "100.00", overrides = {}) => ({ id, market: "MX", name: id, amount, ...overrides });
test("sales totals include only sold records and separate paid from pending", () => {
  const summary = summarizeSales([sale(), sale({ quantity: 1, payment_status: "pending" }), sale({ sale_status: "cancelled", unit_cost: null }), sale({ sale_status: "draft" })]);
  assert.equal(summary.total, 150.75);
  assert.equal(summary.paid, 100.5);
  assert.equal(summary.pending, 50.25);
  assert.equal(summary.units, 3);
  assert.equal(summary.bySku["test-product"], 3);
  assert.equal(summary.cost, 60.3);
  assert.equal(summary.grossProfit, 90.45);
  assert.equal(summary.grossMargin, 60);
  assert.equal(summary.missingCostCount, 0);
});
test("unknown cost suppresses profitability without suppressing revenue or recovery", () => {
  for (const unit_cost of [null, undefined, "", "invalid"]) {
    const unknown = sale({ unit_cost });
    const summary = summarizeSales([sale(), unknown]);
    assert.equal(summary.total, 201);
    assert.equal(summary.cost, null);
    assert.equal(summary.grossProfit, null);
    assert.equal(summary.grossMargin, null);
    assert.equal(summary.missingCostCount, 1);
    assert.equal(saleFinancials(unknown).unitCost, null);
    assert.equal(saleFinancials(unknown).cost, null);
    assert.equal(saleFinancials(unknown).grossProfit, null);
    const { investments } = summarizeInvestments([round()], [unknown]);
    assert.equal(investments[0].collected, 100.5);
    assert.equal(investments[0].cost, null);
  }
});
test("a real zero cost is valid and loss-making sales retain negative profit", () => {
  assert.equal(summarizeSales([sale({ unit_cost: 0 })]).grossMargin, 100);
  assert.deepEqual(saleFinancials(sale({ unit_price: "10.00", unit_cost: "12.50" })), { total: 20, unitCost: 12.5, cost: 25, grossProfit: -5 });
  assert.equal(summarizeSales([sale({ unit_price: 10, unit_cost: 12.5 })]).grossMargin, -25);
});
test("decimal values aggregate in cents", () => {
  const summary = summarizeSales([sale({ quantity: 3, unit_price: "0.10", unit_cost: "0.03" }), sale({ quantity: 1, unit_price: "0.20", unit_cost: "0.02" })]);
  assert.equal(summary.total, 0.5);
  assert.equal(summary.cost, 0.11);
  assert.equal(summary.grossProfit, 0.39);
});
test("pending sales contribute to sales and profit, never recovery", () => {
  const { investments, overall } = summarizeInvestments([round()], [sale({ payment_status: "pending" })]);
  const investment = investments[0];
  assert.equal(investment.total, 100.5);
  assert.equal(investment.grossProfit, 60.3);
  assert.equal(investment.pending, 100.5);
  assert.equal(investment.collected, 0);
  assert.equal(investment.recoveryPercent, 0);
  assert.equal(investment.remaining, 100);
  assert.equal(investment.recovered, false);
  assert.equal(overall.collected, 0);
});
test("paid, edited, and cancelled records change recovery from the current sales snapshot", () => {
  const pending = sale({ payment_status: "pending", unit_price: 75 });
  const paid = { ...pending, payment_status: "paid" };
  assert.equal(summarizeInvestments([round()], [pending]).overall.collected, 0);
  const recovered = summarizeInvestments([round()], [paid]).investments[0];
  assert.equal(recovered.recoveryPercent, 150);
  assert.equal(recovered.remaining, 0);
  assert.equal(recovered.excess, 50);
  assert.equal(recovered.recovered, true);
  const cancelled = summarizeInvestments([round()], [{ ...paid, sale_status: "cancelled" }]).investments[0];
  assert.equal(cancelled.collected, 0);
  assert.equal(cancelled.total, 0);
  assert.equal(cancelled.cost, 0);
  assert.equal(cancelled.remaining, 100);
});
test("overall recovery nets invested and collected capital across dynamic rounds", () => {
  const result = summarizeInvestments([round("a"), round("b"), round("c", "0")], [sale({ quantity: 1, unit_price: 150 })]);
  assert.equal(result.investments.length, 3);
  assert.equal(result.overall.invested, 200);
  assert.equal(result.overall.collected, 150);
  assert.equal(result.overall.remaining, 50);
  assert.equal(result.overall.recovered, false);
  assert.equal(result.investments[1].remaining, 100);
  assert.equal(result.investments[1].total, 0);
  assert.equal(result.investments[1].grossMargin, 0);
  const excess = summarizeInvestments([round()], [sale({ unit_price: 100 })]).overall;
  assert.equal(excess.excess, 100);
  assert.equal(excess.recovered, true);
});
test("round accounting excludes CR and surfaces unmatched active MX sales", () => {
  const result = summarizeInvestments([round(), round("cr", "1000", { market: "CR" })], [sale(), sale({ investment_round_id: null }), sale({ investment_round_id: "unknown" }), sale({ market: "CR" }), sale({ investment_round_id: null, sale_status: "cancelled" })]);
  assert.equal(result.investments.length, 1);
  assert.equal(result.overall.invested, 100);
  assert.equal(result.overall.collected, 100.5);
  assert.equal(result.unassignedSalesCount, 2);
});
test("empty sales and zero denominators yield finite percentages", () => {
  assert.equal(summarizeSales([]).grossMargin, 0);
  assert.equal(summarizeSales([sale({ unit_price: 0 })]).grossMargin, 0);
  const { investments, overall } = summarizeInvestments([round("a", "0")], [sale()]);
  assert.equal(investments[0].recoveryPercent, 0);
  assert.equal(investments[0].remaining, 0);
  assert.equal(investments[0].excess, 100.5);
  assert.equal(overall.recoveryPercent, 0);
  assert.equal(summarizeInvestments([], []).overall.recoveryPercent, 0);
});
test("exact recovery has no remaining amount or excess", () => {
  const { overall } = summarizeInvestments([round()], [sale({ unit_price: 50 })]);
  assert.equal(overall.recovered, true);
  assert.equal(overall.recoveryPercent, 100);
  assert.equal(overall.remaining, 0);
  assert.equal(overall.excess, 0);
});
