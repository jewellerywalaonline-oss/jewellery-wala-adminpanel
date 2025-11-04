import React, { useState, useRef, useEffect } from 'react';

const NewMultiSelect = ({ 
  category = [], 
  categoryId = [], 
  setCategoryId, 
  placeholder = "Select options..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Ensure category is always an array
  const safeCategory = Array.isArray(category) ? category : [];
  const safeCategoryId = Array.isArray(categoryId) ? categoryId : [];

  // Filter options based on search term
  const filteredOptions = safeCategory.filter(option =>
    option?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option?.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleOptionToggle = (option) => {
    const optionValue = option._id; 
    const isSelected = safeCategoryId.includes(optionValue);
    
    if (isSelected) {
      setCategoryId(safeCategoryId.filter(id => id !== optionValue));
    } else {
      setCategoryId([...safeCategoryId, optionValue]);
    }
  };

  // Get display text for selected items
  const getSelectedText = () => {
    if (safeCategoryId.length === 0) return placeholder;
    if (safeCategoryId.length === 1) {
      const selected = safeCategory.find(item => 
        (item?._id === safeCategoryId[0])
      );
      return selected?.name || selected?.label || selected?.toString() || safeCategoryId[0];
    }
    return `${safeCategoryId.length} items selected`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear all selections handler
  const handleClearAll = (e) => {
    e.stopPropagation(); 
    setCategoryId([]);
  };

  // Toggle dropdown handler for the main button
  const handleMainButtonClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Main Select Button (No nested buttons) */}
      <button
        type="button"
        onClick={handleMainButtonClick}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between hover:border-gray-400 transition-colors z-[9999]"
      >
        <span className={`truncate ${safeCategoryId.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {getSelectedText()}
        </span>
        <div className="flex items-center space-x-2">
          {safeCategoryId.length > 0 && (
            <span
              onClick={handleClearAll}
              className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer z-10 p-1 -m-1" 
              title="Clear all"
              role="button" 
              aria-label="Clear all selections"
            >
              ✕
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className=" absolute !z-[99999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-40">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = option?._id;
                const optionLabel = option?.name || option?.label || option?.toString();
                const isSelected = safeCategoryId.includes(optionValue);

                return (
                  <div
                    key={optionValue || index}
                    onClick={() => handleOptionToggle(option)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    {/* CHECKBOX FIX: ADD readOnly PROP */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      tabIndex={-1} 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm">{optionLabel}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>

          {/* Selected Count */}
          {safeCategoryId.length > 0 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
              {safeCategoryId.length} item{safeCategoryId.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewMultiSelect;