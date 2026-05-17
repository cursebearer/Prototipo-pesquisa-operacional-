import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRODUCTS = [
  {
    name: "Carcaça",
    profit: 10,
    labor: "—",
    oven: false,
    description: "Venda in natura, sem processamento adicional.",
    color: "var(--chart-4)",
  },
  {
    name: "Linguiça",
    profit: 25,
    labor: "3 min/kg",
    oven: false,
    description: "Moagem e tempero. Não requer estufa.",
    color: "var(--chart-5)",
  },
  {
    name: "Bacon",
    profit: 35,
    labor: "6 min/kg",
    oven: true,
    description: "Corte e defumação em estufa.",
    color: "var(--chart-2)",
  },
  {
    name: "Salame",
    profit: 45,
    labor: "9 min/kg",
    oven: true,
    description: "Cura e defumação prolongada em estufa.",
    color: "var(--chart-3)",
  },
];

export default function ProblemPage() {
  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Nav */}
        <nav className="flex justify-end">
          <Link
            href="/resolucao"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Ver Resolução →
          </Link>
        </nav>

        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Otimização do Mix de Produção
          </h1>
          <p className="text-muted-foreground text-lg">
            Programação Linear aplicada à agroindústria suína
          </p>
        </header>

        {/* Contexto */}
        <Card>
          <CardHeader>
            <CardTitle>Contexto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground leading-relaxed">
            <p>
              O <strong>Frigorífico Vale Verde</strong> é uma agroindústria
              familiar localizada no interior do Rio Grande do Sul. Toda semana,
              o gerente de produção recebe um lote de carne suína e precisa
              decidir <strong>quanto produzir de cada item</strong> para
              maximizar o lucro da semana.
            </p>
            <p>
              A empresa fabrica quatro produtos derivados de carne suína. Cada
              produto consome <strong>1 kg de matéria‑prima por kg
              produzido</strong>, mas difere no valor agregado, no tempo de mão
              de obra exigido e no uso da estufa de defumação — recurso escasso
              e compartilhado entre Bacon e Salame.
            </p>
            <p>
              Além disso, a empresa mantém um <strong>contrato fixo com um
              supermercado local</strong> que exige uma quantidade mínima semanal
              de Carcaça, e adota como política interna manter pelo menos 1 kg
              de Linguiça, Bacon e Salame para não perder clientes de portfólio.
            </p>
          </CardContent>
        </Card>

        {/* Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Os Produtos</CardTitle>
            <CardDescription>
              Características de cada item fabricado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {PRODUCTS.map((p) => (
                <div
                  key={p.name}
                  className="rounded-lg border border-border p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-semibold text-foreground">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">R$ {p.profit}/kg</Badge>
                    <Badge variant="outline">{p.labor}</Badge>
                    {p.oven && (
                      <Badge className="bg-accent text-accent-foreground">
                        Usa Estufa
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
            <CardTitle>Restrições do Problema</CardTitle>
            <CardDescription>
              Limitações de recursos que definem o espaço de soluções viáveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="font-semibold text-foreground">Carne Total</p>
                <p className="text-muted-foreground">
                  A soma de todos os produtos não pode ultrapassar o lote
                  disponível na semana.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="font-semibold text-foreground">Mão de Obra</p>
                <p className="text-muted-foreground">
                  As horas de trabalho disponíveis limitam quanto pode ser
                  processado (Linguiça, Bacon e Salame consomem tempo).
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="font-semibold text-foreground">Capacidade da Estufa</p>
                <p className="text-muted-foreground">
                  Bacon e Salame disputam o mesmo espaço na estufa de defumação.
                  A capacidade semanal é limitada.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                <p className="font-semibold text-foreground">Contrato Mínimo</p>
                <p className="text-muted-foreground">
                  O supermercado parceiro exige uma quantidade mínima de Carcaça
                  por semana, garantida em contrato.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulação */}
        <Card>
          <CardHeader>
            <CardTitle>Formulação Matemática</CardTitle>
            <CardDescription>
              Modelo de Programação Linear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Variáveis de decisão
              </p>
              <ul className="font-mono text-sm text-foreground space-y-0.5">
                <li>C — kg de Carcaça produzidos</li>
                <li>L — kg de Linguiça produzidos</li>
                <li>B — kg de Bacon produzidos</li>
                <li>S — kg de Salame produzidos</li>
              </ul>
            </div>

            <div className="rounded-lg bg-primary/10 border-l-4 border-primary p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Função Objetivo
              </p>
              <p className="font-mono text-base font-bold text-primary">
                Maximizar Z = 10C + 25L + 35B + 45S
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sujeito a
              </p>
              <ul className="font-mono text-sm text-foreground space-y-1">
                <li>C + L + B + S ≤ TotalCarne</li>
                <li>0,05L + 0,10B + 0,15S ≤ HorasTrabalho</li>
                <li>B + S ≤ CapacidadeEstufa</li>
                <li>C ≥ ContratoMínimo</li>
                <li>L, B, S ≥ 1</li>
                <li>C, L, B, S ≥ 0</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground italic">
              Os valores das restrições (TotalCarne, HorasTrabalho,
              CapacidadeEstufa, ContratoMínimo) são ajustáveis na página de
              resolução para simular diferentes cenários semanais.
            </p>
          </CardContent>
        </Card>

        {/* Solução do cenário base */}
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle>Solução Ótima — Cenário Base</CardTitle>
            <CardDescription>
              Problema resolvido com os valores padrão: 500 kg de carne · 40 h
              de trabalho · 150 kg de estufa · contrato mínimo de 100 kg
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <p className="text-sm text-muted-foreground leading-relaxed">
              Aplicando o método Simplex a esse cenário, o solver encontra os
              valores das variáveis de decisão que <strong className="text-foreground">
              maximizam a função objetivo</strong>. O resultado indica quanto
              produzir de cada produto:
            </p>

            {/* Variáveis de decisão */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Carcaça",  symbol: "C", value: 100, profit: 10,  color: "var(--chart-4)", note: "contrato mínimo"   },
                { name: "Linguiça", symbol: "L", value: 250, profit: 25,  color: "var(--chart-5)", note: "completa a carne"  },
                { name: "Bacon",    symbol: "B", value:   1, profit: 35,  color: "var(--chart-2)", note: "mínimo de portfólio" },
                { name: "Salame",   symbol: "S", value: 149, profit: 45,  color: "var(--chart-3)", note: "máximo da estufa"  },
              ].map((v) => (
                <div
                  key={v.symbol}
                  className="rounded-lg border border-border p-4 space-y-2 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: v.color }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">{v.symbol}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {v.value} <span className="text-sm font-normal text-muted-foreground">kg</span>
                  </p>
                  <p className="text-xs font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.note}</p>
                  <p className="text-xs font-mono text-primary">
                    R$ {(v.value * v.profit).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>

            {/* Lucro total */}
            <div className="rounded-lg bg-primary/10 border-2 border-primary/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-sm text-muted-foreground">Função Objetivo</p>
                <p className="font-mono text-sm text-foreground">
                  Z = 10(100) + 25(250) + 35(1) + 45(149)
                </p>
                <p className="font-mono text-sm text-muted-foreground">
                  Z = 1.000 + 6.250 + 35 + 6.705
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs text-muted-foreground mb-0.5">Lucro Máximo</p>
                <p className="text-4xl font-bold text-primary">R$ 13.990,00</p>
              </div>
            </div>

            {/* Explicação */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Por que essa combinação?</p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>
                  <strong className="text-foreground">Salame</strong> tem o maior lucro por kg (R$ 45),
                  então é maximizado até o limite da estufa — restando 1 kg para Bacon (mínimo obrigatório).
                </li>
                <li>
                  <strong className="text-foreground">Carcaça</strong> é produzida apenas no mínimo
                  contratual (100 kg), pois seu lucro de R$ 10/kg é o menor.
                </li>
                <li>
                  <strong className="text-foreground">Linguiça</strong> absorve toda a carne restante
                  (250 kg), pois é mais lucrativa que a Carcaça e não depende da estufa.
                </li>
              </ul>
            </div>

          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center pb-4">
          <Link
            href="/resolucao"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Explorar outros cenários →
          </Link>
        </div>

      </div>
    </main>
  );
}
