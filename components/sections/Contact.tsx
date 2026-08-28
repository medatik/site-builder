"use client";

import { useState, type FormEvent } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { ContactProps, BusinessInfo, FormField } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { submitContact } from "@/app/actions/contact";
import { HONEYPOT_FIELD } from "@/lib/contact/constants";

const DEFAULT_FIELDS: FormField[] = [
  { name: "name", label: "Full name", type: "text", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "message", label: "How can we help?", type: "textarea", required: true },
];

/**
 * Contact / booking section. Client component with local submit state.
 *
 * Submissions go to the `submitContact` server action, which fans them out to
 * whatever delivery channels the config + env enable (see `lib/contact/`). The
 * client still validates required fields first (the custom Select/DatePicker use
 * hidden inputs, which native validation ignores) and shows pending / error
 * states around the async call.
 */
export function Contact({
  eyebrow,
  title,
  subtitle,
  fields = DEFAULT_FIELDS,
  submitLabel = "Send message",
  successTitle = "Message sent",
  successMessage = "Thanks — we’ve received your message and will be in touch shortly.",
  sendAnotherLabel = "Send another message",
  errorMessage = "Something went wrong sending your message. Please try again, or reach us directly using the details on this page.",
  sendingLabel = "Sending…",
  bookingUrl,
  showBusinessInfo = true,
  infoLabels,
  selectPlaceholder = "Select…",
  bookingPrompt = "Ready to book? Schedule online in under a minute.",
  requiredMessage = "This field is required.",
  business,
  id,
}: ContactProps & { id?: string; business?: BusinessInfo }) {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  // Names of required fields left empty on the last submit attempt. Only the
  // custom controls (select/date) can end up here — native inputs block the
  // submit themselves — but the check covers every field for safety.
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const labels = {
    callUs: infoLabels?.callUs ?? "Call us",
    email: infoLabels?.email ?? "Email",
    visit: infoLabels?.visit ?? "Visit",
    hours: infoLabels?.hours ?? "Hours",
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Custom controls (Select/DatePicker) carry their value in a hidden input,
    // and hidden inputs are excluded from native constraint validation — so
    // `required` must be enforced here.
    const data = new FormData(e.currentTarget);
    const missing = new Set(
      fields
        .filter((f) => f.required && !String(data.get(f.name) ?? "").trim())
        .map((f) => f.name),
    );
    setErrors(missing);
    if (missing.size > 0) return;

    // Tag the submission with the active locale (read from the nearest lang
    // ancestor) so delivered enquiries note the language. Server-resolved config
    // decides where it actually goes — never anything sent from here.
    const locale = e.currentTarget.closest("[lang]")?.getAttribute("lang");
    if (locale) data.set("_locale", locale);

    setSendFailed(false);
    setPending(true);
    try {
      const result = await submitContact(data);
      if (result.ok) setSubmitted(true);
      else if (result.reason === "validation") setErrors(new Set(result.missing));
      else setSendFailed(true);
    } catch {
      setSendFailed(true);
    } finally {
      setPending(false);
    }
  }

  /** Back to a blank form after a successful send. */
  function reset() {
    setSubmitted(false);
    setSendFailed(false);
    setErrors(new Set());
  }

  function clearError(name: string) {
    setErrors((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }

  return (
    <Section id={id ?? "contact"}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
          {showBusinessInfo && business && (
            <ul className="mt-2 flex flex-col gap-4">
              {business.phone && (
                <ContactRow icon={<Phone className="size-5" />} label={labels.callUs}>
                  <a href={`tel:${business.phone.replace(/\s+/g, "")}`} dir="ltr" className="block hover:text-primary rtl:text-end">
                    {business.phone}
                  </a>
                </ContactRow>
              )}
              {business.email && (
                <ContactRow icon={<Mail className="size-5" />} label={labels.email}>
                  <a href={`mailto:${business.email}`} dir="ltr" className="block hover:text-primary rtl:text-end">
                    {business.email}
                  </a>
                </ContactRow>
              )}
              {business.address && (
                <ContactRow icon={<MapPin className="size-5" />} label={labels.visit}>
                  <span dir="ltr" className="block rtl:text-end">{business.address}</span>
                </ContactRow>
              )}
              {business.hours && business.hours.length > 0 && (
                <ContactRow icon={<Clock className="size-5" />} label={labels.hours}>
                  <span className="flex flex-col gap-0.5">
                    {business.hours.map((h) => (
                      <span key={h.days}>
                        <span className="font-medium text-text">{h.days}:</span> {h.hours}
                      </span>
                    ))}
                  </span>
                </ContactRow>
              )}
            </ul>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border-[length:var(--card-border-width)] border-[color-mix(in_srgb,var(--text)_12%,transparent)] card-surface p-7 shadow-[var(--shadow-card)] sm:p-9">
          {bookingUrl ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <p className="text-lg text-muted">{bookingPrompt}</p>
              <Button href={bookingUrl} size="lg" icon="calendar-check">
                {submitLabel}
              </Button>
            </div>
          ) : submitted ? (
            // role=status so a screen reader announces the outcome — the form
            // it replaced is gone, so nothing else would signal success.
            <div
              role="status"
              className="flex flex-col items-center gap-6 py-12 text-center sm:py-16"
            >
              <span
                className="relative flex size-16 shrink-0 items-center justify-center rounded-full text-primary"
                style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
              >
                {/* Soft halo — the same tint at a lower strength, so the badge
                    reads as lit rather than as a flat disc. */}
                <span
                  aria-hidden
                  className="absolute inset-[-7px] rounded-full"
                  style={{ background: "color-mix(in srgb, var(--primary) 7%, transparent)" }}
                />
                <CheckCircle2 className="relative size-8" strokeWidth={2} />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-xl font-bold leading-tight sm:text-2xl">
                  {successTitle}
                </h3>
                <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-muted">
                  {successMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className={cn(
                  "rounded-[var(--radius-btn)] px-3 py-1.5 text-sm font-semibold text-primary",
                  "underline-offset-4 transition-colors duration-[var(--transition-base)]",
                  "hover:underline focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {sendAnotherLabel}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate={false} className="flex flex-col gap-5">
              {/* Tells the server action which contact section this is, so it
                  reads the right fields + delivery config. Not trusted for routing. */}
              <input type="hidden" name="_section" value={id ?? "contact"} />
              {/* Honeypot: hidden from people, tempting to bots. A filled value
                  makes the action silently drop the submission. */}
              <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
                <label>
                  Leave this field empty
                  <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  selectPlaceholder={selectPlaceholder}
                  invalid={errors.has(field.name)}
                  requiredMessage={requiredMessage}
                  onValueChange={() => clearError(field.name)}
                />
              ))}
              {sendFailed && (
                <p role="alert" className="flex items-start gap-2 text-sm text-[#ef4444]">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </p>
              )}
              <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
                {pending ? sendingLabel : submitLabel}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-btn)] text-primary"
        style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <span className="text-[15px] leading-relaxed text-text">{children}</span>
      </div>
    </li>
  );
}

const inputClass =
  "w-full rounded-[var(--radius-btn)] border border-[color-mix(in_srgb,var(--text)_18%,transparent)] " +
  "bg-background px-4 py-3 text-[15px] text-text outline-none transition-colors " +
  "placeholder:text-[color-mix(in_srgb,var(--text)_45%,transparent)] " +
  "focus:border-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]";

function Field({
  field,
  selectPlaceholder,
  invalid,
  requiredMessage,
  onValueChange,
}: {
  field: FormField;
  selectPlaceholder: string;
  invalid: boolean;
  requiredMessage: string;
  onValueChange: () => void;
}) {
  const { name, label, type = "text", placeholder, required, options } = field;
  const errorId = `${name}-error`;
  const describedBy = invalid ? errorId : undefined;
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-heading text-sm font-semibold">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      {type === "textarea" ? (
        <textarea name={name} placeholder={placeholder} required={required} rows={4} className={cn(inputClass, "resize-y")} />
      ) : type === "select" ? (
        <Select
          name={name}
          options={options ?? []}
          placeholder={placeholder ?? selectPlaceholder}
          invalid={invalid}
          onValueChange={onValueChange}
          describedBy={describedBy}
        />
      ) : type === "date" ? (
        <DatePicker
          name={name}
          placeholder={placeholder}
          invalid={invalid}
          onValueChange={onValueChange}
          describedBy={describedBy}
        />
      ) : (
        <input name={name} type={type} placeholder={placeholder} required={required} className={inputClass} />
      )}
      {/* fixed red (not a theme token): must read as an error on every palette/mode */}
      {invalid && (
        <span id={errorId} role="alert" className="text-sm text-[#ef4444]">
          {requiredMessage}
        </span>
      )}
    </label>
  );
}
