import { useMemo, useState } from "react";
import Footer from "../Home/Footer";
import { useCart } from "../../context/cartContext";
import { formatCurrency } from "../../utils/formatCurrency";
import "./Checkout.css";
const PROVINCES = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
const INITIAL_VALUES = {
  fullName: "",
  email: "",
  phone: "",
  province: "",
  canton: "",
  district: "",
  postalCode: "",
  address: "",
  references: "",
};
const REQUIRED_FIELDS = ["fullName", "email", "phone", "province", "canton", "district", "postalCode", "address"];
const getErrors = (values) => {
  const errors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (values.fullName.trim().length < 2 || values.fullName.trim().length > 100) errors.fullName = "Ingresa tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Ingresa un correo válido.";
  if (!(/^\d{8}$/.test(phoneDigits) || /^506\d{8}$/.test(phoneDigits))) errors.phone = "Ingresa un teléfono válido de Costa Rica.";
  if (!PROVINCES.includes(values.province)) errors.province = "Selecciona una provincia.";
  if (values.canton.trim().length < 2) errors.canton = "Ingresa el cantón.";
  if (values.district.trim().length < 2) errors.district = "Ingresa el distrito.";
  if (!/^\d{5}$/.test(values.postalCode)) errors.postalCode = "Ingresa un código postal de 5 dígitos.";
  if (values.address.trim().length < 5) errors.address = "Ingresa la dirección de entrega.";
  return errors;
};
const CheckoutField = ({ id, label, error, children }) => (
  <div className="checkout-field">
    <label htmlFor={id}>{label}</label>
    {children}
    {error && <p className="checkout-field__error" id={`${id}-error`} role="alert">{error}</p>}
  </div>
);
const Checkout = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const errors = useMemo(() => getErrors(values), [values]);
  const fieldError = (field) => (submitted || touched[field]) ? errors[field] : undefined;
  const fieldProps = (field) => ({
    id: field,
    name: field,
    value: values[field],
    required: true,
    "aria-invalid": Boolean(fieldError(field)),
    "aria-describedby": fieldError(field) ? `${field}-error` : undefined,
    onChange: (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setSubmitError("");
    },
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
  });
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitted(true);
    setTouched(Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, true])));
    const firstInvalidField = REQUIRED_FIELDS.find((field) => errors[field]);
    if (firstInvalidField) {
      document.getElementById(firstInvalidField)?.focus();
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/.netlify/functions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: values.fullName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
          },
          shippingAddress: {
            province: values.province,
            canton: values.canton.trim(),
            district: values.district.trim(),
            postalCode: values.postalCode,
            address: values.address.trim(),
            reference: values.references.trim(),
          },
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      const result = await response.json().catch(() => null);
      if (response.status !== 201 || !result?.success) throw new Error("ORDER_CREATION_FAILED");
      setOrderConfirmation(result);
      setValues(INITIAL_VALUES);
      clearCart();
    } catch {
      setSubmitError("No pudimos registrar tu pedido. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (orderConfirmation) {
    return (
      <>
        <main className="checkout checkout--success">
          <span className="home-eyebrow">Pedido registrado</span>
          <h1>¡Pedido recibido!</h1>
          <p>Guardamos correctamente los datos de tu pedido.</p>
          <dl>
            <div><dt>Número de pedido</dt><dd>{orderConfirmation.orderNumber}</dd></div>
            <div><dt>Total</dt><dd>{formatCurrency(orderConfirmation.total, orderConfirmation.currency)} <span>{orderConfirmation.currency}</span></dd></div>
          </dl>
          <strong>El pedido aún no ha sido pagado.</strong>
          <a href="/categorias">Volver al catálogo</a>
        </main>
        <Footer />
      </>
    );
  }
  if (items.length === 0) {
    return (
      <>
        <main className="checkout checkout--empty">
          <span className="home-eyebrow">Checkout</span>
          <h1>Tu carrito está vacío.</h1>
          <p>Agrega productos antes de continuar con el pedido.</p>
          <a href="/categorias">Regresar al catálogo</a>
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <main className="checkout">
        <a className="checkout__back" href="/categorias">← Seguir comprando</a>
        <header className="checkout__heading">
          <span className="home-eyebrow">Checkout</span>
          <h1>Datos para tu pedido</h1>
          <p>Completa tus datos de contacto y entrega. Todavía no se realizará ningún cobro.</p>
        </header>
        <div className="checkout__layout">
          <form className="checkout-form" noValidate onSubmit={handleSubmit}>
            <section aria-labelledby="customer-data-title">
              <h2 id="customer-data-title">Datos del cliente</h2>
              <div className="checkout-form__grid">
                <CheckoutField id="fullName" label="Nombre completo *" error={fieldError("fullName")}>
                  <input {...fieldProps("fullName")} type="text" autoComplete="name" maxLength="100" />
                </CheckoutField>
                <CheckoutField id="email" label="Correo electrónico *" error={fieldError("email")}>
                  <input {...fieldProps("email")} type="email" autoComplete="email" maxLength="254" />
                </CheckoutField>
                <CheckoutField id="phone" label="Teléfono *" error={fieldError("phone")}>
                  <input {...fieldProps("phone")} type="tel" autoComplete="tel" inputMode="tel" maxLength="20" placeholder="8888-8888" />
                </CheckoutField>
              </div>
            </section>
            <section aria-labelledby="delivery-data-title">
              <h2 id="delivery-data-title">Dirección de entrega</h2>
              <div className="checkout-form__grid">
                <CheckoutField id="province" label="Provincia *" error={fieldError("province")}>
                  <select {...fieldProps("province")} autoComplete="address-level1">
                    <option value="">Selecciona una provincia</option>
                    {PROVINCES.map((province) => <option value={province} key={province}>{province}</option>)}
                  </select>
                </CheckoutField>
                <CheckoutField id="canton" label="Cantón *" error={fieldError("canton")}>
                  <input {...fieldProps("canton")} type="text" autoComplete="address-level2" maxLength="100" />
                </CheckoutField>
                <CheckoutField id="district" label="Distrito *" error={fieldError("district")}>
                  <input {...fieldProps("district")} type="text" autoComplete="address-level3" maxLength="100" />
                </CheckoutField>
                <CheckoutField id="postalCode" label="Código postal *" error={fieldError("postalCode")}>
                  <input {...fieldProps("postalCode")} type="text" autoComplete="postal-code" inputMode="numeric" pattern="\d{5}" maxLength="5" />
                </CheckoutField>
                <CheckoutField id="address" label="Dirección exacta *" error={fieldError("address")}>
                  <textarea {...fieldProps("address")} rows="4" autoComplete="street-address" maxLength="500" placeholder="Barrio, número de casa, color, edificio u otras indicaciones." />
                </CheckoutField>
                <div className="checkout-field">
                  <label htmlFor="references">Referencias de entrega</label>
                  <textarea
                    id="references"
                    name="references"
                    rows="3"
                    value={values.references}
                    maxLength="500"
                    placeholder="Frente al parque, casa con portón negro."
                    onChange={(event) => {
                      setValues((current) => ({ ...current, references: event.target.value }));
                      setSubmitError("");
                    }}
                  />
                </div>
              </div>
            </section>
            <div className="checkout-form__shipping">
              <strong>Envío estándar incluido dentro de Costa Rica 🇨🇷</strong>
              <span>Algunas zonas de difícil acceso pueden requerir un cargo adicional.</span>
            </div>
            <button className="checkout-form__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Procesando pedido..." : "Confirmar pedido"}</button>
            {submitError && <p className="checkout-form__error" role="alert">{submitError}</p>}
          </form>
          <aside className="checkout-summary" aria-labelledby="order-summary-title">
            <h2 id="order-summary-title">Resumen del pedido</h2>
            <ul>
              {items.map((item) => (
                <li key={item.productId}>
                  <img src={item.image} alt="" />
                  <div><strong>{item.name}</strong><span>Cantidad: {item.quantity}</span><span>{formatCurrency(item.price, item.currency)} c/u</span></div>
                  <strong>{formatCurrency(item.price * item.quantity, item.currency)}</strong>
                </li>
              ))}
            </ul>
            <dl>
              <div><dt>Artículos</dt><dd>{totalItems}</dd></div>
              <div><dt>Subtotal</dt><dd>{formatCurrency(subtotal, "CRC")}</dd></div>
              <div><dt>Envío estándar</dt><dd>Incluido</dd></div>
              <div className="checkout-summary__total"><dt>Total</dt><dd>{formatCurrency(subtotal, "CRC")}</dd></div>
            </dl>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
};
export default Checkout;
