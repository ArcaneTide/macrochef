import path from "path";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";
import { macroCalorieSplit, type MacroTotals } from "@/lib/macros";

// ─── Font Registration ────────────────────────────────────

const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "DMSerifDisplay",
  src: path.join(FONTS_DIR, "DMSerifDisplay-Regular.ttf"),
});

Font.register({
  family: "Outfit",
  fonts: [
    { src: path.join(FONTS_DIR, "Outfit-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS_DIR, "Outfit-SemiBold.ttf"), fontWeight: 600 },
  ],
});

Font.register({
  family: "Sora",
  fonts: [
    { src: path.join(FONTS_DIR, "Sora-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONTS_DIR, "Sora-SemiBold.ttf"), fontWeight: 600 },
  ],
});

Font.register({
  family: "Fraunces",
  fonts: [
    {
      src: path.join(FONTS_DIR, "Fraunces-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
  ],
});

// ─── Types ────────────────────────────────────────────────

export type PdfIngredient = {
  name: string;
  quantityGrams: number;
};

export type PdfMealSlot = {
  slot: string;
  recipeTitle: string;
  servings: number;
  ingredients: PdfIngredient[];
  macros: MacroTotals;
  instructions?: string | null;
};

export type PdfDay = {
  label: string; // "Monday", "Tuesday", ...
  date: string;  // "Mar 17"
  slots: PdfMealSlot[];
  total: MacroTotals;
};

export type PdfTargetProfile = {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  label?: string | null;
};

export type MealPlanPdfProps = {
  planTitle: string;
  clientName: string;
  dateRange: string;
  days: PdfDay[];
  target: PdfTargetProfile | null;
  weeklyAvg: MacroTotals;
  planNotes?: string | null;
};

// ─── Colors ───────────────────────────────────────────────

const c = {
  charcoal: "#2C2C2C",
  charcoalLight: "#4A4A4A",
  sand: "#E8E0D4",
  sandLight: "#F5F1EB",
  terracotta: "#C4724E",
  clay: "#B8907A",
  olive: "#7A8B6F",
  oliveMuted: "#EBF0E9",
  dimText: "#9A9A9A",
  dayMuted: "#B0A898",
  white: "#FFFFFF",
};

// ─── Styles ───────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 9,
    color: c.charcoal,
    paddingTop: 24,
    paddingBottom: 52,
    paddingHorizontal: 40,
    backgroundColor: c.white,
  },

  // Accent bar
  accentBar: {
    height: 3,
    backgroundColor: c.terracotta,
    marginBottom: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.sand,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  titleBlock: {
    flexDirection: "column",
    justifyContent: "center",
  },
  planTitle: {
    fontFamily: "DMSerifDisplay",
    fontSize: 22,
    color: c.charcoal,
    lineHeight: 1.1,
  },
  headerSub: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 9,
    color: c.charcoalLight,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  clientBadge: {
    backgroundColor: c.oliveMuted,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 8,
    color: c.olive,
  },
  phaseBadge: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 7,
    color: c.charcoalLight,
  },

  // Summary bar
  summaryBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: c.sandLight,
    borderRadius: 5,
    padding: 8,
  },
  summaryLabel: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 7,
    color: c.charcoalLight,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  summaryValue: {
    fontFamily: "Sora",
    fontWeight: 600,
    fontSize: 13,
  },
  summaryUnit: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 8,
    color: c.charcoalLight,
    marginLeft: 2,
  },
  summaryTarget: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 7,
    color: c.dimText,
    marginTop: 2,
  },

  // Macro % bar
  macroPctBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 3,
    backgroundColor: c.sand,
    marginBottom: 5,
    overflow: "hidden",
  },
  macroPctLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  macroPctLabel: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 7,
  },

  // Notes section
  notesSection: {
    backgroundColor: c.sandLight,
    borderLeftWidth: 3,
    borderLeftColor: c.olive,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 14,
    borderRadius: 3,
  },
  notesLabel: {
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 7,
    color: c.olive,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  notesText: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontStyle: "italic",
    fontSize: 8,
    color: c.charcoalLight,
    lineHeight: 1.5,
  },

  // Day section
  daySection: {
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: c.charcoal,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 6,
  },
  dayTitle: {
    fontFamily: "DMSerifDisplay",
    fontSize: 14,
    color: c.white,
  },
  dayDateMacros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayDate: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 7.5,
    color: c.dayMuted,
  },
  dayMacroSep: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 7.5,
    color: c.dayMuted,
  },
  dayMacros: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 7.5,
    color: c.dayMuted,
  },

  // Slot
  slotRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  slotLabel: {
    width: 56,
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 7,
    color: c.olive,
    paddingTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  slotContent: {
    flex: 1,
    backgroundColor: c.sandLight,
    borderRadius: 4,
    padding: 7,
  },
  slotRecipeTitle: {
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 11,
    color: c.charcoal,
    marginBottom: 1,
  },
  slotServings: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 7.5,
    color: c.charcoalLight,
    marginBottom: 5,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1.5,
  },
  ingredientName: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 9,
    color: c.charcoal,
    flex: 1,
  },
  ingredientQty: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 9,
    color: c.charcoalLight,
    marginLeft: 8,
  },
  slotMacroRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: c.sand,
  },
  macroChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  macroNum: {
    fontFamily: "Sora",
    fontWeight: 600,
    fontSize: 8,
  },
  macroLbl: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 7,
    color: c.charcoalLight,
  },
  instructionsLabel: {
    fontFamily: "Outfit",
    fontWeight: 600,
    fontSize: 7,
    color: c.charcoalLight,
    marginTop: 5,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  instructionsText: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontStyle: "italic",
    fontSize: 7.5,
    color: c.charcoalLight,
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: c.sand,
    paddingTop: 6,
  },
  footerTagline: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: 8,
    color: c.charcoalLight,
  },
  footerPageNum: {
    fontFamily: "Sora",
    fontWeight: 400,
    fontSize: 7,
    color: c.dimText,
  },
  footerBrand: {
    fontFamily: "Outfit",
    fontWeight: 400,
    fontSize: 7,
    color: c.charcoalLight,
  },
});

