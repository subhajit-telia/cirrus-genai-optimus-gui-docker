import React, { useState, useEffect, useRef } from 'react';
import './Dropdown.css';
import { Tooltip } from 'react-tooltip';
import { IonIcon } from '@ionic/react';
import { caretDownOutline, caretUpOutline, closeCircleOutline, informationCircleOutline } from 'ionicons/icons';

interface SelectDropdownProps<T> {
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

const SelectDropdown = <T extends Record<string, any>>({
  options,
  selectedOptions,
  setSelectedOptions,
  multiSelect = true, // Default to multi-select if not specified
  idKey,
  nameKey,
  tooltipKey,
  placeHolder,
  label,
}: SelectDropdownProps<T>) => {
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


  const handleRemoveClick = () => {
    setSelectedOptions([]);
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
                <IonIcon className='ml-1' onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick();
                  }} icon={closeCircleOutline}></IonIcon>
              </span>
            )}
          </div>
        ) : placeHolder}
        {isOpen ? <IonIcon icon={caretUpOutline}></IonIcon> : <IonIcon icon={caretDownOutline}></IonIcon>}
      </div>
      {isOpen && (
        <ul className="multi-select-options">
          {options.map((option) => (
            <>
            <li key={option[idKey]}
              className={`multi-select-option ${selectedOptions.some(o => o[idKey] === option[idKey]) ? 'selected' : ''} flex items-center justify-between`}
              onClick={() => handleOptionClick(option)}
            >
              {option[nameKey]}
              <IonIcon data-tooltip-id={option[idKey]} data-tooltip-content={option[tooltipKey]} aria-hidden="true" icon={informationCircleOutline} slot="start"></IonIcon>
            </li>
            <Tooltip id={option[idKey]} />
            </>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectDropdown;
