"use client";

import { Button } from "@smart-pantry/ui";
import { useTranslation } from "@/i18n/useTranslation";

export interface InventoryPaginationProps {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function InventoryPagination({
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
}: InventoryPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label={t("pagination.navAria")}
    >
      <p className="text-sm text-zinc-500" aria-live="polite">
        {t("pagination.pageStatus", { page, totalPages })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPreviousPage}
        >
          {t("pagination.previous")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onNext}
          disabled={!hasNextPage}
        >
          {t("pagination.next")}
        </Button>
      </div>
    </nav>
  );
}
