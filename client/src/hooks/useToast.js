import { useState } from "react";

/** Module-level setter — set by the first call to useToastSystem() */
let _setter = null;

/**
 * Call this anywhere in the app (no hook needed) to show a toast.
 * @param {string} msg   Message to display
 * @param {'info'|'success'|'error'} type
 */
export function toast(msg, type = "info") {
  if (!_setter) return;
  const id = Date.now();
  _setter((prev) => [...prev, { id, msg, type }]);
  setTimeout(() => _setter((prev) => prev.filter((t) => t.id !== id)), 3500);
}

/**
 * Initialize the toast system. Mount <Toast /> once at the root.
 * Returns { toasts } to be rendered by <ToastContainer />.
 */
export function useToastSystem() {
  const [toasts, setToasts] = useState([]);
  _setter = setToasts;
  return { toasts };
}
