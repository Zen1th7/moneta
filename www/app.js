/**
 * MAIN APP
 * Initializes all managers and handles global app state
 */

class MoneyManagerApp {
    constructor() {
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        try {
            console.log('🚀 App setup starting...');

            // 1. Setup global event listeners FIRST (so sidebar works even if data fails)
            this.setupEventListeners();

            // 2. Initialize managers - assign to global variables
            window.walletManager = new WalletManager(dataManager, currencyManager);
            window.transactionManager = new TransactionManager(dataManager, currencyManager);

            // Re-assign to the variables declared in other files
            walletManager = window.walletManager;
            transactionManager = window.transactionManager;

            // Make app globally accessible
            window.app = this;

            // 3. Initial render
            this.updateNetWorth();

            console.log('💰 Money Manager App initialized successfully!');

            // 4. Hide splash screen with a small delay for better UX
            this.hideSplashScreen();
        } catch (error) {
            console.error('❌ App initialization error:', error);
            // alert('Critical initialization error. Check console.');
        }
    }

    setupEventListeners() {
        // Export JSON button
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Export Excel button
        document.getElementById('exportExcelBtn').addEventListener('click', () => {
            this.exportToExcel();
        });

        // Import data button
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        // Import file input change
        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Bottom navigation (mobile)
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.switchView(item.dataset.view);
            });
        });

        // Theme Buttons (Settings)
        const darkBtn = document.getElementById('theme-dark-btn');
        const lightBtn = document.getElementById('theme-light-btn');

        if (darkBtn) darkBtn.addEventListener('click', () => this.setTheme('dark'));
        if (lightBtn) lightBtn.addEventListener('click', () => this.setTheme('light'));

        // Initialize theme from localStorage
        this.initTheme();
    }

    initTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        this.setTheme(theme, false); // Don't save on init
    }

    setTheme(theme, save = true) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        if (save) {
            localStorage.setItem('theme', theme);
        }

        // Update active button state in Settings
        const darkBtn = document.getElementById('theme-dark-btn');
        const lightBtn = document.getElementById('theme-light-btn');

        if (darkBtn) darkBtn.classList.toggle('active', theme === 'dark');
        if (lightBtn) lightBtn.classList.toggle('active', theme === 'light');

        console.log('🌓 Theme set to:', theme);
    }

    updateNetWorth() {
        // Calculate total for each currency separately
        const totalNTD = currencyManager.getTotalByCurrency('NTD');
        const totalUSD = currencyManager.getTotalByCurrency('USD');
        const totalIDR = currencyManager.getTotalByCurrency('IDR');

        // Format and display each
        document.getElementById('totalNTD').textContent = currencyManager.format(totalNTD, 'NTD');
        document.getElementById('totalUSD').textContent = currencyManager.format(totalUSD, 'USD');
        document.getElementById('totalIDR').textContent = currencyManager.format(totalIDR, 'IDR');
    }

    loadConversionRates() {
        // Conversion rates are now only shown during transfer operations
        // This function is kept for backward compatibility but does nothing
    }

    saveConversionRates() {
        // Conversion rates are now saved per-transfer, not globally
        // This function is kept for backward compatibility
    }

    exportData() {
        try {
            const data = dataManager.exportAllData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `money-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showToast('✅ Data exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            alert('❌ Failed to export data. Please try again.');
        }
    }

    exportToExcel() {
        try {
            const transactions = dataManager.getTransactions();
            const wallets = dataManager.getWallets();

            if (transactions.length === 0 && wallets.length === 0) {
                alert('No data to export!');
                return;
            }

            // --- 1. Transactions Worksheet ---
            const transactionRows = transactions.map(t => {
                const sourceWallet = wallets.find(w => w.id === t.walletId);
                const targetWallet = t.targetWalletId ? wallets.find(w => w.id === t.targetWalletId) : null;

                return {
                    'Date': new Date(t.date).toLocaleString(),
                    'Type': t.type.toUpperCase(),
                    'Category': t.category,
                    'From Wallet': sourceWallet ? `${sourceWallet.name} (${sourceWallet.currency})` : 'Deleted Wallet',
                    'To Wallet/Account': targetWallet ? `${targetWallet.name} (${targetWallet.currency})` : (t.type === 'transfer' ? 'Unknown' : '-'),
                    'Amount': t.amount,
                    'Currency': t.currency,
                    'Fee': t.transferFee || 0,
                    'Conv Rate': t.type === 'transfer' ? (t.conversionRate || 1) : '',
                    'Note': t.note || ''
                };
            });

            const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
            this._autoSizeExcelColumns(wsTransactions);

            // --- 2. Summary Worksheet (Net Worth & Wallets) ---
            const totalNTD = currencyManager.getTotalByCurrency('NTD');
            const totalUSD = currencyManager.getTotalByCurrency('USD');
            const totalIDR = currencyManager.getTotalByCurrency('IDR');

            const summaryHeaders = ['Report Section', 'Details', 'Value'];
            const summaryRows = [
                ['TOTAL NET WORTH', 'NTD Balance', totalNTD],
                ['TOTAL NET WORTH', 'USD Balance', totalUSD],
                ['TOTAL NET WORTH', 'IDR Balance', totalIDR],
                ['', '', ''], // Spacer
                ['WALLET LIST', 'Wallet Name (Platform)', 'Balance']
            ];

            wallets.forEach(w => {
                summaryRows.push([
                    'WALLET',
                    `${w.name} (${w.platform})`,
                    `${w.currency} ${w.balance.toLocaleString()}`
                ]);
            });

            const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
            this._autoSizeExcelColumns(wsSummary);

            // Create Workbook and save
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
            XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

            const filename = `money-manager-export-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);

            this.showToast('✅ Excel file exported successfully!');
        } catch (error) {
            console.error('Excel Export failed:', error);
            alert('❌ Failed to export Excel. Error: ' + error.message);
        }
    }

    _autoSizeExcelColumns(ws) {
        if (!ws['!ref']) return;
        const range = XLSX.utils.decode_range(ws['!ref']);
        const cols = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            let maxLen = 10;
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
                if (cell && cell.v) {
                    const len = cell.v.toString().length;
                    if (len > maxLen) maxLen = len;
                }
            }
            cols.push({ wch: maxLen + 2 });
        }
        ws['!cols'] = cols;
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = dataManager.importAllData(data);

                if (success) {
                    // Refresh all UI
                    this.updateNetWorth();
                    this.loadConversionRates();
                    walletManager.render();
                    transactionManager.render();
                    transactionManager.renderAnalytics();
                    transactionManager.updateWalletDropdown();

                    this.showToast('✅ Data imported successfully!');
                } else {
                    alert('❌ Failed to import data. Please check the file format.');
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert('❌ Failed to import data. Invalid file format.');
            }

            // Reset file input
            document.getElementById('importFileInput').value = '';
        };

        reader.readAsText(file);
    }

    switchView(view) {
        // Update bottom nav active state
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Hide all view sections and show the target one
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetView = document.getElementById(`view-${view}`);
        if (targetView) {
            targetView.classList.add('active');
            // Reset scroll position to top for a clean transition
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }

    hideSplashScreen() {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            // Keep splash visible for at least 1.5s for branding visibility
            setTimeout(() => {
                splash.classList.add('fade-out');
                // Remove from DOM after transition
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 500); // Match CSS transition time
            }, 1500);
        }
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--glass-bg);
      backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--glass-border);
      color: var(--color-text-primary);
      padding: var(--space-md) var(--space-lg);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: var(--z-toast);
      font-weight: 600;
      animation: fadeIn 0.3s ease;
    `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }

    // Utility method to clear all data (useful for development/testing)
    clearAllData() {
        if (dataManager.clearAllData()) {
            this.updateNetWorth();
            this.loadConversionRates();
            walletManager.render();
            transactionManager.render();
            transactionManager.renderAnalytics();
            transactionManager.updateWalletDropdown();
            this.showToast('✅ All data cleared!');
        }
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
  }
`;
document.head.appendChild(style);

// Initialize app
const moneyManagerApp = new MoneyManagerApp();
