import { useId, useState, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function joinClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function readStringValue(
  value: InputHTMLAttributes<HTMLInputElement>["value"],
): string {
  return typeof value === "string" ? value : "";
}

function formatDateInputValue(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const locale =
    typeof document === "undefined"
      ? "en-US"
      : document.documentElement.lang || "en-US";

  return parsed.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function Input({
  className = "",
  error,
  id,
  disabled,
  type = "text",
  value,
  defaultValue,
  onChange,
  placeholder,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);
  const [uncontrolledDate, setUncontrolledDate] = useState(() =>
    readStringValue(defaultValue),
  );

  const isDate = type === "date";
  const isDateControlled = isDate && value !== undefined;
  const dateValue = isDateControlled ? readStringValue(value) : uncontrolledDate;
  const dateLabel = dateValue ? formatDateInputValue(dateValue) : "";

  const fieldChrome = joinClasses(
    hasError
      ? "border-red-500 focus-visible:ring-red-500 focus-within:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400 dark:focus-within:ring-red-400"
      : "border-zinc-300 focus-visible:ring-zinc-900 focus-within:ring-zinc-900 dark:border-zinc-600 dark:focus-visible:ring-zinc-100 dark:focus-within:ring-zinc-100",
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5">
      {isDate ? (
        <div
          className={joinClasses(
            "relative h-10 w-full min-w-0 max-w-full overflow-hidden rounded-lg border bg-white",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2",
            "dark:bg-zinc-900",
            disabled && "opacity-50",
            fieldChrome,
            className,
          )}
        >
          <span
            aria-hidden="true"
            suppressHydrationWarning
            className={joinClasses(
              "pointer-events-none absolute inset-0 flex items-center px-3 text-sm",
              dateLabel
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 dark:text-zinc-500",
            )}
          >
            {dateLabel || placeholder || ""}
          </span>
          <input
            id={inputId}
            type="date"
            disabled={disabled}
            value={isDateControlled ? dateValue : undefined}
            defaultValue={isDateControlled ? undefined : defaultValue}
            onChange={(event) => {
              if (!isDateControlled) {
                setUncontrolledDate(event.target.value);
              }
              onChange?.(event);
            }}
            className={joinClasses(
              "absolute inset-0 z-10 h-full w-full min-w-0 cursor-pointer border-0 bg-transparent opacity-[0.01]",
              "text-base scheme-light appearance-none focus-visible:outline-none",
              "disabled:cursor-not-allowed",
            )}
            {...rest}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
      ) : (
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          className={joinClasses(
            "box-border block h-10 w-full min-w-0 max-w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 transition-colors",
            "placeholder:text-zinc-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
            fieldChrome,
            className,
          )}
          {...rest}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
      )}
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
