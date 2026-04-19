import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DemoCarousel } from "@/components/landing/DemoCarousel";

export const metadata = {
  title: "MacroΠie — Meal planning for coaches who build, not just track",
};

export default async function LandingPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/home");

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav className="lp-nav">
        <a href="/" className="lp-nav-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12.5" stroke="#2C2C2C" strokeWidth="1" opacity="0.1" fill="none" />
            <path d="M14 3.5 A10.5 10.5 0 0 1 23 9 L14 14 Z" fill="#7A8B6F" opacity="0.85" />
            <path d="M23 9 A10.5 10.5 0 0 1 18 24 L14 14 Z" fill="#B8907A" opacity="0.85" />
            <path d="M18 24 A10.5 10.5 0 0 1 5 8 L14 14 Z" fill="#C4724E" opacity="0.85" />
            <path d="M5 8 A10.5 10.5 0 0 1 14 3.5 L14 14 Z" fill="#C4B9A8" opacity="0.5" />
            <circle cx="14" cy="14" r="2.5" fill="#FDFBF8" />
          </svg>
          <div className="lp-nav-logo-text">
            Macro<span style={{ color: "#C4724E" }}>Πie</span>
          </div>
        </a>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how" className="lp-nav-link">How it works</a>
          <a href="#demo" className="lp-nav-link">Demo</a>
          <a href="/login" className="lp-nav-link">Log in</a>
          <a href="/signup" className="lp-nav-cta">Start free</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="lp-hero-wrap">
        <section className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <div className="lp-hero-badge-dot" />
              Now in early access
            </div>
            <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300, fontSize: "16px", color: "#B8907A", marginBottom: "12px" }}>
              Less spreadsheets. More coaching.
            </p>
            <h1>
              Your clients deserve meal plans made with{" "}
              <em>intention, not guesswork.</em>
            </h1>
            <p className="lp-hero-sub">
              MacroΠie gives nutrition coaches their time back. Write your recipes once, build plans for every client in minutes and spend your energy where it matters most.
            </p>
            <div className="lp-hero-actions">
              <a href="/signup" className="lp-btn-primary">Start free</a>
              <a href="#how" className="lp-btn-secondary">▶ See how it works</a>
            </div>
            <p className="lp-hero-note">Free for your first 2 clients. No credit card needed.</p>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-hero-float"><span>🥧</span></div>
            <div className="lp-hero-mockup">
              <div className="lp-hero-mockup-bar">
                <div className="lp-hero-mockup-dot" />
                <div className="lp-hero-mockup-dot" />
                <div className="lp-hero-mockup-dot" />
                <div className="lp-hero-mockup-url">macropie.com/home</div>
              </div>
              <div className="lp-hero-mockup-body">
                <div className="lp-mockup-nav">
                  <div className="lp-mockup-nav-brand">
                    <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                      <path d="M14 3.5 A10.5 10.5 0 0 1 23 9 L14 14 Z" fill="#7A8B6F" opacity="0.85" />
                      <path d="M23 9 A10.5 10.5 0 0 1 18 24 L14 14 Z" fill="#B8907A" opacity="0.85" />
                      <path d="M18 24 A10.5 10.5 0 0 1 5 8 L14 14 Z" fill="#C4724E" opacity="0.85" />
                      <path d="M5 8 A10.5 10.5 0 0 1 14 3.5 L14 14 Z" fill="#C4B9A8" opacity="0.5" />
                      <circle cx="14" cy="14" r="2.5" fill="#FDFBF8" />
                    </svg>
                    Macro<em style={{ fontStyle: "normal", color: "#C4724E" }}>Πie</em>
                  </div>
                  <div className="lp-mockup-nav-tabs">
                    <span style={{ color: "#C4724E", fontWeight: 500 }}>Home</span>
                    <span>Recipes</span>
                    <span>Clients</span>
                  </div>
                </div>
                <div className="lp-mockup-greeting">Good morning, Coach</div>
                <div className="lp-mockup-cards">
                  <div className="lp-mockup-card">
                    <div className="lp-mockup-card-label">Clients</div>
                    <div className="lp-mockup-card-value">24</div>
                  </div>
                  <div className="lp-mockup-card dark">
                    <div className="lp-mockup-card-label">Meal Plans</div>
                    <div className="lp-mockup-card-value">18</div>
                  </div>
                  <div className="lp-mockup-card">
                    <div className="lp-mockup-card-label">Recipes</div>
                    <div className="lp-mockup-card-value">156</div>
                  </div>
                </div>
                <div className="lp-mockup-bars">
                  <div className="lp-mockup-bar-row">
                    <div className="lp-mockup-bar-lbl">Protein</div>
                    <div className="lp-mockup-bar-track"><div className="lp-mockup-bar-fill p" /></div>
                  </div>
                  <div className="lp-mockup-bar-row">
                    <div className="lp-mockup-bar-lbl">Carbs</div>
                    <div className="lp-mockup-bar-track"><div className="lp-mockup-bar-fill c" /></div>
                  </div>
                  <div className="lp-mockup-bar-row">
                    <div className="lp-mockup-bar-lbl">Fat</div>
                    <div className="lp-mockup-bar-track"><div className="lp-mockup-bar-fill f" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* PAIN */}
      <section className="lp-pain">
        <div className="lp-pain-inner">
          <h2>Sound <em>familiar?</em></h2>
          <p className="lp-pain-sub">
            Every nutrition coach hits the same wall. The hard part is not the coaching. It is everything around it.
          </p>
          <div className="lp-pain-grid">
            <div className="lp-pain-card">
              <div className="lp-pain-card-top">
                <div className="lp-pain-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#C4724E" strokeWidth="1.5" />
                    <path d="M12 6v6l4 2" stroke="#C4724E" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Hours per plan</h3>
              </div>
              <p>A single meal plan takes an hour or more. Scaling to more clients means sacrificing quality or sleep.</p>
            </div>
            <div className="lp-pain-card">
              <div className="lp-pain-card-top">
                <div className="lp-pain-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#C4724E" strokeWidth="1.5" />
                    <path d="M7 8h10M7 12h6M7 16h8" stroke="#C4724E" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Spreadsheet fatigue</h3>
              </div>
              <p>You spend more time wrestling Excel than coaching. One formula breaks, one client changes and you are rebuilding everything.</p>
            </div>
            <div className="lp-pain-card">
              <div className="lp-pain-card-top">
                <div className="lp-pain-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#C4724E" strokeWidth="1.5" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#C4724E" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Plans that look amateur</h3>
              </div>
              <p>A screenshot or a messy Excel sheet is not what a professional coach delivers. Your clients deserve better than that.</p>
            </div>
            <div className="lp-pain-card">
              <div className="lp-pain-card-top">
                <div className="lp-pain-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#C4724E" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3>Plans that get buried</h3>
              </div>
              <p>You send a PDF or screenshot. It gets buried in their messages. A week later they have not even opened it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section className="lp-demo" id="demo">
        <h2>
          A look inside Macro<em style={{ color: "#C4724E", fontStyle: "normal" }}>Πie</em>
        </h2>
        <p className="lp-demo-sub">
          From recipes to meal plans to PDF exports. Here is what the workspace looks like.
        </p>
        <DemoCarousel />
      </section>

      {/* FEATURES */}
      <section className="lp-features" id="features">
        <div className="lp-features-inner">
          <div className="lp-features-header">
            <h2>
              Everything a coach needs. <em>The precision. The time back.</em>
            </h2>
            <p>Five features. One workspace. Everything in one place.</p>
          </div>
          <div className="lp-features-grid">
            <div
              className="lp-feature-card full"
              style={{ background: "#7A8B6F", borderColor: "#7A8B6F", display: "flex", alignItems: "center", gap: "24px" }}
            >
              <div className="lp-feature-icon" style={{ background: "rgba(255,255,255,.15)", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 style={{ color: "#FDFBF8" }}>Auto-macro adjustment</h3>
                <p style={{ color: "rgba(255,255,255,.8)" }}>
                  Write a recipe once. MacroΠie scales the portions automatically for each client based on their goals. One recipe, infinite clients.
                </p>
              </div>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon olive">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12h6M9 16h4" stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Macro-accurate recipes</h3>
              <p>Build recipes from a verified ingredient database. Add your ingredients, set your portions and MacroΠie calculates protein, carbs, fat and calories instantly.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon clay">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#B8907A" strokeWidth="1.5" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#B8907A" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Client profiles</h3>
              <p>One profile per client. Their macro goals, their plan history, their progress all in one place. No scattered notes, no forgotten targets.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon charcoal-bg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="#2C2C2C" strokeWidth="1.5" />
                  <path d="M3 9h18M9 4v5M15 4v5" stroke="#2C2C2C" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Meal plan builder</h3>
              <p>Pick your recipes, assign them to a client and MacroΠie auto-adjusts portions to hit their macro targets. Tweak if you want to, or let it do the work. Then share.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon terra">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#C4724E" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#C4724E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Share meal plan</h3>
              <p>Export a beautiful branded PDF or share plans directly via the app. Clients access their plan and history anytime from their own dedicated page.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-how" id="how">
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2>
            How it works in{" "}
            <em style={{ fontStyle: "normal", color: "#C4724E" }}>4 steps.</em>
          </h2>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-number">1</div>
              <div className="lp-step-content">
                <h3>Create your recipes</h3>
                <p>Create recipes from a verified ingredient database. MacroΠie calculates every macro instantly. Write them once, use them forever.</p>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-number">2</div>
              <div className="lp-step-content">
                <h3>Create your clients</h3>
                <p>Create a profile for each client with their macro goals. MacroΠie keeps the full history. No scattered notes, no forgotten targets.</p>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-number">3</div>
              <div className="lp-step-content">
                <h3>Build a meal plan</h3>
                <p>Pick your recipes and assign them to a client. MacroΠie scales the portions automatically to match their macro goals. Minutes instead of hours.</p>
              </div>
            </div>
            <div className="lp-step">
              <div className="lp-step-number">4</div>
              <div className="lp-step-content">
                <h3>Share your meal plan</h3>
                <p>Send a clean, branded PDF or share directly via the app. Clients access their plan and history anytime from their own page.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2>
          Less spreadsheets.<br /><em>More life.</em>
        </h2>
        <p>Because great coaching deserves better tools.</p>
        <a href="/signup" className="lp-btn-primary">Start free</a>
        <p className="lp-cta-note">Free for your first 2 clients. No credit card needed.</p>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
            <path d="M10 2.5 A7.5 7.5 0 0 1 17 6.5 L10 10 Z" fill="#7A8B6F" opacity="0.85" />
            <path d="M17 6.5 A7.5 7.5 0 0 1 13 17.5 L10 10 Z" fill="#B8907A" opacity="0.85" />
            <path d="M13 17.5 A7.5 7.5 0 0 1 3.5 6 L10 10 Z" fill="#C4724E" opacity="0.85" />
            <path d="M3.5 6 A7.5 7.5 0 0 1 10 2.5 L10 10 Z" fill="#C4B9A8" opacity="0.5" />
            <circle cx="10" cy="10" r="1.8" fill="#FDFBF8" />
          </svg>
          <span>Macro<span style={{ color: "#C4724E" }}>Πie</span></span>
        </div>
        <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontWeight: 300, fontSize: "13px", color: "#F5F1EB", opacity: 0.5 }}>
          Every plate tells a number. 🥧
        </p>
        <div className="lp-footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:info@macropie.com">Contact</a>
          <a href="https://instagram.com/macropie.app" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <div className="lp-footer-copy">© 2026 MacroΠie. All rights reserved.</div>
      </footer>
    </div>
  );
}
