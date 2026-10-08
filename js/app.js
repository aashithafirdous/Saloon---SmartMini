/**
 * SalonSmart Mini - Main Application Logic
 * "Beauty and You."
 * 
 * Simple Architecture:
 * 1. State/Storage: Handled by window.SalonStore (localStorage)
 * 2. UI Helpers: Handled by window.UI (toasts, modals, formatters)
 * 3. App Controller: Page routing, CRUD operations, calculations, Chart.js
 */

(function () {
  'use strict';

  // Global Chart instances so we can recreate them on page refresh
  let salesChartInstance = null;
  let reportMonthChartInstance = null;
  let reportExpChartInstance = null;
  let currentNav = 'dashboard';

  /* =========================================================================
     1. APP BOOTSTRAP & ROUTING
     ========================================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    checkLoginState();

    // Attach all event listeners
    setupNavigation();
    setupAuthListeners();
    setupAppointmentListeners();
    setupServiceListeners();
    setupStaffListeners();
    setupBillingListeners();
    setupExpenseListeners();
    setupCustomerListeners();
    setupReportListeners();
    setupSettingsListeners();

    // Set today's date in top header
    updateLiveDate();
  });

  // Display current date in topbar
  function updateLiveDate() {
    const el = document.getElementById('topbar-date-text');
    if (el) {
      el.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });
    }
  }

  // Check login: If logged in -> show App, else -> show Login card
  function checkLoginState() {
    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (window.SalonStore.isAuthenticated()) {
      loginView.style.display = 'none';
      appView.style.display = 'flex';
      navigateTo('dashboard');
    } else {
      loginView.style.display = 'flex';
      appView.style.display = 'none';
    }
  }

  // Sidebar navigation & page switcher
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = btn.getAttribute('data-nav');
        navigateTo(targetPage);
        // Close mobile drawer on item click
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('mobile-open');
      });
    });

    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('mobile-open');
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('mobile-open');
      });
    }
  }

  // Switch visible page view by ID
  function navigateTo(pageId) {
    currentNav = pageId;

    // 1. Highlight active sidebar button
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-nav') === pageId);
    });

    // 2. Hide all pages, show target page
    document.querySelectorAll('.page-view').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');

    // 3. Update topbar title
    const titles = {
      dashboard: 'Dashboard Overview',
      appointments: 'Salon Appointments',
      services: 'Service Menu',
      staff: 'Staff & Specialists',
      billing: 'Billing & Checkout',
      expenses: 'Expenses & Overhead',
      customers: 'Client Directory',
      reports: 'Analytics & Reports',
      settings: 'Salon Settings'
    };
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = titles[pageId] || 'Dashboard';

    // 4. Render corresponding page content
    switch (pageId) {
      case 'dashboard': renderDashboard(); break;
      case 'appointments': renderAppointments(); break;
      case 'services': renderServices(); break;
      case 'staff': renderStaff(); break;
      case 'billing': renderBilling(); break;
      case 'expenses': renderExpenses(); break;
      case 'customers': renderCustomers(); break;
      case 'reports': renderReports(); break;
      case 'settings': renderSettings(); break;
    }
  }

  /* =========================================================================
     2. AUTHENTICATION (LOGIN & LOGOUT)
     ========================================================================= */
  function setupAuthListeners() {
    const form = document.getElementById('login-form');
    const toggleBtn = document.getElementById('toggle-password-btn');
    const passInput = document.getElementById('login-password');
    const emailInput = document.getElementById('login-email');
    const logoutBtn = document.getElementById('logout-btn');

    // Show / Hide password toggle
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      });
    }

    // Login Form Submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const pass = passInput.value.trim();

        // Simple frontend validation
        if (!email || !email.includes('@')) {
          document.getElementById('login-email-group').classList.add('has-error');
          return;
        }
        document.getElementById('login-email-group').classList.remove('has-error');

        if (!pass || pass.length < 3) {
          document.getElementById('login-password-group').classList.add('has-error');
          return;
        }
        document.getElementById('login-password-group').classList.remove('has-error');

        // Store login in localStorage & redirect
        window.SalonStore.setAuthenticated(true, { email });
        window.UI.toast('Welcome back to SalonSmart Mini! ✨', 'success');
        checkLoginState();
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.UI.confirm({
          title: 'Sign Out',
          message: 'Are you sure you want to log out of the salon system?',
          confirmText: 'Logout',
          isDestructive: true,
          onConfirm: () => {
            window.SalonStore.setAuthenticated(false);
            window.UI.toast('Signed out successfully.', 'info');
            checkLoginState();
          }
        });
      });
    }
  }

  /* =========================================================================
     3. DASHBOARD LOGIC
     ========================================================================= */
  function renderDashboard() {
    // Dynamic greeting based on current hour
    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) greetingEl.textContent = `${window.UI.getGreeting()}, Manager ✨`;

    const today = new Date().toISOString().split('T')[0];
    const appointments = window.SalonStore.getAppointments();
    const bills = window.SalonStore.getBills();
    const expenses = window.SalonStore.getExpenses();
    const staff = window.SalonStore.getStaff();

    // 1. Calculate KPI values
    const todayApts = appointments.filter(a => a.date === today);
    const confirmedCount = todayApts.filter(a => a.status === 'Confirmed').length;
    const todaySales = bills.filter(b => b.date === today).reduce((sum, b) => sum + (Number(b.finalTotal) || 0), 0);
    const todayExpenses = expenses.filter(e => e.date === today).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const activeStaff = staff.filter(s => s.status === 'Available' || s.status === 'Busy').length;

    // 2. Put values on cards
    document.getElementById('kpi-today-appointments').textContent = todayApts.length;
    document.getElementById('kpi-confirmed-count').textContent = `${confirmedCount} confirmed`;
    document.getElementById('kpi-today-sales').textContent = window.UI.formatCurrency(todaySales);
    document.getElementById('kpi-bills-count').textContent = `${bills.filter(b => b.date === today).length} bills today`;
    document.getElementById('kpi-today-expenses').textContent = window.UI.formatCurrency(todayExpenses);
    document.getElementById('kpi-active-staff').textContent = activeStaff;

    // 3. Populate widgets
    renderDashboardUpcoming(todayApts);
    renderDashboardRecentBills(bills);
    renderDashboardStaffAvail(staff);
    drawDashboardChart(bills);
  }

  function renderDashboardUpcoming(todayApts) {
    const list = document.getElementById('dashboard-upcoming-list');
    if (!list) return;

    if (todayApts.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary);">No appointments booked for today.</div>`;
      return;
    }

    list.innerHTML = todayApts.slice(0, 5).map(apt => `
      <div class="mini-appointment-item">
        <div class="mini-apt-left">
          <div class="mini-apt-time">${window.UI.formatTime(apt.time)}</div>
          <div class="mini-apt-details">
            <h4>${escapeHtml(apt.customerName)}</h4>
            <p>${escapeHtml(apt.serviceName)} &bull; ${escapeHtml(apt.staffName)}</p>
          </div>
        </div>
        <span class="badge badge-${apt.status.toLowerCase()}"><span class="badge-dot"></span>${apt.status}</span>
      </div>
    `).join('');
  }

  function renderDashboardRecentBills(bills) {
    const tbody = document.querySelector('#dashboard-recent-bills-table tbody');
    if (!tbody) return;

    const recent = bills.slice(0, 4);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 16px;">No bills recorded yet</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(b => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${escapeHtml(b.customerName)}</td>
        <td>${escapeHtml(b.serviceName)}</td>
        <td style="font-weight:700; color:var(--primary-rose);">${window.UI.formatCurrency(b.finalTotal)}</td>
        <td><span class="badge badge-confirmed">${b.paymentMode || 'UPI'}</span></td>
      </tr>
    `).join('');
  }

  function renderDashboardStaffAvail(staff) {
    const list = document.getElementById('dashboard-staff-avail-list');
    if (!list) return;

    list.innerHTML = staff.map(st => `
      <div class="staff-avail-item">
        <div class="staff-avail-left">
          <div class="staff-avatar-sm" style="background-color: ${st.avatarColor || '#C94F7C'};">${st.name.charAt(0)}</div>
          <div>
            <strong style="font-size:0.86rem;">${escapeHtml(st.name)}</strong>
            <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(st.role)}</div>
          </div>
        </div>
        <span class="badge badge-${st.status.toLowerCase().replace(/\s+/g, '')}"><span class="badge-dot"></span>${st.status}</span>
      </div>
    `).join('');
  }

  // Draw 7-day sales line chart using Chart.js
  function drawDashboardChart(bills) {
    const canvas = document.getElementById('dashboard-sales-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = [];
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
      const daySum = bills.filter(b => b.date === dateKey).reduce((sum, b) => sum + (Number(b.finalTotal) || 0), 0);
      salesData.push(daySum);
    }

    if (salesChartInstance) salesChartInstance.destroy();

    salesChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue',
          data: salesData,
          borderColor: '#C94F7C',
          backgroundColor: 'rgba(201, 79, 124, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: val => window.UI.formatCurrency(val) } }
        }
      }
    });
  }

  // Dashboard quick actions
  document.getElementById('btn-quick-appointment')?.addEventListener('click', () => openAppointmentModal());
  document.getElementById('btn-quick-service')?.addEventListener('click', () => openServiceModal());
  document.getElementById('btn-quick-bill')?.addEventListener('click', () => navigateTo('billing'));
  document.getElementById('btn-quick-expense')?.addEventListener('click', () => openExpenseModal());
  document.getElementById('view-all-appointments-btn')?.addEventListener('click', () => navigateTo('appointments'));
  document.getElementById('view-all-bills-btn')?.addEventListener('click', () => navigateTo('billing'));
  document.getElementById('view-all-staff-btn')?.addEventListener('click', () => navigateTo('staff'));

  /* =========================================================================
     4. APPOINTMENTS (CRUD & CONFLICT DETECTION)
     ========================================================================= */
  function setupAppointmentListeners() {
    document.getElementById('appointment-search')?.addEventListener('input', renderAppointments);
    document.getElementById('appointment-filter-date')?.addEventListener('change', renderAppointments);
    document.getElementById('appointment-filter-status')?.addEventListener('change', renderAppointments);
    document.getElementById('appointment-reset-filters')?.addEventListener('click', () => {
      document.getElementById('appointment-search').value = '';
      document.getElementById('appointment-filter-date').value = '';
      document.getElementById('appointment-filter-status').value = 'all';
      renderAppointments();
    });

    document.getElementById('btn-open-new-appointment')?.addEventListener('click', () => openAppointmentModal());
    document.getElementById('appointment-form')?.addEventListener('submit', handleAppointmentSubmit);
  }

  function renderAppointments() {
    const tbody = document.getElementById('appointments-table-body');
    const table = document.getElementById('appointments-table');
    const empty = document.getElementById('appointments-empty-state');
    if (!tbody) return;

    const search = (document.getElementById('appointment-search')?.value || '').toLowerCase().trim();
    const dateVal = document.getElementById('appointment-filter-date')?.value || '';
    const statusVal = document.getElementById('appointment-filter-status')?.value || 'all';

    let list = window.SalonStore.getAppointments();

    if (search) {
      list = list.filter(a => a.customerName.toLowerCase().includes(search) || a.customerPhone.includes(search) || a.staffName.toLowerCase().includes(search));
    }
    if (dateVal) list = list.filter(a => a.date === dateVal);
    if (statusVal !== 'all') list = list.filter(a => a.status === statusVal);

    if (list.length === 0) {
      tbody.innerHTML = '';
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    table.style.display = 'table';
    empty.style.display = 'none';

    tbody.innerHTML = list.map(apt => `
      <tr>
        <td>
          <strong>${escapeHtml(apt.customerName)}</strong>
          ${apt.notes ? `<div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(apt.notes)}</div>` : ''}
        </td>
        <td style="color:var(--text-secondary);">${escapeHtml(apt.customerPhone)}</td>
        <td><strong>${escapeHtml(apt.serviceName)}</strong></td>
        <td>${escapeHtml(apt.staffName)}</td>
        <td>${window.UI.formatDate(apt.date)}</td>
        <td style="font-weight:700; color:var(--primary-rose);">${window.UI.formatTime(apt.time)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
            <select class="filter-select" style="padding:2px 4px; font-size:0.72rem;" onchange="window.SalonApp.changeAppointmentStatus('${apt.id}', this.value)">
              <option value="Pending" ${apt.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${apt.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Completed" ${apt.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${apt.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            ${apt.status !== 'Completed' && apt.status !== 'Cancelled' ? `<button class="btn btn-secondary btn-sm" onclick="window.SalonApp.quickBillAppointment('${apt.id}')">Bill</button>` : ''}
            <button class="btn btn-outline btn-icon" onclick="window.SalonApp.editAppointment('${apt.id}')" title="Edit">✏️</button>
            <button class="btn btn-danger btn-icon" onclick="window.SalonApp.deleteAppointment('${apt.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAppointmentModal(apt = null, presetCust = null) {
    const srvSelect = document.getElementById('apt-service-select');
    const staffSelect = document.getElementById('apt-staff-select');

    // Populate dropdowns from store
    srvSelect.innerHTML = `<option value="">-- Choose Service --</option>` +
      window.SalonStore.getServices().map(s => `<option value="${s.id}">${s.name} (${window.UI.formatCurrency(s.price)})</option>`).join('');

    staffSelect.innerHTML = `<option value="">-- Choose Stylist --</option>` +
      window.SalonStore.getStaff().map(st => `<option value="${st.id}">${st.name} - ${st.role} (${st.status})</option>`).join('');

    if (apt) {
      document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
      document.getElementById('apt-form-id').value = apt.id;
      document.getElementById('apt-customer-name').value = apt.customerName;
      document.getElementById('apt-customer-phone').value = apt.customerPhone;
      srvSelect.value = apt.serviceId;
      staffSelect.value = apt.staffId;
      document.getElementById('apt-date').value = apt.date;
      document.getElementById('apt-time').value = apt.time;
      document.getElementById('apt-status').value = apt.status;
      document.getElementById('apt-notes').value = apt.notes || '';
    } else {
      document.getElementById('appointment-modal-title').textContent = 'Schedule Appointment';
      document.getElementById('apt-form-id').value = '';
      document.getElementById('apt-customer-name').value = presetCust ? presetCust.name : '';
      document.getElementById('apt-customer-phone').value = presetCust ? presetCust.phone : '';
      srvSelect.value = '';
      staffSelect.value = '';
      document.getElementById('apt-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('apt-time').value = '10:30';
      document.getElementById('apt-status').value = 'Confirmed';
      document.getElementById('apt-notes').value = '';
    }

    window.UI.openModal('appointment-modal');
  }

  function handleAppointmentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('apt-form-id').value;
    const name = document.getElementById('apt-customer-name').value.trim();
    const phone = document.getElementById('apt-customer-phone').value.trim();
    const srvId = document.getElementById('apt-service-select').value;
    const staffId = document.getElementById('apt-staff-select').value;
    const date = document.getElementById('apt-date').value;
    const time = document.getElementById('apt-time').value;
    const status = document.getElementById('apt-status').value;
    const notes = document.getElementById('apt-notes').value.trim();

    if (!name || !phone || !srvId || !staffId || !date || !time) {
      window.UI.toast('Please fill all required appointment fields.', 'error');
      return;
    }

    // CONFLICT PREVENTION: Check if staff already has another non-cancelled booking at this time
    if (window.SalonStore.hasBookingConflict(staffId, date, time, id)) {
      const staffObj = window.SalonStore.getStaffById(staffId);
      window.UI.toast(`Booking Conflict: ${staffObj ? staffObj.name : 'Stylist'} is already booked on ${date} at ${window.UI.formatTime(time)}!`, 'warning', 4500);
      return;
    }

    const srv = window.SalonStore.getServiceById(srvId);
    const stf = window.SalonStore.getStaffById(staffId);

    window.SalonStore.saveAppointment({
      id: id || undefined,
      customerName: name,
      customerPhone: phone,
      serviceId: srvId,
      serviceName: srv ? srv.name : 'Service',
      staffId: staffId,
      staffName: stf ? stf.name : 'Staff',
      date, time, status, notes
    });

    window.UI.closeModal('appointment-modal');
    window.UI.toast(id ? 'Appointment updated!' : 'Appointment booked successfully! ✨', 'success');
    renderAppointments();
    if (currentNav === 'dashboard') renderDashboard();
  }

  /* =========================================================================
     5. SERVICES (CATALOG & PRICING)
     ========================================================================= */
  function setupServiceListeners() {
    document.getElementById('services-search')?.addEventListener('input', renderServices);
    document.getElementById('services-filter-category')?.addEventListener('change', renderServices);
    document.getElementById('btn-open-new-service')?.addEventListener('click', () => openServiceModal());
    document.getElementById('service-form')?.addEventListener('submit', handleServiceSubmit);
  }

  function renderServices() {
    const grid = document.getElementById('services-grid');
    const empty = document.getElementById('services-empty-state');
    if (!grid) return;

    const search = (document.getElementById('services-search')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('services-filter-category')?.value || 'all';

    let list = window.SalonStore.getServices();
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search) || (s.description && s.description.toLowerCase().includes(search)));
    if (cat !== 'all') list = list.filter(s => s.category === cat);

    if (list.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = list.map(s => `
      <div class="service-card">
        <div>
          <div class="service-card-top">
            <span class="service-category-tag">${escapeHtml(s.category)}</span>
            <span class="service-price">${window.UI.formatCurrency(s.price)}</span>
          </div>
          <h3 class="service-title">${escapeHtml(s.name)}</h3>
          <p class="service-desc">${escapeHtml(s.description || 'Specialized salon treatment.')}</p>
        </div>
        <div class="service-card-bottom">
          <div class="service-duration">⏱️ ${s.duration} mins</div>
          <div class="card-actions-group">
            <button class="btn btn-outline btn-sm" onclick="window.SalonApp.editService('${s.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="window.SalonApp.deleteService('${s.id}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function openServiceModal(s = null) {
    if (s) {
      document.getElementById('service-modal-title').textContent = 'Edit Service';
      document.getElementById('service-form-id').value = s.id;
      document.getElementById('srv-name').value = s.name;
      document.getElementById('srv-category').value = s.category;
      document.getElementById('srv-duration').value = s.duration;
      document.getElementById('srv-price').value = s.price;
      document.getElementById('srv-desc').value = s.description || '';
    } else {
      document.getElementById('service-modal-title').textContent = 'Add Salon Service';
      document.getElementById('service-form-id').value = '';
      document.getElementById('srv-name').value = '';
      document.getElementById('srv-category').value = 'Hair';
      document.getElementById('srv-duration').value = 45;
      document.getElementById('srv-price').value = 800;
      document.getElementById('srv-desc').value = '';
    }
    window.UI.openModal('service-modal');
  }

  function handleServiceSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('service-form-id').value;
    const name = document.getElementById('srv-name').value.trim();
    const category = document.getElementById('srv-category').value;
    const duration = Number(document.getElementById('srv-duration').value) || 30;
    const price = Number(document.getElementById('srv-price').value) || 0;
    const description = document.getElementById('srv-desc').value.trim();

    if (!name || price < 0 || duration <= 0) {
      window.UI.toast('Please check service name, price, and duration.', 'error');
      return;
    }

    window.SalonStore.saveService({ id: id || undefined, name, category, duration, price, description });
    window.UI.closeModal('service-modal');
    window.UI.toast(id ? 'Service updated!' : 'Service created! ✨', 'success');
    renderServices();
  }

  /* =========================================================================
     6. STAFF (SPECIALISTS & WORKLOAD)
     ========================================================================= */
  function setupStaffListeners() {
    document.getElementById('staff-search')?.addEventListener('input', renderStaff);
    document.getElementById('staff-filter-status')?.addEventListener('change', renderStaff);
    document.getElementById('btn-open-new-staff')?.addEventListener('click', () => openStaffModal());
    document.getElementById('staff-form')?.addEventListener('submit', handleStaffSubmit);
  }

  function renderStaff() {
    const grid = document.getElementById('staff-grid');
    const empty = document.getElementById('staff-empty-state');
    if (!grid) return;

    const search = (document.getElementById('staff-search')?.value || '').toLowerCase().trim();
    const statusVal = document.getElementById('staff-filter-status')?.value || 'all';

    let list = window.SalonStore.getStaff();
    if (search) list = list.filter(st => st.name.toLowerCase().includes(search) || st.role.toLowerCase().includes(search));
    if (statusVal !== 'all') list = list.filter(st => st.status === statusVal);

    if (list.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    grid.innerHTML = list.map(st => {
      const workload = window.SalonStore.getStaffWorkload(st.id);
      return `
        <div class="staff-card">
          <div class="staff-card-header">
            <div class="staff-card-avatar" style="background-color: ${st.avatarColor || '#C94F7C'};">${st.name.charAt(0)}</div>
            <div class="staff-card-info">
              <h3>${escapeHtml(st.name)}</h3>
              <p>${escapeHtml(st.role)}</p>
            </div>
          </div>
          <div class="staff-details-list">
            <div class="staff-detail-row">
              <span class="staff-detail-label">Status:</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span class="badge badge-${st.status.toLowerCase().replace(/\s+/g, '')}">${st.status}</span>
                <select class="filter-select" style="padding:2px 4px; font-size:0.72rem;" onchange="window.SalonApp.quickChangeStaffStatus('${st.id}', this.value)">
                  <option value="Available" ${st.status === 'Available' ? 'selected' : ''}>Available</option>
                  <option value="Busy" ${st.status === 'Busy' ? 'selected' : ''}>Busy</option>
                  <option value="Off Duty" ${st.status === 'Off Duty' ? 'selected' : ''}>Off Duty</option>
                </select>
              </div>
            </div>
            <div class="staff-detail-row">
              <span class="staff-detail-label">Today's Workload:</span>
              <span class="staff-detail-val" style="color:var(--primary-rose); font-weight:700;">${workload} appointments</span>
            </div>
            <div class="staff-detail-row">
              <span class="staff-detail-label">Working Hours:</span>
              <span class="staff-detail-val">${escapeHtml(st.workingHours || '10:00 AM - 07:00 PM')}</span>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid var(--border-light);">
            <span style="font-size:0.78rem; color:var(--text-secondary);">${escapeHtml(st.phone || '')}</span>
            <div class="card-actions-group">
              <button class="btn btn-outline btn-sm" onclick="window.SalonApp.editStaff('${st.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="window.SalonApp.deleteStaff('${st.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openStaffModal(st = null) {
    if (st) {
      document.getElementById('staff-modal-title').textContent = 'Edit Staff';
      document.getElementById('staff-form-id').value = st.id;
      document.getElementById('staff-name').value = st.name;
      document.getElementById('staff-phone').value = st.phone || '';
      document.getElementById('staff-role').value = st.role;
      document.getElementById('staff-status').value = st.status;
      document.getElementById('staff-hours').value = st.workingHours || '';
      document.getElementById('staff-spec').value = st.specialization || '';
    } else {
      document.getElementById('staff-modal-title').textContent = 'Add Staff Specialist';
      document.getElementById('staff-form-id').value = '';
      document.getElementById('staff-name').value = '';
      document.getElementById('staff-phone').value = '';
      document.getElementById('staff-role').value = 'Senior Stylist';
      document.getElementById('staff-status').value = 'Available';
      document.getElementById('staff-hours').value = '10:00 AM - 07:00 PM';
      document.getElementById('staff-spec').value = '';
    }
    window.UI.openModal('staff-modal');
  }

  function handleStaffSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('staff-form-id').value;
    const name = document.getElementById('staff-name').value.trim();
    const phone = document.getElementById('staff-phone').value.trim();
    const role = document.getElementById('staff-role').value.trim();
    const status = document.getElementById('staff-status').value;
    const workingHours = document.getElementById('staff-hours').value.trim();
    const specialization = document.getElementById('staff-spec').value.trim();

    if (!name || !role) {
      window.UI.toast('Staff name and role are required.', 'error');
      return;
    }

    window.SalonStore.saveStaff({ id: id || undefined, name, phone, role, status, workingHours, specialization });
    window.UI.closeModal('staff-modal');
    window.UI.toast(id ? 'Staff profile updated!' : 'Staff specialist added! ✨', 'success');
    renderStaff();
    if (currentNav === 'dashboard') renderDashboard();
  }

  /* =========================================================================
     7. BILLING & THERMAL INVOICE GENERATION
     ========================================================================= */
  function setupBillingListeners() {
    const aptSelect = document.getElementById('bill-select-appointment');
    const srvSelect = document.getElementById('bill-service-select');
    const priceInput = document.getElementById('bill-service-price');
    const discountInput = document.getElementById('bill-discount');
    const modeBtns = document.querySelectorAll('.payment-mode-btn');

    // Auto-fill form when user selects a booked appointment
    aptSelect?.addEventListener('change', () => {
      const apt = window.SalonStore.getAppointmentById(aptSelect.value);
      if (apt) {
        document.getElementById('bill-customer-name').value = apt.customerName;
        document.getElementById('bill-customer-phone').value = apt.customerPhone;
        srvSelect.value = apt.serviceId;
        const srv = window.SalonStore.getServiceById(apt.serviceId);
        if (srv) priceInput.value = srv.price;
        const staffSel = document.getElementById('bill-staff-select');
        if (staffSel) staffSel.value = apt.staffId;
        recalculateBill();
      }
    });

    // Auto-update price when service changes
    srvSelect?.addEventListener('change', () => {
      const srv = window.SalonStore.getServiceById(srvSelect.value);
      if (srv) priceInput.value = srv.price;
      recalculateBill();
    });

    // Live Math calculation as inputs change
    priceInput?.addEventListener('input', recalculateBill);
    discountInput?.addEventListener('input', recalculateBill);
    document.getElementById('bill-customer-name')?.addEventListener('input', recalculateBill);
    document.getElementById('bill-staff-select')?.addEventListener('change', recalculateBill);

    // Payment mode selector (UPI, Cash, Card)
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        document.getElementById('bill-payment-mode').value = mode;
        const pMode = document.getElementById('preview-bill-mode');
        if (pMode) pMode.textContent = mode;
      });
    });

    document.getElementById('billing-form')?.addEventListener('submit', handleBillingSubmit);
    document.getElementById('btn-print-receipt')?.addEventListener('click', () => window.UI.printReceipt());
    document.getElementById('billing-history-search')?.addEventListener('input', renderBillingHistory);
  }

  // Real-time calculation: Base - Discount + Tax = Total
  function recalculateBill() {
    const settings = window.SalonStore.getSettings();
    const taxRate = Number(settings.taxRate) || 5;

    const base = Math.max(0, Number(document.getElementById('bill-service-price')?.value) || 0);
    const discount = Math.max(0, Number(document.getElementById('bill-discount')?.value) || 0);
    const subtotal = Math.max(0, base - discount);
    const taxAmount = (subtotal * taxRate) / 100;
    const finalTotal = subtotal + taxAmount;

    // Update real-time preview card
    const name = document.getElementById('bill-customer-name')?.value.trim() || '-';
    const srvSel = document.getElementById('bill-service-select');
    const srvName = srvSel?.options[srvSel.selectedIndex]?.text?.split('-')[0]?.trim() || '-';

    document.getElementById('preview-bill-customer').textContent = name;
    document.getElementById('preview-bill-service').textContent = srvName;
    document.getElementById('preview-bill-base').textContent = window.UI.formatCurrency(base);
    document.getElementById('preview-bill-discount').textContent = `- ${window.UI.formatCurrency(discount)}`;
    document.getElementById('preview-bill-subtotal').textContent = window.UI.formatCurrency(subtotal);
    document.getElementById('preview-bill-tax').textContent = `${window.UI.formatCurrency(taxAmount)} (${taxRate}%)`;
    document.getElementById('preview-bill-total').textContent = window.UI.formatCurrency(finalTotal);

    return { base, discount, subtotal, taxRate, taxAmount, finalTotal };
  }

  function renderBilling() {
    // Populate billing selects
    const aptSel = document.getElementById('bill-select-appointment');
    const srvSel = document.getElementById('bill-service-select');
    const staffSel = document.getElementById('bill-staff-select');

    if (aptSel) {
      aptSel.innerHTML = `<option value="">-- Choose Booked Appointment or Walk-in --</option>` +
        window.SalonStore.getAppointments().filter(a => a.status === 'Confirmed' || a.status === 'Pending').map(a =>
          `<option value="${a.id}">${a.customerName} - ${a.serviceName} (${a.date} ${window.UI.formatTime(a.time)})</option>`
        ).join('');
    }

    if (srvSel) {
      srvSel.innerHTML = `<option value="">-- Select Service --</option>` +
        window.SalonStore.getServices().map(s => `<option value="${s.id}">${s.name} - ${window.UI.formatCurrency(s.price)}</option>`).join('');
    }

    if (staffSel) {
      staffSel.innerHTML = `<option value="">-- Select Staff --</option>` +
        window.SalonStore.getStaff().map(st => `<option value="${st.id}">${st.name} (${st.role})</option>`).join('');
    }

    recalculateBill();
    renderBillingHistory();
  }

  function handleBillingSubmit(e) {
    e.preventDefault();
    const aptId = document.getElementById('bill-select-appointment').value || null;
    const name = document.getElementById('bill-customer-name').value.trim();
    const phone = document.getElementById('bill-customer-phone').value.trim();
    const srvSel = document.getElementById('bill-service-select');
    const srvName = srvSel.options[srvSel.selectedIndex]?.text?.split('-')[0]?.trim();
    const staffSel = document.getElementById('bill-staff-select');
    const staffName = staffSel.options[staffSel.selectedIndex]?.text?.split('(')[0]?.trim() || 'Specialist';
    const mode = document.getElementById('bill-payment-mode').value || 'UPI';

    if (!name || !phone || !srvSel.value) {
      window.UI.toast('Please enter customer info and select a service.', 'error');
      return;
    }

    const calc = recalculateBill();
    if (calc.base <= 0) {
      window.UI.toast('Please specify a valid service price.', 'error');
      return;
    }

    // Save Bill object to store
    const bill = window.SalonStore.saveBill({
      appointmentId: aptId,
      customerName: name,
      customerPhone: phone,
      serviceName: srvName,
      staffName: staffName,
      date: new Date().toISOString().split('T')[0],
      servicePrice: calc.base,
      discount: calc.discount,
      taxPercent: calc.taxRate,
      taxAmount: calc.taxAmount,
      subtotal: calc.subtotal,
      finalTotal: calc.finalTotal,
      paymentMode: mode,
      status: 'Paid'
    });

    window.UI.toast(`Invoice ${bill.id} generated! ✨`, 'success');
    document.getElementById('billing-form').reset();
    renderBilling();

    // Show thermal receipt popup
    openReceiptModal(bill);
  }

  function renderBillingHistory() {
    const tbody = document.getElementById('billing-history-body');
    if (!tbody) return;

    const search = (document.getElementById('billing-history-search')?.value || '').toLowerCase().trim();
    let bills = window.SalonStore.getBills();

    if (search) bills = bills.filter(b => b.id.toLowerCase().includes(search) || b.customerName.toLowerCase().includes(search) || b.serviceName.toLowerCase().includes(search));

    if (bills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:18px;">No invoice records found</td></tr>`;
      return;
    }

    tbody.innerHTML = bills.map(b => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${window.UI.formatDate(b.date)}</td>
        <td>${escapeHtml(b.customerName)}</td>
        <td>${escapeHtml(b.serviceName)}</td>
        <td style="font-weight:700; color:var(--primary-rose);">${window.UI.formatCurrency(b.finalTotal)}</td>
        <td><span class="badge badge-confirmed">${b.paymentMode}</span></td>
        <td style="text-align:right;"><button class="btn btn-outline btn-sm" onclick="window.SalonApp.viewBillReceipt('${b.id}')">View Receipt</button></td>
      </tr>
    `).join('');
  }

  function openReceiptModal(bill) {
    const settings = window.SalonStore.getSettings();
    document.getElementById('receipt-salon-name').textContent = settings.salonName || 'SalonSmart Mini';
    document.getElementById('receipt-salon-tagline').textContent = `“${settings.tagline || 'Beauty and You.'}”`;
    document.getElementById('receipt-salon-phone').textContent = `Ph: ${settings.phone || ''}`;
    document.getElementById('receipt-salon-address').textContent = settings.address || '';

    document.getElementById('receipt-inv-id').textContent = bill.id;
    document.getElementById('receipt-date').textContent = window.UI.formatDate(bill.date);
    document.getElementById('receipt-customer-name').textContent = bill.customerName;
    document.getElementById('receipt-customer-phone').textContent = bill.customerPhone;
    document.getElementById('receipt-staff-name').textContent = bill.staffName || 'Specialist';
    document.getElementById('receipt-service-item').textContent = bill.serviceName;
    document.getElementById('receipt-service-amount').textContent = window.UI.formatCurrency(bill.servicePrice);
    document.getElementById('receipt-subtotal').textContent = window.UI.formatCurrency(bill.subtotal);
    document.getElementById('receipt-discount').textContent = `- ${window.UI.formatCurrency(bill.discount)}`;
    document.getElementById('receipt-tax').textContent = window.UI.formatCurrency(bill.taxAmount);
    document.getElementById('receipt-total').textContent = window.UI.formatCurrency(bill.finalTotal);
    document.getElementById('receipt-payment-mode').textContent = bill.paymentMode;

    window.UI.openModal('receipt-modal');
  }

  /* =========================================================================
     8. EXPENSES (OVERHEAD TRACKING)
     ========================================================================= */
  function setupExpenseListeners() {
    document.getElementById('expense-search')?.addEventListener('input', renderExpenses);
    document.getElementById('expense-filter-category')?.addEventListener('change', renderExpenses);
    document.getElementById('btn-open-new-expense')?.addEventListener('click', () => openExpenseModal());
    document.getElementById('expense-form')?.addEventListener('submit', handleExpenseSubmit);
  }

  function renderExpenses() {
    const tbody = document.getElementById('expenses-table-body');
    const table = document.getElementById('expenses-table');
    const empty = document.getElementById('expenses-empty-state');
    if (!tbody) return;

    const search = (document.getElementById('expense-search')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('expense-filter-category')?.value || 'all';

    let list = window.SalonStore.getExpenses();

    // Summary calculations
    const totalOut = list.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const productOut = list.filter(e => e.category === 'Products').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const utilOut = list.filter(e => e.category === 'Rent' || e.category === 'Electricity' || e.category === 'Water').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    document.getElementById('expense-total-amount').textContent = window.UI.formatCurrency(totalOut);
    document.getElementById('expense-entries-count').textContent = `${list.length} records`;
    document.getElementById('expense-products-amount').textContent = window.UI.formatCurrency(productOut);
    document.getElementById('expense-utilities-amount').textContent = window.UI.formatCurrency(utilOut);

    if (search) list = list.filter(e => e.description.toLowerCase().includes(search) || e.category.toLowerCase().includes(search));
    if (cat !== 'all') list = list.filter(e => e.category === cat);

    if (list.length === 0) {
      tbody.innerHTML = '';
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }
    table.style.display = 'table';
    empty.style.display = 'none';

    tbody.innerHTML = list.map(exp => `
      <tr>
        <td><span class="badge badge-confirmed">${escapeHtml(exp.category)}</span></td>
        <td><strong>${escapeHtml(exp.description)}</strong></td>
        <td>${window.UI.formatDate(exp.date)}</td>
        <td>${exp.paymentMode}</td>
        <td style="font-weight:700; color:#B91C1C;">${window.UI.formatCurrency(exp.amount)}</td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <button class="btn btn-outline btn-icon" onclick="window.SalonApp.editExpense('${exp.id}')">✏️</button>
            <button class="btn btn-danger btn-icon" onclick="window.SalonApp.deleteExpense('${exp.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openExpenseModal(exp = null) {
    if (exp) {
      document.getElementById('expense-modal-title').textContent = 'Edit Expense';
      document.getElementById('expense-form-id').value = exp.id;
      document.getElementById('exp-category').value = exp.category;
      document.getElementById('exp-amount').value = exp.amount;
      document.getElementById('exp-date').value = exp.date;
      document.getElementById('exp-mode').value = exp.paymentMode || 'UPI';
      document.getElementById('exp-desc').value = exp.description;
    } else {
      document.getElementById('expense-modal-title').textContent = 'Record Expense';
      document.getElementById('expense-form-id').value = '';
      document.getElementById('exp-category').value = 'Products';
      document.getElementById('exp-amount').value = '';
      document.getElementById('exp-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('exp-mode').value = 'UPI';
      document.getElementById('exp-desc').value = '';
    }
    window.UI.openModal('expense-modal');
  }

  function handleExpenseSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('expense-form-id').value;
    const category = document.getElementById('exp-category').value;
    const amount = Number(document.getElementById('exp-amount').value) || 0;
    const date = document.getElementById('exp-date').value;
    const paymentMode = document.getElementById('exp-mode').value;
    const description = document.getElementById('exp-desc').value.trim();

    if (!category || amount <= 0 || !date || !description) {
      window.UI.toast('Please enter a valid amount and description.', 'error');
      return;
    }

    window.SalonStore.saveExpense({ id: id || undefined, category, amount, date, paymentMode, description });
    window.UI.closeModal('expense-modal');
    window.UI.toast(id ? 'Expense updated!' : 'Expense recorded! ✨', 'success');
    renderExpenses();
    if (currentNav === 'dashboard') renderDashboard();
  }

  /* =========================================================================
     9. CUSTOMERS DIRECTORY & HISTORY MODAL
     ========================================================================= */
  function setupCustomerListeners() {
    document.getElementById('customer-search')?.addEventListener('input', renderCustomers);
    document.getElementById('btn-open-new-customer')?.addEventListener('click', () => window.UI.openModal('customer-add-modal'));

    document.getElementById('customer-add-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-cust-name').value.trim();
      const phone = document.getElementById('new-cust-phone').value.trim();
      const email = document.getElementById('new-cust-email').value.trim();
      const notes = document.getElementById('new-cust-notes').value.trim();

      if (!name || !phone) {
        window.UI.toast('Name and phone are required.', 'error');
        return;
      }

      window.SalonStore.saveCustomer({
        name, phone, email, notes,
        lastVisit: new Date().toISOString().split('T')[0],
        visitsCount: 1, totalSpent: 0, services: []
      });

      document.getElementById('customer-add-form').reset();
      window.UI.closeModal('customer-add-modal');
      window.UI.toast('Customer added! ✨', 'success');
      renderCustomers();
    });

    document.getElementById('cust-modal-save-notes-btn')?.addEventListener('click', () => {
      const id = document.getElementById('cust-modal-save-notes-btn').getAttribute('data-cust-id');
      const cust = window.SalonStore.getCustomerById(id);
      if (cust) {
        cust.notes = document.getElementById('cust-modal-notes').value.trim();
        window.SalonStore.saveCustomer(cust);
        window.UI.toast('Client reminder note saved! ✨', 'success');
      }
    });

    document.getElementById('cust-modal-book-btn')?.addEventListener('click', () => {
      const id = document.getElementById('cust-modal-save-notes-btn').getAttribute('data-cust-id');
      const cust = window.SalonStore.getCustomerById(id);
      window.UI.closeModal('customer-detail-modal');
      openAppointmentModal(null, cust);
    });
  }

  function renderCustomers() {
    const tbody = document.getElementById('customers-table-body');
    const table = document.getElementById('customers-table');
    const empty = document.getElementById('customers-empty-state');
    if (!tbody) return;

    const search = (document.getElementById('customer-search')?.value || '').toLowerCase().trim();
    let list = window.SalonStore.getCustomers();

    if (search) list = list.filter(c => c.name.toLowerCase().includes(search) || c.phone.includes(search));

    if (list.length === 0) {
      tbody.innerHTML = '';
      table.style.display = 'none';
      empty.style.display = 'block';
      return;
    }
    table.style.display = 'table';
    empty.style.display = 'none';

    tbody.innerHTML = list.map(c => `
      <tr>
        <td>
          <strong>${escapeHtml(c.name)}</strong>
          ${c.email ? `<div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(c.email)}</div>` : ''}
        </td>
        <td style="color:var(--text-secondary);">${escapeHtml(c.phone)}</td>
        <td><span class="badge badge-confirmed">${c.visitsCount || 1} visits</span></td>
        <td>${window.UI.formatDate(c.lastVisit)}</td>
        <td style="font-size:0.8rem; color:var(--text-secondary);">${(c.services && c.services.length) ? escapeHtml(c.services.slice(0, 2).join(', ')) : 'Haircut & Styling'}</td>
        <td style="font-weight:700; color:var(--primary-rose);">${window.UI.formatCurrency(c.totalSpent || 0)}</td>
        <td style="text-align:right;"><button class="btn btn-outline btn-sm" onclick="window.SalonApp.viewCustomerDetails('${c.id}')">View Details</button></td>
      </tr>
    `).join('');
  }

  function openCustomerDetails(id) {
    const cust = window.SalonStore.getCustomerById(id);
    if (!cust) return;

    document.getElementById('cust-modal-name').textContent = cust.name;
    document.getElementById('cust-modal-phone').textContent = `${cust.phone} ${cust.email ? '• ' + cust.email : ''}`;
    document.getElementById('cust-modal-visits').textContent = cust.visitsCount || 1;
    document.getElementById('cust-modal-spent').textContent = window.UI.formatCurrency(cust.totalSpent || 0);
    document.getElementById('cust-modal-last-visit').textContent = window.UI.formatDate(cust.lastVisit);
    document.getElementById('cust-modal-notes').value = cust.notes || '';
    document.getElementById('cust-modal-save-notes-btn').setAttribute('data-cust-id', cust.id);

    // Filter appointments for this customer
    const history = window.SalonStore.getAppointments().filter(a => a.customerPhone === cust.phone || a.customerName.toLowerCase() === cust.name.toLowerCase());
    const histBody = document.getElementById('cust-modal-history-body');
    if (history.length === 0) {
      histBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:14px;">No appointment logs</td></tr>`;
    } else {
      histBody.innerHTML = history.map(a => `
        <tr>
          <td>${window.UI.formatDate(a.date)} ${window.UI.formatTime(a.time)}</td>
          <td><strong>${escapeHtml(a.serviceName)}</strong></td>
          <td>${escapeHtml(a.staffName)}</td>
          <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
        </tr>
      `).join('');
    }

    window.UI.openModal('customer-detail-modal');
  }

  /* =========================================================================
     10. REPORTS & CHARTS
     ========================================================================= */
  function setupReportListeners() {
    document.getElementById('reports-print-btn')?.addEventListener('click', () => window.print());
  }

  function renderReports() {
    const bills = window.SalonStore.getBills();
    const expenses = window.SalonStore.getExpenses();
    const appointments = window.SalonStore.getAppointments();
    const services = window.SalonStore.getServices();
    const staff = window.SalonStore.getStaff();

    const totalSales = bills.reduce((sum, b) => sum + (Number(b.finalTotal) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const profit = totalSales - totalExpenses;
    const margin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;
    const completedApts = appointments.filter(a => a.status === 'Completed').length;
    const rate = appointments.length > 0 ? Math.round((completedApts / appointments.length) * 100) : 100;

    document.getElementById('report-total-sales').textContent = window.UI.formatCurrency(totalSales);
    document.getElementById('report-sales-count').textContent = `${bills.length} invoices generated`;
    document.getElementById('report-total-expenses').textContent = window.UI.formatCurrency(totalExpenses);
    document.getElementById('report-expense-count').textContent = `${expenses.length} expense items`;
    document.getElementById('report-net-profit').textContent = window.UI.formatCurrency(profit);
    document.getElementById('report-profit-margin').textContent = `Margin: ${margin}%`;
    document.getElementById('report-success-rate').textContent = `${rate}%`;
    document.getElementById('report-apt-breakdown').textContent = `${completedApts} of ${appointments.length} completed`;

    drawReportMonthlyChart(bills, expenses);
    drawReportExpenseChart(expenses);

    // Popular services table
    const srvCounts = services.map(s => ({ ...s, count: appointments.filter(a => a.serviceId === s.id).length })).sort((a, b) => b.count - a.count);
    document.querySelector('#report-popular-services-table tbody').innerHTML = srvCounts.slice(0, 5).map(s => `
      <tr>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td><span class="badge badge-confirmed">${s.category}</span></td>
        <td style="font-weight:700; color:var(--primary-rose);">${s.count} bookings</td>
        <td>${window.UI.formatCurrency(s.price)}</td>
      </tr>
    `).join('');

    // Staff workload table
    document.querySelector('#report-staff-workload-table tbody').innerHTML = staff.map(st => `
      <tr>
        <td><strong>${escapeHtml(st.name)}</strong></td>
        <td>${escapeHtml(st.role)}</td>
        <td><span class="badge badge-${st.status.toLowerCase().replace(/\s+/g, '')}">${st.status}</span></td>
        <td style="font-weight:700; color:var(--violet);">${appointments.filter(a => a.staffId === st.id).length} assigned</td>
      </tr>
    `).join('');
  }

  function drawReportMonthlyChart(bills, expenses) {
    const canvas = document.getElementById('report-monthly-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const sales = [18000, 21000, 24500, 27000, 31000, bills.reduce((s, b) => s + (Number(b.finalTotal) || 0), 0)];
    const exps = [11000, 13000, 15500, 14000, 17500, expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)];

    if (reportMonthChartInstance) reportMonthChartInstance.destroy();

    reportMonthChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Sales', data: sales, backgroundColor: '#C94F7C', borderRadius: 4 },
          { label: 'Expenses', data: exps, backgroundColor: '#8B6BAE', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { callback: v => window.UI.formatCurrency(v) } } }
      }
    });
  }

  function drawReportExpenseChart(expenses) {
    const canvas = document.getElementById('report-expense-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const cats = ['Rent', 'Salary', 'Products', 'Electricity', 'Water', 'Other'];
    const data = cats.map(c => expenses.filter(e => e.category === c).reduce((sum, e) => sum + (Number(e.amount) || 0), 0));

    if (reportExpChartInstance) reportExpChartInstance.destroy();

    reportExpChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: cats,
        datasets: [{
          data: data,
          backgroundColor: ['#C94F7C', '#8B6BAE', '#E96A9A', '#6B8EAE', '#10B981', '#F59E0B'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  /* =========================================================================
     11. SETTINGS & RESET DEMO DATA
     ========================================================================= */
  function setupSettingsListeners() {
    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newSettings = {
        salonName: document.getElementById('set-salon-name').value.trim() || 'SalonSmart Mini',
        tagline: document.getElementById('set-tagline').value.trim() || 'Beauty and You.',
        phone: document.getElementById('set-phone').value.trim(),
        email: document.getElementById('set-email').value.trim(),
        address: document.getElementById('set-address').value.trim(),
        currency: document.getElementById('set-currency').value,
        taxRate: Number(document.getElementById('set-tax-rate').value) || 5,
        notifications: {
          smsAlerts: document.getElementById('set-sms-alerts').checked,
          emailReceipts: document.getElementById('set-email-receipts').checked,
          slotReminders: document.getElementById('set-slot-reminders').checked
        }
      };

      window.SalonStore.saveSettings(newSettings);
      document.getElementById('sidebar-salon-name').textContent = newSettings.salonName;
      window.UI.toast('Settings updated successfully! ✨', 'success');
    });

    document.getElementById('settings-reset-defaults-btn')?.addEventListener('click', () => {
      window.UI.confirm({
        title: 'Reset Demo Data',
        message: 'This will reset all bookings, services, staff, and bills back to fresh sample defaults. Proceed?',
        confirmText: 'Reset Data',
        isDestructive: true,
        onConfirm: () => {
          window.SalonStore.resetAllData();
          window.UI.toast('Demo data restored!', 'success');
          renderSettings();
          if (currentNav === 'dashboard') renderDashboard();
        }
      });
    });
  }

  function renderSettings() {
    const s = window.SalonStore.getSettings();
    document.getElementById('set-salon-name').value = s.salonName || '';
    document.getElementById('set-tagline').value = s.tagline || '';
    document.getElementById('set-phone').value = s.phone || '';
    document.getElementById('set-email').value = s.email || '';
    document.getElementById('set-address').value = s.address || '';
    document.getElementById('set-currency').value = s.currency || '₹';
    document.getElementById('set-tax-rate').value = s.taxRate || 5;
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* =========================================================================
     12. PUBLIC BRIDGE FOR INLINE HTML CLICKS
     ========================================================================= */
  window.SalonApp = {
    changeAppointmentStatus(id, newStatus) {
      window.SalonStore.updateAppointmentStatus(id, newStatus);
      window.UI.toast(`Status updated to ${newStatus}`, 'info');
      renderAppointments();
      if (currentNav === 'dashboard') renderDashboard();
    },

    editAppointment(id) {
      const apt = window.SalonStore.getAppointmentById(id);
      if (apt) openAppointmentModal(apt);
    },

    deleteAppointment(id) {
      window.UI.confirm({
        title: 'Delete Appointment',
        message: 'Are you sure you want to delete this appointment?',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: () => {
          window.SalonStore.deleteAppointment(id);
          window.UI.toast('Appointment removed.', 'info');
          renderAppointments();
          if (currentNav === 'dashboard') renderDashboard();
        }
      });
    },

    quickBillAppointment(id) {
      navigateTo('billing');
      setTimeout(() => {
        const sel = document.getElementById('bill-select-appointment');
        if (sel) {
          sel.value = id;
          sel.dispatchEvent(new Event('change'));
        }
      }, 100);
    },

    editService(id) {
      const s = window.SalonStore.getServiceById(id);
      if (s) openServiceModal(s);
    },

    deleteService(id) {
      window.UI.confirm({
        title: 'Delete Service',
        message: 'Remove this service from salon catalog?',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: () => {
          window.SalonStore.deleteService(id);
          window.UI.toast('Service removed.', 'info');
          renderServices();
        }
      });
    },

    quickChangeStaffStatus(id, status) {
      const st = window.SalonStore.getStaffById(id);
      if (st) {
        st.status = status;
        window.SalonStore.saveStaff(st);
        window.UI.toast(`${st.name} is now ${status}`, 'info');
        renderStaff();
        if (currentNav === 'dashboard') renderDashboard();
      }
    },

    editStaff(id) {
      const st = window.SalonStore.getStaffById(id);
      if (st) openStaffModal(st);
    },

    deleteStaff(id) {
      window.UI.confirm({
        title: 'Delete Staff',
        message: 'Remove this staff member?',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: () => {
          window.SalonStore.deleteStaff(id);
          window.UI.toast('Staff member removed.', 'info');
          renderStaff();
          if (currentNav === 'dashboard') renderDashboard();
        }
      });
    },

    editExpense(id) {
      const exp = window.SalonStore.getExpenses().find(e => e.id === id);
      if (exp) openExpenseModal(exp);
    },

    deleteExpense(id) {
      window.UI.confirm({
        title: 'Delete Expense',
        message: 'Delete this expense entry?',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: () => {
          window.SalonStore.deleteExpense(id);
          window.UI.toast('Expense deleted.', 'info');
          renderExpenses();
          if (currentNav === 'dashboard') renderDashboard();
        }
      });
    },

    viewCustomerDetails(id) { openCustomerDetails(id); },
    viewBillReceipt(id) {
      const b = window.SalonStore.getBills().find(bill => bill.id === id);
      if (b) openReceiptModal(b);
    }
  };
})();
