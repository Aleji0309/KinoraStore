import { supabase } from "../lib/supabase";
import { activeMarket } from "../config/markets";
export const getMarketProducts = async () => {
  const { data, error } = await supabase
    .from("market_products")
    .select("*")
    .eq("market", activeMarket);
  if (error) {
    throw error;
  }
  return data;
};