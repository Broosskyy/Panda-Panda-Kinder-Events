import Image from "next/image";

interface PandaMascotProps {
  size?: number;
  className?: string;
}

export function PandaMascot({ size = 120, className = "" }: PandaMascotProps) {
  return (
    <Image
      src="/panda-illustration.svg"
      alt=""
      width={size}
      height={Math.round(size * 1.1)}
      className={className}
      aria-hidden
    />
  );
}
