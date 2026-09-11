import { supabase } from "../../lib/supabase";
const columns = "id, product_sku, reviewer_name, rating, comment, status, created_at, updated_at, products(name)";
export async function loadAdminReviews() {
  const reviews = [];
  const pageSize = 500;
  // Read every page so moderation counts include the complete MX history.
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from("product_reviews").select(columns)
      .eq("market", "MX").order("created_at", { ascending: false })
      .order("id", { ascending: false }).range(offset, offset + pageSize - 1);
    if (error) throw error;
    reviews.push(...(data ?? []));
    if (!data || data.length < pageSize) return reviews;
  }
}
async function moderateReview(id, status) {
  const { data, error } = await supabase.from("product_reviews").update({ status })
    .eq("id", id).eq("market", "MX").eq("status", "pending")
    .select(columns).single();
  if (error) throw error;
  if (!data) throw new Error("No updated review");
  return data;
}
export function approveReview(id) { return moderateReview(id, "approved"); }
export function rejectReview(id) { return moderateReview(id, "rejected"); }
