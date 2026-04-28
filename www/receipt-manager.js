/**
 * RECEIPT MANAGER
 * Handles receipt photo capture, compression, storage, and display
 */

class ReceiptManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this._pendingAdd = null;
    this._pendingEdit = null;

    this.setupEventListeners();
    this.checkStorageUsage();
  }

  // ─── IMAGE COMPRESSION ───────────────────────────────────

  /**
   * Compress an image file to max 1024px longest side, ~200KB JPEG.
   * Returns a base64 data URL string.
   */
  compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1024;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
            else { width = Math.round((width * MAX) / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);

          // Try quality 0.8 first; if still > 200KB, drop to 0.5
          let dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          if (dataUrl.length > 200 * 1024 * (4 / 3)) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.5);
          }
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ─── FILE HANDLER ────────────────────────────────────────

  async handleFile(input, mode) {
    const file = input.files[0];
    if (!file) return;

    try {
      const dataUrl = await this.compressImage(file);
      if (mode === 'add') {
        this._pendingAdd = dataUrl;
        this._showThumbnail('receiptThumbnail', 'receiptPreviewArea', dataUrl);
      } else {
        this._pendingEdit = dataUrl;
        this._showThumbnail('editReceiptThumbnail', 'editReceiptPreviewArea', dataUrl);
      }
      this.checkStorageUsage();
    } catch (err) {
      console.error('Receipt compression failed:', err);
      window.app?.showToast('Could not process image. Try again.');
    }
    input.value = '';
  }

  _showThumbnail(imgId, areaId, src) {
    const img = document.getElementById(imgId);
    const area = document.getElementById(areaId);
    if (img) img.src = src;
    if (area) area.style.display = 'block';
  }

  clearReceipt(mode) {
    if (mode === 'add') {
      this._pendingAdd = null;
      const area = document.getElementById('receiptPreviewArea');
      if (area) { area.style.display = 'none'; document.getElementById('receiptThumbnail').src = ''; }
    } else {
      this._pendingEdit = null;
      const area = document.getElementById('editReceiptPreviewArea');
      if (area) { area.style.display = 'none'; document.getElementById('editReceiptThumbnail').src = ''; }
    }
  }

  // Call this when the add-transaction form resets (new transaction)
  resetAddForm() {
    this._pendingAdd = null;
    this.clearReceipt('add');
  }

  // Returns pending photo for add form, then clears it
  consumeAddPhoto() {
    const photo = this._pendingAdd || null;
    this._pendingAdd = null;
    return photo;
  }

  // Returns pending photo for edit form, then clears it
  consumeEditPhoto() {
    const photo = this._pendingEdit || null;
    this._pendingEdit = null;
    return photo;
  }

  // ─── FULLSCREEN VIEWER ───────────────────────────────────

  openFullscreen(src) {
    const modal = document.getElementById('receiptFullscreenModal');
    const img = document.getElementById('receiptFullscreenImg');
    if (modal && img) { img.src = src; modal.style.display = 'flex'; }
  }

  // Load a transaction's existing receipt into the edit form
  loadReceiptForEdit(transaction) {
    const area = document.getElementById('editReceiptPreviewArea');
    const img = document.getElementById('editReceiptThumbnail');
    if (transaction.receiptPhoto) {
      if (img) img.src = transaction.receiptPhoto;
      if (area) area.style.display = 'block';
      this._pendingEdit = transaction.receiptPhoto;
    } else {
      this._pendingEdit = null;
      if (area) area.style.display = 'none';
    }
  }

  // ─── LOCALSTORAGE USAGE MONITOR ──────────────────────────

  checkStorageUsage() {
    try {
      let total = 0;
      for (const key of Object.keys(localStorage)) {
        total += (localStorage.getItem(key) || '').length;
      }
      const QUOTA = 5 * 1024 * 1024; // 5MB estimate
      const pct = (total / QUOTA) * 100;
      if (pct >= 80) {
        this._showStorageWarning(pct, total);
      }
    } catch (e) { /* ignore */ }
  }

  _showStorageWarning(pct, bytes) {
    const modal = document.getElementById('storageWarningModal');
    const text = document.getElementById('storageUsageText');
    if (text) text.textContent = `Used: ~${(bytes / 1024).toFixed(0)} KB (${pct.toFixed(0)}% of ~5 MB)`;
    if (modal) modal.classList.add('active');
  }

  clearAllReceiptPhotos() {
    const transactions = this.dataManager.getTransactions();
    let cleared = 0;
    const updated = transactions.map(t => {
      if (t.receiptPhoto) { cleared++; return { ...t, receiptPhoto: null }; }
      return t;
    });
    this.dataManager.saveTransactions(updated);
    document.getElementById('storageWarningModal')?.classList.remove('active');
    window.app?.showToast(`Cleared ${cleared} receipt photo${cleared !== 1 ? 's' : ''}.`);
    if (window.transactionManager) window.transactionManager.render();
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────

  setupEventListeners() {
    document.getElementById('clearReceiptsBtn')?.addEventListener('click', () => {
      if (confirm('Delete all receipt photos? This cannot be undone.')) {
        this.clearAllReceiptPhotos();
      }
    });
    document.getElementById('dismissStorageWarningBtn')?.addEventListener('click', () => {
      document.getElementById('storageWarningModal')?.classList.remove('active');
    });
    document.getElementById('receiptFullscreenModal')?.addEventListener('click', e => {
      if (e.target.id === 'receiptFullscreenModal') {
        document.getElementById('receiptFullscreenModal').style.display = 'none';
      }
    });
  }
}
