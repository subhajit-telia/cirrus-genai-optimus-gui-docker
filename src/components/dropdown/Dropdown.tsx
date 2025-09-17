import React, { useState, useEffect, useRef, useMemo } from 'react';
import './Dropdown.css';
import { Tooltip } from 'react-tooltip';
import { IonIcon } from '@ionic/react';
import { FixedSizeList as List } from 'react-window';
import debounce from 'lodash.debounce';
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
  height?: number; // Optional height for the dropdown
  itemSize?: number; // Optional item size for virtualization
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
  height = 200, // Default dropdown height
  itemSize = 35, // Default item size for virtualization
}: SelectDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);

  // Debounce search input to optimize performance
  const debouncedSearch = useMemo(() => debounce((term) => {
    if (term === '') {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter(option =>
          option[nameKey].toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  }, 300), [options, nameKey]);

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

  // Render item in the virtualized list
  const renderItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = filteredOptions[index];
    return (
      <>
        <div
          style={style}
          key={option[idKey]}
          className={`multi-select-option ${selectedOptions.some(o => o[idKey] === option[idKey]) ? 'selected' : ''}`}
          onClick={() => handleOptionClick(option)}
        >
          <span>
            {option[nameKey]}
          </span>
          <IonIcon data-tooltip-id={option[idKey]} data-tooltip-content={option[tooltipKey]} aria-hidden="true" icon={informationCircleOutline} slot="start"></IonIcon>
        </div>
        <Tooltip id={option[idKey]} />
      </>
    );
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      <div className="multi-select-dropdown" onClick={toggleDropdown}>
        <span className='label-name'>{label}</span>
        {selectedOptions.length > 0 ? (
          <div className="selected-options selectedText">
            {multiSelect ? (
              selectedOptions.map((option, index) => (
                <span key={option[idKey]} className="selected-option flex items-center">
                  {option[nameKey]}
                  <IonIcon
                  className="ml-1"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedOptions(selectedOptions.filter(o => o[idKey] !== option[idKey]));
                  }}
                  icon={closeCircleOutline}
                  />
                  {/* {index < selectedOptions.length - 1 && ', '} */}
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
        <div className="dropdown-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="search-input"
          />
          {filteredOptions.length > 0 ? (
            <List
              height={height}
              itemCount={filteredOptions.length}
              itemSize={itemSize}
              width="100%"
              className='listBox'
            >
              {renderItem}
            </List>
          ) : (
            <div className="no-data">No data found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
