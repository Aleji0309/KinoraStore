import { useEffect, useState } from "react";
import { loadInvestmentRounds } from "./salesData";
export default function useInvestmentRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await loadInvestmentRounds();
        if (active) setRounds(data);
      } catch {
        if (active) setError("No se pudieron cargar las inversiones. Intenta de nuevo.");
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [retry]);
  return { rounds, loading, error, refresh: () => setRetry((value) => value + 1) };
}
