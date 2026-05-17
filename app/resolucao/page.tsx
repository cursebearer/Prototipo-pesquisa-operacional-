"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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

const PRODUCTS = [
  { id: "carcaca", name: "Carcaça",  profit: 10, color: "var(--chart-4)" },
  { id: "linguica", name: "Linguiça", profit: 25, color: "var(--chart-5)" },
  { id: "bacon",   name: "Bacon",    profit: 35, color: "var(--chart-2)" },
  { id: "salame",  name: "Salame",   profit: 45, color: "var(--chart-3)" },
];

interface OptimizationResult {
  feasible: boolean;
  result: number;
  carcaca: number;
  linguica: number;
  bacon: number;
  salame: number;
}

interface BottleneckAnalysis {
  type: "oven" | "labor" | "meat" | "none";
  message: string;
  utilization: { meat: number; labor: number; oven: number };
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
      meat:        { max: totalMeat },
      labor:       { max: laborHours },
      oven:        { max: ovenCapacity },
      minCarcass:  { min: minCarcass },
      minLinguica: { min: 1 },
      minBacon:    { min: 1 },
      minSalame:   { min: 1 },
    },
    variables: {
      carcaca:  { profit: 10, meat: 1, labor: 0,    oven: 0, minCarcass: 1, minLinguica: 0, minBacon: 0, minSalame: 0 },
      linguica: { profit: 25, meat: 1, labor: 0.05, oven: 0, minCarcass: 0, minLinguica: 1, minBacon: 0, minSalame: 0 },
      bacon:    { profit: 35, meat: 1, labor: 0.10, oven: 1, minCarcass: 0, minLinguica: 0, minBacon: 1, minSalame: 0 },
      salame:   { profit: 45, meat: 1, labor: 0.15, oven: 1, minCarcass: 0, minLinguica: 0, minBacon: 0, minSalame: 1 },
    },
  };

  const r = solver.Solve(model);
  return {
    feasible: r.feasible ?? false,
    result:   r.result   ?? 0,
    carcaca:  r.carcaca  ?? 0,
    linguica: r.linguica ?? 0,
    bacon:    r.bacon    ?? 0,
    salame:   r.salame   ?? 0,
  };
}

