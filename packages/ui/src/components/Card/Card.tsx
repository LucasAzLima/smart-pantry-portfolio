import type { HTMLAttributes, ReactNode } from "react";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  interactive?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

function joinClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  padding = "md",
  interactive = false,
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-sm",
        "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50",
        paddingClasses[padding],
        interactive &&
          "cursor-pointer transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:focus-visible:ring-zinc-100",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
