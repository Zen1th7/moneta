/**
 * CURRENCY MANAGER
 * Handles currency conversion and formatting
 */

class CurrencyManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currencySymbols = {
            NTD: 'NT$',
            USD: 'US$',
            IDR: 'Rp'
        };
    }

    /**
     * Get current conversion rates
     */
    getRates() {
        return this.dataManager.getConversionRates();
    }

    /**
     * Update conversion rates
     */
    updateRates(usdToNtd, idrToNtd) {
        const rates = {
            usdToNtd: parseFloat(usdToNtd),
            idrToNtd: parseFloat(idrToNtd)
        };
        this.dataManager.saveConversionRates(rates);
        return rates;
    }

    /**
     * Convert any currency to NTD (base currency)
     */
    convertToNTD(amount, fromCurrency) {
        const rates = this.getRates();
        amount = parseFloat(amount);

        if (fromCurrency === 'NTD') {
            return amount;
        } else if (fromCurrency === 'USD') {
            return amount * rates.usdToNtd;
        } else if (fromCurrency === 'IDR') {
            // IDR rate is per 1000, so divide by 1000 first
            return (amount / 1000) * rates.idrToNtd;
        }
        return amount;
    }

    /**
     * Convert NTD to any currency
     */
    convertFromNTD(amount, toCurrency) {
        const rates = this.getRates();
        amount = parseFloat(amount);

        if (toCurrency === 'NTD') {
            return amount;
        } else if (toCurrency === 'USD') {
            return amount / rates.usdToNtd;
        } else if (toCurrency === 'IDR') {
            // IDR rate is per 1000, so multiply by 1000 after conversion
            return (amount / rates.idrToNtd) * 1000;
        }
        return amount;
    }

    /**
     * Convert between any two currencies
     */
    convert(amount, fromCurrency, toCurrency) {
        // First convert to NTD, then to target currency
        const ntdAmount = this.convertToNTD(amount, fromCurrency);
        return this.convertFromNTD(ntdAmount, toCurrency);
    }

    /**
     * Format currency amount with symbol
     */
    format(amount, currency, showSymbol = true) {
        amount = parseFloat(amount);

        // Format number with thousand separators
        let formatted;

        if (currency === 'IDR') {
            // No decimal places for IDR (rupiah)
            formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        } else {
            // 2 decimal places for NTD and USD
            formatted = amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        if (showSymbol) {
            const symbol = this.currencySymbols[currency] || currency;
            return `${symbol} ${formatted}`;
        }

        return formatted;
    }

    /**
     * Format amount with conversion preview
     * Example: "US$ 100.00 (≈ NT$ 3,150.00)"
     */
    formatWithConversion(amount, currency) {
        const mainFormat = this.format(amount, currency);

        if (currency === 'NTD') {
            return mainFormat;
        }

        const ntdAmount = this.convertToNTD(amount, currency);
        const ntdFormat = this.format(ntdAmount, 'NTD');

        return `${mainFormat} <span style="color: var(--color-text-tertiary); font-size: 0.9em;">(≈ ${ntdFormat})</span>`;
    }

    /**
     * Get total net worth in NTD from all wallets
     */
    getTotalNetWorthNTD() {
        const wallets = this.dataManager.getWallets();
        let totalNTD = 0;

        wallets.forEach(wallet => {
            const balanceNTD = this.convertToNTD(wallet.balance, wallet.currency);
            totalNTD += balanceNTD;
        });

        return totalNTD;
    }

    /**
     * Get total balance per currency
     */
    getTotalByCurrency(currency) {
        const wallets = this.dataManager.getWalletsByCurrency(currency);
        console.log(`Calculating total for ${currency}. Wallets found:`, wallets.length);
        const total = wallets.reduce((sum, wallet) => {
            const val = parseFloat(wallet.balance);
            console.log(`Wallet ${wallet.name} (${wallet.currency}): ${wallet.balance} -> parsed: ${val}`);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
        console.log(`Total for ${currency}:`, total);
        return total;
    }

    /**
     * Get currency symbol
     */
    getSymbol(currency) {
        return this.currencySymbols[currency] || currency;
    }

    /**
     * Validate currency code
     */
    isValidCurrency(currency) {
        return ['NTD', 'USD', 'IDR'].includes(currency);
    }

    /**
     * Get all supported currencies
     */
    getSupportedCurrencies() {
        return [
            { code: 'NTD', name: 'New Taiwan Dollar', symbol: 'NT$' },
            { code: 'USD', name: 'US Dollar', symbol: 'US$' },
            { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' }
        ];
    }
}

// Create global instance
const currencyManager = new CurrencyManager(dataManager);
