import heroImage from "../../assets/images/brain-colored.png";
const HeroSection = () => {
  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="home-hero__content">
        <span className="home-eyebrow">Bienvenido a Kinora</span>
        <h1 id="hero-title">Para mentes que no vienen en modo estándar.</h1>
        <p>Juegos de lógica, retos y herramientas para explorar, enfocarte, organizarte y disfrutar a tu manera.</p>
        <div className="home-hero__actions">
          <a className="home-button home-button--primary" href="/categorias">Explorar productos</a>
          <a className="home-button home-button--secondary" href="/nosotros">Conoce Kinora</a>
        </div>
      </div>
      <div className="home-hero__visual" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
    </section>
  );
};
export default HeroSection;
