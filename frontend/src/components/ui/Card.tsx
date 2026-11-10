import type { HTMLAttributes } from "react";

export default function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}