function analyzeBottleneck(
  result: OptimizationResult,
  totalMeat: number,
  laborHours: number,
  ovenCapacity: number
): BottleneckAnalysis {
  const total     = result.carcaca + result.linguica + result.bacon + result.salame;
  const laborUsed = result.linguica * 0.05 + result.bacon * 0.10 + result.salame * 0.15;
  const ovenUsed  = result.bacon + result.salame;

  const utilization = {
    meat:  Math.min((total / totalMeat) * 100, 100),
    labor: Math.min((laborUsed / laborHours) * 100, 100),
    oven:  Math.min((ovenUsed / ovenCapacity) * 100, 100),
  };

  const THRESHOLD = 99;

  if (utilization.oven >= THRESHOLD && utilization.labor >= THRESHOLD) {
    return {
      type: "oven",
      message:
        "A capacidade da estufa e a mão de obra são gargalos simultâneos. Para aumentar o lucro seria necessário expandir ambos os recursos.",
      utilization,
    };
  }
  if (utilization.oven >= THRESHOLD) {
    return {
      type: "oven",
      message:
        "A estufa é o gargalo principal. A produção de Bacon e Salame está limitada pelo espaço disponível — considere ampliar a capacidade de defumação.",
      utilization,
    };
  }
  if (utilization.labor >= THRESHOLD) {
    return {
      type: "labor",
      message:
        "A mão de obra é o gargalo principal. As horas disponíveis limitam o processamento — contratar funcionários ou aumentar a jornada permitiria mais produção.",
      utilization,
    };
  }
  if (utilization.meat >= THRESHOLD) {
    return {
      type: "meat",
      message:
        "A carne total é o fator limitante. Toda a matéria-prima está sendo aproveitada — adquirir mais carne suína aumentaria o lucro.",
      utilization,
    };
  }
  return {
    type: "none",
    message:
      "Nenhum gargalo crítico. A produção está dentro dos limites de todos os recursos.",
    utilization,
  };
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
  onChange: (v: number) => void;
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
        <span>{min.toLocaleString("pt-BR")} {unit}</span>
        <span>{max.toLocaleString("pt-BR")} {unit}</span>
      </div>
    </div>
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
          {percentage.toFixed(1)}%{isBottleneck && " (Gargalo)"}
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

export default function ResolucaoPage() {
  const [totalMeat,    setTotalMeat]    = useState(500);
  const [laborHours,   setLaborHours]   = useState(40);
  const [ovenCapacity, setOvenCapacity] = useState(150);
  const [minCarcass,   setMinCarcass]   = useState(100);

  const solution = useMemo(
    () => solveOptimization(totalMeat, laborHours, ovenCapacity, minCarcass),
    [totalMeat, laborHours, ovenCapacity, minCarcass]
  );

  const bottleneck = useMemo(
    () => analyzeBottleneck(solution, totalMeat, laborHours, ovenCapacity),
    [solution, totalMeat, laborHours, ovenCapacity]
  );

  const pieData = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        name:  p.name,
        value: Number(solution[p.id as keyof OptimizationResult]) || 0,
        color: p.color,
      })).filter((d) => d.value > 0),
    [solution]
  );

  const barData = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        name:       p.name,
        quantidade: Number(solution[p.id as keyof OptimizationResult]) || 0,
        fill:       p.color,
      })),
    [solution]
  );

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Nav */}
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao Problema
          </Link>
          <h1 className="text-xl font-bold text-foreground">Resolução</h1>
        </nav>

        {/* Sliders */}
        <Card>
          <CardHeader>
            <CardTitle>Restrições</CardTitle>
            <CardDescription>
              Ajuste os parâmetros para simular diferentes cenários semanais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <ConstraintSlider
                label="Carne Total Disponível"
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
                label="Contrato Mínimo — Carcaça"
                value={minCarcass}
                min={0}
                max={300}
                unit="kg"
                onChange={setMinCarcass}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {!solution.feasible ? (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-2xl font-bold text-destructive">Solução Inviável</p>
              <p className="text-muted-foreground text-sm">
                As restrições atuais não permitem uma solução viável. Aumente a
                carne disponível, as horas de trabalho ou a capacidade da estufa.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cards de resultado */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-primary bg-primary/5 border-2 sm:col-span-2 lg:col-span-1">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Lucro Máximo</p>
                  <p className="text-2xl font-bold text-primary">
                    R${" "}
                    {solution.result.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </CardContent>
              </Card>
              {PRODUCTS.map((p) => (
                <Card key={p.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <p className="text-sm text-muted-foreground">{p.name}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {(
                        Number(solution[p.id as keyof OptimizationResult]) || 0
                      ).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        kg
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Gráficos + Gargalo */}
            <section className="grid lg:grid-cols-2 gap-6">
              {/* Gráficos */}
              <Card>
                <CardHeader>
                  <CardTitle>Mix de Produção</CardTitle>
                  <CardDescription>Distribuição por produto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Pie */}
                    <div className="space-y-4">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {pieData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(v: number) => [`${v.toFixed(2)} kg`, "Quantidade"]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {pieData.map((entry) => {
                          const total = pieData.reduce((s, d) => s + d.value, 0);
                          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
                          return (
                            <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-muted-foreground truncate">{entry.name}</span>
                              <span className="ml-auto text-sm font-semibold tabular-nums">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bar */}
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical">
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={65} />
                          <Tooltip
                            formatter={(v: number) => [`${v.toFixed(2)} kg`, "Quantidade"]}
                          />
                          <Legend />
                          <Bar dataKey="quantidade" name="Quantidade (kg)" radius={[0, 4, 4, 0]}>
                            {barData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gargalo */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Gargalo</CardTitle>
                  <CardDescription>Fatores limitantes da produção</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <UtilizationBar
                      label="Carne"
                      percentage={bottleneck.utilization.meat}
                      color="var(--chart-4)"
                    />
                    <UtilizationBar
                      label="Mão de Obra"
                      percentage={bottleneck.utilization.labor}
                      color="var(--chart-1)"
                    />
                    <UtilizationBar
                      label="Estufa"
                      percentage={bottleneck.utilization.oven}
                      color="var(--chart-2)"
                    />
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary">
                    <h4 className="font-semibold text-foreground mb-1">Diagnóstico</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {bottleneck.message}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Sugestões de Melhoria:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {bottleneck.type === "oven" && (
                        <>
                          <li>Ampliar capacidade da estufa para produzir mais Bacon e Salame</li>
                          <li>Considerar turno noturno na estufa</li>
                        </>
                      )}
                      {bottleneck.type === "labor" && (
                        <>
                          <li>Contratar mais funcionários para processamento</li>
                          <li>Avaliar automação de etapas manuais</li>
                        </>
                      )}
                      {bottleneck.type === "meat" && (
                        <>
                          <li>Buscar novos fornecedores de carne suína</li>
                          <li>Negociar contratos de maior volume</li>
                        </>
                      )}
                      {bottleneck.type === "none" && (
                        <li>Produção equilibrada — monitore os recursos continuamente</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}

      </div>
    </main>
  );
}
