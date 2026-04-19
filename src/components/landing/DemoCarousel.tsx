"use client";

import { useState } from "react";

const LOGO_SVG = (
  <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
    <path d="M14 3.5 A10.5 10.5 0 0 1 23 9 L14 14 Z" fill="#7A8B6F" opacity="0.85" />
    <path d="M23 9 A10.5 10.5 0 0 1 18 24 L14 14 Z" fill="#B8907A" opacity="0.85" />
    <path d="M18 24 A10.5 10.5 0 0 1 5 8 L14 14 Z" fill="#C4724E" opacity="0.85" />
    <path d="M5 8 A10.5 10.5 0 0 1 14 3.5 L14 14 Z" fill="#C4B9A8" opacity="0.5" />
    <circle cx="14" cy="14" r="2.5" fill="#FDFBF8" />
  </svg>
);

const DEMO_NAV = (activeTab: number) => (
  <div className="lp-demo-nav">
    <div className="lp-demo-nav-brand">
      {LOGO_SVG}
      Macro<em style={{ fontStyle: "normal", color: "#C4724E" }}>Πie</em>
    </div>
    <div className="lp-demo-nav-tabs">
      <span style={activeTab === 0 ? { color: "#C4724E", fontWeight: 500 } : {}}>Home</span>
      <span style={activeTab === 1 ? { color: "#C4724E", fontWeight: 500 } : {}}>Recipes</span>
      <span style={activeTab === 2 ? { color: "#C4724E", fontWeight: 500 } : {}}>Clients</span>
    </div>
  </div>
);

