/**
 * GOAL MANAGER
 * Manages financial savings goals — data layer + UI
 */

class GoalManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.editingGoalId = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.render();

    document.addEventListener('languageChanged', () => this.render());
  }

  // ─── DATA LAYER ──────────────────────────────────────────

  getGoals() { return this.dataManager.getGoals(); }

  createGoal({ name, targetAmount, currency, deadline, linkedWalletId }) {
    return this.dataManager.addGoal({ name, targetAmount: parseFloat(targetAmount), currency, deadline: deadline || null, linkedWalletId: linkedWalletId || null });
  }

  contributeToGoal(id, amount) {
    const goal = this.getGoals().find(g => g.id === id);
    if (!goal || goal.status === 'completed') return false;
    const newSaved = Math.min(goal.savedAmount + parseFloat(amount), goal.targetAmount);
    const updates = { savedAmount: newSaved };
    if (newSaved >= goal.targetAmount) updates.status = 'completed';
    return this.dataManager.updateGoal(id, updates);
  }

  withdrawFromGoal(id, amount) {
    const goal = this.getGoals().find(g => g.id === id);
    if (!goal) return false;
    const newSaved = Math.max(0, goal.savedAmount - parseFloat(amount));
    return this.dataManager.updateGoal(id, { savedAmount: newSaved, status: 'active' });
  }

  completeGoal(id) {
    return this.dataManager.updateGoal(id, { status: 'completed' });
  }

  deleteGoal(id) {
    return this.dataManager.deleteGoal(id);
  }

  updateGoal(id, updates) {
    if (updates.targetAmount !== undefined) updates.targetAmount = parseFloat(updates.targetAmount);
    return this.dataManager.updateGoal(id, updates);
  }

  getGoalProgress(goal) {
    const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
    const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
    let projectedDate = null;
    if (goal.createdAt && goal.savedAmount > 0 && pct < 100) {
      const daysElapsed = (Date.now() - new Date(goal.createdAt).getTime()) / 86400000;
      const ratePerDay = goal.savedAmount / daysElapsed;
      if (ratePerDay > 0) {
        const daysLeft = remaining / ratePerDay;
        projectedDate = new Date(Date.now() + daysLeft * 86400000);
      }
    }
    let trackStatus = 'ok';
    if (goal.deadline && projectedDate) {
      const deadline = new Date(goal.deadline);
      trackStatus = projectedDate > deadline ? 'behind' : 'on-track';
    }
    return { pct, remaining, projectedDate, trackStatus };
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────

  setupEventListeners() {
    document.getElementById('addGoalBtn')?.addEventListener('click', () => this.openModal());
    document.getElementById('cancelGoalBtn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('goalModal')?.addEventListener('click', e => {
      if (e.target.id === 'goalModal') this.closeModal();
    });
    document.getElementById('goalForm')?.addEventListener('submit', e => {
      e.preventDefault();
      this.saveFromForm();
    });
    document.getElementById('deleteGoalBtn')?.addEventListener('click', () => {
      if (this.editingGoalId) this.confirmDelete(this.editingGoalId);
    });

    // Contribute / Withdraw modal
    document.getElementById('goalContributeBtn')?.addEventListener('click', () => {
      const id = document.getElementById('goalActionModal').dataset.goalId;
      if (id) this.submitContribute(id);
    });
    document.getElementById('goalWithdrawBtn')?.addEventListener('click', () => {
      const id = document.getElementById('goalActionModal').dataset.goalId;
      if (id) this.submitWithdraw(id);
    });
    document.getElementById('cancelGoalActionBtn')?.addEventListener('click', () => this.closeActionModal());
    document.getElementById('goalActionModal')?.addEventListener('click', e => {
      if (e.target.id === 'goalActionModal') this.closeActionModal();
    });

    // Event delegation on goal cards
    document.getElementById('goalsContainer')?.addEventListener('click', e => {
      const editBtn = e.target.closest('.goal-edit-btn');
      const actionBtn = e.target.closest('.goal-action-btn');
      if (editBtn) {
        const id = editBtn.closest('[data-goal-id]')?.dataset.goalId;
        if (id) this.openModal(id);
      }
      if (actionBtn) {
        const id = actionBtn.closest('[data-goal-id]')?.dataset.goalId;
        if (id) this.openActionModal(id);
      }
    });
  }

  // ─── GOAL MODAL (ADD / EDIT) ─────────────────────────────

  openModal(goalId = null) {
    this.editingGoalId = goalId;
    const modal = document.getElementById('goalModal');
    const title = document.getElementById('goalModalTitle');
    const deleteBtn = document.getElementById('deleteGoalBtn');

    this._populateWalletSelect();

    if (goalId) {
      title.textContent = window.i18n?.t('editGoal') || 'Edit Goal';
      const goal = this.getGoals().find(g => g.id === goalId);
      if (goal) {
        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalCurrency').value = goal.currency;
        InputFormatter?.setFormattedValue(document.getElementById('goalTarget'), goal.targetAmount);
        document.getElementById('goalDeadline').value = goal.deadline ? goal.deadline.split('T')[0] : '';
        document.getElementById('goalWallet').value = goal.linkedWalletId || '';
      }
      if (deleteBtn) deleteBtn.style.display = 'flex';
    } else {
      title.textContent = window.i18n?.t('addGoal') || 'Add Goal';
      document.getElementById('goalForm').reset();
      if (deleteBtn) deleteBtn.style.display = 'none';
    }

    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    document.getElementById('goalModal')?.classList.remove('active');
    document.body.style.overflow = '';
    this.editingGoalId = null;
  }

  _populateWalletSelect() {
    const select = document.getElementById('goalWallet');
    if (!select) return;
    const wallets = this.dataManager.getWallets();
    const current = select.value;
    select.innerHTML = `<option value="">${window.i18n?.t('noLinkedWallet') || 'No linked wallet'}</option>`;
    wallets.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = `${w.name} (${w.currency})`;
      select.appendChild(opt);
    });
    if (current) select.value = current;
  }

  saveFromForm() {
    const name = document.getElementById('goalName').value.trim();
    const currency = document.getElementById('goalCurrency').value;
    const rawTarget = document.getElementById('goalTarget').value;
    const targetAmount = parseFloat(rawTarget.replace(/[^0-9.]/g, ''));
    const deadline = document.getElementById('goalDeadline').value || null;
    const linkedWalletId = document.getElementById('goalWallet').value || null;

    if (!name || !currency || isNaN(targetAmount) || targetAmount <= 0) return;

    if (this.editingGoalId) {
      this.updateGoal(this.editingGoalId, { name, targetAmount, currency, deadline, linkedWalletId });
    } else {
      this.createGoal({ name, targetAmount, currency, deadline, linkedWalletId });
    }

    this.closeModal();
    this.render();
  }

  confirmDelete(id) {
    const goal = this.getGoals().find(g => g.id === id);
    if (!goal) return;
    const msg = window.i18n?.t('confirmDeleteGoal') || `Delete goal "${goal.name}"?`;
    if (confirm(msg)) {
      this.deleteGoal(id);
      this.closeModal();
      this.render();
    }
  }

  // ─── CONTRIBUTE / WITHDRAW MODAL ─────────────────────────

  openActionModal(goalId) {
    const goal = this.getGoals().find(g => g.id === goalId);
    if (!goal) return;
    const modal = document.getElementById('goalActionModal');
    modal.dataset.goalId = goalId;
    document.getElementById('goalActionTitle').textContent = goal.name;
    document.getElementById('goalActionAmount').value = '';
    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeActionModal() {
    document.getElementById('goalActionModal')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  submitContribute(id) {
    const raw = document.getElementById('goalActionAmount').value;
    const amount = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(amount) || amount <= 0) return;
    this.contributeToGoal(id, amount);
    this.closeActionModal();
    this.render();
    window.app?.showToast(window.i18n?.t('contributionSaved') || 'Contribution saved!');
  }

  submitWithdraw(id) {
    const raw = document.getElementById('goalActionAmount').value;
    const amount = parseFloat(raw.replace(/[^0-9.]/g, ''));
    if (isNaN(amount) || amount <= 0) return;
    this.withdrawFromGoal(id, amount);
    this.closeActionModal();
    this.render();
    window.app?.showToast(window.i18n?.t('withdrawalRecorded') || 'Withdrawal recorded.');
  }

  // ─── RENDER ──────────────────────────────────────────────

  render() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;

    const allGoals = this.getGoals();
    const active = allGoals.filter(g => g.status !== 'completed');
    const completed = allGoals.filter(g => g.status === 'completed');

    if (allGoals.length === 0) {
      container.innerHTML = `
        <div class="card text-center">
          <p class="color-text-tertiary">${window.i18n?.t('noGoals') || 'No goals yet. Set a savings target to get started.'}</p>
        </div>`;
      return;
    }

    let html = active.map(g => this._renderCard(g)).join('');

    if (completed.length > 0) {
      const title = window.i18n?.t('completedGoals') || 'Completed Goals';
      html += `<div class="section-header" style="margin-top:var(--space-lg);">
        <h3 class="section-title" style="font-size:0.85rem;color:var(--color-text-secondary);">${title}</h3>
      </div>`;
      html += completed.map(g => this._renderCard(g)).join('');
    }

    container.innerHTML = html;
  }

  _renderCard(goal) {
    const { pct, remaining, projectedDate, trackStatus } = this.getGoalProgress(goal);
    const isCompleted = goal.status === 'completed';
    const sym = this._currencySymbol(goal.currency);
    const fmt = n => sym + this._formatAmount(n, goal.currency);

    const t = (k, fb) => window.i18n?.t(k) || fb;
    const lang = window.i18n?.currentLanguage || undefined;

    const trackBadge = !isCompleted && goal.deadline
      ? `<span class="budget-status-badge ${trackStatus === 'behind' ? 'status-warning' : ''}" style="${trackStatus === 'on-track' ? 'background:rgba(5,150,105,0.15);color:var(--color-success)' : ''}">${trackStatus === 'on-track' ? t('onTrack', 'On track') : t('behind', 'Behind')}</span>`
      : '';

    const completedBadge = isCompleted
      ? `<span class="budget-status-badge" style="background:rgba(5,150,105,0.15);color:var(--color-success);">${t('completed', 'Completed')}</span>`
      : '';

    const deadline = goal.deadline
      ? `<span style="font-size:0.75rem;color:var(--color-text-secondary);">${t('due', 'Due')} ${new Date(goal.deadline).toLocaleDateString(lang)}</span>`
      : '';

    const projected = projectedDate && !isCompleted
      ? `<span style="font-size:0.75rem;color:var(--color-text-secondary);">${t('est', 'Est.')} ${projectedDate.toLocaleDateString(lang)}</span>`
      : '';

    const actionBtn = !isCompleted
      ? `<button class="goal-action-btn btn btn-sm btn-secondary" style="font-size:0.75rem;padding:4px 10px;">+ / -</button>`
      : '';

    const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`;

    return `
      <div class="card budget-card ${isCompleted ? 'opacity-60' : ''}" data-goal-id="${goal.id}">
        <div class="budget-card-header">
          <div class="budget-card-category">
            <span>🎯</span>
            <span>${goal.name}</span>
            ${completedBadge}${trackBadge}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="budget-card-currency">${goal.currency}</span>
            ${actionBtn}
            <button class="goal-edit-btn budget-edit-btn" aria-label="${t('editGoalAria', 'Edit goal')}">${editIcon}</button>
          </div>
        </div>
        <div class="budget-progress-bar">
          <div class="budget-progress-fill ${isCompleted ? '' : ''}" style="width:${pct.toFixed(1)}%;background:${isCompleted ? 'var(--color-success)' : 'var(--color-primary)'}"></div>
        </div>
        <div class="budget-card-amounts">
          <span class="used">${fmt(goal.savedAmount)} ${t('saved', 'saved')}</span>
          <span>${pct.toFixed(0)}% ${t('of', 'of')} ${fmt(goal.targetAmount)}</span>
        </div>
        ${deadline || projected ? `<div style="display:flex;justify-content:space-between;margin-top:4px;">${deadline}${projected}</div>` : ''}
      </div>`;
  }

  _currencySymbol(currency) {
    return { NTD: 'NT$', USD: 'US$', IDR: 'Rp' }[currency] || currency + ' ';
  }

  _formatAmount(amount, currency) {
    if (currency === 'IDR') return Math.round(amount).toLocaleString();
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
