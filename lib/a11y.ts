/** Shared accessibility class strings */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";

export const inputClassName = `w-full rounded-2xl border border-border/80 bg-bg-card px-5 text-base text-text-primary placeholder:text-transparent shadow-sm transition-all duration-300 focus:border-primary focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/15 min-h-[56px] ${focusRing}`;

export const textareaClassName = `${inputClassName} min-h-[140px] resize-y`;

export const labelClassName = "mb-2.5 block text-base font-medium text-text-primary";