function ScreenHome() {
  return (
    <div className="lp-demo-screen">
      <div className="lp-demo-screen-bar">
        <div className="lp-demo-screen-dots"><span /><span /><span /></div>
        <div className="lp-demo-screen-url">macropie.com/home</div>
      </div>
      <div className="lp-demo-screen-body">
        {DEMO_NAV(0)}
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#2C2C2C" }}>Good morning, Coach</div>
          <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.5 }}>Monday, April 6</div>
        </div>
        <div style={{ fontSize: "8px", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase", color: "#4A4A4A", opacity: 0.5, marginBottom: "6px" }}>Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "10px" }}>
          <div style={{ background: "white", borderRadius: "10px", padding: "10px", border: "1px solid #E8E0D4" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#2C2C2C" }}>12</div>
            <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.6 }}>Active Clients</div>
          </div>
          <div style={{ background: "white", borderRadius: "10px", padding: "10px", border: "1px solid #E8E0D4" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#2C2C2C" }}>48</div>
            <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.6 }}>Recipes</div>
          </div>
          <div style={{ background: "white", borderRadius: "10px", padding: "10px", border: "1px solid #E8E0D4" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#2C2C2C" }}>9</div>
            <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.6 }}>Meal Plans</div>
          </div>
        </div>
        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E8E0D4", overflow: "hidden" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #E8E0D4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "8px", fontWeight: 500, textTransform: "uppercase", color: "#2C2C2C" }}>Active Clients</div>
            <div style={{ fontSize: "8px", color: "#C4724E" }}>View all</div>
          </div>
          <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F5F1EB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#B8907A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white", fontWeight: 500 }}>SM</div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 500, color: "#2C2C2C" }}>S. Mitchell</div>
                <div style={{ fontSize: "7px", color: "#4A4A4A", opacity: 0.5 }}>1800 kcal</div>
              </div>
            </div>
            <div style={{ background: "#C4724E", borderRadius: "6px", padding: "3px 8px", fontSize: "7px", color: "white", fontWeight: 500 }}>+ New Plan</div>
          </div>
          <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#7A8B6F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white", fontWeight: 500 }}>AT</div>
              <div>
                <div style={{ fontSize: "9px", fontWeight: 500, color: "#2C2C2C" }}>A. Torres</div>
                <div style={{ fontSize: "7px", color: "#4A4A4A", opacity: 0.5 }}>2200 kcal</div>
              </div>
            </div>
            <div style={{ background: "#C4724E", borderRadius: "6px", padding: "3px 8px", fontSize: "7px", color: "white", fontWeight: 500 }}>+ New Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenRecipe() {
  return (
    <div className="lp-demo-screen">
      <div className="lp-demo-screen-bar">
        <div className="lp-demo-screen-dots"><span /><span /><span /></div>
        <div className="lp-demo-screen-url">macropie.com/recipes/new</div>
      </div>
      <div className="lp-demo-screen-body">
        {DEMO_NAV(1)}
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#2C2C2C", marginBottom: "2px" }}>New Recipe</div>
        <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.5, marginBottom: "12px" }}>Build a macro-accurate recipe</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E8E0D4", padding: "10px" }}>
              <div style={{ fontSize: "8px", fontWeight: 500, textTransform: "uppercase", color: "#4A4A4A", opacity: 0.6, marginBottom: "6px" }}>Recipe Details</div>
              <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "6px 8px", fontSize: "8px", color: "#4A4A4A", opacity: 0.5, marginBottom: "5px" }}>e.g. Grilled Chicken &amp; Rice</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "6px 8px", fontSize: "8px", color: "#4A4A4A", opacity: 0.5 }}>Servings: 1</div>
                <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "6px 8px", fontSize: "8px", color: "#4A4A4A", opacity: 0.5 }}>Mediterranean</div>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E8E0D4", padding: "10px" }}>
              <div style={{ fontSize: "8px", fontWeight: 500, textTransform: "uppercase", color: "#4A4A4A", opacity: 0.6, marginBottom: "6px" }}>Ingredients</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "6px 8px", display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "8px", color: "#2C2C2C" }}>Chicken breast</div>
                  <div style={{ fontSize: "8px", color: "#7A8B6F", fontWeight: 500 }}>150g</div>
                </div>
                <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "6px 8px", display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "8px", color: "#2C2C2C" }}>Brown rice</div>
                  <div style={{ fontSize: "8px", color: "#7A8B6F", fontWeight: 500 }}>80g</div>
                </div>
              </div>
              <div style={{ marginTop: "6px", border: "1px dashed #E8E0D4", borderRadius: "6px", padding: "6px 8px", textAlign: "center", fontSize: "8px", color: "#C4724E" }}>+ Add Ingredient</div>
            </div>
          </div>
          <div style={{ width: "70px", background: "white", borderRadius: "10px", border: "1px solid #E8E0D4", padding: "10px" }}>
            <div style={{ fontSize: "8px", fontWeight: 500, color: "#2C2C2C", marginBottom: "8px" }}>Per Serving</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#2C2C2C", marginBottom: "6px" }}>487<span style={{ fontSize: "7px", fontWeight: 400, color: "#4A4A4A" }}> kcal</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "5px", textAlign: "center" }}>
                <div style={{ fontSize: "9px", fontWeight: 600, color: "#7A8B6F" }}>38g</div>
                <div style={{ fontSize: "7px", color: "#4A4A4A", opacity: 0.6 }}>Protein</div>
              </div>
              <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "5px", textAlign: "center" }}>
                <div style={{ fontSize: "9px", fontWeight: 600, color: "#B8907A" }}>58g</div>
                <div style={{ fontSize: "7px", color: "#4A4A4A", opacity: 0.6 }}>Carbs</div>
              </div>
              <div style={{ background: "#F5F1EB", borderRadius: "6px", padding: "5px", textAlign: "center" }}>
                <div style={{ fontSize: "9px", fontWeight: 600, color: "#C4724E" }}>8g</div>
                <div style={{ fontSize: "7px", color: "#4A4A4A", opacity: 0.6 }}>Fat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenPdf() {
  return (
    <div className="lp-demo-screen">
      <div className="lp-demo-screen-bar">
        <div className="lp-demo-screen-dots"><span /><span /><span /></div>
        <div className="lp-demo-screen-url">macropie.com/plans/export</div>
      </div>
      <div className="lp-demo-screen-body">
        {DEMO_NAV(2)}
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#2C2C2C", marginBottom: "2px" }}>Meal Plans</div>
        <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.5, marginBottom: "12px" }}>S. Mitchell</div>
        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E8E0D4", overflow: "hidden", marginBottom: "8px" }}>
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #E8E0D4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "9px", fontWeight: 500, color: "#2C2C2C" }}>Week 1 Plan</div>
            <div style={{ background: "#7A8B6F", borderRadius: "6px", padding: "2px 7px", fontSize: "7px", color: "white" }}>Active</div>
          </div>
          <div style={{ padding: "8px 10px" }}>
            <div style={{ fontSize: "8px", color: "#4A4A4A", opacity: 0.6, marginBottom: "8px" }}>1,800 kcal · P 120g · C 180g · F 50g</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #F5F1EB" }}>
                <div style={{ fontSize: "8px", color: "#2C2C2C" }}>Breakfast</div>
                <div style={{ fontSize: "8px", color: "#7A8B6F", fontWeight: 500 }}>420 kcal</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #F5F1EB" }}>
                <div style={{ fontSize: "8px", color: "#2C2C2C" }}>Lunch</div>
                <div style={{ fontSize: "8px", color: "#7A8B6F", fontWeight: 500 }}>580 kcal</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                <div style={{ fontSize: "8px", color: "#2C2C2C" }}>Dinner</div>
                <div style={{ fontSize: "8px", color: "#7A8B6F", fontWeight: 500 }}>800 kcal</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: "#C4724E", borderRadius: "8px", padding: "7px 12px", textAlign: "center", fontSize: "9px", fontWeight: 500, color: "white" }}>Export PDF</div>
      </div>
    </div>
  );
}

