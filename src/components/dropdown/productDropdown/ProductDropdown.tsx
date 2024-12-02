import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import debounce from 'lodash.debounce';
import './ProductDropdown.css';
import { IonIcon } from '@ionic/react';
import { caretDownOutline, caretUpOutline, informationCircleOutline } from 'ionicons/icons';
import { Tooltip } from 'react-tooltip';

interface ProductDropdownProps<T> {
  options: T[];
  selectedOptions: T[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<T[]>>;
  multiSelect?: boolean;
  idKey: keyof T;
  nameKey: keyof T;
  categoryKey: keyof T;
  tooltipKey: keyof T;
  placeHolder: string;
  label:string;
  height?: number;
  itemSize?: number;
}

const ProductDropdown = <T extends Record<string, any>>({
  options,
  selectedOptions,
  setSelectedOptions,
  multiSelect = true,
  idKey,
  nameKey,
  categoryKey,
  tooltipKey,
  placeHolder,
  label,
  height = 200,
  itemSize = 35,
}: ProductDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Record<string, T[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useMemo(
    () =>
      debounce((term) => {
        const grouped = options.reduce((acc, option) => {
          const category = option[categoryKey];
          if (!acc[category]) acc[category] = [];
          if (
            term === '' ||
            option[nameKey].toLowerCase().includes(term.toLowerCase()) ||
            category.toLowerCase().includes(term.toLowerCase())
          ) {
            acc[category].push(option);
          }
          return acc;
        }, {} as Record<string, T[]>);

        // Filter out categories with no matching options
        const nonEmptyGrouped = Object.entries(grouped).reduce((acc, [key, value]) => {
          if (value.length > 0) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, T[]>);

        setFilteredOptions(nonEmptyGrouped);
      }, 300),
    [options, categoryKey, nameKey]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleOptionClick = (option: T) => {
    if (multiSelect) {
      if (selectedOptions.some((o) => o[idKey] === option[idKey])) {
        setSelectedOptions(selectedOptions.filter((o) => o[idKey] !== option[idKey]));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    } else {
      setSelectedOptions([option]);
      setIsOpen(false);
    }
  };

  const renderOptions = (category: string, options: T[]) => (
    <div key={category} className="category-group">
      <div
        className="category-header"
        onClick={() => toggleCategory(category)}
      >
        {formatCategoryName(category)}
        <span className="arrow">{expandedCategories.has(category) ? <IonIcon icon={caretUpOutline}></IonIcon> : <IonIcon icon={caretDownOutline}></IonIcon>}</span>
      </div>
      {expandedCategories.has(category) && (
        <div className="category-options">
          {options.map((option) => (
            <>
                <div
                key={option[idKey]}
                className={`multi-select-option ${
                    selectedOptions.some((o) => o[idKey] === option[idKey]) ? 'selected' : ''
                }`}
                onClick={() => handleOptionClick(option)}
                >
                    <span>
                        {option[nameKey]}
                    </span>
                    <IonIcon data-tooltip-id={option[idKey]} data-tooltip-content={option[tooltipKey]} aria-hidden="true" icon={informationCircleOutline} slot="start"></IonIcon>
                </div>
                <Tooltip id={option[idKey]} />
            </>
          ))}
        </div>
      )}
    </div>
  );

  const formatCategoryName = (category: string) => {
    return category
      .split('-') // Split the category name by hyphens
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' '); // Join the words with spaces
  };
  

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div className="multi-select-dropdown" onClick={toggleDropdown}>
        <span className='label-name'>{label}</span>
        {selectedOptions.length > 0 ? (
          <div className="selected-options selectedText">
            {multiSelect ? (
              selectedOptions.map((option, index) => (
                <span key={option[idKey]}>
                  {option[nameKey]}
                  {index < selectedOptions.length - 1 && ', '}
                </span>
              ))
            ) : (
              <span className="selected-option flex items-center">
                {selectedOptions[0][nameKey]}
              </span>
            )}
          </div>
        ) : (
          placeHolder
        )}
        {isOpen ? <IonIcon icon={caretUpOutline}></IonIcon> : <IonIcon icon={caretDownOutline}></IonIcon>}
      </div>

      {isOpen && (
        <div className="dropdown-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="search-input"
          />
          <div className='overflow-auto pb-12 max-h-52'>
            {Object.keys(filteredOptions).length > 0 ? (
                Object.entries(filteredOptions).map(([category, options]) =>
                renderOptions(category, options)
                )
            ) : (
                <div className="no-data">No data found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDropdown;
