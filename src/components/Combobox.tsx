import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

// Option ka data structure define kiya
export interface Option {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
}: ComboboxProps) {
  // Dropdown khula hai ya band
  const [isOpen, setIsOpen] = useState(false);
  // Search box me user kya type kar raha hai
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Bahar click karne par dropdown close ho jaye
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search filter logic: type kiye gaye text se options match karna
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button: ispar click karne se dropdown khulta hai */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>{selectedLabel || placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 opacity-50 ml-2" />
      </button>

      {/* Jab isOpen true ho tabhi dropdown list dikhegi */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search Input field */}
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Options List */}
          <ul role="listbox" className="max-h-48 overflow-y-auto p-1 text-sm">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400 text-center">No options found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded cursor-pointer text-xs font-medium ${
                    opt.value === value
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {opt.label}
                  {opt.value === value && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}