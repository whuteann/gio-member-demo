import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

interface OtpFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Fired once all six digits are present — lets the form submit itself
   *  rather than making the user reach for a button after the last digit. */
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

/** Six single-digit boxes. TextField isn't shaped for this: the value is one
 *  string but the UI is per-character, and the paste/backspace/auto-advance
 *  behaviour people expect from an OTP field has to be wired by hand. */
export default function OtpField({ label, value, onChange, onComplete, error, disabled }: OtpFieldProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(LENGTH).slice(0, LENGTH).split("");

  function commit(next: string) {
    onChange(next);
    if (next.length === LENGTH) onComplete?.(next);
  }

  function setDigit(index: number, digit: string) {
    const chars = value.padEnd(LENGTH).split("");
    chars[index] = digit || " ";
    commit(chars.join("").trimEnd());
  }

  function onInput(index: number, e: ChangeEvent<HTMLInputElement>) {
    // Mobile keyboards and autofill can deliver more than one character to a
    // single box; take the digits and spread them across the rest.
    const typed = e.target.value.replace(/\D/g, "");
    if (!typed) return setDigit(index, "");
    if (typed.length === 1) {
      setDigit(index, typed);
      inputs.current[Math.min(index + 1, LENGTH - 1)]?.focus();
      return;
    }
    const chars = value.padEnd(LENGTH).split("");
    for (let i = 0; i < typed.length && index + i < LENGTH; i++) chars[index + i] = typed[i];
    commit(chars.join("").trimEnd());
    inputs.current[Math.min(index + typed.length, LENGTH - 1)]?.focus();
  }

  function onKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
      // Backspace in an empty box steps back and clears the previous one,
      // instead of doing nothing and stranding the caret.
      e.preventDefault();
      setDigit(index - 1, "");
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    // Pasting the whole code from a mail app is the common case — fill every
    // box from the first, not just the one that happened to have focus.
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    commit(pasted);
    inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="flex gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            value={digit.trim()}
            onChange={(e) => onInput(index, e)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={onPaste}
            disabled={disabled}
            inputMode="numeric"
            // Lets iOS/Android offer the code straight from the SMS/mail app.
            autoComplete="one-time-code"
            maxLength={1}
            aria-label={`${label} digit ${index + 1}`}
            className={`h-13 w-full rounded-xl border bg-surface text-center text-lg font-semibold text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50 ${
              error ? "border-danger" : "border-border"
            }`}
          />
        ))}
      </div>
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </div>
  );
}
