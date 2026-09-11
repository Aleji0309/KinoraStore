import { useEffect, useId, useRef, useState } from "react";
import { loadProductReviews, submitProductReview } from "../../api/productReviews";
import "./ProductReviews.css";
function Stars({ rating }) {
  return <span className="product-reviews__stars" role="img" aria-label={`${rating} de 5 estrellas`}><span aria-hidden="true">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span></span>;
}
function ReviewForm({ productSku }) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);
  const ratingError = !Number.isInteger(rating) || rating < 1 || rating > 5;
  const commentError = comment.trim().length < 2 || comment.length > 1000;
  const nameError = name.length > 80;
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    setChecked(true);
    setSuccess(false);
    setError("");
    if (ratingError || commentError || nameError) return;
    submitting.current = true;
    setSaving(true);
    try {
      await submitProductReview({ productSku, reviewerName: name, rating, comment });
      setRating(0);
      setName("");
      setComment("");
      setChecked(false);
      setSuccess(true);
    } catch {
      setError("No pudimos enviar tu opinión. Conservamos tus datos para que puedas intentarlo de nuevo.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return <form className="product-reviews__form" onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>Comparte tu experiencia</h3>
    <p>Tu opinión puede ayudar a otras personas a elegir.</p>
    <fieldset disabled={saving} aria-describedby={checked && ratingError ? `${id}-rating-error` : undefined}>
      <legend>Calificación (obligatoria)</legend>
      <div className="product-reviews__rating-buttons">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} aria-label={`Calificar con ${value} ${value === 1 ? "estrella" : "estrellas"}`} aria-pressed={rating === value} className={value <= rating ? "is-selected" : ""} onClick={() => { setRating(value); setSuccess(false); }}><span aria-hidden="true">{value <= rating ? "★" : "☆"}</span></button>)}</div>
      <span className="product-reviews__hint">{rating ? `${rating} de 5 estrellas` : "Elige de 1 a 5 estrellas"}</span>
      {checked && ratingError && <p className="product-reviews__error" id={`${id}-rating-error`}>Selecciona una calificación de 1 a 5 estrellas.</p>}
    </fieldset>
    <label htmlFor={`${id}-name`}>Nombre (opcional)</label>
    <input id={`${id}-name`} autoComplete="given-name" maxLength={80} value={name} disabled={saving} onChange={(event) => { setName(event.target.value); setSuccess(false); }} aria-invalid={checked && nameError} aria-describedby={`${id}-name-hint`} />
    <small id={`${id}-name-hint`}>Si lo dejas vacío, tu opinión aparecerá como Anónimo. Máximo 80 caracteres.</small>
    <label htmlFor={`${id}-comment`}>Tu opinión (obligatoria)</label>
    <textarea id={`${id}-comment`} rows={5} minLength={2} maxLength={1000} required value={comment} disabled={saving} onChange={(event) => { setComment(event.target.value); setSuccess(false); }} aria-invalid={checked && commentError} aria-describedby={`${id}-comment-hint${checked && commentError ? ` ${id}-comment-error` : ""}`} />
    <small id={`${id}-comment-hint`}>{comment.length}/1000 caracteres</small>
    {checked && commentError && <p className="product-reviews__error" id={`${id}-comment-error`}>Escribe entre 2 y 1000 caracteres; los espacios solos no cuentan.</p>}
    <button className="product-reviews__button" type="submit" disabled={saving}>{saving ? "Enviando..." : "Enviar opinión"}</button>
    <small>Las opiniones se revisan antes de publicarse.</small>
    {error && <p className="product-reviews__error" role="alert">{error}</p>}
    <div role="status">{success && <p className="product-reviews__success">¡Gracias! Tu opinión fue enviada y aparecerá cuando sea aprobada.</p>}</div>
  </form>;
}
export default function ProductReviews({ productSku }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await loadProductReviews(productSku);
        if (active) setReviews(data);
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [productSku, retry]);
  const average = reviews.length ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)) : 0;
  return <section className="product-reviews" aria-labelledby="product-reviews-title">
    <h2 id="product-reviews-title">Opiniones</h2>
    <div className="product-reviews__layout"><div className="product-reviews__content">
      {loading ? <p className="product-reviews__notice" role="status">Cargando opiniones...</p> : error ? <div className="product-reviews__notice"><p role="alert">No pudimos cargar las opiniones. Puedes seguir explorando el producto.</p><button className="product-reviews__button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div> : reviews.length ? <>
        <div className="product-reviews__summary"><div><Stars rating={average} /><strong>{average}</strong><span>de 5</span></div><p>{reviews.length} {reviews.length === 1 ? "opinión" : "opiniones"}</p></div>
        <ul className="product-reviews__list">{reviews.map((review) => <li key={review.id}><article><Stars rating={review.rating} /><p className="product-reviews__comment">{review.comment}</p><footer><strong>{review.reviewer_name?.trim() || "Anónimo"}</strong><time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</time></footer></article></li>)}</ul>
      </> : <p className="product-reviews__notice">Todavía no hay opiniones. Puedes ser la primera persona en compartir tu experiencia.</p>}
    </div><ReviewForm key={productSku} productSku={productSku} /></div>
  </section>;
}
