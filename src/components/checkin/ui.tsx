"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

/** Joins class names, ignoring falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-navy hover:bg-gold-light active:bg-gold-dark",
  secondary:
    "border border-champagne/60 text-champagne hover:border-champagne hover:bg-navy-800/60 active:bg-navy-800",
  ghost:
    "text-champagne underline-offset-4 hover:underline",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        "disabled:cursor-not-allowed disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

const inputClasses =
  "w-full min-h-[48px] rounded-lg border border-champagne/40 bg-white px-4 py-3 text-navy placeholder:text-navy-300 " +
  "focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClasses, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-navy-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** White step card on navy — gold top hairline, champagne borders. */
export function StepCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-champagne/40 border-t-2 border-t-gold bg-white p-6 text-navy shadow-xl sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <h2 className="font-serif text-[1.5rem] leading-snug text-navy">{title}</h2>
      <p className="mt-1 text-navy-500">{subtitle}</p>
    </header>
  );
}
