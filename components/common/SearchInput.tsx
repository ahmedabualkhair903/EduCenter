import { FiSearch } from "react-icons/fi";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "بحث...",
}: SearchInputProps) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">
        البحث
      </span>

      <FiSearch
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={17}
      />

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-10 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
      />
    </label>
  );
}