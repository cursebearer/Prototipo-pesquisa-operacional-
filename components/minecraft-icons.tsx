type IconProps = {
  size?: number;
  className?: string;
};

function MCIcon({
  src,
  alt,
  size = 32,
  className,
}: IconProps & { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        imageRendering: "pixelated",
        objectFit: "contain",
        width: size,
        height: size,
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  );
}

export const RawPorkchop = (p: IconProps) =>
  <MCIcon src="/mc/porkchop_raw.png" alt="Carne suína crua" {...p} />;

export const CookedPorkchop = (p: IconProps) =>
  <MCIcon src="/mc/porkchop_cooked.png" alt="Carne suína cozida" {...p} />;

export const Emerald = (p: IconProps) =>
  <MCIcon src="/mc/emerald.png" alt="Esmeralda" {...p} />;

export const GoldIngot = (p: IconProps) =>
  <MCIcon src="/mc/gold_ingot.png" alt="Lingote de ouro" {...p} />;

export const Diamond = (p: IconProps) =>
  <MCIcon src="/mc/diamond.png" alt="Diamante" {...p} />;

export const DiamondSword = (p: IconProps) =>
  <MCIcon src="/mc/diamond_sword.png" alt="Espada de diamante" {...p} />;

export const IronPickaxe = (p: IconProps) =>
  <MCIcon src="/mc/iron_pickaxe.png" alt="Picareta de ferro" {...p} />;

export const GrassBlock = (p: IconProps) =>
  <MCIcon src="/mc/grass_side.png" alt="Bloco de grama" {...p} />;

export const GrassTop = (p: IconProps) =>
  <MCIcon src="/mc/grass_top.png" alt="Topo de grama" {...p} />;

export const Dirt = (p: IconProps) =>
  <MCIcon src="/mc/dirt.png" alt="Terra" {...p} />;

/* Heart usa um SVG inline (Minecraft hearts não estão como arquivo único) */
export function Heart({ size = 28, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 9 8"
      width={size}
      height={(size * 8) / 9}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {[
        ".kkk.kkk.",
        "krrrkrrrk",
        "krrrrrrrk",
        "krrrrrrrk",
        ".krrrrrk.",
        "..krrrk..",
        "...krk...",
        "....k....",
      ].flatMap((row, y) =>
        row.split("").map((ch, x) =>
          ch === "k" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#5a0000" />
          ) : ch === "r" ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#e23030" />
          ) : null,
        ),
      )}
    </svg>
  );
}
