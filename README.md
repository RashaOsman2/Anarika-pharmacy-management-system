import { useState } from "react";

const NAV_LINKS = ["About", "Features", "Tech Stack", "Get Started"];

const FEATURES = [
  { icon: "🏪", title: "Multi-Shop", desc: "Manage inventory across multiple branches from one unified dashboard" },
  { icon: "📦", title: "Stock Tracking", desc: "Track quantities, set low-stock alerts, and audit trail for removals" },
  { icon: "🧾", title: "Receipts", desc: "Auto-generate professional receipts for every sales transaction" },
  { icon: "📊", title: "Analytics", desc: "Detailed sales reports and transaction history per store" },
  { icon: "👤", title: "Role-Based Access", desc: "Separate Owner and Shop Staff dashboards with distinct permissions" },
  { icon: "🔄", title: "Restock History", desc: "Full restocking timeline per product and branch" },
];

const STACK = [
  { layer: "Frontend", tech: "React + TypeScript" },
  { layer: "Styling", tech: "Tailwind CSS + shadcn/ui" },
  { layer: "Auth", tech: "Firebase Authentication" },
  { layer: "Database", tech: "Supabase (PostgreSQL)" },
  { layer: "ORM", tech: "Drizzle ORM" },
  { layer: "Deployment", tech: "Netlify" },
];

const DEMO_ACCOUNTS = [
  { role: "Shop 1 Staff", email: "demoshop1@gmail.com", pass: "demo1234", color: "#4ade80" },
  { role: "Shop 2 Staff", email: "demoshop2@gmail.com", pass: "demo1234", color: "#60a5fa" },
  { role: "Admin", email: "demoadmin@gmail.com", pass: "demoadmin1234", color: "#f472b6" },
];

const CODE = `# 1. Clone the repo
git clone https://github.com/RashaOsman2/Anarika-pharmacy-management-system.git

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Firebase and Supabase credentials

# 4. Run development server
npm run dev`;

