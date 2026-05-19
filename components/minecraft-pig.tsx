type PigVariant = "face" | "side";

export function MinecraftPig({
  variant = "face",
  size = 96,
  className,
  flip = false,
}: {
  variant?: PigVariant;
  size?: number;
  className?: string;
  flip?: boolean;
}) {
  const src = variant === "face" ? "/mc/pig.png" : "/mc/pig_iso.png";
  return (
    <img
      src={src}
      alt="Porco do Minecraft"
      width={size}
      height={size}
      className={className}
      style={{
        imageRendering: "pixelated",
        objectFit: "contain",
        width: size,
        height: "auto",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    />
  );
}
