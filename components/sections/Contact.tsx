export function Contact() {
  const currentYear = new Date().getFullYear();

  return (
    <section className="contact relative isolate" id="contact" aria-labelledby="contact-title">
      <div className="contact-noise" aria-hidden="true" />
      <div className="contact-top section-shell reveal">
        <div className="eyebrow mono">
          <span>05</span> START / A CONVERSATION
        </div>
        <div className="contact-status">
          <i /> OPEN TO OPPORTUNITIES
        </div>
      </div>

      <div className="contact-main section-shell">
        <p className="reveal">Have an idea, an opportunity, or something worth building?</p>
        <h2 className="reveal" id="contact-title">
          LET’S CREATE
          <br />
          <span>THE NEXT</span> <em>THING.</em>
        </h2>
        <a className="contact-link magnetic reveal" href="mailto:reotan040@gmail.com">
          <span>START A PROJECT</span>
          <b aria-hidden="true">↗</b>
        </a>
      </div>

      <footer className="section-shell">
        <div>
          <span className="brand-mark">
            R<span>T</span>
          </span>
          <p>
            Reo Anthony Tan
            <br />
            <small>Creative developer based in the Philippines.</small>
          </p>
        </div>
        <div className="footer-links">
          <a href="mailto:reotan040@gmail.com">EMAIL ↗</a>
          <a href="/assets/Reo-Anthony-Tan-CV.pdf" download>
            RÉSUMÉ ↗
          </a>
        </div>
        <div className="footer-meta mono">
          <span>© {currentYear} REO TAN</span>
          <a href="#home">BACK TO TOP ↑</a>
        </div>
      </footer>
    </section>
  );
}
