import Icon from "../common/Icon/Icon";
import { catalogCategories } from "../../data/homeData";
const TraditionalCategoriesSection = () => {
  return (
    <section className="home-section traditional-categories" aria-labelledby="traditional-categories-title">
      <div className="home-section__heading">
        <h2 id="traditional-categories-title">Explora por categoría</h2>
      </div>
      <div className="traditional-category-grid">
        {catalogCategories.map((category) => (
          <article className={`traditional-category-card traditional-category-card--${category.tone}`} key={category.id} tabIndex={0}>
            <span className="traditional-category-card__icon" aria-hidden="true"><Icon name={category.icon} /></span>
            <h3>{category.title}</h3>
          </article>
        ))}
      </div>
      <p className="traditional-categories__more">Ver todas las categorías →</p>
    </section>
  );
};
export default TraditionalCategoriesSection;
