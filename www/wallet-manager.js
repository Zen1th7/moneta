/**
 * WALLET MANAGER
 * Handles wallet/account UI and operations
 */

class WalletManager {
    constructor(dataManager, currencyManager) {
        this.dataManager = dataManager;
        this.currencyManager = currencyManager;
        this.currentCurrency = 'ALL';
        this.editingWalletId = null;
        this.distributionChart = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Add wallet button
        document.getElementById('addWalletBtn').addEventListener('click', () => {
            this.openWalletModal();
        });

        // Cancel wallet button
        document.getElementById('cancelWalletBtn').addEventListener('click', () => {
            this.closeWalletModal();
        });

        // Wallet form submit
        document.getElementById('walletForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWallet();
        });

        // Delete wallet from modal
        const deleteBtn = document.getElementById('deleteWalletBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.editingWalletId) {
                    this.deleteWallet(this.editingWalletId);
                }
            });
        }

        // Close modal on overlay click
        document.getElementById('walletModal').addEventListener('click', (e) => {
            if (e.target.id === 'walletModal') {
                this.closeWalletModal();
            }
        });

        // Currency tabs
        document.querySelectorAll('#currencyTabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchCurrency(tab.dataset.currency);
            });
        });

        // Event Delegation for Wallet Cards
        const container = document.getElementById('walletsContainer');
        if (container) {
            container.addEventListener('click', (e) => {
                const card = e.target.closest('.wallet-card');
                if (card) {
                    const walletId = card.dataset.walletId;
                    console.log('Wallet clicked:', walletId);
                    this.openWalletModal(walletId);
                }
            });
        }
    }

    openWalletModal(walletId = null) {
        this.editingWalletId = walletId;
        const modal = document.getElementById('walletModal');
        const title = document.getElementById('walletModalTitle');
        const balanceInput = document.getElementById('walletBalance');

        if (walletId) {
            // Edit mode
            title.textContent = 'Edit Wallet';
            const wallet = this.dataManager.getWalletById(walletId);
            document.getElementById('walletName').value = wallet.name;
            document.getElementById('walletCurrency').value = wallet.currency;
            document.getElementById('walletPlatform').value = wallet.platform;
            InputFormatter.setFormattedValue(balanceInput, wallet.balance);

            // Show delete button in edit mode
            const deleteBtn = document.getElementById('deleteWalletBtn');
            if (deleteBtn) deleteBtn.style.display = 'block';
        } else {
            // Add mode
            title.textContent = 'Add Wallet';
            document.getElementById('walletForm').reset();

            // Hide delete button in add mode
            const deleteBtn = document.getElementById('deleteWalletBtn');
            if (deleteBtn) deleteBtn.style.display = 'none';
        }

        // Set up automatic thousand separator formatting for this input
        // Remove any existing listeners first
        const newBalanceInput = balanceInput.cloneNode(true);
        balanceInput.parentNode.replaceChild(newBalanceInput, balanceInput);

        // Apply formatter to the fresh input
        InputFormatter.formatNumberInput(document.getElementById('walletBalance'));

        modal.classList.add('active');
    }

    closeWalletModal() {
        InputFormatter.dismissKeyboard();
        const modal = document.getElementById('walletModal');
        modal.classList.remove('active');
        this.editingWalletId = null;
        document.getElementById('walletForm').reset();
    }

    saveWallet() {
        const name = document.getElementById('walletName').value;
        const currency = document.getElementById('walletCurrency').value;
        const platform = document.getElementById('walletPlatform').value;
        const balanceInput = document.getElementById('walletBalance');
        const balance = InputFormatter.getNumericValue(balanceInput);

        const walletData = {
            name,
            currency,
            platform,
            balance
        };

        if (this.editingWalletId) {
            // Update existing wallet
            this.dataManager.updateWallet(this.editingWalletId, walletData);
        } else {
            // Add new wallet
            this.dataManager.addWallet(walletData);
        }

        this.closeWalletModal();
        this.render();

        // Update net worth
        if (window.app) {
            window.app.updateNetWorth();
        }

        // Update transaction wallet dropdown - THIS WAS MISSING!
        if (window.transactionManager) {
            window.transactionManager.updateWalletDropdown();
            window.transactionManager.updateTargetWalletDropdown();
        }
    }

    deleteWallet(walletId) {
        if (confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
            this.dataManager.deleteWallet(walletId);
            this.render();

            // Update net worth
            if (window.app) {
                window.app.updateNetWorth();
            }

            // Update transaction wallet dropdown
            if (window.transactionManager) {
                window.transactionManager.updateWalletDropdown();
            }

            this.closeWalletModal();
        }
    }

    switchCurrency(currency) {
        this.currentCurrency = currency;

        // Update tab active state
        document.querySelectorAll('#currencyTabs .tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.currency === currency);
        });

        this.render();
    }

    updateChart() {
        const ctx = document.getElementById('walletDistributionChart');
        const legendContainer = document.getElementById('walletChartLegend');
        const section = document.getElementById('walletDistributionSection');

        if (!ctx || !legendContainer || !section) return;

        const wallets = this.dataManager.getWalletsByCurrency(this.currentCurrency);

        // Hide section if no wallets
        if (wallets.length === 0) {
            section.classList.add('hidden');
            return;
        }

        // Calculate data
        let chartData = [];
        let labels = [];
        let total = 0;

        wallets.forEach(wallet => {
            let value;
            if (this.currentCurrency === 'ALL') {
                value = this.currencyManager.convertToNTD(wallet.balance, wallet.currency);
            } else {
                value = parseFloat(wallet.balance);
            }

            if (value > 0) { // Only show positive wallets in distribution
                chartData.push(value);
                labels.push(wallet.name);
                total += value;
            }
        });

        if (chartData.length === 0) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');

        const colors = [
            '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#3b82f6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'
        ];

        // Destroy existing chart instance
        if (this.distributionChart) {
            this.distributionChart.destroy();
        }

        // Create new chart
        this.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: colors.map(c => c),
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 22, 51, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const percent = ((value / total) * 100).toFixed(1);
                                return ` ${context.label}: ${percent}%`;
                            }
                        }
                    }
                }
            }
        });

        // Update Legend
        legendContainer.innerHTML = labels.map((label, index) => {
            const percent = ((chartData[index] / total) * 100).toFixed(1);
            return `
                <div class="flex align-center gap-xs animate-fade-in" style="margin-bottom: 4px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${colors[index % colors.length]}; flex-shrink: 0;"></div>
                    <span class="color-text-secondary" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${label}</span>
                    <span class="font-600" style="color: var(--color-text-primary); margin-left: auto;">${percent}%</span>
                </div>
            `;
        }).join('');
    }

    render() {
        const container = document.getElementById('walletsContainer');
        const wallets = this.dataManager.getWalletsByCurrency(this.currentCurrency);

        // Update chart
        this.updateChart();

        if (wallets.length === 0) {
            let noWalletsMsg;
            if (this.currentCurrency === 'ALL') {
                noWalletsMsg = window.i18n?.t('noWallets') || 'No wallets yet. Add your first wallet to get started!';
            } else {
                // Use specific key: noWalletsUSD, noWalletsNTD, etc.
                const key = `noWallets${this.currentCurrency}`;
                noWalletsMsg = window.i18n?.t(key) || `No ${this.currentCurrency} wallets yet.`;
            }

            const dataI18n = this.currentCurrency === 'ALL' ? 'noWallets' : `noWallets${this.currentCurrency}`;

            container.innerHTML = `
        <div class="card text-center">
          <p style="color: var(--color-text-tertiary);" data-i18n="${dataI18n}">
            ${noWalletsMsg}
          </p>
        </div>
      `;
            return;
        }

        container.innerHTML = wallets.map(wallet => this.createWalletCard(wallet)).join('');
    }

    createWalletCard(wallet) {
        const formattedBalance = this.currencyManager.format(wallet.balance, wallet.currency);
        const balanceColor = wallet.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)';

        // Currency-specific gradient
        let gradient = 'var(--gradient-primary)';
        if (wallet.currency === 'USD') {
            gradient = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        } else if (wallet.currency === 'IDR') {
            gradient = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
        }

        return `
      <div class="wallet-card" data-wallet-id="${wallet.id}">
        <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: ${gradient};"></div>
        <div class="wallet-header">
          <div>
            <div class="wallet-name" style="font-size: 0.9rem;">${wallet.name}</div>
            <div class="wallet-platform" style="font-size: 0.7rem;">${wallet.platform}</div>
          </div>
          <span class="badge badge-${wallet.currency.toLowerCase()}" style="font-size: 0.6rem;">${wallet.currency}</span>
        </div>
        <div class="wallet-balance" style="color: ${balanceColor}; font-size: 1.1rem;">
          ${formattedBalance}
        </div>
      </div>
    `;
    }

    getCurrencyColor(currency) {
        const colors = {
            NTD: 'var(--color-ntd)',
            USD: 'var(--color-usd)',
            IDR: 'var(--color-idr)'
        };
        return colors[currency] || 'var(--color-primary)';
    }
}

// Will be initialized in app.js
let walletManager;
