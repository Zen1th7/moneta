class TransactionManager {
    /**
     * TRANSACTION MANAGER
     * Handles transaction UI and cash flow tracking
     */

    constructor(dataManager, currencyManager) {
        this.dataManager = dataManager;
        this.currencyManager = currencyManager;

        // Default categories
        const defaultCategories = {
            expense: [
                'Food & Dining', 'Fuel', 'Transportation', 'Housing', 'Utilities',
                'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Personal Care',
                'Subscriptions', 'Other'
            ],
            income: [
                'Salary', 'Investment Return', 'Dividend', 'Freelance', 'Gift', 'Other'
            ],
            transfer: [
                'Between Wallets'
            ]
        };

        const savedCategories = localStorage.getItem('transactionCategories');
        this.categories = savedCategories ? JSON.parse(savedCategories) : defaultCategories;

        this.settingsCategoryType = 'expense'; // Default management type

        this.categoryIcons = {
            'Food & Dining': '🍽️',
            'Fuel': '⛽',
            'Transportation': '🚗',
            'Housing': '🏠',
            'Utilities': '💡',
            'Entertainment': '🎬',
            'Shopping': '🛍️',
            'Healthcare': '⚕️',
            'Education': '📚',
            'Personal Care': '💇',
            'Subscriptions': '📱',
            'Salary': '💼',
            'Investment Return': '📈',
            'Dividend': '💰',
            'Freelance': '💻',
            'Gift': '🎁',
            'Other': '📝',
            'Between Wallets': '↔️'
        };

        this.currentFilter = {
            range: 'all',
            startDate: '',
            endDate: ''
        };

        this.selectedAnalyticsCurrency = null;
        this.currentPage = 1;
        this.itemsPerPage = 7;
        this.analyticsTimeframe = 'monthly'; // 'daily', 'monthly', 'annual'
        this.analyticsDate = new Date(); // Current viewing date for analytics

        this.analyticsTimeframe = 'monthly'; // 'daily', 'monthly', 'annual'
        this.analyticsDate = new Date(); // Current viewing date for analytics

        // Category Translation Map
        this.categoryTranslationMap = {
            'Food & Dining': 'catFoodDining',
            'Fuel': 'catFuel',
            'Transportation': 'catTransportation',
            'Housing': 'catHousing',
            'Utilities': 'catUtilities',
            'Entertainment': 'catEntertainment',
            'Shopping': 'catShopping',
            'Healthcare': 'catHealthcare',
            'Education': 'catEducation',
            'Personal Care': 'catPersonalCare',
            'Subscriptions': 'catSubscriptions',
            'Other': 'catOther',
            'Salary': 'catSalary',
            'Investment Return': 'catInvestmentReturn',
            'Dividend': 'catDividend',
            'Freelance': 'catFreelance',
            'Gift': 'catGift',
            'Between Wallets': 'catBetweenWallets'
        };

        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.setupSettingsEventListeners(); // New Settings listeners
            this.updateCategoryDropdown();
            this.updateWalletDropdown();
            this.toggleTransferFields();
            this.setDefaultDateTime();
            this.render();
            this.renderAnalytics();
            this.renderSettingsCategoryList(); // Initial render of settings list

            // Set up automatic thousand separator formatting for amount inputs
            InputFormatter.formatNumberInput(document.getElementById('transactionAmount'));
            InputFormatter.formatNumberInput(document.getElementById('conversionRate'));
            InputFormatter.formatNumberInput(document.getElementById('transferFee'));

            // Edit Modal Inputs
            InputFormatter.formatNumberInput(document.getElementById('edit_transactionAmount'));
            InputFormatter.formatNumberInput(document.getElementById('edit_transferFee'));
            InputFormatter.formatNumberInput(document.getElementById('edit_conversionRate'));

            console.log('TransactionManager initialized - VERSION 3 (Reload Fix)');
            // alert('App Updated to Version 3! Please try deleting now.'); 
            // Commenting out alert to be less annoying, but the log is key.
        } catch (error) {
            console.error('TransactionManager init error:', error);
            alert('Error initializing Transaction Manager: ' + error.message);
        }
    }

    setupEventListeners() {
        // Transaction type change
        document.getElementById('transactionType').addEventListener('change', (e) => {
            this.updateCategoryDropdown();
            this.toggleTransferFields();
        });

        // Transaction form submit
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Source wallet change (for transfers)
        document.getElementById('transactionWallet').addEventListener('change', (e) => {
            if (document.getElementById('transactionType').value === 'transfer') {
                this.updateTargetWalletDropdown();
                this.checkConversionNeeded();
            } else {
                this.checkConversionNeeded();
            }
        });

        // Target wallet change (for transfers)
        document.getElementById('targetWallet').addEventListener('change', (e) => {
            this.checkConversionNeeded();
        });

        // Amount or conversion rate change - update preview
        document.getElementById('transactionAmount').addEventListener('input', () => {
            this.updateConversionPreview();
        });

        document.getElementById('conversionRate').addEventListener('input', () => {
            this.updateConversionPreview();
        });

        document.getElementById('transferFee').addEventListener('input', () => {
            this.updateConversionPreview();
        });

        // --- EDIT MODE LISTENERS ---
        const editPrefix = 'edit_';

        // Edit form submit
        document.getElementById('editTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTransactionSubmitted();
        });

        // Cancel button
        document.getElementById('cancelEditTransactionBtn').addEventListener('click', () => {
            InputFormatter.dismissKeyboard();
            document.getElementById('transactionEditModal').classList.remove('active');
        });

        // Analytics Timeframe
        document.querySelectorAll('.timeframe-selector .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timeframe-selector .btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.analyticsTimeframe = btn.dataset.timeframe;

                // Toggle UI
                const standardNav = document.getElementById('analyticsStandardNav');
                const customNav = document.getElementById('analyticsCustomNav');

                if (this.analyticsTimeframe === 'custom') {
                    standardNav?.classList.add('hidden');
                    customNav?.classList.remove('hidden');

                    // Default values if empty
                    const startInput = document.getElementById('analyticsStartDate');
                    const endInput = document.getElementById('analyticsEndDate');
                    if (!startInput.value) {
                        const firstOfMonth = new Date();
                        firstOfMonth.setDate(1);
                        startInput.value = firstOfMonth.toISOString().split('T')[0];
                    }
                    if (!endInput.value) {
                        endInput.value = new Date().toISOString().split('T')[0];
                    }
                } else {
                    standardNav?.classList.remove('hidden');
                    customNav?.classList.add('hidden');
                }

                this.renderAnalytics();
            });
        });

        // Analytics Custom Date Listeners
        ['analyticsStartDate', 'analyticsEndDate'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                if (this.analyticsTimeframe === 'custom') {
                    this.renderAnalytics();
                }
            });
        });

        // Analytics Navigation
        document.getElementById('prevTimeframeBtn')?.addEventListener('click', () => this.navigateTimeframe(-1));
        document.getElementById('nextTimeframeBtn')?.addEventListener('click', () => this.navigateTimeframe(1));

        // Pagination
        document.getElementById('prevPageBtn')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPageBtn')?.addEventListener('click', () => this.changePage(1));

        // Edit Type Change
        document.getElementById(`${editPrefix}transactionType`).addEventListener('change', () => {
            this.updateCategoryDropdown(editPrefix);
            this.toggleTransferFields(editPrefix);
        });

        // Edit Wallet Change
        document.getElementById(`${editPrefix}transactionWallet`).addEventListener('change', () => {
            if (document.getElementById(`${editPrefix}transactionType`).value === 'transfer') {
                this.updateTargetWalletDropdown(null, editPrefix);
                this.checkConversionNeeded(editPrefix);
            } else {
                this.checkConversionNeeded(editPrefix);
            }
        });

        // Edit Target Wallet Change
        document.getElementById(`${editPrefix}targetWallet`).addEventListener('change', () => {
            this.checkConversionNeeded(editPrefix);
        });

        // Edit Amount/Rate Updates
        ['transactionAmount', 'conversionRate', 'transferFee'].forEach(field => {
            const id = `${editPrefix}${field}`;
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.updateConversionPreview(editPrefix));
            }
        });

        // Delete transaction from modal
        const deleteBtn = document.getElementById('deleteTransactionBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const id = document.getElementById('edit_transactionId').value;
                if (id) {
                    this.deleteTransaction(id);
                    document.getElementById('transactionEditModal').classList.remove('active');
                }
            });
        }

        // --- FILTER LISTENERS ---
        document.getElementById('filterTransactionsBtn').addEventListener('click', () => {
            this.openFilterModal();
        });

        document.getElementById('closeFilterBtn').addEventListener('click', () => {
            this.closeFilterModal();
        });

        document.getElementById('applyFilterBtn').addEventListener('click', () => {
            this.applyFilter();
        });

        // Filter Presets
        document.querySelectorAll('#filterPresets .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state in UI
                document.querySelectorAll('#filterPresets .btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const range = btn.dataset.range;
                const customDateEl = document.getElementById('customDateRange');

                if (range === 'custom') {
                    customDateEl.classList.remove('hidden');
                } else {
                    customDateEl.classList.add('hidden');
                }
            });
        });
    }

    editTransaction(id) {
        const transaction = this.dataManager.getTransactions().find(t => t.id === id);
        if (!transaction) return;

        // Set editing state
        document.getElementById('edit_transactionId').value = transaction.id;

        // Populate fields with 'edit_' prefix
        document.getElementById('edit_transactionType').value = transaction.type;

        // Update local dropdowns for modal
        const prefix = 'edit_';
        this.updateCategoryDropdown(prefix);
        this.toggleTransferFields(prefix);
        this.updateWalletDropdown(null, prefix);

        document.getElementById('edit_transactionCategory').value = transaction.category;
        document.getElementById('edit_transactionAmount').value = InputFormatter.formatNumber(transaction.amount);
        document.getElementById('edit_transactionWallet').value = transaction.walletId;

        document.getElementById('edit_transactionNote').value = transaction.note || '';
        document.getElementById('edit_transactionDate').value = transaction.date;

        // Handle Transfer Fields
        if (transaction.type === 'transfer') {
            document.getElementById('edit_targetWallet').value = transaction.targetWalletId || '';
            document.getElementById('edit_transferFee').value = InputFormatter.formatNumber(transaction.transferFee || 0);

            this.updateTargetWalletDropdown(null, prefix); // Ensure target dropdown is correct

            // Handle Conversion
            if (transaction.conversionRate && transaction.conversionRate !== 1) {
                document.getElementById('edit_conversionRateField').classList.remove('hidden');
                document.getElementById('edit_conversionRate').value = InputFormatter.formatNumber(transaction.conversionRate);
            } else {
                document.getElementById('edit_conversionRateField').classList.add('hidden');
                document.getElementById('edit_conversionRate').value = '';
            }

            this.checkConversionNeeded(prefix); // Re-run checks
            this.updateConversionPreview(prefix);
        }

        // Show Modal
        document.getElementById('transactionEditModal').classList.add('active');
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction? The wallet balance will be reversed.')) {
            console.log('Calling dataManager.deleteTransaction(' + id + ')...');
            const success = this.dataManager.deleteTransaction(id);
            console.log('Delete result:', success);

            if (success) {
                // 1. Manually update dropdowns JUST IN CASE reload fails
                console.log('Manually updating dropdowns before reload...');
                this.updateWalletDropdown();
                this.updateTargetWalletDropdown();

                // 2. Force Reload
                console.log('Attempting Page Reload...');
                window.location.reload();
                window.location.href = window.location.href;
            } else {
                console.error('Delete failed according to DataManager');
                alert('Failed to delete transaction.');
            }
        }
    }

    updateCategoryDropdown(prefix = '') {
        const type = document.getElementById(`${prefix}transactionType`).value;
        const categorySelect = document.getElementById(`${prefix}transactionCategory`);

        const categories = this.categories[type] || [];
        categorySelect.innerHTML = categories.map(cat => {
            const translatedCat = this.getCategoryTranslation(cat); // Translate for display
            return `<option value="${cat}">${translatedCat}</option>`; // Value stays English/ID
        }).join('');
    }

    getCategoryTranslation(categoryName) {
        if (!window.i18n) return categoryName;
        const key = this.categoryTranslationMap[categoryName];
        return key ? window.i18n.t(key) : categoryName;
    }

    updateWalletDropdown(wallets = null, prefix = '') {
        const walletSelect = document.getElementById(`${prefix}transactionWallet`);
        const currentValue = walletSelect.value;
        const walletData = wallets || this.dataManager.getWallets();

        const defaultText = window.i18n?.t('selectWallet') || 'Select wallet...';
        const optionsHtml = `<option value="" data-i18n="selectWallet">${defaultText}</option>` +
            walletData.map(wallet => {
                const balance = this.currencyManager.format(wallet.balance, wallet.currency);
                return `<option value="${wallet.id}" data-currency="${wallet.currency}">${wallet.name} (${balance})</option>`;
            }).join('');

        walletSelect.innerHTML = optionsHtml;

        // Restore value if it still exists
        if (currentValue) {
            walletSelect.value = currentValue;
        }
    }

    toggleTransferFields(prefix = '') {
        const type = document.getElementById(`${prefix}transactionType`).value;
        const targetField = document.getElementById(`${prefix}field-target`);
        const feeField = document.getElementById(`${prefix}field-fee`);
        const conversionField = document.getElementById(`${prefix}conversionRateField`);
        const conversionPreview = document.getElementById(`${prefix}conversionPreview`);

        // Only run reorder logic for main form (no prefix)
        // The modal has a fixed layout so we don't shuffle fields around
        if (prefix === '') {
            const amountLabel = document.querySelector('label[for="transactionAmount"]');

            if (type === 'transfer') {
                amountLabel.textContent = 'Transfer Amount';
                document.getElementById('field-category').classList.add('hidden');

                targetField.classList.remove('hidden');
                feeField.classList.remove('hidden');
                conversionPreview.classList.remove('hidden');

                this.updateTargetWalletDropdown();
                this.reorderFormFields('transfer');
            } else {
                amountLabel.textContent = 'Amount';
                document.getElementById('field-category').classList.remove('hidden');

                targetField.classList.add('hidden');
                feeField.classList.add('hidden');
                conversionField.classList.add('hidden');
                conversionPreview.classList.add('hidden');

                this.reorderFormFields('regular');
            }
        } else {
            // Modal Logic (Simpler)
            if (type === 'transfer') {
                targetField.classList.remove('hidden');
                feeField.classList.remove('hidden');
                conversionPreview.classList.remove('hidden');

                // Popoulate target wallet & Hide Category
                if (document.getElementById(`${prefix}field-category`)) {
                    document.getElementById(`${prefix}field-category`).classList.add('hidden');
                }
                this.updateTargetWalletDropdown(null, prefix);

                this.checkConversionNeeded(prefix);
            } else {
                targetField.classList.add('hidden');
                feeField.classList.add('hidden');
                conversionField.classList.add('hidden');
                conversionPreview.classList.add('hidden');

                // Show Category
                if (document.getElementById(`${prefix}field-category`)) {
                    document.getElementById(`${prefix}field-category`).classList.remove('hidden');
                }
            }
        }
    }

    reorderFormFields(mode, prefix = '') {
        const formId = prefix === 'edit_' ? 'editTransactionForm' : 'transactionForm';
        const form = document.getElementById(formId);
        if (!form) return;

        // Get all elements
        const type = document.getElementById(`${prefix}field-type`);
        const category = document.getElementById(`${prefix}field-category`);
        const wallet = document.getElementById(`${prefix}field-wallet`);
        const amount = document.getElementById(`${prefix}field-amount`);
        const target = document.getElementById(`${prefix}field-target`);
        const fee = document.getElementById(`${prefix}field-fee`);
        const conversion = document.getElementById(`${prefix}conversionRateField`);
        const preview = document.getElementById(`${prefix}conversionPreview`);
        const note = document.getElementById(`${prefix}field-note`);
        const date = document.getElementById(`${prefix}field-date`);

        // Modal footer/actions
        const actions = prefix === 'edit_' ? form.querySelector('.modal-footer-actions') : document.getElementById('form-actions');

        // Requested Transfer Order: Type > Wallet > Target > Rate > Preview > Amount > Fee > Note > Date
        if (mode === 'transfer') {
            if (type) form.appendChild(type);
            if (wallet) form.appendChild(wallet);
            if (target) form.appendChild(target);
            if (conversion) form.appendChild(conversion);
            if (preview) form.appendChild(preview);
            if (amount) form.appendChild(amount);
            if (fee) form.appendChild(fee);
            if (note) form.appendChild(note);
            if (date) form.appendChild(date);
        } else {
            // Regular Expense/Income Order
            if (type) form.appendChild(type);
            if (category) form.appendChild(category);
            if (wallet) form.appendChild(wallet);
            if (amount) form.appendChild(amount);
            if (note) form.appendChild(note);
            if (date) form.appendChild(date);
        }

        if (actions) form.appendChild(actions);
    }

    updateTargetWalletDropdown(wallets = null, prefix = '') {
        const targetSelect = document.getElementById(`${prefix}targetWallet`);
        const currentValue = targetSelect.value;
        const sourceWalletId = document.getElementById(`${prefix}transactionWallet`).value;

        const walletData = wallets || this.dataManager.getWallets();

        // Filter out source wallet
        const availableWallets = walletData.filter(w => w.id !== sourceWalletId);

        if (availableWallets.length === 0) {
            targetSelect.innerHTML = '<option value="">No other wallets available</option>';
            return;
        }

        const defaultDestText = window.i18n?.t('selectDestinationWallet') || 'Select destination wallet...';
        targetSelect.innerHTML = `<option value="" data-i18n="selectDestinationWallet">${defaultDestText}</option>` +
            availableWallets.map(w => {
                const balance = this.currencyManager.format(w.balance, w.currency);
                return `<option value="${w.id}">${w.name} (${balance})</option>`;
            }).join('');

        if (currentValue && availableWallets.find(w => w.id === currentValue)) {
            targetSelect.value = currentValue; // Restore selection
        }
    }

    checkConversionNeeded(prefix = '') {
        const sourceWalletId = document.getElementById(`${prefix}transactionWallet`).value;
        const targetWalletId = document.getElementById(`${prefix}targetWallet`).value;
        const conversionField = document.getElementById(`${prefix}conversionRateField`);

        if (!sourceWalletId || !targetWalletId) {
            conversionField.classList.add('hidden');
            return false;
        }

        const sourceWallet = this.dataManager.getWalletById(sourceWalletId);
        const targetWallet = this.dataManager.getWalletById(targetWalletId);

        if (!sourceWallet || !targetWallet) return false;

        // Reset conversion preview on change
        document.getElementById(`${prefix}conversionPreview`).innerHTML = '';

        if (sourceWallet.currency !== targetWallet.currency) {
            // Show conversion rate field
            conversionField.classList.remove('hidden');

            // Update label - tricky if label doesn't have unique ID with prefix in my HTML structure
            // In main form: conversionRateLabel
            // In modal: labels don't have IDs? I didn't add IDs to modal labels.
            // Let's assume user knows. Or I can query selector inside the div.
            // For now, functionality first.

            // Update preview
            this.updateConversionPreview(prefix);
        } else {
            conversionField.classList.add('hidden');
            this.updateConversionPreview(prefix);
        }
    }

    updateConversionPreview(prefix = '') {
        const amount = InputFormatter.getNumericValue(document.getElementById(`${prefix}transactionAmount`));
        const sourceWalletId = document.getElementById(`${prefix}transactionWallet`).value;
        const targetWalletId = document.getElementById(`${prefix}targetWallet`).value;
        const fee = InputFormatter.getNumericValue(document.getElementById(`${prefix}transferFee`));
        const previewElement = document.getElementById(`${prefix}conversionPreview`);

        if (!sourceWalletId || !targetWalletId) {
            previewElement.textContent = '';
            return;
        }

        const sourceWallet = this.dataManager.getWalletById(sourceWalletId);
        const targetWallet = this.dataManager.getWalletById(targetWalletId);

        let rate = 1;
        if (sourceWallet.currency !== targetWallet.currency) {
            rate = InputFormatter.getNumericValue(document.getElementById(`${prefix}conversionRate`));
            if (rate === 0) {
                previewElement.textContent = '';
                return;
            }
        }

        if (amount === 0) return;

        const convertedAmount = amount * rate;
        const afterFee = convertedAmount - fee;

        const sourceFormatted = this.currencyManager.format(amount, sourceWallet.currency);
        const convertedFormatted = this.currencyManager.format(convertedAmount, targetWallet.currency);
        const feeFormatted = this.currencyManager.format(fee, targetWallet.currency);
        const finalFormatted = this.currencyManager.format(afterFee, targetWallet.currency);

        let preview = '';
        if (sourceWallet.currency !== targetWallet.currency) {
            preview = `Send: ${sourceFormatted} → Receive: ${convertedFormatted}`;
            if (fee > 0) {
                preview += `<br>Fee: ${feeFormatted} → Final: ${finalFormatted}`;
            }
        } else {
            // Same currency
            if (fee > 0) {
                preview = `Transfer: ${sourceFormatted}<br>Fee: ${feeFormatted} → Final: ${finalFormatted}`;
            }
        }

        previewElement.innerHTML = preview;
    }

    setDefaultDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const dateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById('transactionDate').value = dateTimeStr;
    }

    addTransaction() {
        try {
            const type = document.getElementById('transactionType').value;
            const category = document.getElementById('transactionCategory').value;

            const amount = InputFormatter.getNumericValue(document.getElementById('transactionAmount'));
            const walletId = document.getElementById('transactionWallet').value;
            const note = document.getElementById('transactionNote').value;
            const date = document.getElementById('transactionDate').value;

            if (!walletId) {
                alert('Please select a wallet');
                return;
            }

            // Get source wallet to determine currency
            const sourceWallet = this.dataManager.getWalletById(walletId);

            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            // Handle transfer type
            if (type === 'transfer') {
                const targetWalletId = document.getElementById('targetWallet').value;

                if (!targetWalletId) {
                    alert('Please select a destination wallet for transfer');
                    return;
                }

                const targetWallet = this.dataManager.getWalletById(targetWalletId);

                // Check if conversion needed
                let conversionRate = 1;
                let transferFee = InputFormatter.getNumericValue(document.getElementById('transferFee'));

                if (sourceWallet.currency !== targetWallet.currency) {
                    conversionRate = InputFormatter.getNumericValue(document.getElementById('conversionRate'));

                    if (!conversionRate || conversionRate <= 0) {
                        alert('Please enter a valid conversion rate');
                        return;
                    }
                }

                // UNIFIED TRANSFER TRANSACTION
                const targetAmount = (amount * conversionRate) - transferFee;

                const transaction = {
                    type: 'transfer',
                    category: 'Transfer',
                    amount: amount, // Source Amount (Outflow)
                    currency: sourceWallet.currency,
                    walletId: walletId, // Primary owner (Source)

                    // Unified Transfer Specifics
                    sourceWalletId: walletId,
                    targetWalletId: targetWalletId,
                    targetAmount: targetAmount,
                    targetCurrency: targetWallet.currency,
                    conversionRate: conversionRate,
                    transferFee: transferFee,

                    note: note,
                    date: date
                };

                this.dataManager.addTransaction(transaction);

            } else {
                // Regular transaction
                const transaction = {
                    type,
                    category,
                    amount,
                    currency: sourceWallet.currency,
                    walletId,
                    note,
                    date
                };

                this.dataManager.addTransaction(transaction);
            }

            // Reset form and State
            InputFormatter.dismissKeyboard();
            document.getElementById('transactionForm').reset();

            this.setDefaultDateTime();
            this.render();
            this.renderAnalytics();

            // Update global UI
            if (window.walletManager) {
                window.walletManager.render();
            }
            if (window.app) {
                window.app.updateNetWorth();
            }

            // Refresh toggles
            this.toggleTransferFields();
            this.updateCategoryDropdown();
            this.updateWalletDropdown();
            this.updateTargetWalletDropdown();

        } catch (error) {
            console.error('Add transaction error:', error);
            alert('Error adding transaction: ' + error.message);
        }
    }

    updateTransactionSubmitted() {
        try {
            const editingId = document.getElementById('edit_transactionId').value;
            if (!editingId) return;

            const prefix = 'edit_';
            const type = document.getElementById(`${prefix}transactionType`).value;
            const category = document.getElementById(`${prefix}transactionCategory`).value;
            const amount = InputFormatter.getNumericValue(document.getElementById(`${prefix}transactionAmount`));
            const walletId = document.getElementById(`${prefix}transactionWallet`).value;
            const note = document.getElementById(`${prefix}transactionNote`).value;
            const date = document.getElementById(`${prefix}transactionDate`).value;

            if (!walletId) {
                alert('Please select a wallet');
                return;
            }

            const sourceWallet = this.dataManager.getWalletById(walletId);

            if (amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            let transaction = null;

            if (type === 'transfer') {
                const targetWalletId = document.getElementById(`${prefix}targetWallet`).value;
                if (!targetWalletId) {
                    alert('Please select a destination wallet for transfer');
                    return;
                }
                const targetWallet = this.dataManager.getWalletById(targetWalletId);

                let conversionRate = 1;
                let transferFee = InputFormatter.getNumericValue(document.getElementById(`${prefix}transferFee`));

                if (sourceWallet.currency !== targetWallet.currency) {
                    conversionRate = InputFormatter.getNumericValue(document.getElementById(`${prefix}conversionRate`));
                    if (!conversionRate || conversionRate <= 0) {
                        alert('Please enter a valid conversion rate');
                        return;
                    }
                }

                const targetAmount = (amount * conversionRate) - transferFee;

                transaction = {
                    type: 'transfer',
                    category: 'Transfer',
                    amount: amount,
                    currency: sourceWallet.currency,
                    walletId: walletId,
                    sourceWalletId: walletId,
                    targetWalletId: targetWalletId,
                    targetAmount: targetAmount,
                    targetCurrency: targetWallet.currency,
                    conversionRate: conversionRate,
                    transferFee: transferFee,
                    note: note,
                    date: date
                };
            } else {
                transaction = {
                    type,
                    category,
                    amount,
                    currency: sourceWallet.currency,
                    walletId,
                    note,
                    date
                };
            }

            // Perform Update
            this.dataManager.updateTransaction(editingId, transaction);

            // Close Modal
            InputFormatter.dismissKeyboard();
            document.getElementById('transactionEditModal').classList.remove('active');

            // Reload to ensure safety and fresh state (consistent with previous behavior)
            console.log('Update complete, reloading...');
            window.location.reload();

        } catch (error) {
            console.error('Update transaction error:', error);
            alert('Error updating transaction: ' + error.message);
        }
    }

    navigateTimeframe(direction) {
        if (this.analyticsTimeframe === 'custom') return; // Navigation not used for custom
        const date = new Date(this.analyticsDate);
        if (this.analyticsTimeframe === 'daily') {
            date.setDate(date.getDate() + direction);
        } else if (this.analyticsTimeframe === 'monthly') {
            date.setMonth(date.getMonth() + direction);
        } else if (this.analyticsTimeframe === 'annual') {
            date.setFullYear(date.getFullYear() + direction);
        }
        this.analyticsDate = date;
        this.renderAnalytics();
    }

    changePage(direction) {
        this.currentPage += direction;
        this.render();
    }

    // RENDER
    render() {
        const container = document.getElementById('transactionsContainer');
        const pagination = document.getElementById('historyPagination');
        if (!container) return;

        let transactions = this.dataManager.getTransactions();

        // Apply filtering
        transactions = this.filterTransactionsByDate(transactions);

        if (transactions.length === 0) {
            const noTxMsg = window.i18n?.t('noTransactions') || 'No transactions found for the selected period.';
            container.innerHTML = `
        <div class="card text-center">
          <p style="color: var(--color-text-tertiary);" data-i18n="noTransactions">${noTxMsg}</p>
        </div>
      `;
            pagination?.classList.add('hidden');
            return;
        }

        // Pagination Logic
        const totalPages = Math.ceil(transactions.length / this.itemsPerPage);
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = transactions.slice(start, end);

        // Show recent transactions
        container.innerHTML = pageData.map(t =>
            this.createTransactionItem(t)
        ).join('');

        // Update Pagination Controls
        if (pagination) {
            if (totalPages > 1) {
                pagination.classList.remove('hidden');
                document.getElementById('pageIndicator').textContent = `${window.i18n?.t('page') || 'Page'} ${this.currentPage} ${window.i18n?.t('of') || 'of'} ${totalPages}`;
                document.getElementById('prevPageBtn').disabled = this.currentPage === 1;
                document.getElementById('nextPageBtn').disabled = this.currentPage === totalPages;
            } else {
                pagination.classList.add('hidden');
            }
        }

        // Add click listener to entire item
        container.querySelectorAll('.transaction-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.editTransaction(id);
            });
        });
    }

    filterTransactionsByDate(transactions) {
        if (this.currentFilter.range === 'all') return transactions;

        const now = new Date();
        let startDate, endDate;

        if (this.currentFilter.range === 'custom') {
            startDate = this.currentFilter.startDate ? new Date(this.currentFilter.startDate) : null;
            endDate = this.currentFilter.endDate ? new Date(this.currentFilter.endDate) : null;

            // Set endDate to end of day
            if (endDate) endDate.setHours(23, 59, 59, 999);
        } else {
            const days = parseInt(this.currentFilter.range);
            startDate = new Date();
            startDate.setDate(now.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
            endDate = now;
        }

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            if (startDate && tDate < startDate) return false;
            if (endDate && tDate > endDate) return false;
            return true;
        });
    }

    openFilterModal() {
        document.getElementById('filterModal').classList.add('active');
    }

    closeFilterModal() {
        InputFormatter.dismissKeyboard();
        document.getElementById('filterModal').classList.remove('active');
    }

    applyFilter() {
        const activeBtn = document.querySelector('#filterPresets .btn.active');
        const range = activeBtn ? activeBtn.dataset.range : 'all';

        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;

        this.currentFilter = {
            range,
            startDate,
            endDate
        };

        this.render();
        this.closeFilterModal();

        // Show success toast
        if (window.app) {
            const rangeText = range === 'all' ? 'All Time' :
                range === 'custom' ? 'Custom Range' :
                    `Last ${range} Days`;
            window.app.showToast(`📊 Filter Applied: ${rangeText}`);
        }
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction? The wallet balance will be reversed.')) {
            const success = this.dataManager.deleteTransaction(id);
            if (success) {
                this.render();
                this.renderAnalytics();

                // Update global UI
                if (window.walletManager) window.walletManager.render();
                if (window.app) window.app.updateNetWorth();
            } else {
                alert('Failed to delete transaction.');
            }
        }
    }

    createTransactionItem(transaction) {
        const wallet = this.dataManager.getWalletById(transaction.walletId);
        const walletName = wallet ? wallet.name : 'Unknown';

        const formattedAmount = this.currencyManager.format(transaction.amount, transaction.currency);

        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Icon
        let icon = this.categoryIcons[transaction.category] || '📝';

        // Color
        let amountClass = transaction.type; // income, expense, transfer

        // Handle display
        let displayAmount = formattedAmount;
        let prefix = '';

        if (transaction.type === 'income') {
            prefix = '+';
        } else if (transaction.type === 'expense') {
            prefix = '-';
        } else if (transaction.type === 'transfer') {
            // Check for Unified Transfer fields
            if (transaction.targetAmount && transaction.targetCurrency) {
                const formattedTarget = this.currencyManager.format(transaction.targetAmount, transaction.targetCurrency);
                // Format: -100 USD (Red) -> +3000 NTD (Green)
                displayAmount = `<span style="color:var(--color-danger)">-${formattedAmount}</span> <span style="color:var(--color-text-tertiary)">→</span> <span style="color:var(--color-success)">+${formattedTarget}</span>`;
                prefix = ''; // Prefix handled in string
                amountClass = 'transfer'; // Neutral or special color
            } else if (transaction.isTransferIn) {
                // Legacy support
                prefix = '+';
                amountClass = 'income';
            } else {
                // Legacy support
                prefix = '-';
                amountClass = 'expense';
            }
        }

        return `
      <div class="transaction-item animate-slide-up" data-id="${transaction.id}">
        <div class="transaction-icon ${amountClass}" style="width: 44px; height: 44px; font-size: 1.25rem; flex-shrink: 0;">
          ${icon}
        </div>
        <div class="transaction-details" style="flex: 1; min-width: 0;">
          <div class="transaction-category" style="font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${this.getCategoryTranslation(transaction.category || 'Transfer')}
          </div>
          <div class="transaction-note" style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${transaction.note || walletName} • ${dateStr}
          </div>
        </div>
        <div class="transaction-amount ${amountClass}" style="font-size: 0.95rem; font-weight: 700; text-align: right; flex-shrink: 0; margin-left: var(--space-sm);">
          ${prefix}${displayAmount}
        </div>
      </div>
    `;
    }

    refreshAnalyticsDate() {
        this.analyticsDate = new Date(); // Reset to current time
        this.renderAnalytics();
    }

    renderAnalytics() {
        const container = document.getElementById('analyticsContainer');
        const tabsContainer = document.getElementById('analyticsCurrencyTabs');
        const displayDate = document.getElementById('analyticsDisplayDate');
        if (!container || !tabsContainer) return;

        // Update Display Date
        if (displayDate) {
            if (this.analyticsTimeframe === 'daily') {
                displayDate.textContent = this.analyticsDate.toLocaleDateString(undefined, { dateStyle: 'long' });
            } else if (this.analyticsTimeframe === 'monthly') {
                displayDate.textContent = this.analyticsDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
            } else if (this.analyticsTimeframe === 'annual') {
                displayDate.textContent = this.analyticsDate.getFullYear();
            }
        }

        let timeframeKey;
        if (this.analyticsTimeframe === 'daily') {
            // Fix: Use LOCAL time for key, not UTC (toISOString)
            const year = this.analyticsDate.getFullYear();
            const month = String(this.analyticsDate.getMonth() + 1).padStart(2, '0');
            const day = String(this.analyticsDate.getDate()).padStart(2, '0');
            timeframeKey = `${year}-${month}-${day}`;
        } else if (this.analyticsTimeframe === 'monthly') {
            timeframeKey = `${this.analyticsDate.getFullYear()}-${this.analyticsDate.getMonth() + 1}`;
        } else if (this.analyticsTimeframe === 'annual') {
            timeframeKey = `${this.analyticsDate.getFullYear()}`;
        } else if (this.analyticsTimeframe === 'custom') {
            const startStr = document.getElementById('analyticsStartDate')?.value || '';
            const endStr = document.getElementById('analyticsEndDate')?.value || '';
            if (!startStr || !endStr) {
                container.innerHTML = `
                    <div class="card text-center animate-fade-in">
                        <p class="color-text-tertiary">Please select a valid date range.</p>
                    </div>
                `;
                return;
            }
            timeframeKey = `${startStr}|${endStr}`;
        }

        const statsByCurrency = this.dataManager.getStatsByTimeframe(this.analyticsTimeframe, timeframeKey);
        const expenseBreakdownByCurrency = this.dataManager.getCategoryBreakdownByTimeframe(this.analyticsTimeframe, timeframeKey, 'expense');
        const incomeBreakdownByCurrency = this.dataManager.getCategoryBreakdownByTimeframe(this.analyticsTimeframe, timeframeKey, 'income');

        const currencies = Object.keys(statsByCurrency);

        if (currencies.length === 0) {
            tabsContainer.innerHTML = '';
            const noDataMsg = window.i18n?.t('noData') || 'No transaction data for this period.';
            container.innerHTML = `
                <div class="card text-center animate-fade-in">
                    <p class="color-text-tertiary" data-i18n="noData">${noDataMsg}</p>
                </div>
            `;
            return;
        }

        // Default or sanitize current currency selection
        if (!this.selectedAnalyticsCurrency || !currencies.includes(this.selectedAnalyticsCurrency)) {
            this.selectedAnalyticsCurrency = currencies[0];
        }

        // Render Tabs
        tabsContainer.innerHTML = currencies.map(curr => `
            <div class="tab ${curr === this.selectedAnalyticsCurrency ? 'active' : ''}" data-currency="${curr}">
                ${curr}
            </div>
        `).join('');

        // Add Tab Listeners
        tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.selectedAnalyticsCurrency = tab.dataset.currency;
                this.renderAnalytics();
            });
        });

        // Render Content for Selected Currency
        const currency = this.selectedAnalyticsCurrency;
        const stats = statsByCurrency[currency];
        const expenseBreakdown = expenseBreakdownByCurrency[currency] || {};
        const incomeBreakdown = incomeBreakdownByCurrency[currency] || {};

        container.innerHTML = `
            <div class="analytics-currency-section animate-fade-in">
                <!-- 1. OVERVIEW -->
                <div class="card mb-md" style="border-left: 4px solid var(--color-primary);">
                    <div class="card-header" style="align-items: flex-start; text-align: left; padding-bottom: var(--space-sm);">
                        <h3 class="card-title" style="font-size: 0.9rem;"><span data-i18n="overview">${window.i18n?.t('overview') || 'Overview'}</span> (${currency})</h3>
                    </div>
                    <div class="grid grid-2 gap-md">
                        <div>
                            <div class="form-label" style="font-size: 0.7rem; color: var(--color-text-tertiary);" data-i18n="income">${window.i18n?.t('income') || 'Income'}</div>
                            <div class="wallet-balance" style="color: var(--color-success); font-size: 1.25rem; text-align: left;">
                                ${this.currencyManager.format(stats.income, currency)}
                            </div>
                        </div>
                        <div>
                            <div class="form-label" style="font-size: 0.7rem; color: var(--color-text-tertiary);" data-i18n="expense">${window.i18n?.t('expense') || 'Expenses'}</div>
                            <div class="wallet-balance" style="color: var(--color-danger); font-size: 1.25rem; text-align: left;">
                                ${this.currencyManager.format(stats.expense, currency)}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid gap-md" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                    <!-- 2. INCOME BREAKDOWN -->
                    <div class="card">
                        <div class="card-header" style="align-items: flex-start; text-align: left; padding-bottom: var(--space-sm);">
                            <h3 class="card-title" style="font-size: 0.85rem;">📈 <span data-i18n="incomeBreakdown">${window.i18n?.t('incomeBreakdown') || 'Income Breakdown'}</span></h3>
                        </div>
                        <div class="card-body" style="padding: 0 var(--space-md) var(--space-md);">
                            ${this.renderBreakdownList(incomeBreakdown, currency, 'income')}
                        </div>
                    </div>

                    <!-- 3. EXPENSE BREAKDOWN -->
                    <div class="card">
                        <div class="card-header" style="align-items: flex-start; text-align: left; padding-bottom: var(--space-sm);">
                            <h3 class="card-title" style="font-size: 0.85rem;">📉 <span data-i18n="expenseBreakdown">${window.i18n?.t('expenseBreakdown') || 'Expense Breakdown'}</span></h3>
                        </div>
                        <div class="card-body" style="padding: 0 var(--space-md) var(--space-md);">
                            ${this.renderBreakdownList(expenseBreakdown, currency, 'expense')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBreakdownList(breakdown, currency, type) {
        const entries = Object.entries(breakdown);
        if (entries.length === 0) {
            return `<p class="text-center color-text-tertiary" style="font-size: 0.75rem; padding: var(--space-md) 0;">No ${type} data</p>`;
        }

        // Sort by amount
        const sorted = entries.sort((a, b) => b[1].total - a[1].total);
        const total = sorted.reduce((sum, [_, data]) => sum + data.total, 0);

        return `<ul class="list" style="margin: 0;">` +
            sorted.map(([category, data]) => {
                const icon = this.categoryIcons[category] || '📝';
                const percentage = total > 0 ? Math.round((data.total / total) * 100) : 0;

                // Detailed items with dates
                const itemsList = data.items.map(item => {
                    const date = new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    return `
                        <div class="flex-between" style="font-size: 0.7rem; color: var(--color-text-tertiary); padding: 2px 0;">
                            <span>${date} ${item.note ? '• ' + item.note : ''}</span>
                            <span>${this.currencyManager.format(item.amount, currency)}</span>
                        </div>
                    `;
                }).join('');

                return `
                <li class="list-item" style="padding: var(--space-sm) 0; border-bottom: 1px solid var(--glass-border); flex-direction: column; align-items: stretch;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
                            <span>${icon}</span>
                            <span>${this.getCategoryTranslation(category)}</span>
                        </span>
                        <span style="font-weight: 600; font-size: 0.85rem;">${this.currencyManager.format(data.total, currency)}</span>
                    </div>
                    <div class="progress-container" style="height: 4px; background: var(--color-bg-tertiary); border-radius: 2px; margin-bottom: var(--space-xs);">
                        <div class="progress-bar" style="width: ${percentage}%; height: 100%; border-radius: 2px; background: ${type === 'expense' ? 'var(--color-danger)' : 'var(--color-success)'}"></div>
                    </div>
                    <div class="breakdown-items mt-xs" style="border-left: 2px solid var(--glass-border); padding-left: 8px;">
                        ${itemsList}
                    </div>
                </li>
            `;
            }).join('') +
            `</ul>`;
    }

    // --- Category Management (Settings) ---

    setupSettingsEventListeners() {
        const addBtn = document.getElementById('addCategoryBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addCategory());
        }

        const input = document.getElementById('newCategoryName');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addCategory();
            });
        }

        // Category Type Tabs (Settings)
        const typeTabs = document.querySelectorAll('#categoryTypeTabs .tab');
        typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                typeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.settingsCategoryType = tab.dataset.type;
                this.renderSettingsCategoryList();
            });
        });
    }

    renderSettingsCategoryList() {
        const container = document.getElementById('settingsCategoryList');
        if (!container) return;

        // Show only categories for the active management type
        const categoriesToShow = this.categories[this.settingsCategoryType] || [];

        container.innerHTML = categoriesToShow.map(catName => `
            <div class="category-item">
                <span>${this.categoryIcons[catName] || '📝'} ${this.getCategoryTranslation(catName)}</span>
                <button class="btn-icon-delete" onclick="transactionManager.deleteCategory('${catName}', '${this.settingsCategoryType}')">
                    🗑️
                </button>
            </div>
        `).join('');

        if (categoriesToShow.length === 0) {
            container.innerHTML = `<p class="text-center color-text-tertiary">No ${this.settingsCategoryType} categories found.</p>`;
        }
    }

    addCategory() {
        const input = document.getElementById('newCategoryName');
        const name = input.value.trim();
        if (!name) return;

        const type = this.settingsCategoryType;

        if (!this.categories[type].includes(name)) {
            this.categories[type].push(name);
            this.saveCategories();
            this.renderSettingsCategoryList();
            this.updateCategoryDropdown();
            InputFormatter.dismissKeyboard();
            input.value = '';
            console.log(`Category added to ${type}:`, name);
        } else {
            alert('Category already exists in this list!');
        }
    }

    deleteCategory(name, type) {
        if (confirm(`Delete category "${name}"? This won't affect existing transactions.`)) {
            this.categories[type] = this.categories[type].filter(c => c !== name);
            this.saveCategories();
            this.renderSettingsCategoryList();
            this.updateCategoryDropdown();
            console.log('Category deleted:', name);
        }
    }

    saveCategories() {
        localStorage.setItem('transactionCategories', JSON.stringify(this.categories));
    }
}
