import { expertise } from "@/data/portfolio";

export function Expertise() {
  return (
    <section className="expertise section-shell relative" id="expertise" aria-labelledby="expertise-title">
      <div className="section-heading reveal">
        <div className="eyebrow mono">
          <span>04</span> EXPERTISE / CAPABILITIES
        </div>
        <p className="section-code mono">[ HOW I APPLY THE STACK ]</p>
      </div>

      <div className="expertise-layout">
        <div className="expertise-title reveal">
          <h2 id="expertise-title">
            Ideas need
            <br />
            <em>range.</em>
          </h2>
          <p>A flexible toolkit for taking a project from blank canvas to live experience.</p>
          <div className="radar" aria-hidden="true">
            <i />
            <i />
            <span>RT</span>
          </div>
        </div>

        <div className="expertise-list reveal">
          {expertise.map((item) => (
            <article key={item.index}>
              <span className="expertise-no mono">{item.index}</span>
              <h3>{item.title}</h3>
              <p>{item.tools}</p>
              <b aria-hidden="true">↗</b>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
