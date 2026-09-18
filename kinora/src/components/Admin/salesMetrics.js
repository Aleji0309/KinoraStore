// Accumulate database numeric(12,2) values in cents to avoid decimal drift.
const cents = (value) => Math.round(Number(value) * 100);
const hasCost = (value) => value !== null && value !== undefined && String(value).trim() !== "" && Number.isFinite(Number(value));
const percent = (part, total) => total > 0 ? part / total * 100 : 0;
export function saleFinancials(sale) {
  const quantity = Number(sale.quantity);
  const total = cents(sale.unit_price) * quantity;
  const unitCost = hasCost(sale.unit_cost) ? cents(sale.unit_cost) : null;
  const cost = unitCost === null ? null : unitCost * quantity;
  return {
    total: total / 100,
    unitCost: unitCost === null ? null : unitCost / 100,
    cost: cost === null ? null : cost / 100,
    grossProfit: cost === null ? null : (total - cost) / 100,
  };
}
export function summarizeSales(sales) {
  const summary = { total: 0, paid: 0, pending: 0, units: 0, cost: 0, missingCostCount: 0, bySku: {} };
  for (const sale of sales) {
    if (sale.sale_status !== "sold") continue;
    const quantity = Number(sale.quantity);
    const total = cents(sale.unit_price) * quantity;
    summary.total += total;
    summary.units += quantity;
    if (sale.payment_status === "paid") summary.paid += total;
    if (sale.payment_status === "pending") summary.pending += total;
    if (hasCost(sale.unit_cost)) summary.cost += cents(sale.unit_cost) * quantity;
    else summary.missingCostCount++;
    summary.bySku[sale.product_sku] = (summary.bySku[sale.product_sku] || 0) + quantity;
  }
  const grossProfit = summary.total - summary.cost;
  return {
    ...summary,
    total: summary.total / 100,
    paid: summary.paid / 100,
    pending: summary.pending / 100,
    cost: summary.missingCostCount ? null : summary.cost / 100,
    grossProfit: summary.missingCostCount ? null : grossProfit / 100,
    grossMargin: summary.missingCostCount ? null : percent(grossProfit, summary.total),
  };
}
function recovery(investedCents, collectedCents) {
  return {
    invested: investedCents / 100,
    collected: collectedCents / 100,
    recoveryPercent: percent(collectedCents, investedCents),
    recovered: collectedCents >= investedCents,
    remaining: Math.max(investedCents - collectedCents, 0) / 100,
    excess: Math.max(collectedCents - investedCents, 0) / 100,
  };
}
export function summarizeInvestments(rounds, sales) {
  const mxRounds = rounds.filter((round) => round.market === "MX");
  const grouped = new Map(mxRounds.map((round) => [round.id, []]));
  let unassignedSalesCount = 0;
  for (const sale of sales) {
    if (sale.market !== "MX" || sale.sale_status !== "sold") continue;
    const group = grouped.get(sale.investment_round_id);
    if (group) group.push(sale);
    else unassignedSalesCount++;
  }
  const investments = mxRounds.map((round) => {
    const summary = summarizeSales(grouped.get(round.id));
    return { ...round, ...summary, ...recovery(cents(round.amount), cents(summary.paid)) };
  });
  const totalInvested = investments.reduce((total, round) => total + cents(round.invested), 0);
  const totalCollected = investments.reduce((total, round) => total + cents(round.collected), 0);
  return { investments, overall: recovery(totalInvested, totalCollected), unassignedSalesCount };
}
