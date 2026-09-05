"use client";

/**
 * Ticket 09 — a delete action wrapped in a native confirm() so a mis-click
 * can't destroy a licence/rule row. Calls a bound server action
 * (`deleteLicense`/`deleteRule` from src/app/admin/actions.ts) with no
 * further arguments.
 */
export function DeleteButton({
  action,
  confirmMessage,
  label = "Delete",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="font-signage text-sm font-semibold text-flag hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
