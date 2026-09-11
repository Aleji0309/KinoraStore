import { supabase } from "../lib/supabase";
export async function loadProductReviews(productSku) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_sku, reviewer_name, rating, comment, created_at")
    .eq("product_sku", productSku)
    .eq("market", "MX")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function submitProductReview({ productSku, reviewerName, rating, comment }) {
  const name = reviewerName.trim();
  const text = comment.trim();
  if (!productSku || !Number.isInteger(rating) || rating < 1 || rating > 5 || text.length < 2 || text.length > 1000 || name.length > 80) {
    throw new Error("Revisa la calificación y los campos de tu opinión.");
  }
  // Do not select the inserted row: pending reviews are not publicly readable.
  const { error } = await supabase.from("product_reviews").insert({
    product_sku: productSku,
    market: "MX",
    reviewer_name: name || null,
    rating,
    comment: text,
    status: "pending",
  });
  if (error) throw error;
}
