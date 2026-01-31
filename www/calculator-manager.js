/**
* CALCULATOR MANAGER
* Provides an overlay keyboard for arithmetic operations on numeric inputs
*/

class CalculatorManager {
    constructor() {
        this.currentInput = null;
        this.expression = '';
        this.result = 0;
        this.isActive = false;

        // Wait for DOM to ensure modal is available
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Setup listeners for calculator buttons
        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = btn.dataset.val;
                this.handleInput(val);

                // Add haptic feedback if available (native)
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(10);
                }
            });
        });

        // Close calculator on overlay click (outside container)
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hide();
            });
        }
    }

    show(inputElement) {
        if (!inputElement) return;
        this.currentInput = inputElement;

        // Get current value from input (strip commas)
        const currentVal = inputElement.value.replace(/,/g, '');
        // If it's 0 or empty, starts fresh. If it has value, starts with it.
        this.expression = (currentVal === '0' || !currentVal) ? '' : currentVal;
        this.result = parseFloat(currentVal) || 0;

        this.updateDisplay();

        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.classList.add('active');
            this.isActive = true;

            // Focus prevention for native keyboard
            if (window.InputFormatter) window.InputFormatter.dismissKeyboard();
        }
    }

    hide() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.classList.remove('active');
            this.isActive = false;
        }
        this.currentInput = null;
    }

    handleInput(val) {
        if (!val) return;

        if (val === 'C') {
            this.expression = '';
            this.result = 0;
        } else if (val === 'DEL') {
            this.expression = this.expression.toString().slice(0, -1);
        } else if (val === '=') {
            this.calculate();
            this.expression = this.result.toString();
        } else if (val === 'DONE') {
            this.calculate();
            this.applyResult();
            this.hide();
        } else {
            // Numbers and Operators
            const lastChar = this.expression.toString().slice(-1);
            const operators = ['+', '-', '*', '÷'];

            // Prevent double operators
            if (operators.includes(val) && (operators.includes(lastChar) || this.expression === '')) {
                // If expression is empty and val is minus, allow it
                if (this.expression === '' && val === '-') {
                    this.expression = '-';
                }
                return;
            }

            // Prevent double decimals in one number part
            if (val === '.') {
                const parts = this.expression.toString().split(/[+\-*÷]/);
                const lastPart = parts[parts.length - 1];
                if (lastPart.includes('.')) return;
            }

            this.expression += val;
        }

        this.calculate(); // Live preview
        this.updateDisplay();
    }

    calculate() {
        try {
            if (!this.expression || this.expression === '-') {
                this.result = 0;
                return;
            }

            // Conversion for evaluation
            let evalExpr = this.expression.toString()
                .replace(/÷/g, '/')
                .replace(/×/g, '*');

            // Sanity check: remove trailing operator for eval
            evalExpr = evalExpr.replace(/[+\-*/÷]$/, '');

            // Safe evaluation using simple Parser (numbers and basic operators only)
            if (/^[0-9+\-*/.() ]+$/.test(evalExpr)) {
                this.result = new Function('return ' + evalExpr)();

                // Keep precision handled for money
                this.result = Math.round(this.result * 100) / 100;
            }
        } catch (e) {
            console.warn('Calc eval error:', e);
            // Don't update result on error, just keep last valid one
        }
    }

    updateDisplay() {
        const exprDiv = document.getElementById('calc-expression');
        const resultDiv = document.getElementById('calc-result');
        if (exprDiv) exprDiv.textContent = this.expression || '0';
        if (resultDiv) {
            const displayResult = window.InputFormatter ? window.InputFormatter.formatNumber(this.result) : this.result;
            resultDiv.textContent = displayResult || '0';
        }
    }

    applyResult() {
        if (this.currentInput) {
            if (window.InputFormatter) {
                window.InputFormatter.setFormattedValue(this.currentInput, this.result);
            } else {
                this.currentInput.value = this.result;
            }
            // Trigger events
            this.currentInput.dispatchEvent(new Event('input', { bubbles: true }));
            this.currentInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Global instance
window.calculatorManager = new CalculatorManager();
