import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MinecraftPig } from "@/components/minecraft-pig";
import {
  RawPorkchop,
  CookedPorkchop,
  GrassBlock,
  Emerald,
  GoldIngot,
} from "@/components/minecraft-icons";

const PRODUCTS = [
  {
    symbol: "x₁",
    name: "Carcaça",
    profit: 10,
    labor: "—",
    oven: false,
    refrig: false,
    description: "Venda in natura, sem processamento adicional.",
    color: "var(--chart-4)",
    icon: <RawPorkchop size={40} />,
  },
  {
    symbol: "x₂",
    name: "Linguiça",
    profit: 25,
    labor: "3 min/kg",
    oven: false,
    refrig: true,
    description: "Moagem, tempero e armazenamento refrigerado.",
    color: "var(--chart-5)",
    icon: <CookedPorkchop size={40} />,
  },
  {
    symbol: "x₃",
    name: "Bacon",
    profit: 35,
    labor: "6 min/kg",
    oven: true,
    refrig: true,
    description: "Corte, defumação em estufa e refrigeração.",
    color: "var(--chart-2)",
    icon: <CookedPorkchop size={40} />,
  },
  {
    symbol: "x₄",
    name: "Salame",
    profit: 45,
    labor: "9 min/kg",
    oven: true,
    refrig: false,
    description: "Cura e defumação prolongada em estufa.",
    color: "var(--chart-3)",
    icon: <CookedPorkchop size={40} />,
  },
];

