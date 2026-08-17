import heroImage from "../../assets/hero.png";
const HeroSection = () => {
  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="home-hero__content">
        <span className="home-eyebrow">Bienvenido a Kinora</span>
        <h1 id="hero-title">Productos pensados para acompañar tu día</h1>
        <p>Recursos de lógica, organización, bienestar sensorial y lectura, seleccionados para distintas formas de sentir, pensar y disfrutar.</p>
        <div className="home-hero__actions">
          <a className="home-button home-button--primary" href="#productos">Explorar productos</a>
          <a className="home-button home-button--secondary" href="#kinora">Conoce Kinora</a>
        </div>
      </div>
      <div className="home-hero__visual" aria-hidden="true">
        <span className="home-hero__shape home-hero__shape--sun" />
        <span className="home-hero__shape home-hero__shape--leaf" />
        <img src={heroImage} alt="" />
      </div>
    </section>
  );
};
export default HeroSection;
