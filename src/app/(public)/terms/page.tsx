export const metadata = { title: "Terms of Service — MacroΠie" };

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FDFBF8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "'Outfit', sans-serif",
        color: "#2C2C2C",
      }}
    >
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", fontWeight: 400 }}>
        Terms of Service
      </h1>
      <p style={{ color: "#4A4A4A", fontSize: "16px" }}>Coming soon.</p>
      <a href="/" style={{ fontSize: "14px", color: "#C4724E", textDecoration: "none", marginTop: "8px" }}>
        ← Back to home
      </a>
    </div>
  );
}
