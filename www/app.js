/**
 * MAIN APP
 * Initializes all managers and handles global app state
 */

class MoneyManagerApp {
    constructor() {
        this.init();
    }

    async init() {
        this.lastPauseTime = 0; // Track when app enters background
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

            // 1. Initialize managers - assign to global variables
            window.walletManager = new WalletManager(dataManager, currencyManager);
            window.transactionManager = new TransactionManager(dataManager, currencyManager);
            window.securityManager = new SecurityManager(dataManager, window.i18n);
            window.recurringManager = new RecurringManager(dataManager);
            window.notificationManager = new NotificationManager(dataManager, window.i18n);
            window.budgetManager = new BudgetManager(dataManager, window.transactionManager);
            window.goalManager = new GoalManager(dataManager);
            window.receiptManager = new ReceiptManager(dataManager);

            // Re-assign to the variables declared in other files
            walletManager = window.walletManager;
            transactionManager = window.transactionManager;
            securityManager = window.securityManager;
            const recurringManager = window.recurringManager;
            const notificationManager = window.notificationManager;

            // 2. Setup global event listeners
            this.setupEventListeners();

            // Listen for resume event to fix UI glitches (Android WebView)
            document.addEventListener('resume', () => {
                setTimeout(() => this.forceRedraw(), 100);
            });

            // Link security manager to app to reset grace period on unlock
            securityManager.onUnlock = () => {
                this.resetGracePeriod();
            };

            // 2.5 Start Security Check (Lock Screen)
            securityManager.checkSecurity();

            // 2.6 Check Recurring Transactions
            recurringManager.checkAndExecute();

            // Make app globally accessible
            window.app = this;

            // 3. Initial render
            this.updateNetWorth();

            console.log('💰 Money Manager App initialized successfully!');

            // 4. Hide splash screen with a small delay for better UX
            this.hideSplashScreen();
        } catch (error) {
            console.error('❌ App initialization error:', error);
            // Ensure splash is hidden even on error so user can see something
            setTimeout(() => this.hideSplashScreen(), 1000);

            // Show a non-blocking toast if i18n is available, otherwise alert
            if (window.i18n) {
                console.warn('App partially loaded with errors.');
            } else {
                alert('App initialization error. Check console.');
            }
        }
    }

    setupEventListeners() {
        console.log('🛠️ Setting up event listeners...');

        const safeAddListener = (id, event, callback) => {
            try {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener(event, callback);
                } else {
                    console.warn(`⚠️ Element #${id} not found, skipping listener.`);
                }
            } catch (err) {
                console.error(`❌ Error setting up listener for #${id}:`, err);
            }
        };

        // Export JSON button
        safeAddListener('exportDataBtn', 'click', () => this.exportData());

        // Export Excel button
        safeAddListener('exportExcelBtn', 'click', () => this.exportToExcel());

        // Import data button
        safeAddListener('importDataBtn', 'click', () => {
            const fileInput = document.getElementById('importFileInput');
            if (fileInput) fileInput.click();
        });

        // Import file input change
        safeAddListener('importFileInput', 'change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Delete All Data Button (Danger Zone)
        safeAddListener('deleteAllDataBtn', 'click', () => this.showDeleteDataModal());

        // Delete Data Modal Buttons
        safeAddListener('cancelDeleteDataBtn', 'click', () => this.cancelDeleteData());
        safeAddListener('confirmDeleteDataBtn', 'click', () => this.confirmDeleteData());

        // Bottom navigation (mobile)
        try {
            document.querySelectorAll('.bottom-nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.switchView(item.dataset.view);
                });
            });
        } catch (err) {
            console.error('❌ Error setting up bottom nav listeners:', err);
        }

        // Theme Buttons (Settings)
        safeAddListener('theme-dark-btn', 'click', () => this.setTheme('dark'));
        safeAddListener('theme-light-btn', 'click', () => this.setTheme('light'));

        // Initialize theme from localStorage
        try {
            this.initTheme();
        } catch (err) {
            console.error('❌ Error initializing theme:', err);
        }

        // Language Selector
        try {
            this.setupLanguageSelector();
        } catch (err) {
            console.error('❌ Error setting up language selector:', err);
        }

        // Currency Settings
        try {
            this.setupCurrencySettings();
        } catch (err) {
            console.error('❌ Error setting up currency settings:', err);
        }

        // Biometric Toggle (Settings)
        try {
            this.setupBiometricSettings();
        } catch (err) {
            console.error('❌ Error setting up biometric settings:', err);
        }

        // Base Currency (Settings)
        try {
            this.setupBaseCurrencySettings();
        } catch (err) {
            console.error('❌ Error setting up base currency settings:', err);
        }

        // Manage Recurring Transactions Button
        try {
            if (window.recurringManager) {
                window.recurringManager.initUI();
            }
        } catch (err) {
            console.error('❌ Error initializing recurring manager UI:', err);
        }

        // Notifications (Settings)
        try {
            this.setupNotificationSettings();
        } catch (err) {
            console.error('❌ Error setting up notification settings:', err);
        }

        // 3. Initialise Notifications
        try {
            if (window.notificationManager) {
                window.notificationManager.init();
            }
        } catch (err) {
            console.error('❌ Error initializing notification manager:', err);
        }
    }

    forceRedraw() {
        // Force layout recalculation to fix rendering glitches
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }

    setupBiometricSettings() {
        const toggle = document.getElementById('biometricToggle');
        if (!toggle) return;

        // Set initial state
        toggle.checked = dataManager.isBiometricEnabled();

        toggle.addEventListener('change', async (e) => {
            const enabled = e.target.checked;

            if (enabled) {
                // Verify biometrics are actually available before enabling
                const plugin = window.Capacitor?.Plugins?.NativeBiometric;
                if (plugin) {
                    try {
                        const result = await plugin.isAvailable();
                        if (result.isAvailable) {
                            dataManager.setBiometricEnabled(true);
                            this.showToast(window.i18n.t('biometricEnabledToast'));
                        } else {
                            alert('❌ Biometrics not available on this device.');
                            toggle.checked = false;
                        }
                    } catch (err) {
                        console.error('Biometric check error:', err);
                        toggle.checked = false;
                    }
                } else {
                    // Simulation mode or web
                    dataManager.setBiometricEnabled(true);
                    this.showToast(window.i18n.t('biometricSimulationToast'));
                }
            } else {
                dataManager.setBiometricEnabled(false);
                this.showToast(window.i18n.t('biometricDisabledToast'));
            }
        });

        // Unlock button handler for overlay
        const unlockBtn = document.getElementById('unlock-btn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                if (window.securityManager) window.securityManager.authenticate();
            });
        }
    }

    setupNotificationSettings() {
        const reminderToggle = document.getElementById('reminderToggle');
        const quickActionsToggle = document.getElementById('quickActionsToggle');

        if (!reminderToggle || !quickActionsToggle) return;

        // Set initial state
        reminderToggle.checked = dataManager.isReminderEnabled();
        quickActionsToggle.checked = dataManager.isQuickActionsEnabled();

        // Reminder Toggle
        reminderToggle.addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            dataManager.setReminderEnabled(enabled);

            if (window.notificationManager) {
                if (enabled) {
                    await window.notificationManager.scheduleDailyReminder();
                    this.showToast('🔔 ' + window.i18n.t('dailyReminder') + ' ON');
                } else {
                    await window.notificationManager.cancelDailyReminder();
                    this.showToast('🔕 ' + window.i18n.t('dailyReminder') + ' OFF');
                }
            }
        });

        // Quick Actions Toggle
        quickActionsToggle.addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            dataManager.setQuickActionsEnabled(enabled);

            if (window.notificationManager) {
                if (enabled) {
                    await window.notificationManager.showQuickActions();
                    this.showToast('⚡ ' + window.i18n.t('quickActions') + ' ON');
                } else {
                    await window.notificationManager.cancelQuickActions();
                    this.showToast('🛑 ' + window.i18n.t('quickActions') + ' OFF');
                }
            }
        });
    }

    setupBaseCurrencySettings() {
        const select = document.getElementById('baseCurrencySelect');
        if (!select) return;

        // Set initial state
        select.value = dataManager.getBaseCurrency();

        select.addEventListener('change', (e) => {
            const currency = e.target.value;
            dataManager.setBaseCurrency(currency);
            this.showToast(window.i18n.t('baseCurrencySetToast').replace('{currency}', currency));

            // Refresh dashboards and analytics
            this.updateNetWorth();
            if (window.transactionManager) {
                window.transactionManager.renderAnalytics();
            }
        });
    }

    setupLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (!selector) return;

        const buttons = selector.querySelectorAll('[data-lang]');

        // Set initial active state
        const currentLang = window.i18n ? window.i18n.currentLanguage : 'en';
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });

        // Add click handlers
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                if (window.i18n) {
                    window.i18n.setLanguage(lang);
                    // Update active button state
                    buttons.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
                    console.log('🌐 Language set to:', lang);

                    // Re-render dynamic components to ensure Full Translation
                    if (window.transactionManager) {
                        // Wallets
                        window.transactionManager.updateWalletDropdown();
                        window.transactionManager.updateWalletDropdown(null, 'edit_');

                        // Categories (Dropdowns & Settings List)
                        window.transactionManager.updateCategoryDropdown();
                        window.transactionManager.updateCategoryDropdown('edit_');
                        window.transactionManager.renderSettingsCategoryList();

                        // Transaction History (to update category names in list)
                        window.transactionManager.render();

                        // Analytics (already handles data-i18n, but safe to re-render if needed)
                        window.transactionManager.renderAnalytics();
                    }

                    if (window.recurringManager) {
                        // Recurring List
                        window.recurringManager.renderList();
                        // Recurring Dropdowns in Modals
                        window.recurringManager.updateCategoryDropdown('edit_recurring');
                        window.recurringManager.updateWalletDropdown('edit_recurring');
                    }

                    if (window.walletManager) {
                        window.walletManager.render(); // Re-render wallets (for empty states dynamic text)
                    }
                }
            });
        });

        // Apply initial translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }

        // 3. App State Listener (Re-auth on Resume)
        const checkAuth = () => {
            const now = Date.now();
            const timeInBackground = now - this.lastPauseTime;

            console.log(`🔄 App status check: Time in background = ${timeInBackground}ms`);

            // Only trigger if we've been gone for more than 2 seconds
            // This ignores focus flips from biometric dialogs or notifications
            if (timeInBackground > 2000) {
                console.log('🛡️ Threshold met, checking security...');
                if (window.securityManager) {
                    window.securityManager.checkSecurity();
                }
            } else {
                console.log('🛡️ Threshold NOT met, skipping lock.');
            }
        };

        if (window.Capacitor && window.Capacitor.Plugins.App) {
            window.Capacitor.Plugins.App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    checkAuth();
                } else {
                    this.lastPauseTime = Date.now();
                }
            });
        }
    }

    setupCurrencySettings() {
        const rates = dataManager.getConversionRates();
        const usdNtdInput = document.getElementById('rate-usd-ntd');
        const usdIdrInput = document.getElementById('rate-usd-idr');
        const ntdIdrInput = document.getElementById('rate-ntd-idr');
        const saveBtn = document.getElementById('saveRatesBtn');

        if (!usdNtdInput || !usdIdrInput || !ntdIdrInput || !saveBtn) return;

        // Load current rates and add live formatting
        if (window.InputFormatter) {
            window.InputFormatter.setFormattedValue(usdNtdInput, rates.usdToNtd);
            window.InputFormatter.setFormattedValue(usdIdrInput, rates.usdToIdr);
            window.InputFormatter.setFormattedValue(ntdIdrInput, rates.ntdToIdr);

            window.InputFormatter.formatNumberInput(usdNtdInput);
            window.InputFormatter.formatNumberInput(usdIdrInput);
            window.InputFormatter.formatNumberInput(ntdIdrInput);
        } else {
            usdNtdInput.value = rates.usdToNtd;
            usdIdrInput.value = rates.usdToIdr;
            ntdIdrInput.value = rates.ntdToIdr;
        }

        saveBtn.addEventListener('click', () => {
            const newRates = {
                usdToNtd: InputFormatter.getNumericValue(usdNtdInput),
                usdToIdr: InputFormatter.getNumericValue(usdIdrInput),
                ntdToIdr: InputFormatter.getNumericValue(ntdIdrInput)
            };

            if (isNaN(newRates.usdToNtd) || isNaN(newRates.usdToIdr) || isNaN(newRates.ntdToIdr) ||
                newRates.usdToNtd <= 0 || newRates.usdToIdr <= 0 || newRates.ntdToIdr <= 0) {
                this.showToast(window.i18n.t('invalidRatesToast'));
                return;
            }

            dataManager.saveConversionRates(newRates);

            // Re-render components that depend on rates
            if (window.walletManager) window.walletManager.render();
            if (window.transactionManager) {
                window.transactionManager.renderAnalytics();
            }
            this.updateNetWorth();

            this.showToast('✅ ' + (window.i18n ? window.i18n.t('ratesUpdated') : 'Rates updated!'));
        });
    }

    resetGracePeriod() {
        // Sets lastPauseTime to now, giving the user 2 seconds of "grace"
        // right after they unlock or perform an action that returns focus
        this.lastPauseTime = Date.now();
        console.log('🛡️ Grace period reset. Last pause set to now.');
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

    async exportData() {
        try {
            const data = dataManager.exportAllData();
            const json = JSON.stringify(data, null, 2);
            const filename = `smart-money-backup-${new Date().toISOString().split('T')[0]}.json`;

            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                // JSON is plain text, so we use isBase64 = false
                await this.handleNativeExport(filename, json, false);
            } else {
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showToast(window.i18n.t('dataExportedToast'));
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('❌ Failed to export data. Please try again.');
        }
    }

    async handleNativeExport(filename, data, isBase64) {
        try {
            const { Filesystem, Share } = window.Capacitor.Plugins;

            if (!Filesystem || !Share) {
                throw new Error("Native plugins not available. Please ensure Cap Sync was run.");
            }

            // Write file
            let result;
            try {
                // Try writing to CACHE with the requested encoding
                result = await Filesystem.writeFile({
                    path: filename,
                    data: data,
                    directory: 'CACHE',
                    encoding: isBase64 ? 'base64' : 'utf8'
                });
            } catch (writeErr) {
                // Fallback: If 'base64' encoding fails (unsupported encoding error), 
                // try omitting it. Some Android systems handle binary defaults automatically if formatted as base64 string.
                if (isBase64 && writeErr.message && writeErr.message.toLowerCase().includes('encoding')) {
                    result = await Filesystem.writeFile({
                        path: filename,
                        data: data,
                        directory: 'CACHE'
                    });
                } else {
                    throw writeErr;
                }
            }

            try {
                await Share.share({
                    title: filename,
                    url: result.uri,
                    dialogTitle: 'Save your file'
                });
                this.showToast(window.i18n.t('exportProcessedToast'));
            } catch (shareErr) {
                // Ignore cancellation - user likely just closed the share sheet
                if (shareErr.message && shareErr.message.toLowerCase().includes('canceled')) {
                    this.showToast(window.i18n.t('exportFinishedToast'));
                } else {
                    throw shareErr;
                }
            }
        } catch (e) {
            console.error('Native export error:', e);
            alert('❌ Native export failed: ' + e.message);
        } finally {
            // Force redraw to fix UI glitches after returning from native share sheet
            setTimeout(() => this.forceRedraw(), 300);
        }
    }

    async exportToExcel() {
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
                    [window.i18n.t('date')]: new Date(t.date).toLocaleString(),
                    [window.i18n.t('type')]: window.i18n.t(t.type), // income, expense, transfer
                    [window.i18n.t('category')]: window.transactionManager ? window.transactionManager.getCategoryTranslation(t.category) : t.category,
                    [window.i18n.t('wallet')]: sourceWallet ? `${sourceWallet.name} (${sourceWallet.currency})` : window.i18n.t('deletedWallet'),
                    [window.i18n.t('targetWallet')]: targetWallet ? `${targetWallet.name} (${targetWallet.currency})` : (t.type === 'transfer' ? window.i18n.t('unknown') : '-'),
                    [window.i18n.t('amount')]: t.amount,
                    [window.i18n.t('currency')]: t.currency,
                    [window.i18n.t('transferFee')]: t.transferFee || 0,
                    [window.i18n.t('conversionRate')]: t.type === 'transfer' ? (t.conversionRate || 1) : '',
                    [window.i18n.t('note')]: t.note || ''
                };
            });

            const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
            this._autoSizeExcelColumns(wsTransactions);

            // --- 2. Summary Worksheet (Net Worth & Wallets) ---
            const totalNTD = currencyManager.getTotalByCurrency('NTD');
            const totalUSD = currencyManager.getTotalByCurrency('USD');
            const totalIDR = currencyManager.getTotalByCurrency('IDR');

            const summaryHeaders = [window.i18n.t('reportSection'), window.i18n.t('details'), window.i18n.t('value')];
            const summaryRows = [
                [window.i18n.t('totalNetWorth'), window.i18n.t('balance') + ' (NTD)', totalNTD],
                [window.i18n.t('totalNetWorth'), window.i18n.t('balance') + ' (USD)', totalUSD],
                [window.i18n.t('totalNetWorth'), window.i18n.t('balance') + ' (IDR)', totalIDR],
                ['', '', ''], // Spacer
                [window.i18n.t('walletList'), window.i18n.t('walletNamePlatform'), window.i18n.t('balance')]
            ];

            wallets.forEach(w => {
                summaryRows.push([
                    window.i18n.t('wallet'),
                    `${w.name} (${w.platform})`,
                    `${w.currency} ${w.balance.toLocaleString()}`
                ]);
            });

            const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryRows]);
            this._autoSizeExcelColumns(wsSummary);

            // Create Workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsSummary, window.i18n.t('summary'));
            XLSX.utils.book_append_sheet(wb, wsTransactions, window.i18n.t('transactions'));

            const filename = `smart-money-export-${new Date().toISOString().split('T')[0]}.xlsx`;

            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                // Generate base64 for native sharing
                const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
                // Pass true for isBase64
                await this.handleNativeExport(filename, base64, true);
            } else {
                XLSX.writeFile(wb, filename);
                this.showToast(window.i18n.t('excelExportedToast'));
            }
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

    showDeleteDataModal() {
        const modal = document.getElementById('deleteDataModal');
        const confirmBtn = document.getElementById('confirmDeleteDataBtn');
        const timerText = document.getElementById('deleteDataTimerText');

        if (!modal || !confirmBtn || !timerText) return;

        // Reset state
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
        modal.classList.add('active');

        // Start Timer
        this.startDeleteTimer(confirmBtn, timerText);
    }

    startDeleteTimer(btn, textSpan) {
        let seconds = 5;
        const proceedText = window.i18n.t('proceed');
        const timerTemplate = window.i18n.t('proceedTimer');

        // Initial text
        textSpan.textContent = timerTemplate.replace('{s}', seconds);

        this.deleteTimer = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                textSpan.textContent = timerTemplate.replace('{s}', seconds);
            } else {
                clearInterval(this.deleteTimer);
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                textSpan.textContent = proceedText;
            }
        }, 1000);
    }

    cancelDeleteData() {
        const modal = document.getElementById('deleteDataModal');
        if (modal) modal.classList.remove('active');
        if (this.deleteTimer) clearInterval(this.deleteTimer);
    }

    confirmDeleteData() {
        if (confirm(window.i18n.t('confirmDeleteAllData'))) {
            // Check again for safety (double confirm handled by browser alert usually, or just proceed)
            // But we already have a 5s timer modal. Just double check via simple alert or just do it?
            // User requirement: "when user press it, please show a warning notification... then the proceed button can be pressed".
            // The modal IS the warning notification. So pressing "Proceed" should execute.

            try {
                // Clear all data
                localStorage.clear();
                this.showToast(window.i18n.t('allDataClearedToast'));

                // Reload app to reset state completely
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (e) {
                console.error('Delete data failed:', e);
                alert('Failed to delete data: ' + e.message);
            }
        }
    }

    showDeleteDataModal() {
        const modal = document.getElementById('deleteDataModal');
        const confirmBtn = document.getElementById('confirmDeleteDataBtn');
        const timerText = document.getElementById('deleteDataTimerText');

        if (!modal || !confirmBtn || !timerText) return;

        // Reset state
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
        modal.classList.add('active');

        // Start Timer
        this.startDeleteTimer(confirmBtn, timerText);
    }

    startDeleteTimer(btn, textSpan) {
        let seconds = 5;
        const proceedText = window.i18n.t('proceed');
        const timerTemplate = window.i18n.t('proceedTimer');

        // Initial text
        textSpan.textContent = timerTemplate.replace('{s}', seconds);

        this.deleteTimer = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                textSpan.textContent = timerTemplate.replace('{s}', seconds);
            } else {
                clearInterval(this.deleteTimer);
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                textSpan.textContent = proceedText;
            }
        }, 1000);
    }

    cancelDeleteData() {
        const modal = document.getElementById('deleteDataModal');
        if (modal) modal.classList.remove('active');
        if (this.deleteTimer) clearInterval(this.deleteTimer);
    }

    confirmDeleteData() {
        try {
            // Clear all data
            localStorage.clear();
            this.showToast(window.i18n.t('allDataClearedToast'));

            // Reload app to reset state completely
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (e) {
            console.error('Delete data failed:', e);
            alert('Failed to delete data: ' + e.message);
        }
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = dataManager.importAllData(data);

                if (success) {
                    // 1. Reload data in managers
                    if (window.transactionManager) {
                        window.transactionManager.reloadCategories();
                    }

                    // 2. Refresh all UI
                    this.updateNetWorth();
                    this.loadConversionRates();
                    walletManager.render();
                    transactionManager.render();
                    transactionManager.renderAnalytics();
                    transactionManager.updateWalletDropdown();
                    transactionManager.updateCategoryDropdown();
                    transactionManager.renderSettingsCategoryList();

                    this.showToast(window.i18n.t('importSuccess'));
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

            // Refresh Analytics date if switching to analytics
            if (view === 'analytics' && window.transactionManager) {
                window.transactionManager.refreshAnalyticsDate();
            }

            // Reset Transaction History pagination if switching to transactions
            if (view === 'transactions' && window.transactionManager) {
                window.transactionManager.resetPagination();
            }

            // Refresh budgets on switching to budgets view
            if (view === 'budgets' && window.budgetManager) {
                window.budgetManager.render();
            }

            // Refresh goals on switching to goals view
            if (view === 'goals' && window.goalManager) {
                window.goalManager.render();
            }
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
            this.showToast(window.i18n.t('allDataClearedToast'));
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
