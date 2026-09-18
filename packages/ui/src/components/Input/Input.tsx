import { useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function joinClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function Input({
  className = "",
  error,
  id,
  disabled,
  type = "text",
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        className={joinClasses(
          "h-10 w-full min-w-0 rounded-lg border bg-white px-3 text-sm text-zinc-900 transition-colors",
          "placeholder:text-zinc-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          hasError
            ? "border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400"
            : "border-zinc-300 focus-visible:ring-zinc-900 dark:border-zinc-600 dark:focus-visible:ring-zinc-100",
          className,
        )}
        {...rest}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
