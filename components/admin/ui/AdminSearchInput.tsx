import { Search } from "lucide-react";

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Suchen…",
  className = "",
}: AdminSearchInputProps) {
  return (
    <div className={`admin-search-wrap ${className}`}>
      <Search className="admin-search-icon h-4 w-4" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input admin-search-input"
      />
    </div>
  );
}
