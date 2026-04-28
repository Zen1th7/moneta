/**
 * NOTIFICATION MANAGER
 * Handles daily reminders and quick action notifications
 */

class NotificationManager {
    constructor(dataManager, i18n) {
        this.dataManager = dataManager;
        this.i18n = i18n;
        this.plugin = window.Capacitor?.Plugins?.LocalNotifications;
        this.DAILY_REMINDER_ID = 1001;
        this.QUICK_ACTIONS_ID = 1002;
    }

    async init() {
        try {
            if (!this.plugin) {
                console.warn('⚠️ LocalNotifications plugin not available.');
                return;
            }

            // 1. Request permissions if not granted
            const status = await this.plugin.checkPermissions();
            console.log('🔔 [NotificationManager] Permission status:', status);

            if (status.display !== 'granted') {
                const request = await this.plugin.requestPermissions();
                console.log('🔔 [NotificationManager] Permission request result:', request);
                if (request.display !== 'granted') {
                    console.warn('⚠️ Notification permission denied by user.');
                    return false;
                }
            }

            // 2. Create Notification Channel (Android Requirement)
            await this.createChannels();

            // 3. Register Action Types for Quick Actions
            await this.plugin.registerActionTypes({
                types: [
                    {
                        id: 'TRANSACTION_ACTIONS',
                        actions: [
                            {
                                id: 'ADD_INCOME',
                                title: this.i18n.t('addIncome'),
                                foreground: true
                            },
                            {
                                id: 'ADD_EXPENSE',
                                title: this.i18n.t('addExpense'),
                                foreground: true
                            }
                        ]
                    }
                ]
            });

            // 4. Setup Listeners
            this.setupListeners();

            // 5. Initial sync from settings
            this.syncWithSettings();

            console.log('🔔 Notification Manager fully initialized.');
            return true;
        } catch (err) {
            console.error('❌ Notification Manager init error:', err);
            return false;
        }
    }

    async createChannels() {
        if (!this.plugin) return;

        console.log('🔔 Creating notification channels...');
        await this.plugin.createChannel({
            id: 'smart-money-reminders',
            name: 'Reminders & Quick Actions',
            description: 'Notification channel for daily reminders and quick tracking buttons',
            importance: 4, // 1-5 (5 is highest)
            visibility: 1, // 1 is public
            sound: 'default'
        });
    }

    setupListeners() {
        // When user clicks a notification action
        this.plugin.addListener('localNotificationActionPerformed', (notification) => {
            console.log('🔔 Notification action performed:', notification);
            const actionId = notification.actionId;

            if (actionId === 'ADD_INCOME' || actionId === 'ADD_EXPENSE') {
                this.handleQuickAction(actionId);
            } else if (notification.notification.id === this.QUICK_ACTIONS_ID) {
                // If user clicks the bar itself, open app to transactions and ensure it stays
                window.app.switchView('transactions');
                this.showQuickActions();
            } else if (notification.notification.id === this.DAILY_REMINDER_ID) {
                // Clicking the reminder body just opens the app to transactions
                window.app.switchView('transactions');
            }
        });
    }

    handleQuickAction(actionId) {
        console.log('🔔 [NotificationManager] Handling quick action:', actionId);

        // 1. Switch to Transactions view
        window.app.switchView('transactions');

        // 2. Select the correct type, frequency, and focus amount
        setTimeout(() => {
            const typeValue = actionId === 'ADD_INCOME' ? 'income' : 'expense';
            const typeSelect = document.getElementById('transactionType');
            const occurrenceSelect = document.getElementById('transactionOccurrence');

            // Force "Once" as requested
            if (occurrenceSelect) {
                occurrenceSelect.value = 'once';
                occurrenceSelect.dispatchEvent(new Event('change'));
            }

            if (typeSelect) {
                typeSelect.value = typeValue;
                typeSelect.dispatchEvent(new Event('change'));

                // Focus amount field if exists
                const amountInput = document.getElementById('transactionAmount');
                if (amountInput) {
                    amountInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Give it a subtle highlight
                    amountInput.classList.add('highlight-flash');
                    setTimeout(() => amountInput.classList.remove('highlight-flash'), 2000);
                }
            }
        }, 500); // 500ms delay to ensure view transition is complete

        // 3. Immediately re-show/refresh the persistent notification
        this.showQuickActions();
    }

