/**
 * UTILITIES
 * Helper functions for formatting and input handling
 */

class InputFormatter {
    /**
   * Format number input with thousand separators as user types
   */
    static formatNumberInput(inputElement) {
        inputElement.addEventListener('input', function (e) {
            // Save cursor position
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;
            const oldValueLength = oldValue.length;

            // Remove all commas to get raw number
            let rawValue = this.value.replace(/,/g, '');

            // If empty, just decimal point, or just minus sign, leave it
            if (rawValue === '' || rawValue === '.' || rawValue === '-') {
                return;
            }

            // Split into integer and decimal parts
            const parts = rawValue.split('.');
            let integerPart = parts[0];
            const decimalPart = parts[1];

            // Only format if we have valid digits (allow negative)
            if (!/^-?\d*$/.test(integerPart)) {
                return;
            }

            // Add commas to integer part
            const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            // Reconstruct value with decimal if present
            let newValue = formatted;
            if (decimalPart !== undefined) {
                newValue += '.' + decimalPart;
            }

            // Update the input value
            this.value = newValue;

            // Calculate new cursor position
            const newValueLength = newValue.length;
            const diff = newValueLength - oldValueLength;
            const newCursorPosition = cursorPosition + diff;

            // Restore cursor position
            this.setSelectionRange(newCursorPosition, newCursorPosition);
        });
    }

    /**
     * Get numeric value from formatted input (remove commas)
     */
    static getNumericValue(inputElement) {
        return parseFloat(inputElement.value.replace(/,/g, '')) || 0;
    }

    /**
     * Format a raw number into a string with commas (returns string)
     */
    static formatNumber(value) {
        if (value === null || value === undefined || value === '') return '';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '';

        const parts = numValue.toString().split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const decimalPart = parts[1];

        return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
    }

    /**
     * Set formatted value to input
     */
    static setFormattedValue(inputElement, value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            inputElement.value = '';
            return;
        }

        // Format with commas
        const parts = numValue.toString().split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1];

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        inputElement.value = decimalPart !== undefined
            ? `${integerPart}.${decimalPart}`
            : integerPart;
    }
    /**
     * Force dismiss the virtual keyboard (mobile)
     */
    static dismissKeyboard() {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }
    }
}

// Make globally available
window.InputFormatter = InputFormatter;