export default function ProblemPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Nav */}
        <nav className="flex justify-end">
          <Link
            href="/resolucao"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Ver Resolução →
          </Link>
        </nav>

        {/* Header com porco isométrico */}
        <header className="flex items-center gap-6 flex-wrap">
          <MinecraftPig variant="side" size={180} className="shrink-0 drop-shadow-lg" />
          <div className="space-y-3 flex-1 min-w-[260px]">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Otimização do Mix de Produção
            </h1>
            <p className="text-muted-foreground text-2xl flex items-center gap-3 flex-wrap">
              <GrassBlock size={36} />
              Programação Linear aplicada à agroindústria suína
              <RawPorkchop size={36} />
            </p>
          </div>
        </header>

        {/* Contexto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Contexto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground leading-relaxed text-xl">
            <p>
              O <strong>Frigorífico Vale Verde</strong> é uma agroindústria
              familiar localizada no interior do Rio Grande do Sul. Toda semana,
              o gerente de produção recebe um lote de carne suína e precisa
              decidir <strong>quanto produzir de cada item</strong> para
              maximizar o lucro da semana.
            </p>
            <p>
              A empresa fabrica quatro produtos derivados da carne suína. Todos
              partem da mesma matéria‑prima — <strong>cada quilo produzido
              consome um quilo de carne</strong> — mas se diferenciam pelo lucro
              por kg, pelo tempo de mão de obra que exigem e pelo uso de dois
              recursos compartilhados: a <strong>estufa de defumação</strong>{" "}
              (disputada por Bacon e Salame) e a <strong>câmara de
              refrigeração</strong> (compartilhada entre Linguiça e Bacon).
            </p>
            <p>
              Além dos limites de recursos, o gerente precisa atender a um{" "}
              <strong>contrato fixo de Carcaça</strong> com um supermercado
              local e respeitar a <strong>demanda máxima de Salame</strong>, que
              é um produto premium absorvido pelo mercado em quantidade limitada
              por semana.
            </p>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Os Produtos</CardTitle>
            <CardDescription className="text-lg">
              Características de cada item fabricado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-5">
              {PRODUCTS.map((p) => (
                <div
                  key={p.name}
                  className="rounded-lg border border-border p-5 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-mono text-base text-muted-foreground">{p.symbol}</span>
                    <span className="font-semibold text-foreground text-xl">
                      {p.name}
                    </span>
                    <span className="ml-auto">{p.icon}</span>
                  </div>
                  <p className="text-base text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary" className="text-base px-3 py-1">R$ {p.profit}/kg</Badge>
                    <Badge variant="outline" className="text-base px-3 py-1">{p.labor}</Badge>
                    {p.oven && (
                      <Badge className="bg-accent text-accent-foreground text-base px-3 py-1">
                        Estufa
                      </Badge>
                    )}
                    {p.refrig && (
                      <Badge className="text-base px-3 py-1 text-white" style={{ backgroundColor: "var(--chart-4)" }}>
                        Refrigeração
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restrições */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Restrições do Problema</CardTitle>
            <CardDescription className="text-lg">
              Limitações de recursos que definem o espaço de soluções viáveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 text-base">
              <div className="rounded-lg bg-muted/50 p-5 space-y-1">
                <p className="font-semibold text-foreground text-lg">Carne Total</p>
                <p className="text-muted-foreground">
                  A soma de todos os produtos não pode ultrapassar o lote
                  disponível na semana.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-5 space-y-1">
                <p className="font-semibold text-foreground text-lg">Mão de Obra</p>
                <p className="text-muted-foreground">
                  As horas de trabalho disponíveis limitam o processamento
                  (Linguiça, Bacon e Salame consomem tempo).
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-5 space-y-1">
                <p className="font-semibold text-foreground text-lg">Capacidade da Estufa</p>
                <p className="text-muted-foreground">
                  Bacon e Salame disputam o mesmo espaço na estufa de defumação.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-5 space-y-1">
                <p className="font-semibold text-foreground text-lg">Câmara de Refrigeração</p>
                <p className="text-muted-foreground">
                  Linguiça e Bacon precisam ser armazenados refrigerados — a
                  capacidade da câmara é compartilhada entre os dois.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-5 space-y-1">
                <p className="font-semibold text-foreground text-lg">Demanda Máxima de Salame</p>
                <p className="text-muted-foreground">
                  O mercado local absorve apenas uma quantidade limitada de
                  Salame por semana (produto premium).
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-5 space-y-1">
                <p className="font-semibold text-foreground text-lg">Contrato Mínimo de Carcaça</p>
                <p className="text-muted-foreground">
                  O supermercado parceiro exige uma quantidade mínima semanal
                  de Carcaça, garantida em contrato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Formulação Matemática</CardTitle>
            <CardDescription className="text-lg">
              Modelo de Programação Linear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-5 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Variáveis de decisão
              </p>
              <ul className="font-mono text-lg text-foreground space-y-1">
                <li>x₁ — kg de Carcaça produzidos</li>
                <li>x₂ — kg de Linguiça produzidos</li>
                <li>x₃ — kg de Bacon produzidos</li>
                <li>x₄ — kg de Salame produzidos</li>
              </ul>
            </div>

            <div className="rounded-lg bg-primary/10 border-l-4 border-primary p-5 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Função Objetivo
              </p>
              <p className="font-mono text-2xl font-bold text-primary">
                Maximizar Z = 10x₁ + 25x₂ + 35x₃ + 45x₄
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-5 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Sujeito a
              </p>
              <ul className="font-mono text-lg text-foreground space-y-1.5">
                <li>x₁ + x₂ + x₃ + x₄ ≤ TotalCarne</li>
                <li>0,05 x₂ + 0,10 x₃ + 0,15 x₄ ≤ HorasTrabalho</li>
                <li>x₃ + x₄ ≤ CapacidadeEstufa</li>
                <li>x₂ + x₃ ≤ CapacidadeRefrigeração</li>
                <li>x₄ ≤ DemandaMáxSalame</li>
                <li>x₁ ≥ ContratoMínimo</li>
                <li>x₁, x₂, x₃, x₄ ≥ 0</li>
              </ul>
            </div>

            <p className="text-base text-muted-foreground italic">
              Os valores das restrições (TotalCarne, HorasTrabalho,
              CapacidadeEstufa, CapacidadeRefrigeração, DemandaMáxSalame,
              ContratoMínimo) são ajustáveis na página de resolução para
              simular diferentes cenários semanais.
            </p>
          </CardContent>
        </Card>

        {/* Solução do cenário base */}
        <Card className="border-primary/40">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-3xl">Solução Ótima — Cenário Base</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Valores das restrições adotados neste cenário
                </CardDescription>
              </div>
              <MinecraftPig variant="side" size={160} className="shrink-0 drop-shadow-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Grid com valores das restrições */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-base">
              {[
                { label: "Carne Total",       value: "500 kg" },
                { label: "Mão de Obra",       value: "40 h"   },
                { label: "Estufa",            value: "150 kg" },
                { label: "Refrigeração",      value: "280 kg" },
                { label: "Demanda Salame",    value: "120 kg" },
                { label: "Contrato Carcaça",  value: "100 kg" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="rounded-lg bg-muted/50 p-4 flex flex-col gap-0.5"
                >
                  <p className="text-sm text-muted-foreground">{r.label}</p>
                  <p className="font-semibold text-foreground text-lg">{r.value}</p>
                </div>
              ))}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Aplicando o método Simplex a esse cenário, o solver encontra os
              valores das variáveis de decisão que <strong className="text-foreground">
              maximizam a função objetivo</strong>. O resultado indica quanto
              produzir de cada produto:
            </p>

            {/* Variáveis de decisão */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Carcaça",  symbol: "x₁", value: 100, profit: 10, color: "var(--chart-4)", note: "contrato mínimo"        },
                { name: "Linguiça", symbol: "x₂", value: 250, profit: 25, color: "var(--chart-5)", note: "limite carne + refrig." },
                { name: "Bacon",    symbol: "x₃", value:  30, profit: 35, color: "var(--chart-2)", note: "preenche estufa restante" },
                { name: "Salame",   symbol: "x₄", value: 120, profit: 45, color: "var(--chart-3)", note: "demanda máxima"         },
              ].map((v) => (
                <div
                  key={v.symbol}
                  className="rounded-lg border border-border p-5 space-y-2 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: v.color }}
                    />
                    <span className="text-base text-muted-foreground font-mono">{v.symbol}</span>
                  </div>
                  <p className="text-4xl font-bold text-foreground">
                    {v.value} <span className="text-base font-normal text-muted-foreground">kg</span>
                  </p>
                  <p className="text-base font-medium text-foreground">{v.name}</p>
                  <p className="text-sm text-muted-foreground">{v.note}</p>
                  <p className="text-base font-mono text-primary font-semibold">
                    R$ {(v.value * v.profit).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>

            {/* Lucro total */}
            <div className="rounded-lg bg-primary/10 border-2 border-primary/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-base text-muted-foreground">Função Objetivo</p>
                <p className="font-mono text-lg text-foreground">
                  Z = 10(100) + 25(250) + 35(30) + 45(120)
                </p>
                <p className="font-mono text-lg text-muted-foreground">
                  Z = 1.000 + 6.250 + 1.050 + 5.400
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-base text-muted-foreground mb-1 flex items-center gap-2 justify-center sm:justify-end">
                  <Emerald size={20} /> Lucro Máximo <GoldIngot size={20} />
                </p>
                <p className="text-5xl font-bold text-primary">R$ 13.700,00</p>
              </div>
            </div>

            {/* Explicação */}
            <div className="rounded-lg bg-muted/50 p-5 space-y-3 text-base text-muted-foreground">
              <p className="font-semibold text-foreground text-lg">Por que essa combinação?</p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  <strong className="text-foreground">Salame (x₄)</strong> tem o maior lucro/kg
                  (R$ 45), mas a <strong>demanda máxima</strong> limita a produção a 120 kg.
                </li>
                <li>
                  <strong className="text-foreground">Bacon (x₃)</strong> ocupa o espaço
                  restante da estufa (150 − 120 = 30 kg) — como tem lucro/kg maior
                  que a Linguiça, preenche o limite da estufa antes dela.
                </li>
                <li>
                  <strong className="text-foreground">Linguiça (x₂)</strong> absorve o restante
                  da carne (250 kg), limitada simultaneamente pela carne total e pela câmara
                  de refrigeração (x₂ + x₃ = 280 kg).
                </li>
                <li>
                  <strong className="text-foreground">Carcaça (x₁)</strong> fica no mínimo
                  contratual (100 kg) — o menor lucro/kg justifica não produzir além do
                  obrigatório.
                </li>
              </ul>
            </div>

          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center pb-4 items-center gap-6 flex-wrap">
          <MinecraftPig variant="side" size={100} />
          <Link
            href="/resolucao"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-4 text-xl font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Explorar outros cenários →
          </Link>
          <MinecraftPig variant="side" size={100} flip />
        </div>

      </div>
    </main>
  );
}
