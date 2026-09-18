"use client";

import { Button } from "@smart-pantry/ui";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { SignOutModal } from "./SignOutModal";
import { deleteAccount, signOut } from "@/app/actions/auth";
import { isNextRedirectError } from "@/lib/auth/redirect";
import { getUserInitials } from "@/lib/userInitials";
import { useTranslation } from "@/i18n/useTranslation";
import type { MessageKey } from "@/i18n/messages";
import { usePantryStore } from "@/store/usePantryStore";

export interface UserProfileMenuProps {
  userName: string | null;
  userEmail: string;
}

const DELETE_ERROR_KEYS = new Set<MessageKey>([
  "auth.error.notAuthenticated",
  "auth.error.deleteUnavailable",
  "auth.error.unexpected",
]);

function resolveDeleteError(
  t: (key: MessageKey) => string,
  value: string,
): string {
  if (DELETE_ERROR_KEYS.has(value as MessageKey)) {
    return t(value as MessageKey);
  }

  return value;
}

export function UserProfileMenu({ userName, userEmail }: UserProfileMenuProps) {
  const { t } = useTranslation();
  const enterGuestSession = usePantryStore((state) => state.enterGuestSession);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initials = getUserInitials(userName, userEmail);
  const displayName = userName?.trim() || userEmail;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setActionError(null);
    setIsOpen((current) => !current);
  };

  const handleMenuItemClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    next: () => void,
  ) => {
    event.preventDefault();
    setIsOpen(false);
    next();
  };

  const handleSignOutCancel = () => {
    if (isPending) {
      return;
    }

    setIsSignOutOpen(false);
  };

  const handleSignOutConfirm = () => {
    startTransition(async () => {
      try {
        enterGuestSession();
        await signOut();
      } catch (caught) {
        if (isNextRedirectError(caught)) {
          throw caught;
        }
      }
    });
  };

  const handleDeleteCancel = () => {
    if (isPending) {
      return;
    }

    setIsDeleteOpen(false);
    setActionError(null);
  };

  const handleDeleteConfirm = () => {
    setActionError(null);

    startTransition(async () => {
      try {
        const result = await deleteAccount();

        if (!result.ok) {
          setActionError(resolveDeleteError(t, result.error));
          return;
        }

        enterGuestSession();
      } catch (caught) {
        if (isNextRedirectError(caught)) {
          enterGuestSession();
          throw caught;
        }

        setActionError(t("auth.error.unexpected"));
      }
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold tracking-wide text-white transition-all hover:bg-zinc-700 hover:ring-2 hover:ring-zinc-300 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        aria-label={t("auth.profileMenuAria")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={handleToggle}
      >
        <span aria-hidden="true">{initials}</span>
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t("auth.profileMenuAria")}
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {displayName}
            </p>
            {userName ? (
              <p className="mt-0.5 truncate text-xs text-zinc-500">{userEmail}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              role="menuitem"
              className="w-full justify-start"
              onClick={(event) =>
                handleMenuItemClick(event, () => setIsSignOutOpen(true))
              }
            >
              {t("auth.signOut")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              role="menuitem"
              className="w-full justify-start text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={(event) =>
                handleMenuItemClick(event, () => {
                  setActionError(null);
                  setIsDeleteOpen(true);
                })
              }
            >
              {t("auth.deleteAccount")}
            </Button>
          </div>
        </div>
      ) : null}

      <SignOutModal
        open={isSignOutOpen}
        isLoading={isPending}
        onCancel={handleSignOutCancel}
        onConfirm={handleSignOutConfirm}
      />
      <DeleteAccountModal
        open={isDeleteOpen}
        isLoading={isPending}
        error={actionError}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
