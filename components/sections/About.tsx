export function About() {
  return (
    <section className="about section-shell relative" id="about" aria-labelledby="about-title">
      <div className="section-heading reveal">
        <div className="eyebrow mono">
          <span>01</span> ABOUT / PROFILE
        </div>
        <p className="section-code mono">[ HUMAN-CENTERED DIGITAL CRAFT ]</p>
      </div>

      <div className="about-statement reveal">
        <h2 id="about-title">
          Building with logic.
          <br />
          <span>Designing with instinct.</span>
        </h2>
        <p>
          I’m Reo, a graduating IT student and multidisciplinary creative who turns real problems into
          clear, engaging digital products.
        </p>
      </div>

      <div className="bento reveal">
        <article className="bento-card intro-card">
          <span className="card-id mono">A / 001</span>
          <p>
            I work across the full experience—from interface thinking and responsive development to the
            visual details that give a product its character.
          </p>
          <div className="signature">
            Reo <span>Tan.</span>
          </div>
        </article>

        <article className="bento-card stat-card lime">
          <span className="card-id mono">LIVE OUTPUT</span>
          <strong>03</strong>
          <p>
            Projects built, shipped,
            <br />
            and live on the web.
          </p>
          <i className="pulse" aria-hidden="true" />
        </article>

        <article className="bento-card philosophy-card">
          <div className="mini-orbit" aria-hidden="true">
            <i />
            <span>✦</span>
          </div>
          <p>
            “Make it useful.
            <br />
            Make it clear.
            <br />
            <em>Then make it unforgettable.</em>”
          </p>
        </article>

        <article className="bento-card disciplines-card">
          <span className="card-id mono">CORE SYSTEM</span>
          <div>
            <span>01</span>
            <b>DEVELOP</b>
            <small>Structure + performance</small>
          </div>
          <div>
            <span>02</span>
            <b>DESIGN</b>
            <small>Interface + identity</small>
          </div>
          <div>
            <span>03</span>
            <b>DELIVER</b>
            <small>Polish + reliability</small>
          </div>
        </article>
      </div>
    </section>
  );
}