export default function AnarikaDocs() {
  const [copied, setCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(null);

  const copyCode = () => {
    navigator.clipboard.writeText(CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyEmail = (email, idx) => {
    navigator.clipboard.writeText(email);
    setCopiedAccount(idx);
    setTimeout(() => setCopiedAccount(null), 1500);
  };

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#0a0f0a",
      color: "#e8f0e8",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f0a; }
        ::-webkit-scrollbar-thumb { background: #2d5c2d; border-radius: 2px; }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(3.5rem, 10vw, 8rem);
          line-height: 0.9;
          letter-spacing: -0.03em;
          color: #e8f0e8;
        }

        .hero-title span {
          color: #4ade80;
          display: block;
        }

        .nav-link {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6b9e6b;
          text-decoration: none;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { color: #4ade80; }

        .feature-card {
          background: #0d140d;
          border: 1px solid #1a2e1a;
          border-radius: 2px;
          padding: 1.75rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px;
          height: 0;
          background: #4ade80;
          transition: height 0.3s ease;
        }
        .feature-card:hover { border-color: #2d5c2d; transform: translateY(-2px); }
        .feature-card:hover::before { height: 100%; }

        .stack-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 0;
          border-bottom: 1px solid #1a2e1a;
          transition: all 0.2s;
        }
        .stack-row:hover { padding-left: 0.5rem; }
        .stack-row:last-child { border-bottom: none; }

        .code-block {
          background: #060c06;
          border: 1px solid #1a2e1a;
          border-radius: 2px;
          padding: 1.5rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.8;
          color: #a8c8a8;
          white-space: pre;
          overflow-x: auto;
        }
        .code-block .comment { color: #4a6e4a; }
        .code-block .cmd { color: #4ade80; }

        .demo-card {
          border: 1px solid #1a2e1a;
          background: #0d140d;
          padding: 1.25rem;
          border-radius: 2px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .demo-card:hover { border-color: #2d5c2d; background: #111a11; }

        .badge {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 1px;
          background: #0d1a0d;
          border: 1px solid #2d5c2d;
          color: #4ade80;
          display: inline-block;
        }

        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #4ade80;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-label::before {
          content: '';
          width: 1.5rem;
          height: 1px;
          background: #4ade80;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #e8f0e8;
          line-height: 1.1;
        }

        .copy-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: #1a2e1a;
          color: #6b9e6b;
          border: 1px solid #2d5c2d;
          padding: 0.4rem 0.8rem;
          border-radius: 1px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover { background: #2d5c2d; color: #e8f0e8; }

        .cross-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #2d5c2d, transparent);
          margin: 4rem 0;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(#1a2e1a22 1px, transparent 1px),
            linear-gradient(90deg, #1a2e1a22 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .pill-mono {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: #6b9e6b;
        }

        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 700;
          color: #4ade80;
          line-height: 1;
        }

        .env-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #1a2e1a;
        }
        .env-item:last-child { border-bottom: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.4s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.55s; opacity: 0; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pulse-dot { animation: pulse-dot 2s infinite; }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid #1a2e1a",
        background: "rgba(10,15,10,0.92)",
        backdropFilter: "blur(12px)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>💊</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#e8f0e8",
            letterSpacing: "0.02em",
          }}>Anarika</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {NAV_LINKS.map(l => (
            <span key={l} className="nav-link">{l}</span>
          ))}
          
            href="https://github.com/RashaOsman2/Anarika-pharmacy-management-system"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "#4ade80",
              color: "#0a0f0a",
              padding: "0.5rem 1rem",
              borderRadius: "1px",
              textDecoration: "none",
              fontWeight: 500,
              transition: "opacity 0.2s",
            }}
          >GitHub ↗</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", paddingTop: "8rem", paddingBottom: "6rem", overflow: "hidden" }}>
        <div className="grid-overlay" />
        {/* Large decorative cross */}
        <div style={{
          position: "absolute", right: "8%", top: "50%", transform: "translateY(-50%)",
          width: "320px", height: "320px", opacity: 0.04,
          background: "radial-gradient(circle, #4ade80 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "2rem" }}
            className="fade-up fade-up-1">
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#4ade80", display: "inline-block",
              marginTop: "0.35rem", flexShrink: 0,
            }} className="pulse-dot" />
            <span className="pill-mono">Pharmacy Management System · v1.0</span>
          </div>

          <h1 className="hero-title fade-up fade-up-2">
            Manage
            <span>Smarter.</span>
          </h1>

          <p style={{
            fontFamily: "'Crimson Pro', serif",
            fontStyle: "italic",
            fontSize: "1.3rem",
            color: "#8aaf8a",
            maxWidth: "480px",
            lineHeight: 1.6,
            marginTop: "1.5rem",
            marginBottom: "2.5rem",
          }} className="fade-up fade-up-3">
            Full-stack pharmacy operations — multi-branch inventory, stock control, and receipt generation in one system.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }} className="fade-up fade-up-4">
            
              href="https://github.com/RashaOsman2/Anarika-pharmacy-management-system"
              target="_blank"
              rel="noreferrer"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "#4ade80",
                color: "#0a0f0a",
                padding: "0.75rem 1.75rem",
                borderRadius: "1px",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >View on GitHub</a>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "transparent",
                color: "#4ade80",
                padding: "0.75rem 1.75rem",
                borderRadius: "1px",
                border: "1px solid #2d5c2d",
                cursor: "pointer",
              }}
            >Try Demo ↓</button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "3rem", marginTop: "5rem",
            paddingTop: "3rem", borderTop: "1px solid #1a2e1a",
            flexWrap: "wrap",
          }}>
            {[
              { num: "6+", label: "Core Features" },
              { num: "2", label: "Role Types" },
              { num: "∞", label: "Branches" },
            ].map(s => (
              <div key={s.label}>
                <div className="stat-num">{s.num}</div>
                <div className="pill-mono" style={{ marginTop: "0.25rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cross-line" />

      {/* Features */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div className="section-label">Features</div>
        <h2 className="section-title" style={{ marginBottom: "3rem" }}>
          Everything a pharmacy<br />
          <em style={{ fontStyle: "italic", color: "#6b9e6b" }}>actually needs</em>
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{f.icon}</div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.1rem",
                color: "#e8f0e8",
                marginBottom: "0.5rem",
              }}>{f.title}</div>
              <div style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: "0.95rem",
                color: "#6b9e6b",
                lineHeight: 1.6,
              }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="cross-line" />

      {/* Tech Stack */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
          <div>
            <div className="section-label">Tech Stack</div>
            <h2 className="section-title" style={{ marginBottom: "2rem" }}>
              Built on solid<br />
              <em style={{ fontStyle: "italic", color: "#6b9e6b" }}>foundations</em>
            </h2>
            <p style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: "1.05rem",
              color: "#6b9e6b",
              lineHeight: 1.7,
            }}>
              Modern tooling chosen for reliability, developer experience, and production performance.
            </p>
          </div>
          <div style={{ border: "1px solid #1a2e1a", padding: "0.5rem 1.5rem", background: "#0d140d" }}>
            {STACK.map(s => (
              <div key={s.layer} className="stack-row">
                <span className="pill-mono" style={{ color: "#4a6e4a" }}>{s.layer}</span>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.8rem",
                  color: "#e8f0e8",
                }}>{s.tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cross-line" />

      {/* Demo Accounts */}
      <section id="demo" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div className="section-label">Live Demo</div>
        <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>Try it yourself</h2>
        <p style={{
          fontFamily: "'Crimson Pro', serif",
          fontSize: "1.05rem",
          color: "#6b9e6b",
          marginBottom: "2rem",
        }}>Click any account to copy the email address.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {DEMO_ACCOUNTS.map((acc, i) => (
            <div key={i} className="demo-card" onClick={() => copyEmail(acc.email, i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span className="badge" style={{ borderColor: acc.color + "55", color: acc.color, background: acc.color + "11" }}>
                  {acc.role}
                </span>
                <span className="pill-mono" style={{ fontSize: "0.65rem", color: copiedAccount === i ? "#4ade80" : "#4a6e4a" }}>
                  {copiedAccount === i ? "✓ copied" : "click to copy"}
                </span>
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.78rem",
                color: "#a8c8a8",
                marginBottom: "0.4rem",
              }}>{acc.email}</div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.75rem",
                color: "#4a6e4a",
              }}>pass: {acc.pass}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="cross-line" />

      {/* Getting Started */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem 6rem" }}>
        <div className="section-label">Installation</div>
        <h2 className="section-title" style={{ marginBottom: "2rem" }}>Get started<br />
          <em style={{ fontStyle: "italic", color: "#6b9e6b" }}>in minutes</em>
        </h2>

        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1 }}>
            <button className="copy-btn" onClick={copyCode}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <div className="code-block">
            {CODE.split('\n').map((line, i) => {
              const isComment = line.startsWith('#');
              const isCmd = line.startsWith('git') || line.startsWith('npm') || line.startsWith('cp');
              return (
                <div key={i} style={{ color: isComment ? "#4a6e4a" : isCmd ? "#86efac" : "#a8c8a8" }}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>

        {/* Env vars */}
        <div style={{
          marginTop: "2rem",
          border: "1px solid #1a2e1a",
          background: "#0d140d",
          padding: "1.5rem",
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#4ade80",
            marginBottom: "1rem",
          }}>Required Environment Variables</div>
          {[
            { name: "Firebase credentials", desc: "API key, auth domain, project ID" },
            { name: "Supabase URL + anon key", desc: "From your Supabase project dashboard" },
            { name: "Database URL", desc: "PostgreSQL connection string" },
          ].map((e, i) => (
            <div key={i} className="env-item">
              <span style={{ color: "#4ade80", marginTop: "1px" }}>→</span>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#e8f0e8" }}>{e.name}</div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.9rem", color: "#4a6e4a", marginTop: "0.15rem" }}>{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1a2e1a",
        padding: "2.5rem 2rem",
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1rem",
            color: "#e8f0e8",
            marginBottom: "0.25rem",
          }}>Yeasin Osman Rasha</div>
          <div className="pill-mono">Software Engineering · Daffodil International University</div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <span className="pill-mono">💊 Anarika · 2024</span>
          
            href="https://github.com/RashaOsman2/Anarika-pharmacy-management-system"
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#4ade80",
              textDecoration: "none",
              border: "1px solid #2d5c2d",
              padding: "0.4rem 0.8rem",
            }}
          >GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}
