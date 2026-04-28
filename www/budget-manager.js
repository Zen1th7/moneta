/**
 * BUDGET MANAGER
 * Manages monthly spending budgets per category — data layer + UI
 */

class BudgetManager {
  constructor(dataManager, transactionManager) {
    this.dataManager = dataManager;
    this.transactionManager = transactionManager;
    this.editingBudgetId = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();

    document.addEventListener('languageChanged', () => this.render());
  }

  // ─── DATA LAYER ──────────────────────────────────────────

  getBudgets() {
    return this.dataManager.getBudgets();
  }

  createBudget({ categoryId, limitAmount, currency }) {
    return this.dataManager.addBudget({
      categoryId,
      limitAmount: parseFloat(limitAmount),
      currency,
      createdAt: new Date().toISOString()
    });
  }

  updateBudget(id, updates) {
    if (updates.limitAmount !== undefined) updates.limitAmount = parseFloat(updates.limitAmount);
    return this.dataManager.updateBudget(id, updates);
  }

  deleteBudget(id) {
    return this.dataManager.deleteBudget(id);
  }

  /**
   * Sum expense transactions for a category in the current calendar month
   * matching the budget's currency (via wallet currency).
   */
  calculateBudgetUsage(budget) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const wallets = this.dataManager.getWallets();
    const walletMap = {};
    wallets.forEach(w => { walletMap[w.id] = w; });