    async syncWithSettings() {
        if (!this.plugin) return;

        // Sync Daily Reminder
        if (this.dataManager.isReminderEnabled()) {
            await this.scheduleDailyReminder();
        } else {
            await this.cancelDailyReminder();
        }

        // Sync Quick Actions
        if (this.dataManager.isQuickActionsEnabled()) {
            await this.showQuickActions();
        } else {
            await this.cancelQuickActions();
        }
    }

    async scheduleDailyReminder() {
        if (!this.plugin) return;

        console.log('🔔 [NotificationManager] scheduleDailyReminder() called for 19:00');

        try {
            await this.plugin.schedule({
                notifications: [
                    {
                        title: this.i18n.t('reminderTitle'),
                        body: this.i18n.t('reminderBody'),
                        id: this.DAILY_REMINDER_ID,
                        schedule: {
                            on: {
                                hour: 19,
                                minute: 0
                            },
                            repeats: true,
                            allowWhileIdle: true
                        },
                        sound: 'default',
                        channelId: 'smart-money-reminders',
                        attachments: null,
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
            console.log('🔔 [NotificationManager] Daily reminder scheduled successfully');
        } catch (err) {
            console.error('❌ [NotificationManager] Failed to schedule daily reminder:', err);
        }
    }

    async cancelDailyReminder() {
        if (!this.plugin) return;
        await this.plugin.cancel({
            notifications: [{ id: this.DAILY_REMINDER_ID }]
        });
    }

    async showQuickActions() {
        if (!this.plugin) return;

        console.log('🔔 [NotificationManager] showQuickActions() called');

        try {
            await this.plugin.schedule({
                notifications: [
                    {
                        title: 'Moneta',
                        body: '', // Empty body as requested for the notification popup to keep it compact
                        id: this.QUICK_ACTIONS_ID,
                        ongoing: true,
                        autoCancel: false,
                        channelId: 'smart-money-reminders',
                        actionTypeId: 'TRANSACTION_ACTIONS',
                        schedule: { at: new Date(Date.now() + 100) } // 100ms delay for reliability
                    }
                ]
            });
            console.log('🔔 [NotificationManager] Quick actions scheduled successfully');
        } catch (err) {
            console.error('❌ [NotificationManager] Failed to schedule quick actions:', err);
        }
    }

    async cancelQuickActions() {
        if (!this.plugin) return;
        await this.plugin.cancel({
            notifications: [{ id: this.QUICK_ACTIONS_ID }]
        });
    }

    /**
     * Budget threshold alert — in-app toast + native push (Capacitor).
     * Deduplicates per session so the same budget+threshold only fires once.
     */
    async sendBudgetAlert(budget, value, threshold) {
        if (!this._budgetAlertSent) this._budgetAlertSent = new Set();
        const key = `${budget.id}:${threshold}`;
        if (this._budgetAlertSent.has(key)) return;
        this._budgetAlertSent.add(key);

        const category = budget.categoryId;
        const msg = threshold === 'over'
            ? `"${category}" budget exceeded your ${budget.currency} limit.`
            : `"${category}" budget is ${Math.round(value)}% used — nearing limit.`;

        window.app?.showToast((threshold === 'over' ? '⚠️ ' : '⚡ ') + msg);

        if (this.plugin) {
            try {
                await this.plugin.schedule({
                    notifications: [{
                        id: 2000 + Math.floor(Math.random() * 1000),
                        title: threshold === 'over' ? 'Budget Exceeded' : 'Budget Warning',
                        body: msg,
                        schedule: { at: new Date(Date.now() + 200) }
                    }]
                });
            } catch (err) {
                console.warn('Budget push notification failed:', err);
            }
        }
    }
}

// Global instance (initialized in app.js)
window.notificationManager = null;
