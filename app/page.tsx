"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import solver from "javascript-lp-solver";

// Product data with characteristics
const PRODUCTS = [
  {
    id: "carcaca",
    name: "Carcaça",
    profit: 10,
    laborTime: 0,
    usesOven: false,
    color: "var(--chart-4)",
  },
  {
    id: "linguica",
    name: "Linguiça",
    profit: 25,
    laborTime: 0.05,
    usesOven: false,
    color: "var(--chart-5)",
  },
  {
    id: "bacon",
    name: "Bacon",
    profit: 35,
    laborTime: 0.1,
    usesOven: true,
    color: "var(--chart-2)",
  },
  {
    id: "salame",
    name: "Salame",
    profit: 45,
    laborTime: 0.15,
    usesOven: true,
    color: "var(--chart-3)",
  },
];

interface OptimizationResult {
  feasible: boolean;
  bounded: boolean;
  result: number;
  carcaca: number;
  linguica: number;
  bacon: number;
  salame: number;
}

interface BottleneckAnalysis {
  type: "oven" | "labor" | "meat" | "contract" | "none";
  message: string;
  utilization: {
    meat: number;
    labor: number;
    oven: number;
  };
}

function solveOptimization(
  totalMeat: number,
  laborHours: number,
  ovenCapacity: number,
  minCarcass: number
): OptimizationResult {
  const model = {
    optimize: "profit",
    opType: "max",
    constraints: {
      meat: { max: totalMeat },
      labor: { max: laborHours },
      oven: { max: ovenCapacity },
      minCarcass: { min: minCarcass },
      minLinguica: { min: 1 },
      minBacon: { min: 1 },
      minSalame: { min: 1 },
    },
    variables: {
      carcaca: {
        profit: 10,
        meat: 1,
        labor: 0,
        oven: 0,
        minCarcass: 1,
        minLinguica: 0,
        minBacon: 0,
        minSalame: 0,
      },
      linguica: {
        profit: 25,
        meat: 1,
        labor: 0.05,
        oven: 0,
        minCarcass: 0,
        minLinguica: 1,
        minBacon: 0,
        minSalame: 0,
      },
      bacon: {
        profit: 35,
        meat: 1,
        labor: 0.1,
        oven: 1,
        minCarcass: 0,
        minLinguica: 0,
        minBacon: 1,
        minSalame: 0,
      },
      salame: {
        profit: 45,
        meat: 1,
        labor: 0.15,
        oven: 1,
        minCarcass: 0,
        minLinguica: 0,
        minBacon: 0,
        minSalame: 1,
      },
    },
  };

  const result = solver.Solve(model);

  return {
    feasible: result.feasible ?? false,
    bounded: result.bounded ?? false,
    result: result.result ?? 0,
    carcaca: result.carcaca ?? 0,
    linguica: result.linguica ?? 0,
    bacon: result.bacon ?? 0,
    salame: result.salame ?? 0,
  };
}

function analyzeBottleneck(
  result: OptimizationResult,
  totalMeat: number,
  laborHours: number,
  ovenCapacity: number
): BottleneckAnalysis {
  const totalProduced =
    result.carcaca + result.linguica + result.bacon + result.salame;
  const laborUsed =
    result.carcaca * 0 +
    result.linguica * 0.05 +
    result.bacon * 0.1 +
    result.salame * 0.15;
  const ovenUsed = result.bacon + result.salame;

  const meatUtilization = (totalProduced / totalMeat) * 100;
  const laborUtilization = (laborUsed / laborHours) * 100;
  const ovenUtilization = (ovenUsed / ovenCapacity) * 100;

  const utilization = {
    meat: Math.min(meatUtilization, 100),
    labor: Math.min(laborUtilization, 100),
    oven: Math.min(ovenUtilization, 100),
  };

  // Determine main bottleneck
  const THRESHOLD = 99;

  if (ovenUtilization >= THRESHOLD && laborUtilization >= THRESHOLD) {
    return {
      type: "oven",
      message:
        "A capacidade da estufa E a mao de obra sao gargalos simultaneos! Para aumentar o lucro, seria necessario expandir ambos os recursos. A estufa limita a producao de Bacon e Salame (produtos mais lucrativos), enquanto as horas de trabalho restringem o processamento total.",
      utilization,
    };
  }

  if (ovenUtilization >= THRESHOLD) {
    return {
      type: "oven",
      message:
        "A capacidade da estufa e o gargalo principal! A producao de Bacon e Salame esta limitada pelo espaco disponivel na estufa. Para aumentar o lucro, considere expandir a capacidade de defumacao/cura.",
      utilization,
    };
  }

  if (laborUtilization >= THRESHOLD) {
    return {
      type: "labor",
      message:
        "A mao de obra disponivel e o gargalo principal! As horas de trabalho limitam a producao de itens processados. Considere contratar mais funcionarios ou aumentar a jornada para maximizar o lucro.",
      utilization,
    };
  }

  if (meatUtilization >= THRESHOLD) {
    return {
      type: "meat",
      message:
        "A quantidade de carne disponivel e o gargalo principal! Toda a materia-prima esta sendo utilizada de forma otimizada. Para aumentar o lucro, seria necessario adquirir mais carne suina.",
      utilization,
    };
  }

  return {
    type: "none",
    message:
      "Nenhum gargalo critico identificado. A producao atual esta otimizada dentro das restricoes estabelecidas.",
    utilization,
  };
}

function ProductCard({
  product,
}: {
  product: (typeof PRODUCTS)[0];
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
      <div
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{ backgroundColor: product.color }}
      />
      <div className="flex-1">
        <p className="font-medium text-foreground">{product.name}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            R$ {product.profit}/kg
          </Badge>
          <Badge variant="outline" className="text-xs">
            {product.laborTime === 0 ? "0 min/kg" : `${Math.round(product.laborTime * 60)} min/kg`}
          </Badge>
          {product.usesOven && (
            <Badge
              className="text-xs bg-accent text-accent-foreground"
            >
              Usa Estufa
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function ConstraintSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-20 text-right text-sm font-bold text-primary bg-transparent border-b-2 border-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-sm font-bold text-primary">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min.toLocaleString("pt-BR")} {unit}
        </span>
        <span>
          {max.toLocaleString("pt-BR")} {unit}
        </span>
      </div>
    </div>
  );
}

function ResultCard({
  title,
  value,
  unit,
  color,
  highlight = false,
}: {
  title: string;
  value: number;
  unit: string;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={highlight ? "border-primary bg-primary/5 border-2" : ""}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {color && (
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          )}
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}
            >
              {value.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {unit}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UtilizationBar({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  const isBottleneck = percentage >= 99;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${isBottleneck ? "text-accent" : "text-foreground"}`}>
          {percentage.toFixed(1)}%
          {isBottleneck && " (Gargalo)"}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: isBottleneck ? "var(--accent)" : color,
          }}
        />
      </div>
    </div>
  );
}

function LPGraphicModel({
  ovenCapacity,
  laborHours,
  optimalBacon,
  optimalSalame,
}: {
  ovenCapacity: number;
  laborHours: number;
  optimalBacon: number;
  optimalSalame: number;
}) {
  // SVG dimensions
  const width = 500;
  const height = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Determine axis range based on constraints
  const maxX = Math.max(ovenCapacity, laborHours / 0.10, optimalBacon * 1.3, 50);
  const maxY = Math.max(ovenCapacity, laborHours / 0.15, optimalSalame * 1.3, 50);
  const axisMax = Math.ceil(Math.max(maxX, maxY) / 10) * 10;

  const scaleX = (x: number) => padding.left + (x / axisMax) * plotWidth;
  const scaleY = (y: number) => padding.top + plotHeight - (y / axisMax) * plotHeight;

  // Constraint lines (for Bacon x, Salame y):
  // 1. Estufa: x + y <= ovenCapacity
  // 2. Mao de obra: 0.10x + 0.15y <= laborHours
  // 3. x >= 1, y >= 1

  // Calculate intersection points for feasible region
  const vertices: { x: number; y: number }[] = [];

  // Point: x=1, y=1 (minimum constraints intersection)
  vertices.push({ x: 1, y: 1 });

  // Point: x=1, intersection with oven or labor (whichever is lower)
  const yAtX1Oven = ovenCapacity - 1;
  const yAtX1Labor = (laborHours - 0.10 * 1) / 0.15;
  const yAtX1 = Math.min(yAtX1Oven, yAtX1Labor);
  if (yAtX1 > 1) vertices.push({ x: 1, y: yAtX1 });

  // Point: y=1, intersection with oven or labor (whichever is lower)
  const xAtY1Oven = ovenCapacity - 1;
  const xAtY1Labor = (laborHours - 0.15 * 1) / 0.10;
  const xAtY1 = Math.min(xAtY1Oven, xAtY1Labor);
  if (xAtY1 > 1) vertices.push({ x: xAtY1, y: 1 });

  // Point: intersection of oven and labor constraints
  // x + y = ovenCapacity
  // 0.10x + 0.15y = laborHours
  // Solving: y = ovenCapacity - x
  // 0.10x + 0.15(ovenCapacity - x) = laborHours
  // 0.10x + 0.15*ovenCapacity - 0.15x = laborHours
  // -0.05x = laborHours - 0.15*ovenCapacity
  // x = (0.15*ovenCapacity - laborHours) / 0.05
  const xIntersect = (0.15 * ovenCapacity - laborHours) / 0.05;
  const yIntersect = ovenCapacity - xIntersect;
  if (xIntersect >= 1 && yIntersect >= 1 && xIntersect <= axisMax && yIntersect <= axisMax) {
    vertices.push({ x: xIntersect, y: yIntersect });
  }

  // Sort vertices by angle around centroid for proper polygon drawing
  if (vertices.length > 2) {
    const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    vertices.sort(
      (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
  }

  // Build polygon path
  const polygonPath =
    vertices.length > 2
      ? vertices
          .map((v, i) => `${i === 0 ? "M" : "L"} ${scaleX(v.x)} ${scaleY(v.y)}`)
          .join(" ") + " Z"
      : "";

  // Generate tick marks
  const tickCount = 5;
  const tickStep = axisMax / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo Grafico de Programacao Linear</CardTitle>
        <CardDescription>
          Visualizacao 2D simplificada: Bacon (eixo X) vs Salame (eixo Y) - produtos que usam a estufa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Este grafico mostra a regiao viavel considerando apenas Bacon e Salame (os produtos mais lucrativos que competem pela estufa). As linhas representam as restricoes e a area colorida e a regiao viavel onde todas as restricoes sao satisfeitas.
        </p>

        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full max-w-lg"
            style={{ minHeight: "300px" }}
          >
            {/* Grid */}
            {ticks.map((t, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1={scaleX(t)}
                  y1={padding.top}
                  x2={scaleX(t)}
                  y2={padding.top + plotHeight}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  strokeDasharray="2 4"
                />
                <line
                  x1={padding.left}
                  y1={scaleY(t)}
                  x2={padding.left + plotWidth}
                  y2={scaleY(t)}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  strokeDasharray="2 4"
                />
              </g>
            ))}

            {/* Feasible region */}
            {polygonPath && (
              <path
                d={polygonPath}
                fill="var(--primary)"
                fillOpacity={0.2}
                stroke="var(--primary)"
                strokeWidth={2}
              />
            )}

            {/* Oven constraint: x + y = ovenCapacity */}
            <line
              x1={scaleX(0)}
              y1={scaleY(ovenCapacity)}
              x2={scaleX(ovenCapacity)}
              y2={scaleY(0)}
              stroke="var(--chart-2)"
              strokeWidth={2}
              strokeDasharray="6 4"
            />

            {/* Labor constraint: 0.10x + 0.15y = laborHours */}
            <line
              x1={scaleX(0)}
              y1={scaleY(laborHours / 0.15)}
              x2={scaleX(laborHours / 0.10)}
              y2={scaleY(0)}
              stroke="var(--chart-3)"
              strokeWidth={2}
              strokeDasharray="6 4"
            />

            {/* Min Bacon: x = 1 */}
            <line
              x1={scaleX(1)}
              y1={padding.top}
              x2={scaleX(1)}
              y2={padding.top + plotHeight}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />

            {/* Min Salame: y = 1 */}
            <line
              x1={padding.left}
              y1={scaleY(1)}
              x2={padding.left + plotWidth}
              y2={scaleY(1)}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="var(--foreground)"
              strokeWidth={1.5}
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="var(--foreground)"
              strokeWidth={1.5}
            />

            {/* Tick labels */}
            {ticks.map((t, i) => (
              <g key={`tick-${i}`}>
                <text
                  x={scaleX(t)}
                  y={padding.top + plotHeight + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--muted-foreground)"
                >
                  {t.toFixed(0)}
                </text>
                <text
                  x={padding.left - 8}
                  y={scaleY(t) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--muted-foreground)"
                >
                  {t.toFixed(0)}
                </text>
              </g>
            ))}

            {/* Axis labels */}
            <text
              x={padding.left + plotWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="13"
              fill="var(--foreground)"
              fontWeight="500"
            >
              Bacon (kg)
            </text>
            <text
              x={-(padding.top + plotHeight / 2)}
              y={18}
              textAnchor="middle"
              fontSize="13"
              fill="var(--foreground)"
              fontWeight="500"
              transform="rotate(-90)"
            >
              Salame (kg)
            </text>

            {/* Optimal point */}
            <circle
              cx={scaleX(optimalBacon)}
              cy={scaleY(optimalSalame)}
              r={8}
              fill="var(--accent)"
              fillOpacity={0.3}
            />
            <circle
              cx={scaleX(optimalBacon)}
              cy={scaleY(optimalSalame)}
              r={5}
              fill="var(--accent)"
              stroke="var(--background)"
              strokeWidth={2}
            />
            <text
              x={scaleX(optimalBacon) + 12}
              y={scaleY(optimalSalame) - 8}
              fontSize="11"
              fontWeight="600"
              fill="var(--accent)"
            >
              Otimo ({optimalBacon.toFixed(1)}, {optimalSalame.toFixed(1)})
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[var(--chart-2)]" style={{ backgroundImage: `repeating-linear-gradient(to right, var(--chart-2) 0, var(--chart-2) 4px, transparent 4px, transparent 8px)` }} />
            <span className="text-muted-foreground">Restricao Estufa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[var(--chart-3)]" style={{ backgroundImage: `repeating-linear-gradient(to right, var(--chart-3) 0, var(--chart-3) 4px, transparent 4px, transparent 8px)` }} />
            <span className="text-muted-foreground">Restricao Mao de Obra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/20 border-2 border-primary" />
            <span className="text-muted-foreground">Regiao Viavel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Solucao Otima</span>
          </div>
        </div>

        {/* Equations */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-foreground">Funcao Objetivo:</h4>
            <p className="text-muted-foreground font-mono text-xs">
              Max Z = 35 * Bacon + 45 * Salame
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-foreground">Restricoes:</h4>
            <ul className="text-muted-foreground font-mono text-xs space-y-1">
              <li>Bacon + Salame &lt;= {ovenCapacity} (Estufa)</li>
              <li>0,10*Bacon + 0,15*Salame &lt;= {laborHours} (Mao de Obra)</li>
              <li>Bacon &gt;= 1, Salame &gt;= 1 (Minimos)</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic border-t pt-3">
          Nota: Este grafico e uma simplificacao 2D do problema completo de 4 variaveis. O ponto otimo real considera todas as restricoes simultaneamente usando o metodo Simplex.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── MÉTODO SIMPLEX ────────────────────────────────────────────────────────────

interface SimplexStep {
  iteration: number;
  tableau: number[][];
  basicVars: string[];
  pivotRow: number | null;
  pivotCol: number | null;
  enteringVar: string | null;
  leavingVar: string | null;
  zValue: number;
  description: string;
  isOptimal: boolean;
}

const SX_VARS = ["x₁", "x₂", "x₃", "x₄", "s₁", "s₂", "s₃"];
const SX_LABELS = [
  "Carcaça (excesso sobre contrato)",
  "Linguiça (excesso sobre mínimo)",
  "Bacon (excesso sobre mínimo)",
  "Salame (excesso sobre mínimo)",
  "Folga — Carne",
  "Folga — Mão de Obra",
  "Folga — Estufa",
];

function fmtN(n: number): string {
  if (Math.abs(n) < 0.00005) return "0";
  const r = Math.round(n * 10000) / 10000;
  if (Number.isInteger(r)) return r.toString();
  return parseFloat(r.toFixed(4)).toString();
}

function runSimplex(
  totalMeat: number,
  laborHours: number,
  ovenCapacity: number,
  minCarcass: number
): { steps: SimplexStep[]; feasible: boolean; reason?: string } {
  // Variable substitution to handle lower bounds:
  //   x₁ = Carcaça − minCarcass,  x₂ = Linguiça − 1,  x₃ = Bacon − 1,  x₄ = Salame − 1
  const b1 = totalMeat - minCarcass - 3;   // remaining meat after minimums
  const b2 = laborHours - 0.3;             // remaining labor after minimums
  const b3 = ovenCapacity - 2;             // remaining oven after minimums
  const constant = 10 * minCarcass + 105;  // profit locked in by minimums

  if (b1 < -1e-9 || b2 < -1e-9 || b3 < -1e-9) {
    return {
      steps: [],
      feasible: false,
      reason: b1 < 0
        ? `Carne total (${totalMeat} kg) insuficiente: contrato (${minCarcass} kg) + mínimos (3 kg) = ${minCarcass + 3} kg > ${totalMeat} kg.`
        : b2 < 0
        ? `Horas disponíveis (${laborHours} h) insuficientes para produzir os mínimos de Linguiça/Bacon/Salame (0,30 h necessárias).`
        : `Capacidade da estufa (${ovenCapacity} kg) insuficiente para os mínimos de Bacon + Salame (2 kg necessários).`,
    };
  }

  // Tableau — 4 rows × 8 cols
  // Rows: [s₁, s₂, s₃, Z]   Cols: [x₁, x₂, x₃, x₄, s₁, s₂, s₃, RHS]
  const T: number[][] = [
    [1,   1,    1,    1,    1, 0, 0, b1],
    [0,   0.05, 0.10, 0.15, 0, 1, 0, b2],
    [0,   0,    1,    1,    0, 0, 1, b3],
    [-10, -25,  -35,  -45,  0, 0, 0, constant],
  ];

  const basis = ["s₁", "s₂", "s₃"];
  const steps: SimplexStep[] = [];
  const snap = (): number[][] => T.map((r) => [...r]);

  steps.push({
    iteration: 0,
    tableau: snap(),
    basicVars: [...basis],
    pivotRow: null,
    pivotCol: null,
    enteringVar: null,
    leavingVar: null,
    zValue: constant,
    description:
      "Tableau inicial. Solução básica viável: x₁ = x₂ = x₃ = x₄ = 0 (as variáveis transformadas). " +
      "Variáveis de folga s₁, s₂, s₃ estão na base com valores iguais ao lado direito (LD). " +
      `Lucro inicial = R$ ${constant.toLocaleString("pt-BR")} (apenas dos mínimos garantidos).`,
    isOptimal: false,
  });

  for (let it = 1; it <= 15; it++) {
    // Critério de entrada: coeficiente mais negativo na linha Z
    let pc = -1;
    let minZ = -1e-9;
    for (let j = 0; j < 7; j++) {
      if (T[3][j] < minZ) { minZ = T[3][j]; pc = j; }
    }

    if (pc < 0) {
      steps.push({
        iteration: it,
        tableau: snap(),
        basicVars: [...basis],
        pivotRow: null,
        pivotCol: null,
        enteringVar: null,
        leavingVar: null,
        zValue: T[3][7],
        description:
          "✓ Ótimo alcançado! Todos os coeficientes da linha Z são ≥ 0 — nenhuma variável pode " +
          "aumentar o lucro ao entrar na base. O algoritmo Simplex termina aqui.",
        isOptimal: true,
      });
      break;
    }

    // Critério de saída: razão mínima (teste da razão)
    let pr = -1;
    let minRatio = Infinity;
    for (let i = 0; i < 3; i++) {
      if (T[i][pc] > 1e-9) {
        const ratio = T[i][7] / T[i][pc];
        if (ratio < minRatio - 1e-9) { minRatio = ratio; pr = i; }
      }
    }
    if (pr < 0) break;

    const entering = SX_VARS[pc];
    const leaving = basis[pr];
    const pivotElem = T[pr][pc];

    steps.push({
      iteration: it,
      tableau: snap(),
      basicVars: [...basis],
      pivotRow: pr,
      pivotCol: pc,
      enteringVar: entering,
      leavingVar: leaving,
      zValue: T[3][7],
      description:
        `Iteração ${it}: ${entering} (${SX_LABELS[pc]}) entra na base — coeficiente Z mais negativo: ${fmtN(minZ)}. ` +
        `${leaving} sai — razão mínima: ${fmtN(minRatio)}. ` +
        `Elemento pivô: ${fmtN(pivotElem)} (linha ${pr + 1}, coluna ${pc + 1}).`,
      isOptimal: false,
    });

    // Operação pivô: normalizar linha pivô
    for (let j = 0; j <= 7; j++) T[pr][j] /= pivotElem;

    // Eliminar coluna pivô nas demais linhas
    for (let i = 0; i <= 3; i++) {
      if (i !== pr) {
        const f = T[i][pc];
        for (let j = 0; j <= 7; j++) T[i][j] -= f * T[pr][j];
      }
    }
    basis[pr] = entering;
  }

  return { steps, feasible: true };
}

function SimplexVisualization({
  totalMeat,
  laborHours,
  ovenCapacity,
  minCarcass,
}: {
  totalMeat: number;
  laborHours: number;
  ovenCapacity: number;
  minCarcass: number;
}) {
  const [step, setStep] = useState(0);

  const result = useMemo(
    () => runSimplex(totalMeat, laborHours, ovenCapacity, minCarcass),
    [totalMeat, laborHours, ovenCapacity, minCarcass]
  );

  useEffect(() => { setStep(0); }, [result]);

  const b1 = totalMeat - minCarcass - 3;
  const b2 = laborHours - 0.3;
  const b3 = ovenCapacity - 2;
  const constant = 10 * minCarcass + 105;

  if (!result.feasible) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Método Simplex — Resolução Passo a Passo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{result.reason}</p>
        </CardContent>
      </Card>
    );
  }

  const { steps } = result;
  const cur = steps[step];
  const last = steps[steps.length - 1];

  // Extract optimal solution values
  const sol: Record<string, number> = Object.fromEntries(SX_VARS.map((v) => [v, 0]));
  if (last) {
    last.basicVars.forEach((v, i) => { sol[v] = last.tableau[i][7]; });
  }

  const finalVals = [
    { name: "Carcaça",  val: (sol["x₁"] || 0) + minCarcass, expr: `x₁ + ${minCarcass}` },
    { name: "Linguiça", val: (sol["x₂"] || 0) + 1,          expr: "x₂ + 1" },
    { name: "Bacon",    val: (sol["x₃"] || 0) + 1,          expr: "x₃ + 1" },
    { name: "Salame",   val: (sol["x₄"] || 0) + 1,          expr: "x₄ + 1" },
  ];

  const isFirst = step === 0;
  const isLast  = step === steps.length - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método Simplex — Resolução Passo a Passo</CardTitle>
        <CardDescription>
          Algoritmo Simplex aplicado ao problema de maximização do mix de produção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Formulação ── */}
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-semibold text-sm">Transformação de Variáveis</h4>
            <p className="text-muted-foreground">
              Substituição para converter limites inferiores em não-negatividade:
            </p>
            <ul className="font-mono space-y-0.5 text-muted-foreground">
              <li>x₁ = Carcaça − {minCarcass}   <span className="opacity-60">(excesso sobre contrato)</span></li>
              <li>x₂ = Linguiça − 1   <span className="opacity-60">(excesso sobre mínimo)</span></li>
              <li>x₃ = Bacon − 1      <span className="opacity-60">(excesso sobre mínimo)</span></li>
              <li>x₄ = Salame − 1     <span className="opacity-60">(excesso sobre mínimo)</span></li>
            </ul>
            <p className="text-muted-foreground pt-1">
              Constante de lucro incorporada:{" "}
              <span className="font-semibold text-foreground">R$ {constant.toLocaleString("pt-BR")}</span>
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-semibold text-sm">Problema em Forma Padrão</h4>
            <div className="font-mono space-y-1 text-muted-foreground">
              <p className="text-foreground font-semibold">Max Z = 10x₁ + 25x₂ + 35x₃ + 45x₄</p>
              <p className="opacity-60">sujeito a:</p>
              <p>x₁ + x₂ + x₃ + x₄ + s₁ = {fmtN(b1)}</p>
              <p>0,05x₂ + 0,10x₃ + 0,15x₄ + s₂ = {fmtN(b2)}</p>
              <p>x₃ + x₄ + s₃ = {fmtN(b3)}</p>
              <p className="opacity-60">x₁, x₂, x₃, x₄, s₁, s₂, s₃ ≥ 0</p>
            </div>
          </div>
        </div>

        {/* ── Navegação ── */}
        <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirst}
            className="px-4 py-2 rounded-md bg-muted text-sm font-medium disabled:opacity-40 hover:bg-muted/80 transition-colors"
          >
            ← Anterior
          </button>
          <div className="text-center flex-1">
            <p className="font-bold text-sm">
              {isFirst
                ? "Tableau Inicial"
                : cur.isOptimal
                ? "✓ Solução Ótima"
                : `Iteração ${step}`}
            </p>
            <div className="flex justify-center gap-1 mt-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step
                      ? "bg-primary scale-125"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Passo {step + 1} de {steps.length}
            </p>
          </div>
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={isLast}
            className="px-4 py-2 rounded-md bg-muted text-sm font-medium disabled:opacity-40 hover:bg-muted/80 transition-colors"
          >
            Próxima →
          </button>
        </div>

        {/* ── Descrição do passo ── */}
        <div
          className={`rounded-lg border-l-4 p-3 text-sm leading-relaxed ${
            cur.isOptimal
              ? "bg-primary/10 border-primary text-foreground"
              : isFirst
              ? "bg-muted/50 border-muted-foreground text-muted-foreground"
              : "bg-accent/10 border-accent text-foreground"
          }`}
        >
          {cur.description}
        </div>

        {/* ── Tableau ── */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="bg-muted border-b border-r border-border px-3 py-2 text-left font-semibold text-xs w-14">
                  Base
                </th>
                {SX_VARS.map((v, j) => (
                  <th
                    key={v}
                    className={`border-b border-r border-border px-2 py-2 text-center font-mono font-semibold text-xs ${
                      cur.pivotCol === j
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "bg-muted"
                    }`}
                  >
                    {v}
                  </th>
                ))}
                <th className="bg-muted border-b border-border px-3 py-2 text-center font-semibold text-xs">
                  LD
                </th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((i) => (
                <tr
                  key={i}
                  className={
                    cur.pivotRow === i
                      ? "bg-yellow-50 dark:bg-yellow-900/10"
                      : "hover:bg-muted/20"
                  }
                >
                  <td className="border-b border-r border-border px-3 py-2 font-mono font-bold text-primary text-xs">
                    {cur.basicVars[i]}
                  </td>
                  {cur.tableau[i].slice(0, 7).map((val, j) => (
                    <td
                      key={j}
                      className={`border-b border-r border-border px-2 py-2 text-center font-mono text-xs transition-colors ${
                        cur.pivotRow === i && cur.pivotCol === j
                          ? "bg-orange-200 dark:bg-orange-800/50 font-bold text-orange-700 dark:text-orange-200 ring-inset ring-2 ring-orange-500"
                          : cur.pivotCol === j
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : cur.pivotRow === i
                          ? "bg-yellow-50 dark:bg-yellow-900/10"
                          : ""
                      }`}
                    >
                      {fmtN(val)}
                    </td>
                  ))}
                  <td className="border-b border-border px-3 py-2 text-center font-mono font-semibold text-xs">
                    {fmtN(cur.tableau[i][7])}
                  </td>
                </tr>
              ))}
              {/* Linha Z */}
              <tr className="bg-primary/5">
                <td className="border-r border-border px-3 py-2 font-mono font-bold text-primary text-xs">
                  Z
                </td>
                {cur.tableau[3].slice(0, 7).map((val, j) => (
                  <td
                    key={j}
                    className={`border-r border-border px-2 py-2 text-center font-mono font-semibold text-xs ${
                      cur.pivotCol === j ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    } ${
                      val < -0.0001
                        ? "text-destructive"
                        : val > 0.0001
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {fmtN(val)}
                  </td>
                ))}
                <td className="border-border px-3 py-2 text-center font-mono font-bold text-primary text-xs">
                  {cur.zValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Legenda ── */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-orange-200 dark:bg-orange-800/50 ring-1 ring-orange-500" />
            Elemento pivô
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30" />
            Coluna entrante
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-300" />
            Linha sainte
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-destructive font-bold">neg</span> = coef. Z negativo (pode melhorar)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-primary font-bold">pos</span> = coef. Z não-negativo (ótimo nessa variável)
          </span>
        </div>

        {/* ── Valores da solução básica atual ── */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="font-semibold text-sm mb-3">Solução Básica Atual</h4>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {SX_VARS.map((v) => {
              const idx = cur.basicVars.indexOf(v);
              const val = idx >= 0 ? cur.tableau[idx][7] : 0;
              const isBasic = idx >= 0;
              return (
                <div
                  key={v}
                  title={SX_LABELS[SX_VARS.indexOf(v)]}
                  className={`rounded px-2 py-2 text-center border transition-colors ${
                    isBasic
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background border-border opacity-60"
                  }`}
                >
                  <p className="font-mono text-xs text-muted-foreground">{v}</p>
                  <p className={`font-mono font-bold text-sm ${isBasic ? "text-primary" : "text-muted-foreground"}`}>
                    {fmtN(val)}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Z atual ={" "}
            <span className="font-semibold text-foreground">
              R$ {cur.zValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {isFirst && (
              <span className="opacity-70">
                {" "}(R$ {constant.toLocaleString("pt-BR")} dos mínimos + R$ 0,00 das variáveis transformadas)
              </span>
            )}
          </p>
        </div>

        {/* ── Solução ótima final ── */}
        {cur.isOptimal && (
          <div className="rounded-lg bg-primary/10 border-2 border-primary/40 p-5 space-y-4">
            <h4 className="font-bold text-primary">
              Solução Ótima — Convertida para Variáveis Originais
            </h4>
            <p className="text-xs text-muted-foreground">
              Produto = variável transformada + mínimo garantido
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {finalVals.map(({ name, val, expr }) => (
                <div
                  key={name}
                  className="bg-background rounded-lg p-3 text-center border border-border"
                >
                  <p className="font-semibold text-sm text-foreground">{name}</p>
                  <p className="text-2xl font-bold text-primary mt-1">{fmtN(val)}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {expr} = {fmtN(val)} kg
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center pt-3 border-t border-primary/20">
              <p className="text-sm text-muted-foreground">Lucro Máximo Total</p>
              <p className="text-4xl font-bold text-primary mt-1">
                R${" "}
                {cur.zValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductionOptimizer() {
  // Constraint states
  const [totalMeat, setTotalMeat] = useState(500);
  const [laborHours, setLaborHours] = useState(40);
  const [ovenCapacity, setOvenCapacity] = useState(150);
  const [minCarcass, setMinCarcass] = useState(100);

  // Calculate optimal solution
  const solution = useMemo(
    () => solveOptimization(totalMeat, laborHours, ovenCapacity, minCarcass),
    [totalMeat, laborHours, ovenCapacity, minCarcass]
  );

  // Analyze bottleneck
  const bottleneck = useMemo(
    () => analyzeBottleneck(solution, totalMeat, laborHours, ovenCapacity),
    [solution, totalMeat, laborHours, ovenCapacity]
  );

  // Prepare chart data
  const pieData = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        name: p.name,
        value: Number(solution[p.id as keyof OptimizationResult]) || 0,
        color: p.color,
      })).filter((d) => d.value > 0),
    [solution]
  );

  const barData = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        name: p.name,
        quantidade: Number(solution[p.id as keyof OptimizationResult]) || 0,
        lucro:
          (Number(solution[p.id as keyof OptimizationResult]) || 0) * p.profit,
        fill: p.color,
      })),
    [solution]
  );

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            Otimizador de Mix de Producao
          </h1>
          <p className="text-muted-foreground text-lg">
            Maximize o lucro da sua agroindústria suína com Programação Linear
          </p>
        </header>

        {/* Problem Statement */}
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle>Enunciado do Problema</CardTitle>
            <CardDescription>
              Problema de Programação Linear com restrições dinâmicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Uma agroindustria suina deseja determinar a quantidade otima de cada produto a ser fabricado para maximizar o lucro total. A empresa produz quatro tipos de produtos derivados de carne suina, cada um com diferentes margens de lucro, requisitos de mao de obra e uso de equipamentos.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-foreground">Produtos e Lucros:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Carcaca: R$ 10/kg - venda in natura, sem processamento</li>
                  <li>Linguica: R$ 25/kg - requer 3 minutos de trabalho por kg</li>
                  <li>Bacon: R$ 35/kg - requer 6 minutos de trabalho e uso da estufa</li>
                  <li>Salame: R$ 45/kg - requer 9 minutos de trabalho e uso da estufa</li>
                </ul>
              </div>
              
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-semibold text-foreground">Restricoes (Dinamicas):</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Carne Total: Quantidade maxima de materia-prima disponivel</li>
                  <li>Mao de Obra: Horas de trabalho disponiveis para processamento</li>
                  <li>Capacidade da Estufa: Limite de kg que podem ser defumados/curados</li>
                  <li>Contrato Minimo: Quantidade minima de Carcaca a ser produzida</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-primary/10 p-4 border-l-4 border-primary">
              <p className="text-sm text-foreground">
                Restricao Adicional: A empresa deve produzir pelo menos 1 kg de Linguica, 1 kg de Bacon e 1 kg de Salame para manter a diversificacao do portfolio e atender pedidos minimos de clientes. A Carcaca possui sua propria restricao de contrato minimo ajustavel.
              </p>
            </div>

            <p className="text-sm text-muted-foreground italic">
              Utilize os controles deslizantes abaixo para ajustar as restricoes dinamicamente e observe como a solucao otima se adapta em tempo real.
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Section 1: Scenario */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                O Cenario
              </CardTitle>
              <CardDescription>
                O produtor precisa decidir como dividir sua carne suína para
                maximizar o lucro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </CardContent>
          </Card>

          {/* Section 2: Constraints */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Restricoes Dinamicas</CardTitle>
              <CardDescription>
                Ajuste os parâmetros para simular diferentes cenários de
                produção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <ConstraintSlider
                  label="Carne Total Disponivel"
                  value={totalMeat}
                  min={100}
                  max={1000}
                  unit="kg"
                  onChange={setTotalMeat}
                />
                <ConstraintSlider
                  label="Horas de Trabalho"
                  value={laborHours}
                  min={10}
                  max={100}
                  unit="h"
                  onChange={setLaborHours}
                />
                <ConstraintSlider
                  label="Capacidade da Estufa"
                  value={ovenCapacity}
                  min={50}
                  max={500}
                  unit="kg"
                  onChange={setOvenCapacity}
                />
                <ConstraintSlider
                  label="Contrato Minimo Carcaca"
                  value={minCarcass}
                  min={0}
                  max={300}
                  unit="kg"
                  onChange={setMinCarcass}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Results Dashboard */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Resolucao Otima
          </h2>

          {!solution.feasible ? (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <span className="text-4xl text-destructive">!</span>
                  <h3 className="text-xl font-bold text-destructive">
                    Solução Inviável
                  </h3>
                  <p className="text-muted-foreground">
                    As restricoes atuais nao permitem uma solucao viavel. Lembre-se que e necessario produzir no minimo 1 kg de Linguica, Bacon e Salame, alem do contrato minimo de Carcaca. Tente aumentar a quantidade de carne, as horas de trabalho ou a capacidade da estufa.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <ResultCard
                  title="Lucro Maximo Total"
                  value={solution.result}
                  unit="R$"
                  highlight
                />
              </div>
              <ResultCard
                title="Carcaca"
                value={solution.carcaca}
                unit="kg"
                color="var(--chart-4)"
              />
              <ResultCard
                title="Linguica"
                value={solution.linguica}
                unit="kg"
                color="var(--chart-5)"
              />
              <ResultCard
                title="Bacon"
                value={solution.bacon}
                unit="kg"
                color="var(--chart-2)"
              />
              <ResultCard
                title="Salame"
                value={solution.salame}
                unit="kg"
                color="var(--chart-3)"
              />
            </div>
          )}
        </section>

        {/* Section 4: Analysis */}
        {solution.feasible && (
          <section className="grid lg:grid-cols-2 gap-6">
            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Mix de Producao</CardTitle>
                <CardDescription>
                  Distribuição da produção por produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pie Chart + Legend */}
                  <div className="space-y-4">
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [
                              `${value.toFixed(2)} kg`,
                              "Quantidade",
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legenda responsiva */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {pieData.map((entry) => {
                        const total = pieData.reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
                        return (
                          <div key={entry.name} className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground truncate">{entry.name}</span>
                            <span className="ml-auto text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-3">
                      {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
                          <span className="text-xs font-medium text-foreground tabular-nums whitespace-nowrap">
                            {entry.value.toFixed(1)} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={70} />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            name === "quantidade"
                              ? `${value.toFixed(2)} kg`
                              : `R$ ${value.toFixed(2)}`,
                            name === "quantidade" ? "Quantidade" : "Lucro",
                          ]}
                        />
                        <Legend />
                        <Bar
                          dataKey="quantidade"
                          name="Quantidade (kg)"
                          radius={[0, 4, 4, 0]}
                        >
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottleneck Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analise de Gargalo</CardTitle>
                <CardDescription>
                  Identificação dos fatores limitantes da produção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Utilization bars */}
                <div className="space-y-4">
                  <UtilizationBar
                    label="Utilização da Carne"
                    percentage={bottleneck.utilization.meat}
                    color="var(--chart-4)"
                  />
                  <UtilizationBar
                    label="Utilização da Mão de Obra"
                    percentage={bottleneck.utilization.labor}
                    color="var(--chart-1)"
                  />
                  <UtilizationBar
                    label="Utilização da Estufa"
                    percentage={bottleneck.utilization.oven}
                    color="var(--chart-2)"
                  />
                </div>

                {/* Analysis text */}
                <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
                  <h4 className="font-semibold text-foreground mb-2">
                    Diagnóstico
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {bottleneck.message}
                  </p>
                </div>

                {/* Improvement suggestions */}
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">
                    Sugestoes de Melhoria:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {bottleneck.type === "oven" && (
                      <>
                        <li>
                          Aumentar capacidade da estufa permitiria mais Bacon e
                          Salame
                        </li>
                        <li>
                          Considerar turno noturno para a estufa se possível
                        </li>
                      </>
                    )}
                    {bottleneck.type === "labor" && (
                      <>
                        <li>
                          Contratar mais funcionários para processamento
                        </li>
                        <li>Avaliar automação de processos</li>
                      </>
                    )}
                    {bottleneck.type === "meat" && (
                      <>
                        <li>Buscar novos fornecedores de carne suína</li>
                        <li>Negociar contratos de maior volume</li>
                      </>
                    )}
                    {bottleneck.type === "none" && (
                      <li>Produção está equilibrada - monitore continuamente</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* LP Graphic Model */}
        {solution.feasible && (
          <section>
            <LPGraphicModel
              ovenCapacity={ovenCapacity}
              laborHours={laborHours}
              optimalBacon={solution.bacon}
              optimalSalame={solution.salame}
            />
          </section>
        )}

        {/* Simplex Method */}
        {solution.feasible && (
          <section>
            <SimplexVisualization
              totalMeat={totalMeat}
              laborHours={laborHours}
              ovenCapacity={ovenCapacity}
              minCarcass={minCarcass}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4 border-t border-border">
          <p>
            Desenvolvido com Programacao Linear usando o metodo Simplex - Otimizacao em tempo real
          </p>
        </footer>
      </div>
    </main>
  );
}