    return this.dataManager.getTransactions().reduce((sum, t) => {
      if (t.type !== 'expense') return sum;
      if (t.category !== budget.categoryId) return sum;
      const tDate = new Date(t.date || t.createdAt);
      if (tDate < monthStart || tDate > monthEnd) return sum;
      const wallet = walletMap[t.walletId];
      if (!wallet || wallet.currency !== budget.currency) return sum;
      return sum + Math.abs(parseFloat(t.amount) || 0);
    }, 0);
  }

  getBudgetWithUsage(budget) {
    const used = this.calculateBudgetUsage(budget);
    const limit = budget.limitAmount;
    const remaining = Math.max(0, limit - used);
    const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    let status = 'ok';
    if (used >= limit) status = 'over';
    else if (percentage >= 80) status = 'warning';
    return { ...budget, used, remaining, percentage, status };
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────

  checkBudgetThresholds(budget) {
    const nm = window.notificationManager;
    if (!nm) return;
    const { used, percentage, status } = this.getBudgetWithUsage(budget);
    if (status === 'over') nm.sendBudgetAlert?.(budget, used, 'over');
    else if (status === 'warning') nm.sendBudgetAlert?.(budget, percentage, 'warning');
  }

  recalculateAll() {
    this.getBudgets().forEach(b => this.checkBudgetThresholds(b));
    this.render();
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────

  setupEventListeners() {
    document.getElementById('addBudgetBtn')?.addEventListener('click', () => {
      this.openModal();
    });

    document.getElementById('cancelBudgetBtn')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('budgetModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'budgetModal') this.closeModal();
    });

    document.getElementById('budgetForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFromForm();
    });

    document.getElementById('deleteBudgetBtn')?.addEventListener('click', () => {
      if (this.editingBudgetId) this.confirmDelete(this.editingBudgetId);
    });

    // Event delegation on budget cards
    document.getElementById('budgetsContainer')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.budget-edit-btn');
      if (btn) {
        const id = btn.closest('[data-budget-id]')?.dataset.budgetId;
        if (id) this.openModal(id);
      }
    });
  }

  // ─── MODAL ───────────────────────────────────────────────

  openModal(budgetId = null) {
    this.editingBudgetId = budgetId;
    const modal = document.getElementById('budgetModal');
    const title = document.getElementById('budgetModalTitle');
    const deleteBtn = document.getElementById('deleteBudgetBtn');

    this._populateCategorySelect();

    if (budgetId) {
      title.textContent = window.i18n?.t('editBudget') || 'Edit Budget';
      const budget = this.getBudgets().find(b => b.id === budgetId);
      if (budget) {
        document.getElementById('budgetCategory').value = budget.categoryId;
        document.getElementById('budgetCurrency').value = budget.currency;
        InputFormatter?.setFormattedValue(document.getElementById('budgetLimit'), budget.limitAmount);
      }
      if (deleteBtn) deleteBtn.style.display = 'flex';
    } else {
      title.textContent = window.i18n?.t('addBudget') || 'Add Budget';
      document.getElementById('budgetForm').reset();
      if (deleteBtn) deleteBtn.style.display = 'none';
    }

    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('budgetModal')?.classList.remove('active');
    document.body.style.overflow = '';
    this.editingBudgetId = null;
  }

  _populateCategorySelect() {
    const select = document.getElementById('budgetCategory');
    if (!select) return;
    const categories = this.transactionManager?.categories?.expense || [];
    const icons = this.transactionManager?.categoryIcons || {};
    const current = select.value;
    select.innerHTML = `<option value="">${window.i18n?.t('selectCategory') || 'Select category…'}</option>`;
    categories.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${icons[name] || ''} ${name}`.trim();
      select.appendChild(opt);
    });
    if (current) select.value = current;
  }

  saveFromForm() {
    const categoryId = document.getElementById('budgetCategory').value;
    const currency = document.getElementById('budgetCurrency').value;
    const rawLimit = document.getElementById('budgetLimit').value;
    const limitAmount = parseFloat(rawLimit.replace(/[^0-9.]/g, ''));

    if (!categoryId || !currency || isNaN(limitAmount) || limitAmount <= 0) return;

    if (this.editingBudgetId) {
      this.updateBudget(this.editingBudgetId, { categoryId, limitAmount, currency });
    } else {
      // Prevent duplicate category+currency budget
      const existing = this.getBudgets().find(
        b => b.categoryId === categoryId && b.currency === currency
      );
      if (existing) {
        alert(window.i18n?.t('budgetAlreadyExists') || 'A budget for this category and currency already exists.');
        return;
      }
      this.createBudget({ categoryId, limitAmount, currency });
    }

    this.closeModal();
    this.render();
    window.app?.updateNetWorth?.();
  }

  confirmDelete(id) {
    const budget = this.getBudgets().find(b => b.id === id);
    if (!budget) return;
    const msg = window.i18n?.t('confirmDeleteBudget') || `Delete budget for "${budget.categoryId}"?`;
    if (confirm(msg)) {
      this.deleteBudget(id);
      this.closeModal();
      this.render();
    }
  }

  // ─── RENDER ──────────────────────────────────────────────

  render() {
    const container = document.getElementById('budgetsContainer');
    if (!container) return;

    const budgets = this.getBudgets();

    this._renderSummary(budgets);

    if (budgets.length === 0) {
      container.innerHTML = `
        <div class="card text-center">
          <p class="color-text-tertiary">${window.i18n?.t('noBudgets') || 'No budgets yet. Set a monthly limit for a spending category.'}</p>
        </div>`;
      return;
    }

    container.innerHTML = budgets.map(b => this._renderCard(b)).join('');
  }

  _renderSummary(budgets) {
    const el = document.getElementById('budgetSummaryLine');
    if (!el) return;
    if (budgets.length === 0) { el.textContent = '—'; return; }
    const t = (k, fb) => window.i18n?.t(k) || fb;
    const word = (n) => n > 1 ? t('budgetWordPlural', 'budgets') : t('budgetWord', 'budget');
    const over = budgets.filter(b => this.getBudgetWithUsage(b).status === 'over').length;
    const warn = budgets.filter(b => this.getBudgetWithUsage(b).status === 'warning').length;
    if (over > 0) {
      el.textContent = `${over} ${word(over)} ${t('budgetSummaryOver', 'over limit')}`;
      el.style.color = 'var(--color-danger)';
    } else if (warn > 0) {
      el.textContent = `${warn} ${word(warn)} ${t('budgetSummaryNear', 'near limit')}`;
      el.style.color = 'var(--color-warning)';
    } else {
      el.textContent = `${budgets.length} ${word(budgets.length)} ${t('budgetSummaryOk', 'on track')}`;
      el.style.color = 'var(--color-success)';
    }
  }

  _renderCard(budget) {
    const { used, remaining, percentage, status } = this.getBudgetWithUsage(budget);
    const icons = this.transactionManager?.categoryIcons || {};
    const icon = icons[budget.categoryId] || '💰';
    const currencySymbol = this._currencySymbol(budget.currency);
    const fmt = n => currencySymbol + this._formatAmount(n, budget.currency);

    const t = (k, fb) => window.i18n?.t(k) || fb;
    const translatedCategory = window.transactionManager?.getCategoryTranslation
      ? window.transactionManager.getCategoryTranslation(budget.categoryId)
      : budget.categoryId;

    const statusBadge = status !== 'ok'
      ? `<span class="budget-status-badge status-${status}">${status === 'over' ? t('overBudget', 'Over budget') : t('nearBudget', 'Near limit')}</span>`
      : '';

    const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`;

    return `
      <div class="card budget-card" data-budget-id="${budget.id}">
        <div class="budget-card-header">
          <div class="budget-card-category">
            <span>${icon}</span>
            <span>${translatedCategory}</span>
            ${statusBadge}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="budget-card-currency">${budget.currency}</span>
            <button class="budget-edit-btn" aria-label="${t('editBudgetAria', 'Edit budget')}">${editIcon}</button>
          </div>
        </div>
        <div class="budget-progress-bar">
          <div class="budget-progress-fill status-${status}" style="width:${percentage.toFixed(1)}%"></div>
        </div>
        <div class="budget-card-amounts">
          <span class="used ${status === 'over' ? 'status-over' : ''}">${fmt(used)} ${t('used', 'used')}</span>
          <span>${percentage.toFixed(0)}% ${t('of', 'of')} ${fmt(budget.limitAmount)}</span>
        </div>
      </div>`;
  }

  _currencySymbol(currency) {
    const map = { NTD: 'NT$', USD: 'US$', IDR: 'Rp' };
    return map[currency] || currency + ' ';
  }

  _formatAmount(amount, currency) {
    if (currency === 'IDR') return Math.round(amount).toLocaleString();
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
