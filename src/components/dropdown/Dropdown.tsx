import React, { useState, useEffect, useRef } from 'react';
import './Dropdown.css';
import { Tooltip } from 'react-tooltip';
import { IonIcon } from '@ionic/react';
import { caretDownOutline, caretUpOutline } from 'ionicons/icons';

interface MultiSelectProps<T> {
  options: T[];
  selectedOptions: T[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<T[]>>;
  multiSelect?: boolean; // Optional prop to enable multi-select mode
  idKey: keyof T; // Key for the ID in the option objects
  nameKey: keyof T; // Key for the display name in the option objects
  tooltipKey: keyof T;
  placeHolder: string;
  label:string;
}

const MultiSelect = <T extends Record<string, any>>({
  options,
  selectedOptions,
  setSelectedOptions,
  multiSelect = true, // Default to multi-select if not specified
  idKey,
  nameKey,
  tooltipKey,
  placeHolder,
  label,
}: MultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleOptionClick = (option: T) => {
    if (multiSelect) {
      // Multi-select mode
      if (selectedOptions.some(o => o[idKey] === option[idKey])) {
        setSelectedOptions(selectedOptions.filter((o) => o[idKey] !== option[idKey]));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    } else {
      // Single-select mode
      setSelectedOptions([option]);
      setIsOpen(false); // Close dropdown after selection in single-select mode
    }
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div className="multi-select-dropdown" onClick={toggleDropdown}>
        <span className='label-name'>{label}</span>
        <span className='selectedText'>{selectedOptions.length > 0 ? selectedOptions.map(option => option[nameKey]).join(', ') : placeHolder}</span>
        {isOpen ? <IonIcon icon={caretUpOutline}></IonIcon> : <IonIcon icon={caretDownOutline}></IonIcon>}
      </div>
      {isOpen && (
        <ul className="multi-select-options">
          {options.map((option) => (
            <>
            <li
                data-tooltip-id={option[idKey]} data-tooltip-content={option[tooltipKey]}
              key={option[idKey]}
              className={`multi-select-option ${selectedOptions.some(o => o[idKey] === option[idKey]) ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option[nameKey]}
            </li>
            <Tooltip id={option[idKey]} />
            </>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiSelect;
