import Icon from "../common/Icon/Icon";
const values = [
  { icon: "heart", title: "Selección con intención", text: "Elegimos cada producto pensando en su utilidad cotidiana y en una experiencia amable." },
  { icon: "layers", title: "Apoyos para tu día", text: "Recursos para organización, regulación, enfoque y bienestar, sin fórmulas únicas." },
  { icon: "community", title: "Una mirada inclusiva", text: "Celebramos distintas formas de procesar, aprender y relacionarse con el mundo." },
];
const ValueSection = () => {
  return (
    <section className="value-section" id="kinora" aria-labelledby="value-title">
      <div className="value-section__intro">
        <span className="home-eyebrow">La intención detrás de Kinora</span>
        <h2 id="value-title">Herramientas para vivir a tu manera</h2>
        <p>Kinora es un espacio pensado para personas neurodivergentes, familias y quienes buscan recursos más claros, cómodos e inclusivos para la vida diaria.</p>
      </div>
      <div className="value-list">
        {values.map((value) => (
          <article className="value-item" key={value.title}>
            <span aria-hidden="true"><Icon name={value.icon} /></span>
            <div>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
export default ValueSection;
