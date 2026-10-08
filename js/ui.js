/**
 * SalonSmart Mini - UI Utilities & Helper Functions
 * Toast notifications, Modal controls, Confirmation dialogs, and Formatters
 */

(function () {
  'use strict';

  window.UI = {
    /**
     * Show a modern floating toast notification
     * @param {string} message - Message text
     * @param {'success'|'error'|'info'|'warning'} type - Toast type
     * @param {number} duration - Auto dismiss timeout in ms (default 3200)
     */
    toast(message, type = 'info', duration = 3200) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast-item toast-${type}`;

      const iconMap = {
        success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
        error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
        warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
        info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      };

      toast.innerHTML = `
        <div class="toast-icon-wrap">${iconMap[type] || iconMap.info}</div>
        <div class="toast-content">${message}</div>
        <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
      `;

      container.appendChild(toast);

      // Trigger enter animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      const removeToast = () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      };

      toast.querySelector('.toast-close').addEventListener('click', removeToast);

      if (duration > 0) {
        setTimeout(removeToast, duration);
      }
    },

    /**
     * Show customizable confirmation dialog
     */
    confirm({
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      isDestructive = false,
      onConfirm = () => {},
    }) {
      const modal = document.getElementById('confirm-modal');
      if (!modal) return;

      const titleEl = modal.querySelector('#confirm-modal-title');
      const msgEl = modal.querySelector('#confirm-modal-message');
      const confirmBtn = modal.querySelector('#confirm-modal-ok-btn');
      const cancelBtn = modal.querySelector('#confirm-modal-cancel-btn');

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;

      if (confirmBtn) {
        confirmBtn.textContent = confirmText;
        confirmBtn.className = isDestructive
          ? 'btn btn-danger'
          : 'btn btn-primary';

        // Clean previous listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', () => {
          this.closeModal('confirm-modal');
          onConfirm();
        });
      }

      if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', () => {
          this.closeModal('confirm-modal');
        });
      }

      this.openModal('confirm-modal');
    },

    /**
     * Open modal by ID
     */
    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('is-open');
        document.body.classList.add('modal-open');
        const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 150);
        }
      }
    },

    /**
     * Close modal by ID
     */
    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('is-open');
        if (!document.querySelector('.modal.is-open')) {
          document.body.classList.remove('modal-open');
        }
      }
    },

    /**
     * Setup global modal click outside and escape key listeners
     */
    initModalEvents() {
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-close-modal]')) {
          const modal = e.target.closest('.modal');
          if (modal) this.closeModal(modal.id);
        }
        if (e.target.classList.contains('modal-backdrop')) {
          const modal = e.target.closest('.modal');
          if (modal) this.closeModal(modal.id);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const openModals = document.querySelectorAll('.modal.is-open');
          openModals.forEach((m) => this.closeModal(m.id));
        }
      });
    },

    /**
     * Currency formatter
     */
    formatCurrency(amount) {
      const settings = window.SalonStore ? window.SalonStore.getSettings() : { currency: '₹' };
      const cur = settings.currency || '₹';
      const num = Number(amount) || 0;
      return `${cur}${num.toLocaleString('en-IN', {
        minimumFractionDigits: num % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;
    },

    /**
     * Format standard YYYY-MM-DD date to friendly string
     */
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
        return dateStr;
      } catch (e) {
        return dateStr;
      }
    },

    /**
     * Format 24h HH:mm to 12h AM/PM
     */
    formatTime(timeStr) {
      if (!timeStr) return '';
      if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
      const [h, m] = timeStr.split(':');
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${m || '00'} ${ampm}`;
    },

    /**
     * Get greeting based on current local hour
     */
    getGreeting() {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    },

    /**
     * Print receipt or trigger window print
     */
    printReceipt() {
      window.print();
    },
  };
})();
