import { needs } from "../../data/homeData";
import Icon from "../common/Icon/Icon";
const CategoriesSection = () => {
  return (
    <section className="home-section" id="categorias" aria-labelledby="categories-title">
      <div className="home-section__heading">
        <span className="home-eyebrow">Explora por situación</span>
        <h2 id="categories-title">Encuentra lo que necesitas</h2>
      </div>
      <div className="category-grid">
        {needs.map((need) => (
          <article className={`category-card category-card--${need.tone}`} key={need.id}>
            <span className="category-card__icon" aria-hidden="true"><Icon name={need.icon} /></span>
            <h3>{need.title}</h3>
            <p>{need.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
export default CategoriesSection;
