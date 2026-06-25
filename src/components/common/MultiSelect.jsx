import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const MultiSelect = forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder = 'Select options',
  value = [],
  onChange,
  disabled,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(value || []);
  const containerRef = useRef(null);

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionValue) => {
    let newValues;
    if (selectedValues.includes(optionValue)) {
      newValues = selectedValues.filter(v => v !== optionValue);
    } else {
      newValues = [...selectedValues, optionValue];
    }

    setSelectedValues(newValues);

    // Trigger onChange
    if (onChange) {
      onChange(newValues);
    }
  };

  const handleRemoveOption = (optionValue, e) => {
    e.stopPropagation();
    const newValues = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newValues);

    if (onChange) {
      onChange(newValues);
    }
  };

  // Get selected options for display
  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Hidden input for form compatibility */}
      <input
        ref={ref}
        type="hidden"
        value={JSON.stringify(selectedValues)}
        {...props}
      />

      {/* Custom styled multi-select */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border shadow-sm min-h-[42px]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-all duration-200',
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400',
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
            isOpen && 'ring-2 ring-primary-500 border-primary-500',
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-400 text-sm py-0.5">{placeholder}</span>
            ) : (
              selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 text-sm"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(option.value, e)}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className={cn(
            'absolute z-50 mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200',
            'max-h-60 overflow-auto',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}>
            <ul className="py-1">
              {options.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleToggleOption(option.value)}
                      className={cn(
                        'relative w-full cursor-pointer select-none py-2.5 pl-4 pr-10 text-left text-sm',
                        'transition-colors duration-100',
                        isSelected
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50',
                        index === 0 && 'rounded-t-lg',
                        index === options.length - 1 && 'rounded-b-lg'
                      )}
                    >
                      <span className="block truncate">{option.label}</span>
                      {isSelected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-600">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
