// SEA/ASEAN dial codes, digits only (no "+") — matches the backend's
// digits-only phone_number contract (app/schemas/auth.py). Sorted
// longest-first at use site so a 3-digit code never gets mistaken for a
// 2-digit one when deriving the selected country back out of a value.
const SEA_COUNTRY_CODES = [
  { code: "60", flag: "🇲🇾", name: "Malaysia" },
  { code: "65", flag: "🇸🇬", name: "Singapore" },
  { code: "62", flag: "🇮🇩", name: "Indonesia" },
  { code: "66", flag: "🇹🇭", name: "Thailand" },
  { code: "63", flag: "🇵🇭", name: "Philippines" },
  { code: "84", flag: "🇻🇳", name: "Vietnam" },
  { code: "673", flag: "🇧🇳", name: "Brunei" },
  { code: "855", flag: "🇰🇭", name: "Cambodia" },
  { code: "856", flag: "🇱🇦", name: "Laos" },
  { code: "95", flag: "🇲🇲", name: "Myanmar" },
];

const DEFAULT_COUNTRY_CODE = "60"; // Malaysia

interface PhoneNumberFieldProps {
  label: string;
  /** The full phone number as it's actually stored/sent — country code
   * followed directly by the local number, digits only. Nothing fancier:
   * this component only exists to make typing that string easier. */
  value: string;
  onChange: (fullDigits: string) => void;
  error?: string;
  required?: boolean;
}

export default function PhoneNumberField({ label, value, onChange, error, required }: PhoneNumberFieldProps) {
  const sortedByLongestCode = [...SEA_COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  const matched = sortedByLongestCode.find((c) => value.startsWith(c.code));
  const countryCode = matched?.code ?? DEFAULT_COUNTRY_CODE;
  const localNumber = matched ? value.slice(matched.code.length) : value;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-surface transition-colors focus-within:border-primary ${error ? "border-danger" : "border-border"}`}
      >
        <select
          aria-label="Country code"
          value={countryCode}
          onChange={(e) => onChange(e.target.value + localNumber)}
          className="flex-none border-r border-border bg-transparent py-3 pl-3 pr-2 text-sm text-foreground outline-none"
        >
          {SEA_COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} +{c.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          autoComplete="tel-national"
          required={required}
          value={localNumber}
          onChange={(e) => onChange(countryCode + e.target.value.replace(/\D/g, ""))}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-foreground outline-none"
        />
      </div>
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </div>
  );
}