// ─── Helpers ──────────────────────────────────────────────

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack1: "Snack 1",
  snack2: "Snack 2",
};

function fmt(n: number, dec = 0) {
  return n.toFixed(dec);
}

// ─── Sub-components ───────────────────────────────────────

function MacroPieLogo() {
  return (
    <Svg width={30} height={30} viewBox="0 0 22 22">
      <Circle cx={11} cy={11} r={10} stroke="#2C2C2C" strokeWidth={0.8} fill="none" />
      <Path d="M11 3.5 A7.5 7.5 0 0 1 17.5 8 L11 11 Z" fill="#7A8B6F" />
      <Path d="M17.5 8 A7.5 7.5 0 0 1 13.5 18 L11 11 Z" fill="#B8907A" />
      <Path d="M13.5 18 A7.5 7.5 0 0 1 4.5 9 L11 11 Z" fill="#C4724E" />
      <Path d="M4.5 9 A7.5 7.5 0 0 1 11 3.5 L11 11 Z" fill="#C4B9A8" />
      <Circle cx={11} cy={11} r={2} fill="#FDFBF8" />
    </Svg>
  );
}

function MacroChips({ macros }: { macros: MacroTotals }) {
  return (
    <View style={s.slotMacroRow}>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.charcoal }]}>{fmt(macros.calories)}</Text>
        <Text style={s.macroLbl}>kcal</Text>
      </View>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.olive }]}>{fmt(macros.protein, 1)}g</Text>
        <Text style={s.macroLbl}>P</Text>
      </View>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.clay }]}>{fmt(macros.carbs, 1)}g</Text>
        <Text style={s.macroLbl}>C</Text>
      </View>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.terracotta }]}>{fmt(macros.fat, 1)}g</Text>
        <Text style={s.macroLbl}>F</Text>
      </View>
    </View>
  );
}

