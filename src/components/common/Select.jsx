import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const Select = forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  value,
  onChange,
  disabled,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const containerRef = useRef(null);

  // Find the selected option label
  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedValue(value || '');
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

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    setIsOpen(false);

    // Trigger onChange with a synthetic event-like object
    if (onChange) {
      onChange({ target: { value: optionValue, name: props.name } });
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Hidden native select for form compatibility */}
      <select
        ref={ref}
        value={selectedValue}
        onChange={(e) => handleSelect(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom styled select */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'relative w-full cursor-pointer rounded-lg bg-white py-2.5 pl-4 pr-10 text-left border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-all duration-200',
            disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400',
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
            isOpen && 'ring-2 ring-primary-500 border-primary-500',
            className
          )}
        >
          <span className={cn(
            'block truncate text-sm',
            !selectedOption && 'text-gray-400'
          )}>
            {displayText}
          </span>
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
                const isSelected = option.value === selectedValue;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'relative w-full cursor-pointer select-none py-2.5 pl-4 pr-10 text-left text-sm',
                        'transition-colors duration-100',
                        isSelected
                          ? 'bg-primary-50 text-primary-700 font-medium'
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

Select.displayName = 'Select';

export default Select;
