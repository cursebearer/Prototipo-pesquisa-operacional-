# Otimizador de Mix de Produção

Aplicação web interativa de **Programação Linear** para maximização do lucro em uma agroindústria suína. Resolve o problema de mix de produção em tempo real usando o algoritmo Simplex, com visualização passo a passo do método.

## Tecnologias

- [Next.js 16](https://nextjs.org/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [javascript-lp-solver](https://github.com/JWally/jsLPSolver) — solver de programação linear
- [Recharts](https://recharts.org/) — gráficos interativos

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [pnpm](https://pnpm.io/) (gerenciador de pacotes)

### Instalar o pnpm (caso não tenha)

```bash
npm install -g pnpm
```

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/cursebearer/Prototipo-pesquisa-operacional-.git
cd Prototipo-pesquisa-operacional-
```

### 2. Instale as dependências

```bash
pnpm install
```

> Se aparecer erro relacionado a scripts de build (sharp), rode:
> ```bash
> pnpm install --ignore-scripts
> ```

### 3. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

### 4. Acesse no navegador

```
http://localhost:3000
```

---

## Funcionalidades

- **Sliders + campos numéricos** para ajuste dinâmico das restrições (carne, mão de obra, estufa, contrato mínimo)
- **Solução ótima em tempo real** — recalcula automaticamente ao mover qualquer controle
- **Análise de gargalos** — identifica qual recurso está limitando o lucro
- **Gráfico de mix** — rosca com legenda responsiva + barras por produto
- **Modelo gráfico 2D** — visualização da região viável (Bacon × Salame)
- **Método Simplex passo a passo** — tableau interativo com navegação por iteração, destaque do elemento pivô e solução ótima convertida para variáveis originais

---

## Problema modelado

**Maximizar** `Z = 10·Carcaça + 25·Linguiça + 35·Bacon + 45·Salame`

| Restrição | Expressão |
|-----------|-----------|
| Carne total | `Carcaça + Linguiça + Bacon + Salame ≤ totalMeat` |
| Mão de obra | `0,05·Linguiça + 0,10·Bacon + 0,15·Salame ≤ laborHours` |
| Estufa | `Bacon + Salame ≤ ovenCapacity` |
| Contrato mínimo | `Carcaça ≥ minCarcass` |
| Mínimos de portfólio | `Linguiça, Bacon, Salame ≥ 1 kg` |
