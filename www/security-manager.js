/**
 * SECURITY MANAGER
 * Handles biometric authentication and lock screen logic
 */

class SecurityManager {
    constructor(dataManager, i18n) {
        this.dataManager = dataManager;
        this.i18n = i18n;
        this.isLocked = false;
        this.isAuthenticating = false;
        this.plugin = window.Capacitor?.Plugins?.NativeBiometric;
    }

    /**
     * Check if biometrics are available and enabled
     */
    async checkSecurity() {
        if (!this.dataManager.isBiometricEnabled()) {
            this.hideLockScreen();
            return;
        }

        // Only trigger if not already locked or in middle of auth
        if (this.isLocked || this.isAuthenticating) return;

        this.showLockScreen();
        await this.authenticate();
    }

    /**
     * Show the full-screen lock overlay
     */
    showLockScreen() {
        this.isLocked = true;
        const overlay = document.getElementById('lock-screen-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('active');

            // Localize text in overlay
            const title = overlay.querySelector('.lock-title');
            const desc = overlay.querySelector('.lock-desc');
            const btn = overlay.querySelector('#unlock-btn');

            if (title) title.textContent = this.i18n.t('authenticate');
            if (desc) desc.textContent = this.i18n.t('unlockToProceed');
            if (btn) btn.textContent = this.i18n.t('authenticate');
        }
    }

    /**
     * Hide the lock screen overlay
     */
    hideLockScreen() {
        this.isLocked = false;
        const overlay = document.getElementById('lock-screen-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }
    }

    /**
     * Trigger native biometric prompt
     */
    async authenticate() {
        if (!this.plugin) {
            console.warn('NativeBiometric plugin not found. Skipping auth.');
            this.hideLockScreen();
            return;
        }

        this.isAuthenticating = true;
        try {
            const result = await this.plugin.isAvailable();
            if (!result.isAvailable) {
                console.warn('Biometrics not available on this device.');
                this.isAuthenticating = false;
                this.hideLockScreen();
                return;
            }

            const authResult = await this.plugin.verifyIdentity({
                reason: this.i18n.t('biometricDesc'),
                title: this.i18n.t('biometricLock'),
                subtitle: "",
                description: this.i18n.t('unlockToProceed')
            });

            console.log('Authentication result:', authResult);
            this.isAuthenticating = false;
            this.hideLockScreen();
        } catch (error) {
            console.error('Authentication error:', error);
            this.isAuthenticating = false;
            this.showError();
        }
    }

    /**
     * Show error state on lock screen
     */
    showError() {
        const overlay = document.getElementById('lock-screen-overlay');
        if (overlay) {
            const desc = overlay.querySelector('.lock-desc');
            const btn = overlay.querySelector('#unlock-btn');

            if (desc) {
                desc.textContent = this.i18n.t('authFailed');
                desc.style.color = 'var(--color-danger)';
            }
            if (btn) btn.textContent = this.i18n.t('retry');
        }
    }
}

// Global instance will be created in app.js
