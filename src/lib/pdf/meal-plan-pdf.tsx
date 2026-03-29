import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { type MacroTotals } from "@/lib/macros";

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
};

export type MealPlanPdfProps = {
  planTitle: string;
  clientName: string;
  dateRange: string;
  days: PdfDay[];
  target: PdfTargetProfile | null;
  weeklyAvg: MacroTotals;
};

// ─── Styles ───────────────────────────────────────────────

const c = {
  olive: "#7A8B6F",
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  protein: "#5A6B4F",
  carbs: "#B8907A",
  fat: "#C4724E",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: c.slate700,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: c.white,
  },
  // Header
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: c.olive,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: c.slate900,
  },
  clientBadge: {
    backgroundColor: "#EDF1EB",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    color: c.olive,
    fontFamily: "Helvetica-Bold",
  },
  headerSub: {
    fontSize: 9,
    color: c.slate500,
    marginTop: 2,
  },
  // Summary bar
  summaryBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: c.slate100,
    borderRadius: 4,
    padding: 8,
  },
  summaryLabel: {
    fontSize: 7,
    color: c.slate500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: c.slate900,
  },
  summaryUnit: {
    fontSize: 8,
    color: c.slate500,
    marginLeft: 1,
  },
  summaryTarget: {
    fontSize: 7,
    color: c.slate400,
    marginTop: 1,
  },
  // Day section
  daySection: {
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: c.slate900,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  dayTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: c.white,
    letterSpacing: 0.3,
  },
  dayDate: {
    fontSize: 8,
    color: "#94a3b8",
  },
  dayMacros: {
    fontSize: 8,
    color: "#94a3b8",
  },
  // Meal slot
  slotRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  slotLabel: {
    width: 52,
    fontSize: 7.5,
    color: c.slate500,
    fontFamily: "Helvetica-Bold",
    paddingTop: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  slotContent: {
    flex: 1,
    backgroundColor: c.slate100,
    borderRadius: 3,
    padding: 6,
  },
  slotRecipeTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: c.slate900,
    marginBottom: 3,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  ingredientName: {
    fontSize: 7.5,
    color: c.slate700,
    flex: 1,
  },
  ingredientQty: {
    fontSize: 7.5,
    color: c.slate500,
    marginLeft: 8,
  },
  slotMacroRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 5,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: c.slate200,
  },
  macroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  macroNum: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },
  macroLbl: {
    fontSize: 7,
    color: c.slate500,
  },
  emptySlot: {
    fontSize: 7.5,
    color: c.slate400,
    fontStyle: "italic",
  },
  instructionsLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: c.slate500,
    marginTop: 5,
    marginBottom: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  instructionsText: {
    fontSize: 7,
    color: c.slate500,
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: c.slate200,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: c.slate400,
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

function MacroChips({ macros }: { macros: MacroTotals }) {
  return (
    <View style={s.slotMacroRow}>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.slate900 }]}>{fmt(macros.calories)}</Text>
        <Text style={s.macroLbl}>kcal</Text>
      </View>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.protein }]}>{fmt(macros.protein, 1)}g</Text>
        <Text style={s.macroLbl}>P</Text>
      </View>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.carbs }]}>{fmt(macros.carbs, 1)}g</Text>
        <Text style={s.macroLbl}>C</Text>
      </View>
      <View style={s.macroChip}>
        <Text style={[s.macroNum, { color: c.fat }]}>{fmt(macros.fat, 1)}g</Text>
        <Text style={s.macroLbl}>F</Text>
      </View>
    </View>
  );
}

function SlotBlock({ slot }: { slot: PdfMealSlot }) {
  return (
    <View style={s.slotRow}>
      <Text style={s.slotLabel}>{SLOT_LABELS[slot.slot] ?? slot.slot}</Text>
      <View style={s.slotContent}>
        <Text style={s.slotRecipeTitle}>
          {slot.recipeTitle}
          {"  "}
          <Text style={{ fontSize: 7.5, fontFamily: "Helvetica", color: c.slate500 }}>
            × {slot.servings} serving{slot.servings !== 1 ? "s" : ""}
          </Text>
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
        <Text style={s.dayTitle}>{day.label.toUpperCase()}</Text>
        <Text style={s.dayDate}>{day.date}</Text>
        <Text style={s.dayMacros}>
          {fmt(day.total.calories)} kcal · {fmt(day.total.protein, 1)}g P · {fmt(day.total.carbs, 1)}g C · {fmt(day.total.fat, 1)}g F
        </Text>
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
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text style={[s.summaryValue, { color }]}>{fmt(value, unit === "kcal" ? 0 : 1)}</Text>
        <Text style={s.summaryUnit}>{unit}</Text>
      </View>
      {target !== undefined && (
        <Text style={s.summaryTarget}>Target: {fmt(target, unit === "kcal" ? 0 : 1)}{unit}</Text>
      )}
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
}: MealPlanPdfProps) {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document title={planTitle} author="MacroLock">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.planTitle}>{planTitle}</Text>
            <Text style={s.clientBadge}>{clientName.toUpperCase()}</Text>
          </View>
          <Text style={s.headerSub}>{dateRange}</Text>
        </View>

        {/* Weekly averages */}
        <View style={s.summaryBar}>
          <SummaryCard
            label="Avg Daily Calories"
            value={weeklyAvg.calories}
            unit="kcal"
            target={target?.calorieTarget}
            color={c.slate900}
          />
          <SummaryCard
            label="Avg Daily Protein"
            value={weeklyAvg.protein}
            unit="g"
            target={target?.proteinTarget}
            color={c.protein}
          />
          <SummaryCard
            label="Avg Daily Carbs"
            value={weeklyAvg.carbs}
            unit="g"
            target={target?.carbsTarget}
            color={c.carbs}
          />
          <SummaryCard
            label="Avg Daily Fat"
            value={weeklyAvg.fat}
            unit="g"
            target={target?.fatTarget}
            color={c.fat}
          />
        </View>

        {/* Day sections */}
        {days.map((day, i) => (
          <DaySection key={i} day={day} />
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>MacroLock · {planTitle}</Text>
          <Text style={s.footerText}>Generated {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
