import { useEffect, useRef, useState } from "react";
import { approveReview, loadAdminReviews, rejectReview } from "./reviewsData";
const statuses = {
  pending: { label: "Pendiente", badge: "soldout" },
  approved: { label: "Aprobada", badge: "available" },
  rejected: { label: "Rechazada", badge: "disabled" },
};
const filters = [["all", "Todas"], ["pending", "Pendientes"], ["approved", "Aprobadas"], ["rejected", "Rechazadas"]];
export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [filter, setFilter] = useState("pending");
  const [savingId, setSavingId] = useState(null);
  const [rowErrors, setRowErrors] = useState({});
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      setNotice("");
      try {
        const data = await loadAdminReviews();
        if (active) { setReviews(data); setRowErrors({}); }
      } catch {
        if (active) setError("No se pudieron cargar las opiniones. Intenta actualizar de nuevo.");
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [retry]);
  const moderate = async (review, status) => {
    if (saving.current || loading || review.status !== "pending") return;
    saving.current = true;
    setSavingId(review.id);
    setRowErrors((current) => ({ ...current, [review.id]: "" }));
    setNotice("");
    try {
      const updated = await (status === "approved" ? approveReview(review.id) : rejectReview(review.id));
      if (!mounted.current) return;
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(status === "approved" ? "Opinión aprobada." : "Opinión rechazada.");
    } catch {
      if (mounted.current) setRowErrors((current) => ({ ...current, [review.id]: "No se pudo guardar el cambio. Reintenta o actualiza las opiniones para verificar su estado." }));
    } finally {
      saving.current = false;
      if (mounted.current) setSavingId(null);
    }
  };
  const approved = reviews.filter((review) => review.status === "approved");
  const average = approved.length ? Number((approved.reduce((sum, review) => sum + Number(review.rating), 0) / approved.length).toFixed(1)) : "—";
  const cards = [
    ["total", "Total de opiniones", reviews.length],
    ["soldout", "Pendientes", reviews.filter((review) => review.status === "pending").length],
    ["available", "Aprobadas", approved.length],
    ["disabled", "Rechazadas", reviews.filter((review) => review.status === "rejected").length],
    ["total", "Calificación promedio", average],
  ];
  const visible = reviews.filter((review) => filter === "all" || review.status === filter);
  return <>
    <section className="admin-summary admin-summary--reviews" aria-label="Resumen de opiniones">
      {cards.map(([badge, label, value]) => <div key={label} className={`admin-stat admin-stat--${badge}`}><span>{label}</span><strong>{loading || error ? "—" : value}</strong>{label === "Calificación promedio" && <span>Solo aprobadas · de 5</span>}</div>)}
    </section>
    <div className="admin-review-filters" role="group" aria-label="Filtrar opiniones por estado">
      {filters.map(([value, label]) => <button key={value} className="admin-tab" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
    </div>
    <p className="admin-feedback admin-feedback--saved" role="status">{notice}</p>
    <section className="admin-inventory" aria-labelledby="reviews-title">
      <div className="admin-section-heading admin-section-actions"><div><h2 id="reviews-title">Opiniones de clientes</h2><p>Modera las opiniones de México antes de publicarlas.</p></div><button className="admin-button admin-button--secondary" disabled={loading || savingId !== null} onClick={() => { if (!saving.current) setRetry((value) => value + 1); }}>Actualizar opiniones</button></div>
      {loading ? <p className="admin-empty" role="status">Cargando opiniones...</p> : error ? <p className="admin-empty admin-error" role="alert">{error}</p> : !visible.length ? <p className="admin-empty">{reviews.length ? "No hay opiniones en este filtro." : "Todavía no hay opiniones en México."}</p> :
        <table className="admin-table admin-reviews-table">
          <caption className="admin-sr-only">Opiniones de México: {filters.find(([value]) => value === filter)[1]}</caption>
          <thead><tr>{["Fecha", "Producto", "SKU", "Cliente", "Calificación", "Opinión", "Estado", "Acciones"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{visible.map((review) => <tr key={review.id}>
            <td data-label="Fecha"><time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("es-MX")}</time></td>
            <td data-label="Producto"><strong>{review.products?.name || review.product_sku}</strong></td>
            <td data-label="SKU"><span className="admin-sku">{review.product_sku}</span></td>
            <td data-label="Cliente">{review.reviewer_name || "Anónimo"}</td>
            <td data-label="Calificación"><span className="admin-review-stars" role="img" aria-label={`${review.rating} de 5 estrellas`}>{"★".repeat(Math.max(0, Math.min(5, Math.round(Number(review.rating)) || 0)))}{"☆".repeat(5 - Math.max(0, Math.min(5, Math.round(Number(review.rating)) || 0)))}</span><span className="admin-detail" aria-hidden="true">{review.rating} / 5</span></td>
            <td data-label="Opinión" className="admin-review-comment">{review.comment}</td>
            <td data-label="Estado"><span className={`admin-badge admin-badge--${statuses[review.status]?.badge || "disabled"}`}>{statuses[review.status]?.label || "Sin estado"}</span></td>
            <td data-label="Acciones" className="admin-review-actions">{review.status === "pending" ? <div><button className="admin-button" disabled={savingId !== null} onClick={() => moderate(review, "approved")}>Aprobar</button><button className="admin-button admin-button--secondary" disabled={savingId !== null} onClick={() => moderate(review, "rejected")}>Rechazar</button></div> : <span className="admin-detail">Sin acciones pendientes</span>}{savingId === review.id && <p className="admin-feedback" role="status">Guardando...</p>}{rowErrors[review.id] && <p className="admin-error" role="alert">{rowErrors[review.id]}</p>}</td>
          </tr>)}</tbody>
        </table>}
    </section>
  </>;
}
