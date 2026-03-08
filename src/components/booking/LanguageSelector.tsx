import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
  label?: string;
  compact?: boolean;
}

export const LanguageSelector = ({ value, onChange, label = "Notification Language", compact = false }: LanguageSelectorProps) => {
  return (
    <div className={compact ? "" : "space-y-1"}>
      {!compact && (
        <Label className="flex items-center gap-1.5 text-sm">
          <Globe className="w-3.5 h-3.5" />
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={(v) => onChange(v as LanguageCode)}>
        <SelectTrigger className={compact ? "w-full" : "mt-1"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
