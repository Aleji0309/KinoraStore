import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Logo from "../common/Logo/Logo";
import "./AdminPage.css";
export default function AdminLogin({ onLogin, sessionError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) { setError("No pudimos iniciar sesión. Revisa tu correo y contraseña e intenta de nuevo."); return; }
      onLogin?.(data.session);
    } catch { setError("No se pudo conectar. Intenta de nuevo en un momento."); }
    finally { setLoading(false); }
  };
  return <main className="admin-shell admin-login-shell"><section className="admin-login-card" aria-labelledby="login-title"><Logo className="admin-login-logo" /><p className="admin-eyebrow">Administración</p><h1 id="login-title">Bienvenido a Kinora</h1><p>Ingresa para gestionar el inventario y las ventas de México.</p><form onSubmit={handleSubmit} className="admin-login-form"><label htmlFor="admin-email">Correo electrónico</label><input id="admin-email" type="email" autoComplete="username" placeholder="tu@correo.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} /><label htmlFor="admin-password">Contraseña</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} />{(error || sessionError) && <p className="admin-error" role="alert">{error || sessionError}</p>}<button className="admin-button" type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button></form><a className="admin-back" href="/">← Volver a la tienda</a></section></main>;
}
