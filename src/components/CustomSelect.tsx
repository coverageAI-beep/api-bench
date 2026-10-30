import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: React.ReactNode;
  badgeOnly?: boolean;
}

export interface CustomSelectChangeEvent {
  target: { value: string };
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (e: CustomSelectChangeEvent) => void;
  className?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  id?: string;
  menuWidth?: 'match' | 'auto';
  align?: 'left' | 'right';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  className = '',
  icon,
  placeholder = 'Select option',
  id,
  menuWidth = 'match',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const handleSelect = (optValue: string) => {
    setIsOpen(false);
    onChange({ target: { value: optValue } });
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-9 flex items-center justify-between px-3 text-xs font-medium rounded-lg bg-[#FFFFFF] border text-[#292524] shadow-2xs hover:bg-[#F7F5F0] hover:border-[#D9D2C7] focus:outline-none focus:ring-1 focus:ring-[#C26D53] focus:border-[#C26D53] transition-colors select-none ${
          isOpen
            ? 'ring-1 ring-[#C26D53] border-[#C26D53] bg-[#F7F5F0]'
            : 'border-[#E3DDD3]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          {icon && <span className="text-[#78716C] shrink-0 flex items-center">{icon}</span>}
          {selectedOption?.badge && (
            <span className="shrink-0 flex items-center">{selectedOption.badge}</span>
          )}
          {!selectedOption?.badgeOnly && (
            <span className="truncate text-[#292524] font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        {/* Accurately positioned Chevron icon container */}
        <span className="shrink-0 ml-2.5 flex items-center justify-center text-[#78716C] pointer-events-none">
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#C26D53]' : ''
            }`}
          />
        </span>
      </button>

      {/* Styled Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 rounded-xl bg-[#FFFFFF] border border-[#D9D2C7] shadow-xl z-50 py-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 focus:outline-none ${
            menuWidth === 'match'
              ? 'w-full'
              : 'min-w-full w-max max-w-xs sm:max-w-md'
          }`}
          style={{ minWidth: '100%' }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-[calc(100%-8px)] mx-1 text-left px-2.5 py-1.5 text-xs flex items-center justify-between gap-3 rounded-lg transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#F7ECE8] font-semibold'
                    : 'hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {opt.badge && <span className="shrink-0 flex items-center">{opt.badge}</span>}
                  <span
                    className={`truncate ${
                      isSelected ? 'text-[#C26D53] font-semibold' : 'text-[#292524]'
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#C26D53] shrink-0 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
