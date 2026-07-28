import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ValtiqStay",
};

export default function PrivacyPage() {
  return (
    <div style={{ background: "#0A1931", minHeight: "100vh", color: "#F5E9D3" }}>
      {/* Nav bar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(10,25,49,0.97)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(212,180,131,0.08)",
        padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px",
      }}>
        <Link href="/" style={{
          fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase",
          color: "rgba(212,180,131,0.45)", textDecoration: "none", transition: "color 0.2s",
          display: "inline-flex", alignItems: "center", gap: "8px",
        }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M13 5H1M1 5L5 1M1 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Home
        </Link>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(212,180,131,0.25)" }}>
          Privacy Policy
        </span>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px 96px" }}>
        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <p style={{
            fontSize: "9px", letterSpacing: "0.5em", textTransform: "uppercase",
            color: "rgba(212,180,131,0.45)", marginBottom: "16px",
          }}>
            VALTIQSTAY · INFORMATIVA
          </p>
          <h1 style={{
            fontSize: "clamp(32px,5vw,56px)", fontWeight: 300, lineHeight: 1.1,
            letterSpacing: "-0.02em", color: "#F5E9D3", marginBottom: "16px",
          }}>
            Privacy Policy
          </h1>
          <div style={{ height: "1px", width: "64px", background: "linear-gradient(to right,#D4B483,transparent)" }} />
          <p style={{ fontSize: "12px", color: "rgba(212,180,131,0.3)", marginTop: "16px", letterSpacing: "0.05em" }}>
            Ultimo aggiornamento: giugno 2025
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>

          <Section title="1. Titolare del trattamento">
            <p>
              Il titolare del trattamento dei dati personali è <strong>ValtiqStay S.r.l.</strong>,
              con sede legale in Italia (indirizzo in corso di registrazione), P.IVA IT12345678901.
            </p>
            <p>
              Per qualsiasi richiesta relativa alla privacy è possibile contattarci all&apos;indirizzo:{" "}
              <a href="mailto:alisamaffei@valtiqstay.com" style={{ color: "#D4B483", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                alisamaffei@valtiqstay.com
              </a>
            </p>
          </Section>

          <Section title="2. Dati raccolti">
            <p>Il sito raccoglie le seguenti categorie di dati:</p>
            <ul>
              <li>
                <strong style={{ color: "#F5E9D3" }}>Cookie tecnici</strong> — cookie di sessione e
                preferenza lingua, strettamente necessari al funzionamento del sito.
              </li>
              <li>
                <strong style={{ color: "#F5E9D3" }}>Dati del form demo</strong> — nome e cognome,
                nome della struttura alberghiera, indirizzo email aziendale, numero di telefono
                (facoltativo), compilati volontariamente dall&apos;utente per richiedere una
                dimostrazione del servizio.
              </li>
            </ul>
            <p>
              Non vengono raccolti dati sensibili, né dati relativi a minori. Non vengono utilizzati
              cookie di profilazione o di terze parti.
            </p>
          </Section>

          <Section title="3. Finalità del trattamento">
            <ul>
              <li>Garantire il corretto funzionamento tecnico del sito web</li>
              <li>Memorizzare le preferenze di lingua dell&apos;utente</li>
              <li>Gestire e rispondere alle richieste di demo inviate tramite il form di contatto</li>
              <li>Contattare l&apos;utente per organizzare una dimostrazione personalizzata del servizio</li>
            </ul>
          </Section>

          <Section title="4. Base giuridica">
            <p>Il trattamento si basa sulle seguenti basi giuridiche ai sensi dell&apos;art. 6 GDPR:</p>
            <ul>
              <li>
                <strong style={{ color: "#F5E9D3" }}>Legittimo interesse</strong> (art. 6, par. 1, lett. f) —
                per i cookie tecnici necessari al funzionamento del sito.
              </li>
              <li>
                <strong style={{ color: "#F5E9D3" }}>Consenso</strong> (art. 6, par. 1, lett. a) —
                per l&apos;archiviazione della preferenza cookie, fornito tramite il banner presente
                nella pagina.
              </li>
              <li>
                <strong style={{ color: "#F5E9D3" }}>Esecuzione di misure precontrattuali</strong> (art. 6, par. 1, lett. b) —
                per la gestione delle richieste di demo inviate dall&apos;utente.
              </li>
            </ul>
          </Section>

          <Section title="5. Conservazione dei dati">
            <p>
              I dati inseriti nel form di richiesta demo vengono conservati per un periodo massimo
              di <strong style={{ color: "#F5E9D3" }}>24 mesi</strong> dalla data di ricezione,
              salvo diverso accordo con l&apos;utente o obblighi di legge.
            </p>
            <p>
              I cookie tecnici di sessione vengono eliminati al termine della navigazione.
              Il cookie di preferenza lingua viene conservato per la durata della sessione del browser.
            </p>
          </Section>

          <Section title="6. Cookie">
            <p>Il sito utilizza esclusivamente cookie tecnici:</p>
            <div style={{
              background: "rgba(212,180,131,0.04)", border: "1px solid rgba(212,180,131,0.08)",
              borderRadius: "12px", padding: "20px 24px", marginTop: "8px",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", color: "rgba(212,180,131,0.5)", fontWeight: 500, paddingBottom: "10px", letterSpacing: "0.1em" }}>Cookie</th>
                    <th style={{ textAlign: "left", color: "rgba(212,180,131,0.5)", fontWeight: 500, paddingBottom: "10px", letterSpacing: "0.1em" }}>Finalità</th>
                    <th style={{ textAlign: "left", color: "rgba(212,180,131,0.5)", fontWeight: 500, paddingBottom: "10px", letterSpacing: "0.1em" }}>Durata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: "rgba(245,233,211,0.6)", padding: "8px 0", borderTop: "1px solid rgba(212,180,131,0.07)", fontFamily: "monospace" }}>valtiq-cookie</td>
                    <td style={{ color: "rgba(245,233,211,0.45)", padding: "8px 12px", borderTop: "1px solid rgba(212,180,131,0.07)" }}>Memorizza il consenso al banner cookie</td>
                    <td style={{ color: "rgba(245,233,211,0.45)", padding: "8px 0", borderTop: "1px solid rgba(212,180,131,0.07)" }}>Sessione</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: "16px" }}>
              Non utilizziamo cookie di terze parti, cookie di profilazione, pixel di tracciamento
              o tecnologie di analisi comportamentale.
            </p>
          </Section>

          <Section title="7. Diritti dell'interessato">
            <p>
              Ai sensi degli artt. 15–22 del Regolamento UE 2016/679 (GDPR), l&apos;utente ha
              diritto di:
            </p>
            <ul>
              <li><strong style={{ color: "#F5E9D3" }}>Accesso</strong> — ottenere conferma del trattamento e copia dei dati</li>
              <li><strong style={{ color: "#F5E9D3" }}>Rettifica</strong> — correggere dati inesatti o incompleti</li>
              <li><strong style={{ color: "#F5E9D3" }}>Cancellazione</strong> — richiedere la cancellazione dei propri dati (&quot;diritto all&apos;oblio&quot;)</li>
              <li><strong style={{ color: "#F5E9D3" }}>Portabilità</strong> — ricevere i dati in formato strutturato e leggibile da macchina</li>
              <li><strong style={{ color: "#F5E9D3" }}>Opposizione</strong> — opporsi al trattamento basato su legittimo interesse</li>
              <li><strong style={{ color: "#F5E9D3" }}>Limitazione</strong> — richiedere la limitazione del trattamento in determinati casi</li>
            </ul>
            <p>
              Per esercitare i propri diritti scrivere a:{" "}
              <a href="mailto:alisamaffei@valtiqstay.com" style={{ color: "#D4B483", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                alisamaffei@valtiqstay.com
              </a>.
              Risponderemo entro 30 giorni dalla ricezione della richiesta.
            </p>
            <p>
              È inoltre possibile proporre reclamo all&apos;Autorità Garante per la protezione
              dei dati personali (
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer"
                style={{ color: "#D4B483", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                www.garanteprivacy.it
              </a>).
            </p>
          </Section>

          <Section title="8. Sicurezza">
            <p>
              ValtiqStay adotta misure tecniche e organizzative adeguate per proteggere i dati
              personali da accessi non autorizzati, perdita, distruzione o divulgazione.
              Le comunicazioni tra il browser e il sito avvengono tramite protocollo HTTPS cifrato.
            </p>
          </Section>

          <Section title="9. Modifiche alla presente informativa">
            <p>
              La presente informativa può essere aggiornata periodicamente per riflettere modifiche
              normative o operative. La data dell&apos;ultimo aggiornamento è indicata in cima alla
              pagina. In caso di modifiche sostanziali, sarà fornita adeguata comunicazione.
            </p>
          </Section>

        </div>

        {/* Back link */}
        <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(212,180,131,0.08)" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            fontSize: "11px", letterSpacing: "0.35em", textTransform: "uppercase",
            color: "rgba(212,180,131,0.45)", textDecoration: "none", transition: "color 0.2s",
          }}>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
              <path d="M13 5H1M1 5L5 1M1 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Torna alla homepage
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(212,180,131,0.07)", background: "#050B17",
        padding: "24px", textAlign: "center",
      }}>
        <p style={{ fontSize: "10px", color: "rgba(212,180,131,0.2)", margin: 0, letterSpacing: "0.05em" }}>
          © 2025 ValtiqStay S.r.l. — P.IVA IT12345678901
        </p>
      </footer>
    </div>
  );
}

/* ─── Section helper ──────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{
        fontSize: "16px", fontWeight: 500, color: "#D4B483",
        letterSpacing: "0.04em", marginBottom: "20px",
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: "14px", lineHeight: 1.8, color: "rgba(245,233,211,0.55)",
        display: "flex", flexDirection: "column", gap: "12px",
      }}>
        {children}
      </div>
      <style>{`
        section ul { margin: 8px 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
        section ul li { padding-left: 16px; position: relative; }
        section ul li::before { content: '·'; position: absolute; left: 0; color: rgba(212,180,131,0.4); }
        section p { margin: 0; }
      `}</style>
    </section>
  );
}
