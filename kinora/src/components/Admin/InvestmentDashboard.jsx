import { summarizeInvestments } from "./salesMetrics";
import { costValue, money, percentage } from "./financialFormat";
function InvestmentCard({ investment }) {
  const round = investment;
  const progress = round.recovered ? 100 : Math.min(100, Math.max(0, round.recoveryPercent));
  return <article className="admin-investment-card" aria-labelledby={`investment-${round.id}`}>
    <h3 id={`investment-${round.id}`}>{round.name}</h3>
    <span className={`admin-badge admin-badge--${round.recovered ? "available" : "soldout"}`}>{round.recovered ? "Inversión recuperada" : "Por recuperar"}</span>
    <dl className="admin-financial-details"><div><dt>Total invertido</dt><dd>{money(round.invested)}</dd></div></dl>
    <div className="admin-investment-progress">
      <p><span>Recuperación de inversión</span><strong>{percentage(round.recoveryPercent)}</strong></p>
      <progress max="100" value={progress} aria-label={`Recuperación de inversión: ${round.name}`} />
      <p className="admin-detail">{money(round.collected)} recuperados de {money(round.invested)}</p>
    </div>
    <dl className="admin-financial-details">
      {[
        ["Total vendido", money(round.total)],
        ["Total cobrado", money(round.collected)],
        ["Pendiente por cobrar", money(round.pending)],
        ["Costo de productos vendidos", costValue(round.cost)],
        ["Ganancia bruta", costValue(round.grossProfit)],
        ["Margen bruto", costValue(round.grossMargin, percentage)],
        [round.recovered ? "Excedente sobre inversión" : "Monto por recuperar", money(round.recovered ? round.excess : round.remaining)],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    {round.missingCostCount > 0 && <p className="admin-error">Costo pendiente en {round.missingCostCount} venta(s). La recuperación se calcula con los cobros registrados.</p>}
  </article>;
}
export default function InvestmentDashboard({ rounds, sales, loading, error, onRetry }) {
  const { investments, overall, unassignedSalesCount } = summarizeInvestments(rounds, sales);
  return <section className="admin-inventory admin-investments" aria-labelledby="investments-title">
    <div className="admin-section-heading admin-section-actions"><div><h2 id="investments-title">Rendimiento por inversión</h2><p>La recuperación considera solo ventas cobradas; excluye pagos pendientes y ventas canceladas.</p></div><button className="admin-button admin-button--secondary" onClick={onRetry} disabled={loading}>Actualizar inversiones</button></div>
    {loading ? <p className="admin-empty" role="status">Cargando rendimiento por inversión...</p> : error ? <p className="admin-empty admin-error" role="alert">{error}</p> : <div className="admin-investments-content">
      {unassignedSalesCount > 0 && <p className="admin-registration-notice">{unassignedSalesCount} venta(s) sin una inversión de México asociada. Se incluyen en el resumen de ventas, pero no en la recuperación por inversión ni en el total recuperado de capital.</p>}
      {!investments.length ? <p className="admin-empty">Todavía no hay inversiones registradas en México.</p> : <>
        <div className="admin-summary admin-summary--capital" aria-label="Resumen del capital invertido">
          {[
            ["Capital total invertido", money(overall.invested)],
            ["Total recuperado", money(overall.collected)],
            [overall.recovered ? "Excedente acumulado" : "Capital pendiente de recuperar", money(overall.recovered ? overall.excess : overall.remaining)],
          ].map(([label, value]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        {overall.recovered && <p className="admin-feedback--saved">Capital total recuperado</p>}
        <div className="admin-investment-grid">{investments.map((investment) => <InvestmentCard key={investment.id} investment={investment} />)}</div>
      </>}
    </div>}
  </section>;
}