const SCREENS = [
  {
    key: "home",
    component: <ScreenHome />,
    caption: <><strong>Home:</strong> Clients, recipes and plans at a glance.</>,
  },
  {
    key: "recipe",
    component: <ScreenRecipe />,
    caption: <><strong>Recipe builder:</strong> Macros calculated automatically as you add ingredients.</>,
  },
  {
    key: "pdf",
    component: <ScreenPdf />,
    caption: <>Export a branded, print-ready PDF in one click.</>,
  },
];

const POSITIONS = ["lp-pos-left", "lp-pos-center", "lp-pos-right"] as const;

export function DemoCarousel() {
  const [current, setCurrent] = useState(1);

  function posClass(i: number) {
    const rel = (i - current + 3) % 3;
    return POSITIONS[rel];
  }

  function handleScreenClick(i: number) {
    const rel = (i - current + 3) % 3;
    if (rel === 0) setCurrent((current - 1 + 3) % 3);
    else if (rel === 2) setCurrent((current + 1) % 3);
  }

  return (
    <div className="lp-demo-screens">
      <div className="lp-demo-carousel">
        {SCREENS.map((screen, i) => {
          const rel = (i - current + 3) % 3;
          return (
            <div
              key={screen.key}
              className={`lp-demo-screen-wrap ${posClass(i)}`}
              onClick={() => handleScreenClick(i)}
            >
              {screen.component}
              <div
                className="lp-demo-caption"
                style={{ opacity: rel === 1 ? 1 : 0 }}
              >
                {screen.caption}
              </div>
            </div>
          );
        })}
      </div>
      <div className="lp-demo-dots">
        <button
          className="lp-demo-arrow"
          onClick={() => setCurrent((current - 1 + 3) % 3)}
          aria-label="Previous"
        >
          &#8592;
        </button>
        {SCREENS.map((_, i) => (
          <button
            key={i}
            className={`lp-demo-dot${current === i ? " active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to screen ${i + 1}`}
          />
        ))}
        <button
          className="lp-demo-arrow"
          onClick={() => setCurrent((current + 1) % 3)}
          aria-label="Next"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}
