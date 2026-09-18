const InstructionList = ({ title, items }) => items?.length ? (
  <div className="product-how-to-play__group">
    <h3>{title}</h3>
    <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </div>
) : null;
export default function HowToPlay({ instructions }) {
  if (!instructions) return null;
  return (
    <section className="product-specifications product-how-to-play" aria-labelledby="product-how-to-play-title">
      <h2 id="product-how-to-play-title">Cómo jugar</h2>
      <div className="product-specifications__description">
        {instructions.intro && <p>{instructions.intro}</p>}
        {instructions.challenges && <p><strong>Desafíos:</strong> {instructions.challenges}</p>}
        <ol>{instructions.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        {instructions.modes?.length > 0 && (
          <div className="product-how-to-play__group">
            <h3>Modos de juego</h3>
            <dl>{instructions.modes.map((mode) => (
              <div key={mode.name}><dt>{mode.name}</dt><dd>{mode.description}</dd></div>
            ))}</dl>
          </div>
        )}
        <InstructionList title="Consejos" items={instructions.tips} />
        <InstructionList title="Notas" items={instructions.notes} />
      </div>
    </section>
  );
}