function SlotBlock({ slot }: { slot: PdfMealSlot }) {
  return (
    <View style={s.slotRow} wrap={false}>
      <Text style={s.slotLabel}>{SLOT_LABELS[slot.slot] ?? slot.slot}</Text>
      <View style={s.slotContent}>
        <Text style={s.slotRecipeTitle}>{slot.recipeTitle}</Text>
        <Text style={s.slotServings}>
          × {slot.servings} serving{slot.servings !== 1 ? "s" : ""}
        </Text>
        {slot.ingredients.map((ing, i) => (
          <View key={i} style={s.ingredientRow}>
            <Text style={s.ingredientName}>{ing.name}</Text>
            <Text style={s.ingredientQty}>{fmt(ing.quantityGrams * slot.servings)}g</Text>
          </View>
        ))}
        <MacroChips macros={slot.macros} />
        {slot.instructions && (
          <View style={{ marginTop: 4 }}>
            <Text style={s.instructionsLabel}>Preparation</Text>
            <Text style={s.instructionsText}>{slot.instructions}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DaySection({ day }: { day: PdfDay }) {
  if (day.slots.length === 0) return null;

  return (
    <View style={s.daySection} wrap={false}>
      <View style={s.dayHeader}>
        <Text style={s.dayTitle}>{day.label}</Text>
        <View style={s.dayDateMacros}>
          <Text style={s.dayDate}>{day.date}</Text>
          <Text style={s.dayMacroSep}>·</Text>
          <Text style={s.dayMacros}>
            {fmt(day.total.calories)} kcal · {fmt(day.total.protein, 1)}g P · {fmt(day.total.carbs, 1)}g C · {fmt(day.total.fat, 1)}g F
          </Text>
        </View>
      </View>
      {day.slots.map((slot, i) => (
        <SlotBlock key={i} slot={slot} />
      ))}
    </View>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  target,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  target?: number;
  color: string;
}) {
  return (
    <View style={s.summaryCard}>
      <Text style={s.summaryLabel}>{label}</Text>
      <View style={s.summaryValueRow}>
        <Text style={[s.summaryValue, { color }]}>
          {fmt(value, unit === "kcal" ? 0 : 1)}
        </Text>
        <Text style={s.summaryUnit}>{unit}</Text>
      </View>
      {target !== undefined && (
        <Text style={s.summaryTarget}>
          Target: {fmt(target, unit === "kcal" ? 0 : 1)}{unit}
        </Text>
      )}
    </View>
  );
}

function MacroPctBar({ macros }: { macros: MacroTotals }) {
  const split = macroCalorieSplit(macros);
  const proteinPct = Math.round(split.proteinPct);
  const carbsPct = Math.round(split.carbsPct);
  const fatPct = Math.round(split.fatPct);

  return (
    <View>
      <View style={s.macroPctBar}>
        <View style={{ flex: split.proteinPct, backgroundColor: c.olive }} />
        <View style={{ flex: split.carbsPct, backgroundColor: c.clay }} />
        <View style={{ flex: split.fatPct, backgroundColor: c.terracotta }} />
      </View>
      <View style={s.macroPctLabels}>
        <Text style={[s.macroPctLabel, { color: c.olive }]}>Protein {proteinPct}%</Text>
        <Text style={[s.macroPctLabel, { color: c.clay }]}>Carbs {carbsPct}%</Text>
        <Text style={[s.macroPctLabel, { color: c.terracotta }]}>Fat {fatPct}%</Text>
      </View>
    </View>
  );
}

// ─── Document ─────────────────────────────────────────────

export function MealPlanPdfDocument({
  planTitle,
  clientName,
  dateRange,
  days,
  target,
  weeklyAvg,
  planNotes,
}: MealPlanPdfProps) {
  return (
    <Document title={planTitle} author="MacroΠie">
      <Page size="A4" style={s.page}>
        {/* Terracotta accent bar */}
        <View style={s.accentBar} />

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <MacroPieLogo />
            <View style={s.titleBlock}>
              <Text style={s.planTitle}>{planTitle}</Text>
              <Text style={s.headerSub}>{dateRange}</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.clientBadge}>{clientName.toUpperCase()}</Text>
            {target?.label && (
              <Text style={s.phaseBadge}>{target.label}</Text>
            )}
          </View>
        </View>

        {/* Weekly averages */}
        <View style={s.summaryBar}>
          <SummaryCard
            label="Avg Daily Calories"
            value={weeklyAvg.calories}
            unit="kcal"
            target={target?.calorieTarget}
            color={c.charcoal}
          />
          <SummaryCard
            label="Avg Daily Protein"
            value={weeklyAvg.protein}
            unit="g"
            target={target?.proteinTarget}
            color={c.olive}
          />
          <SummaryCard
            label="Avg Daily Carbs"
            value={weeklyAvg.carbs}
            unit="g"
            target={target?.carbsTarget}
            color={c.clay}
          />
          <SummaryCard
            label="Avg Daily Fat"
            value={weeklyAvg.fat}
            unit="g"
            target={target?.fatTarget}
            color={c.terracotta}
          />
        </View>

        {/* Macro % bar */}
        <MacroPctBar macros={weeklyAvg} />

        {/* Coach notes */}
        {planNotes && (
          <View style={s.notesSection}>
            <Text style={s.notesLabel}>Coach's Notes</Text>
            <Text style={s.notesText}>{planNotes}</Text>
          </View>
        )}

        {/* Day sections */}
        {days.map((day, i) => (
          <DaySection key={i} day={day} />
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerTagline}>Every plate tells a number.</Text>
          <Text
            style={s.footerPageNum}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
          <Text style={s.footerBrand}>MacroΠie · macropie.com</Text>
        </View>
      </Page>
    </Document>
  );
}
