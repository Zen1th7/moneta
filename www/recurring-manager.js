/**
 * RECURRING MANAGER
 * Handles automated transaction execution based on schedules
 */

class RecurringManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Check all recurring transactions and execute those that are due
     */
    async checkAndExecute() {
        console.log('📅 Checking for due recurring transactions...');
        const recurringTransactions = this.dataManager.getRecurringTransactions();
        const now = new Date();
        // 90-day catch-up cap: skip occurrences older than this
        const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        let executionCount = 0;

        for (let recurring of recurringTransactions) {
            // Skip paused templates
            if (recurring.isPaused) continue;

            let nextRun = new Date(recurring.nextRunDate);

            // If nextRun is before the 90-day cutoff, fast-forward it to the cutoff boundary
            while (nextRun < cutoff) {
                nextRun = this.calculateNextDate(nextRun, recurring.frequency);
            }

            let thisTemplateCount = 0;
            // While the next run date is in the past, execute and advance
            while (nextRun <= now) {
                console.log(`💸 Executing recurring transaction: ${recurring.note || 'Untitled'}`);

                const transaction = {
                    type: recurring.type,
                    amount: recurring.amount,
                    currency: recurring.currency,
                    category: recurring.category,
                    walletId: recurring.walletId,
                    note: recurring.note + " (Auto)",
                    date: nextRun.toISOString()
                };

                this.dataManager.addTransaction(transaction);
                executionCount++;
                thisTemplateCount++;

                nextRun = this.calculateNextDate(nextRun, recurring.frequency);
            }

            if (thisTemplateCount > 0) {
                this.dataManager.updateRecurringTransaction(recurring.id, {
                    nextRunDate: nextRun.toISOString(),
                    lastRunDate: new Date().toISOString()
                });
            }
        }

        if (executionCount > 0) {
            console.log(`✅ Automated ${executionCount} transactions.`);
            if (window.app) {
                window.app.updateNetWorth();
                this._showCatchUpBanner(executionCount);
            }
        } else {
            console.log('📅 No recurring transactions due.');
        }
    }

    /**
     * Calculate the next date based on frequency
     * @param {Date} date - The current run date
     * @param {string} frequency - daily, monthly, yearly
     * @returns {Date} - The next calculated date
     */
    calculateNextDate(date, frequency) {
        const next = new Date(date);
        switch (frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        return next;
    }

    _showCatchUpBanner(count) {
        const existing = document.getElementById('recurringCatchUpBanner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'recurringCatchUpBanner';
        banner.style.cssText = `
            position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
            background: var(--glass-bg); backdrop-filter: blur(var(--glass-blur));
            border: 1px solid var(--color-primary); color: var(--color-text-primary);
            padding: var(--space-sm) var(--space-md); border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl); z-index: var(--z-toast);
            display: flex; align-items: center; gap: var(--space-sm);
            font-size: 0.85rem; font-weight: 600; max-width: 90vw;
        `;
        banner.innerHTML = `
            <span>⚡ ${count} recurring transaction${count > 1 ? 's' : ''} were automatically added</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:1rem;padding:0 4px;">&times;</button>
        `;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 8000);
    }

    pauseRecurring(id) {
        this.dataManager.updateRecurringTransaction(id, { isPaused: true });
        this.renderList();
    }

    resumeRecurring(id) {
        this.dataManager.updateRecurringTransaction(id, {
            isPaused: false,
            nextRunDate: new Date().toISOString()
        });
        this.renderList();
    }

    /**
     * Get projected transactions for a specific date range
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns {Array} List of projected transaction objects
     */
    getProjectedTransactions(startDate, endDate) {
        const projected = [];
        const recurringList = this.dataManager.getRecurringTransactions();

        // Normalize dates to start of day for comparison
        const rangeStart = new Date(startDate);
        rangeStart.setHours(0, 0, 0, 0);

        const rangeEnd = new Date(endDate);
        rangeEnd.setHours(23, 59, 59, 999);

        recurringList.forEach(recurring => {
            let nextRun = new Date(recurring.nextRunDate);
            nextRun.setHours(0, 0, 0, 0);

            // Project forward until end date
            while (nextRun <= rangeEnd) {
                // Only include if within range
                if (nextRun >= rangeStart) {
                    projected.push({
                        id: `proj_${recurring.id}_${nextRun.getTime()}`, // Virtual ID
                        type: recurring.type,
                        amount: recurring.amount,
                        currency: recurring.currency,
                        category: recurring.category,
                        walletId: recurring.walletId,
                        note: recurring.note + " (Projected)",
                        date: nextRun.toISOString(),
                        isProjected: true // Flag for UI distinction if needed
                    });
                }
                nextRun = this.calculateNextDate(nextRun, recurring.frequency);
            }
        });

        return projected;
    }

    /**
     * UI METHODS
     */

    initUI() {
        console.log('🔄 Initializing Recurring Manager UI...');

        // Modal listeners
        const editModal = document.getElementById('recurringEditModal');
        const closeEditBtn = document.getElementById('closeRecurringEditBtn');
        const deleteBtn = document.getElementById('deleteRecurringBtn');
        const editForm = document.getElementById('editRecurringForm');

        // Form interactivity
        const typeSelect = document.getElementById('edit_recurringType');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.updateCategoryDropdown('edit_recurring');
                this.toggleTransferFields('edit_recurring');
            });
        }

        if (closeEditBtn) {
            closeEditBtn.addEventListener('click', () => {
                editModal.classList.remove('active');
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const id = deleteBtn.dataset.id;
                if (id) {
                    this.deleteRecurring(id);
                    editModal.classList.remove('active');
                }
            });
        }

        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditFormSubmit(e));
        }

        this.renderList();
    }

    renderList() {
        const container = document.getElementById('recurringListContainer');
        if (!container) return;

        const recurringTransactions = this.dataManager.getRecurringTransactions();

        if (recurringTransactions.length === 0) {
            container.innerHTML = `
                <div class="card text-center py-xl">
                    <p class="color-text-tertiary m-0" data-i18n="noRecurring">No recurring transactions found.</p>
                </div>
            `;
            if (window.i18n) window.i18n.applyTranslations(container);
            return;
        }

        container.innerHTML = recurringTransactions.map(r => {
            const wallet = this.dataManager.getWalletById(r.walletId);
            const frequencyLabel = window.i18n ? window.i18n.t(r.frequency) : r.frequency;

            // Format amount exactly like TransactionManager.createTransactionItem
            let displayAmount = window.currencyManager ? window.currencyManager.format(r.amount, r.currency) : `${r.currency} ${r.amount}`;
            let amountClass = r.type;
            let prefix = '';

            if (r.type === 'income') {
                prefix = '+';
            } else if (r.type === 'expense') {
                prefix = '-';
            } else if (r.type === 'transfer') {
                const targetWallet = this.dataManager.getWalletById(r.targetWalletId);
                if (targetWallet) {
                    const targetAmount = r.amount * (r.conversionRate || 1);
                    const formattedTarget = window.currencyManager ? window.currencyManager.format(targetAmount, targetWallet.currency) : `${targetWallet.currency} ${targetAmount}`;
                    displayAmount = `<span style="color:var(--color-danger)">-${displayAmount}</span> <span style="color:var(--color-text-tertiary)">→</span> <span style="color:var(--color-success)">+${formattedTarget}</span>`;
                    prefix = '';
                    amountClass = 'transfer';
                } else {
                    prefix = '-';
                    amountClass = 'expense';
                }
            }

            // Category Icon
            const icon = (window.transactionManager && window.transactionManager.categoryIcons[r.category]) || '🔁';

            // Format Next Run Date with Title
            const nextRunTitle = window.i18n ? window.i18n.t('nextRun') : 'Next Run';
            let nextRunStr = '';
            if (r.nextRunDate) {
                const nrDate = new Date(r.nextRunDate);
                const lang = window.i18n?.currentLanguage || undefined;
                nextRunStr = nrDate.toLocaleDateString(lang) + ' ' + nrDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
            }

            const isPaused = !!r.isPaused;
            const pausedBadge = isPaused
                ? `<span style="font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:99px;background:rgba(245,158,11,0.15);color:var(--color-warning);margin-left:4px;">Paused</span>`
                : '';
            const pauseBtn = `
                <button onclick="event.stopPropagation();recurringManager.${isPaused ? 'resume' : 'pause'}Recurring('${r.id}')"
                    style="background:none;border:1px solid var(--glass-border);border-radius:var(--radius-sm);color:var(--color-text-secondary);cursor:pointer;font-size:0.7rem;padding:2px 7px;margin-top:2px;">
                    ${isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>`;

            // MATCH TRANSACTION-ITEM STRUCTURE PERFECTLY
            return `
                <div class="transaction-item animate-slide-up" data-id="${r.id}" onclick="recurringManager.editRecurring('${r.id}')" style="cursor: pointer; ${isPaused ? 'opacity:0.6' : ''}">
                    <div class="transaction-icon ${amountClass}" style="width: 44px; height: 44px; font-size: 1.25rem; flex-shrink: 0;">
                        ${icon}
                    </div>
                    <div class="transaction-details" style="flex: 1; min-width: 0;">
                        <div class="transaction-category" style="font-size: 0.95rem; font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${window.transactionManager ? window.transactionManager.getCategoryTranslation(r.category || 'Transfer') : r.category}${pausedBadge}
                        </div>
                        <div class="transaction-note" style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${r.note || (wallet ? wallet.name : 'Unknown')} • 🔁 ${frequencyLabel}
                        </div>
                        <div class="next-run" style="font-size: 0.65rem; color: var(--color-warning); margin-top: 1px; font-weight: 500;">
                            ${isPaused ? 'Paused' : nextRunTitle + ': ' + nextRunStr}
                        </div>
                        ${pauseBtn}
                    </div>
                    <div class="transaction-amount ${amountClass}" style="font-size: 0.95rem; font-weight: 700; text-align: right; flex-shrink: 0; margin-left: var(--space-sm);">
                        ${prefix}${displayAmount}
                    </div>
                </div>
            `;
        }).join('');
    }

    editRecurring(id) {
        const recurring = this.dataManager.getRecurringTransactions().find(r => r.id === id);
        if (!recurring) return;

        const editModal = document.getElementById('recurringEditModal');
        const deleteBtn = document.getElementById('deleteRecurringBtn');

        if (editModal) {
            // Populate basic fields
            document.getElementById('edit_recurringId').value = id;
            document.getElementById('edit_recurringOccurrence').value = recurring.frequency;
            document.getElementById('edit_recurringType').value = recurring.type;

            // Populate Next Run Date
            if (recurring.nextRunDate) {
                const date = new Date(recurring.nextRunDate);
                // Format for datetime-local: YYYY-MM-DDTHH:MM
                // Localize to system time for the input
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date - offset)).toISOString().slice(0, 16);
                document.getElementById('edit_recurringNextRun').value = localISOTime;
            }

            // Populate dropdowns before setting values
            this.updateWalletDropdown('edit_recurring');
            this.updateCategoryDropdown('edit_recurring');
            this.toggleTransferFields('edit_recurring');

            document.getElementById('edit_recurringWallet').value = recurring.walletId;
            document.getElementById('edit_recurringCategory').value = recurring.category;
            document.getElementById('edit_recurringAmount').value = recurring.amount.toFixed(2);
            document.getElementById('edit_recurringNote').value = recurring.note || '';

            if (recurring.type === 'transfer') {
                document.getElementById('edit_recurringTargetWallet').value = recurring.targetWalletId || '';
            }

            deleteBtn.dataset.id = id;
            editModal.classList.add('active');
            if (window.i18n) window.i18n.applyTranslations(editModal);
        }
    }

    handleEditFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('edit_recurringId').value;
        const walletId = document.getElementById('edit_recurringWallet').value;
        const wallet = this.dataManager.getWalletById(walletId);

        const updates = {
            frequency: document.getElementById('edit_recurringOccurrence').value,
            type: document.getElementById('edit_recurringType').value,
            category: document.getElementById('edit_recurringCategory').value,
            walletId: walletId,
            currency: wallet ? wallet.currency : 'USD',
            amount: parseFloat(document.getElementById('edit_recurringAmount').value),
            note: document.getElementById('edit_recurringNote').value,
            nextRunDate: new Date(document.getElementById('edit_recurringNextRun').value).toISOString()
        };

        if (updates.type === 'transfer') {
            updates.targetWalletId = document.getElementById('edit_recurringTargetWallet').value;
            updates.category = 'Transfer';
        }

        this.dataManager.updateRecurringTransaction(id, updates);

        document.getElementById('recurringEditModal').classList.remove('active');
        this.renderList();

        if (window.app) window.app.showToast(window.i18n.t('recurringUpdatedToast'));
    }

    updateWalletDropdown(prefix = 'recurring') {
        const selects = [
            document.getElementById(`${prefix}Wallet`),
            document.getElementById(`${prefix}TargetWallet`)
        ];

        const wallets = this.dataManager.getWallets();
        const options = wallets.map(w => `<option value="${w.id}">${w.name} (${w.currency})</option>`).join('');

        selects.forEach(select => {
            if (select) {
                const currentVal = select.value;
                select.innerHTML = options;
                if (currentVal) select.value = currentVal;
            }
        });
    }

    updateCategoryDropdown(prefix = 'recurring') {
        const select = document.getElementById(`${prefix}Category`);
        const typeSelect = document.getElementById(`${prefix}Type`);
        if (!select || !typeSelect) return;

        const type = typeSelect.value;
        const categories = window.transactionManager ? window.transactionManager.categories[type] : [];

        select.innerHTML = categories.map(c => {
            const label = window.transactionManager ? window.transactionManager.getCategoryTranslation(c) : c;
            return `<option value="${c}">${label}</option>`;
        }).join('');
    }

    toggleTransferFields(prefix = 'recurring') {
        const type = document.getElementById(`${prefix}Type`).value;
        const targetField = document.getElementById(`${prefix}FieldTarget`);
        const categoryField = document.getElementById(`${prefix}CategoryField`);

        if (targetField) {
            if (type === 'transfer') {
                targetField.classList.remove('hidden');
            } else {
                targetField.classList.add('hidden');
            }
        }

        if (categoryField) {
            if (type === 'transfer') {
                categoryField.classList.add('hidden');
            } else {
                categoryField.classList.remove('hidden');
            }
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const walletId = document.getElementById('recurringWallet').value;
        const wallet = this.dataManager.getWalletById(walletId);

        const recurring = {
            type: document.getElementById('recurringType').value,
            walletId: walletId,
            currency: wallet ? wallet.currency : 'NTD',
            category: document.getElementById('recurringCategory').value,
            amount: parseFloat(document.getElementById('recurringAmount').value),
            frequency: document.getElementById('recurringFrequency').value,
            nextRunDate: new Date(document.getElementById('recurringStartDate').value).toISOString(),
            note: document.getElementById('recurringNote').value
        };

        this.dataManager.addRecurringTransaction(recurring);

        // Reset and close
        e.target.reset();
        document.getElementById('recurringFormModal').classList.remove('active');
        this.renderList();

        if (window.app) window.app.showToast(window.i18n.t('recurringScheduledToast'));
    }

    deleteRecurring(id) {
        if (confirm(window.i18n.t('confirmDeleteRecurring'))) {
            this.dataManager.deleteRecurringTransaction(id);
            this.renderList();
        }
    }
}

// Global instance will be created in app.js
