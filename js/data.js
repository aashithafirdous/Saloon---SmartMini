/**
 * SalonSmart Mini - Data Store & LocalStorage Manager
 * "Beauty and You."
 */

(function () {
  'use strict';

  // Helper to format dates relative to today
  function getRelativeDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  const STORAGE_KEYS = {
    AUTH: 'salonsmart_auth',
    SETTINGS: 'salonsmart_settings',
    SERVICES: 'salonsmart_services',
    STAFF: 'salonsmart_staff',
    CUSTOMERS: 'salonsmart_customers',
    APPOINTMENTS: 'salonsmart_appointments',
    EXPENSES: 'salonsmart_expenses',
    BILLS: 'salonsmart_bills',
  };

  const DEFAULT_SETTINGS = {
    salonName: 'SalonSmart Mini',
    tagline: 'Beauty and You.',
    phone: '+91 98765 43210',
    email: 'hello@salonsmartmini.com',
    address: '402 Bloom Avenue, Rose Garden Road, Bangalore - 560001',
    currency: '₹',
    taxRate: 5, // 5% GST
    themeAccent: '#C94F7C',
    notifications: {
      smsAlerts: true,
      emailReceipts: true,
      slotReminders: true,
    },
  };

  const DEFAULT_SERVICES = [
    {
      id: 'srv-1',
      name: 'Signature Layer Haircut & Styling',
      category: 'Hair',
      duration: 45,
      price: 650,
      description: 'Consultation, scalp massage, precision layer cut & professional blow-dry finish.',
    },
    {
      id: 'srv-2',
      name: 'Organic Keratin Silk Therapy',
      category: 'Hair',
      duration: 120,
      price: 3200,
      description: 'Formaldehyde-free intensive keratin protein treatment for sleek, frizz-free hair.',
    },
    {
      id: 'srv-3',
      name: 'Moroccan Argan Nourish Hair Spa',
      category: 'Hair',
      duration: 60,
      price: 1400,
      description: 'Deep conditioning argan butter masque with steam and relaxing head acupressure.',
    },
    {
      id: 'srv-4',
      name: 'Balayage & Global Color Contour',
      category: 'Hair',
      duration: 150,
      price: 4500,
      description: 'Custom sun-kissed hand-painted balayage with high-shine glossing glaze.',
    },
    {
      id: 'srv-5',
      name: 'Hydra-Dew Glow Infusion Facial',
      category: 'Skin & Facial',
      duration: 60,
      price: 1800,
      description: 'Ultrasonic pore cleanse, hyaluronic acid booster ampoule and soothing ice globe massage.',
    },
    {
      id: 'srv-6',
      name: '24K Gold Luxury Illuminating Facial',
      category: 'Skin & Facial',
      duration: 75,
      price: 2800,
      description: 'Pure colloidal gold leaf sheet, micro-current lifting and brightening radiance peel.',
    },
    {
      id: 'srv-7',
      name: 'Herbal Detox & Anti-Tan Cleanup',
      category: 'Skin & Facial',
      duration: 40,
      price: 850,
      description: 'Gentle fruit enzyme exfoliation, steam extraction and cooling mint clay pack.',
    },
    {
      id: 'srv-8',
      name: 'HD Glam Party & Occasion Makeup',
      category: 'Makeup',
      duration: 60,
      price: 2500,
      description: 'Waterproof high-definition base, smokey/soft-glam eye artistry and mink eyelashes.',
    },
    {
      id: 'srv-9',
      name: 'Royal Bridal Makeover Grand Package',
      category: 'Makeup',
      duration: 180,
      price: 8500,
      description: 'Airbrush bridal application, dupatta/saree draping, luxury hair updo and jewelry placement.',
    },
    {
      id: 'srv-10',
      name: 'Gel Nail Extensions with Chrome Art',
      category: 'Nails & Spa',
      duration: 75,
      price: 1600,
      description: 'Hard gel sculpting, cuticle care, ombre chrome powder finish and crystal accents.',
    },
    {
      id: 'srv-11',
      name: 'Deluxe Rose Petal Pedicure',
      category: 'Nails & Spa',
      duration: 50,
      price: 950,
      description: 'Milk & rose bath soak, sea salt exfoliation, heel rasping, paraffin wax dip.',
    },
    {
      id: 'srv-12',
      name: 'Lavender Aroma Rejuvenating Manicure',
      category: 'Nails & Spa',
      duration: 40,
      price: 750,
      description: 'Botanical essential oils, nail shaping, cuticle therapy and long-lasting gel shine.',
    },
  ];

  const DEFAULT_STAFF = [
    {
      id: 'stf-1',
      name: 'Ananya Sharma',
      role: 'Senior Hair Stylist',
      phone: '+91 98201 11223',
      workingHours: '09:30 AM - 06:30 PM',
      status: 'Available', // Available, Busy, Off Duty
      specialization: 'Layer Cuts & Balayage',
      rating: 4.9,
      avatarColor: '#C94F7C',
    },
    {
      id: 'stf-2',
      name: 'Priya Nair',
      role: 'Master Aesthetician',
      phone: '+91 98334 44556',
      workingHours: '10:00 AM - 07:00 PM',
      status: 'Busy',
      specialization: 'Hydra Facials & Skin Peels',
      rating: 4.8,
      avatarColor: '#8B6BAE',
    },
    {
      id: 'stf-3',
      name: 'Sneha Kapoor',
      role: 'Bridal Makeup Artist',
      phone: '+91 98451 77889',
      workingHours: '11:00 AM - 08:00 PM',
      status: 'Available',
      specialization: 'HD Airbrush & Bridal Glam',
      rating: 5.0,
      avatarColor: '#E96A9A',
    },
    {
      id: 'stf-4',
      name: 'Meera Patel',
      role: 'Senior Nail Art & Spa Tech',
      phone: '+91 98112 33445',
      workingHours: '10:00 AM - 07:00 PM',
      status: 'Available',
      specialization: 'Gel Extensions & Paraffin Pedicure',
      rating: 4.7,
      avatarColor: '#6B8EAE',
    },
    {
      id: 'stf-5',
      name: 'Rohan Verma',
      role: 'Hair & Scalp Therapist',
      phone: '+91 98771 99001',
      workingHours: '09:00 AM - 06:00 PM',
      status: 'Off Duty',
      specialization: 'Keratin & Deep Scalp Massages',
      rating: 4.6,
      avatarColor: '#A06B9A',
    },
  ];

  const DEFAULT_CUSTOMERS = [
    {
      id: 'cust-1',
      name: 'Diya Sen',
      phone: '+91 98200 45671',
      email: 'diya.sen@example.com',
      lastVisit: getRelativeDate(0),
      visitsCount: 6,
      totalSpent: 9200,
      services: ['Signature Layer Haircut & Styling', 'Hydra-Dew Glow Infusion Facial'],
      notes: 'Prefers mild warm water during hair wash. Sensitive skin on forehead.',
    },
    {
      id: 'cust-2',
      name: 'Tanvi Reddy',
      phone: '+91 98311 56782',
      email: 'tanvi.r@example.com',
      lastVisit: getRelativeDate(-2),
      visitsCount: 4,
      totalSpent: 5800,
      services: ['Deluxe Rose Petal Pedicure', 'Gel Nail Extensions with Chrome Art'],
      notes: 'Loves pastel pink chrome shades. Coffee with almond milk.',
    },
    {
      id: 'cust-3',
      name: 'Kavya Menon',
      phone: '+91 98422 67893',
      email: 'kavya.menon@example.com',
      lastVisit: getRelativeDate(-5),
      visitsCount: 8,
      totalSpent: 14500,
      services: ['Balayage & Global Color Contour', 'Organic Keratin Silk Therapy'],
      notes: 'VIP customer. Allergic to tea tree oil products.',
    },
    {
      id: 'cust-4',
      name: 'Aisha Khan',
      phone: '+91 98533 78904',
      email: 'aisha.k@example.com',
      lastVisit: getRelativeDate(-7),
      visitsCount: 3,
      totalSpent: 4200,
      services: ['24K Gold Luxury Illuminating Facial'],
      notes: 'Prefers evening appointments after 5 PM.',
    },
    {
      id: 'cust-5',
      name: 'Pooja Joshi',
      phone: '+91 98644 89015',
      email: 'pooja.j@example.com',
      lastVisit: getRelativeDate(-12),
      visitsCount: 2,
      totalSpent: 3100,
      services: ['Lavender Aroma Rejuvenating Manicure', 'Herbal Detox & Anti-Tan Cleanup'],
      notes: 'Referred by Kavya Menon. First time trying herbal packs.',
    },
    {
      id: 'cust-6',
      name: 'Ritu Saxena',
      phone: '+91 98755 90126',
      email: 'ritu.saxena@example.com',
      lastVisit: getRelativeDate(-1),
      visitsCount: 5,
      totalSpent: 11200,
      services: ['Royal Bridal Makeover Grand Package', 'HD Glam Party & Occasion Makeup'],
      notes: 'Wedding reception trial was completed successfully.',
    },
    {
      id: 'cust-7',
      name: 'Natasha Roy',
      phone: '+91 98866 01237',
      email: 'natasha.roy@example.com',
      lastVisit: getRelativeDate(-18),
      visitsCount: 1,
      totalSpent: 1400,
      services: ['Moroccan Argan Nourish Hair Spa'],
      notes: 'Likes quiet treatment rooms without loud background music.',
    },
  ];

  const DEFAULT_APPOINTMENTS = [
    {
      id: 'apt-101',
      customerName: 'Diya Sen',
      customerPhone: '+91 98200 45671',
      serviceId: 'srv-1',
      serviceName: 'Signature Layer Haircut & Styling',
      staffId: 'stf-1',
      staffName: 'Ananya Sharma',
      date: getRelativeDate(0),
      time: '10:30',
      status: 'Confirmed', // Pending, Confirmed, Completed, Cancelled
      notes: 'Layer styling for college convocation',
    },
    {
      id: 'apt-102',
      customerName: 'Tanvi Reddy',
      customerPhone: '+91 98311 56782',
      serviceId: 'srv-10',
      serviceName: 'Gel Nail Extensions with Chrome Art',
      staffId: 'stf-4',
      staffName: 'Meera Patel',
      date: getRelativeDate(0),
      time: '11:45',
      status: 'Confirmed',
      notes: 'Rose gold chrome finish requested',
    },
    {
      id: 'apt-103',
      customerName: 'Aisha Khan',
      customerPhone: '+91 98533 78904',
      serviceId: 'srv-5',
      serviceName: 'Hydra-Dew Glow Infusion Facial',
      staffId: 'stf-2',
      staffName: 'Priya Nair',
      date: getRelativeDate(0),
      time: '02:00',
      status: 'Confirmed',
      notes: 'Pre-flight hydration facial',
    },
    {
      id: 'apt-104',
      customerName: 'Ritu Saxena',
      customerPhone: '+91 98755 90126',
      serviceId: 'srv-8',
      serviceName: 'HD Glam Party & Occasion Makeup',
      staffId: 'stf-3',
      staffName: 'Sneha Kapoor',
      date: getRelativeDate(0),
      time: '04:30',
      status: 'Pending',
      notes: 'Evening gala event makeup',
    },
    {
      id: 'apt-105',
      customerName: 'Kavya Menon',
      customerPhone: '+91 98422 67893',
      serviceId: 'srv-4',
      serviceName: 'Balayage & Global Color Contour',
      staffId: 'stf-1',
      staffName: 'Ananya Sharma',
      date: getRelativeDate(0),
      time: '01:00',
      status: 'Completed',
      notes: 'Caramel highlights touchup',
    },
    {
      id: 'apt-106',
      customerName: 'Pooja Joshi',
      customerPhone: '+91 98644 89015',
      serviceId: 'srv-11',
      serviceName: 'Deluxe Rose Petal Pedicure',
      staffId: 'stf-4',
      staffName: 'Meera Patel',
      date: getRelativeDate(1),
      time: '11:00',
      status: 'Confirmed',
      notes: 'Weekend relaxation',
    },
    {
      id: 'apt-107',
      customerName: 'Natasha Roy',
      customerPhone: '+91 98866 01237',
      serviceId: 'srv-3',
      serviceName: 'Moroccan Argan Nourish Hair Spa',
      staffId: 'stf-1',
      staffName: 'Ananya Sharma',
      date: getRelativeDate(1),
      time: '03:30',
      status: 'Pending',
      notes: 'First time spa package',
    },
    {
      id: 'apt-108',
      customerName: 'Simran Kaur',
      customerPhone: '+91 98977 12345',
      serviceId: 'srv-7',
      serviceName: 'Herbal Detox & Anti-Tan Cleanup',
      staffId: 'stf-2',
      staffName: 'Priya Nair',
      date: getRelativeDate(-1),
      time: '12:15',
      status: 'Completed',
      notes: 'Post-vacation tan removal',
    },
    {
      id: 'apt-109',
      customerName: 'Shreya Verma',
      customerPhone: '+91 98123 98765',
      serviceId: 'srv-2',
      serviceName: 'Organic Keratin Silk Therapy',
      staffId: 'stf-1',
      staffName: 'Ananya Sharma',
      date: getRelativeDate(-2),
      time: '02:30',
      status: 'Completed',
      notes: 'Full length treatment',
    },
    {
      id: 'apt-110',
      customerName: 'Meenakshi Iyer',
      customerPhone: '+91 98234 87654',
      serviceId: 'srv-6',
      serviceName: '24K Gold Luxury Illuminating Facial',
      staffId: 'stf-2',
      staffName: 'Priya Nair',
      date: getRelativeDate(-1),
      time: '04:00',
      status: 'Cancelled',
      notes: 'Client had an urgent family emergency',
    },
  ];

  const DEFAULT_BILLS = [
    {
      id: 'INV-2026-101',
      appointmentId: 'apt-105',
      customerName: 'Kavya Menon',
      customerPhone: '+91 98422 67893',
      serviceName: 'Balayage & Global Color Contour',
      staffName: 'Ananya Sharma',
      date: getRelativeDate(0),
      servicePrice: 4500,
      discount: 250,
      taxPercent: 5,
      taxAmount: 212.5,
      subtotal: 4250,
      finalTotal: 4462.5,
      paymentMode: 'UPI', // UPI, Cash, Card
      status: 'Paid',
    },
    {
      id: 'INV-2026-102',
      appointmentId: 'apt-108',
      customerName: 'Simran Kaur',
      customerPhone: '+91 98977 12345',
      serviceName: 'Herbal Detox & Anti-Tan Cleanup',
      staffName: 'Priya Nair',
      date: getRelativeDate(-1),
      servicePrice: 850,
      discount: 50,
      taxPercent: 5,
      taxAmount: 40,
      subtotal: 800,
      finalTotal: 840,
      paymentMode: 'Cash',
      status: 'Paid',
    },
    {
      id: 'INV-2026-103',
      appointmentId: 'apt-109',
      customerName: 'Shreya Verma',
      customerPhone: '+91 98123 98765',
      serviceName: 'Organic Keratin Silk Therapy',
      staffName: 'Ananya Sharma',
      date: getRelativeDate(-2),
      servicePrice: 3200,
      discount: 200,
      taxPercent: 5,
      taxAmount: 150,
      subtotal: 3000,
      finalTotal: 3150,
      paymentMode: 'Card',
      status: 'Paid',
    },
    {
      id: 'INV-2026-104',
      appointmentId: null,
      customerName: 'Diya Sen',
      customerPhone: '+91 98200 45671',
      serviceName: 'Hydra-Dew Glow Infusion Facial',
      staffName: 'Priya Nair',
      date: getRelativeDate(-4),
      servicePrice: 1800,
      discount: 100,
      taxPercent: 5,
      taxAmount: 85,
      subtotal: 1700,
      finalTotal: 1785,
      paymentMode: 'UPI',
      status: 'Paid',
    },
  ];

  const DEFAULT_EXPENSES = [
    {
      id: 'exp-1',
      category: 'Rent', // Rent, Salary, Products, Electricity, Water, Other
      amount: 32000,
      date: getRelativeDate(-7),
      description: 'Monthly salon studio commercial premises lease',
      paymentMode: 'Bank Transfer',
    },
    {
      id: 'exp-2',
      category: 'Salary',
      amount: 45000,
      date: getRelativeDate(-5),
      description: 'Staff payroll advance and monthly incentives distribution',
      paymentMode: 'Bank Transfer',
    },
    {
      id: 'exp-3',
      category: 'Products',
      amount: 8650,
      date: getRelativeDate(-3),
      description: 'OPI gel nail lacquers, Olaplex bond repair & salon foils replenishment',
      paymentMode: 'UPI',
    },
    {
      id: 'exp-4',
      category: 'Electricity',
      amount: 4200,
      date: getRelativeDate(-2),
      description: 'BESCOM commercial electricity power & air-conditioning bill',
      paymentMode: 'UPI',
    },
    {
      id: 'exp-5',
      category: 'Water',
      amount: 1100,
      date: getRelativeDate(-1),
      description: 'Purified mineral water supply cans and salon hair-wash filtration refills',
      paymentMode: 'Cash',
    },
    {
      id: 'exp-6',
      category: 'Other',
      amount: 1450,
      date: getRelativeDate(0),
      description: 'Fresh aromatic flower decorations & organic green tea refreshments',
      paymentMode: 'Cash',
    },
    {
      id: 'exp-7',
      category: 'Products',
      amount: 5400,
      date: getRelativeDate(-10),
      description: 'Dermalogica facial cleanser kits & 24K gold foil sheets',
      paymentMode: 'Card',
    },
  ];

  // Core Storage Manager Object
  window.SalonStore = {
    keys: STORAGE_KEYS,

    // Initialize or read from localStorage
    init() {
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        this.resetAllData();
      }
    },

    // Reset all demo data back to clean defaults
    resetAllData() {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(DEFAULT_BILLS));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    },

    // Generic Get
    get(key, defaultValue = []) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Error reading localStorage for key: ' + key, e);
        return defaultValue;
      }
    },

    // Generic Set
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Error setting localStorage for key: ' + key, e);
      }
    },

    // Auth State
    isAuthenticated() {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    },

    setAuthenticated(isAuth, user = null) {
      if (isAuth) {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
        if (user) {
          localStorage.setItem('salonsmart_user', JSON.stringify(user));
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        localStorage.removeItem('salonsmart_user');
      }
    },

    getUser() {
      return this.get('salonsmart_user', { email: 'admin@salonsmart.com', name: 'Salon Manager' });
    },

    // Settings
    getSettings() {
      return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    },

    saveSettings(settings) {
      this.set(STORAGE_KEYS.SETTINGS, settings);
    },

    // Services
    getServices() {
      return this.get(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    },

    getServiceById(id) {
      return this.getServices().find((s) => s.id === id) || null;
    },

    saveService(serviceData) {
      const services = this.getServices();
      if (serviceData.id) {
        const idx = services.findIndex((s) => s.id === serviceData.id);
        if (idx !== -1) {
          services[idx] = { ...services[idx], ...serviceData };
        }
      } else {
        serviceData.id = 'srv-' + Date.now();
        services.unshift(serviceData);
      }
      this.set(STORAGE_KEYS.SERVICES, services);
      return serviceData;
    },

    deleteService(id) {
      let services = this.getServices();
      services = services.filter((s) => s.id !== id);
      this.set(STORAGE_KEYS.SERVICES, services);
    },

    // Staff
    getStaff() {
      return this.get(STORAGE_KEYS.STAFF, DEFAULT_STAFF);
    },

    getStaffById(id) {
      return this.getStaff().find((st) => st.id === id) || null;
    },

    saveStaff(staffData) {
      const staffList = this.getStaff();
      if (staffData.id) {
        const idx = staffList.findIndex((st) => st.id === staffData.id);
        if (idx !== -1) {
          staffList[idx] = { ...staffList[idx], ...staffData };
        }
      } else {
        staffData.id = 'stf-' + Date.now();
        if (!staffData.avatarColor) {
          const colors = ['#C94F7C', '#8B6BAE', '#E96A9A', '#6B8EAE', '#D97706'];
          staffData.avatarColor = colors[Math.floor(Math.random() * colors.length)];
        }
        staffList.unshift(staffData);
      }
      this.set(STORAGE_KEYS.STAFF, staffList);
      return staffData;
    },

    deleteStaff(id) {
      let staffList = this.getStaff();
      staffList = staffList.filter((st) => st.id !== id);
      this.set(STORAGE_KEYS.STAFF, staffList);
    },

    // Appointments
    getAppointments() {
      return this.get(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
    },

    getAppointmentById(id) {
      return this.getAppointments().find((a) => a.id === id) || null;
    },

    saveAppointment(aptData) {
      const appointments = this.getAppointments();
      if (aptData.id) {
        const idx = appointments.findIndex((a) => a.id === aptData.id);
        if (idx !== -1) {
          appointments[idx] = { ...appointments[idx], ...aptData };
        }
      } else {
        aptData.id = 'apt-' + Date.now();
        appointments.unshift(aptData);
      }
      this.set(STORAGE_KEYS.APPOINTMENTS, appointments);

      // Auto-update customer profile if not exists
      this.syncCustomerFromAppointment(aptData);
      return aptData;
    },

    updateAppointmentStatus(id, newStatus) {
      const appointments = this.getAppointments();
      const apt = appointments.find((a) => a.id === id);
      if (apt) {
        apt.status = newStatus;
        this.set(STORAGE_KEYS.APPOINTMENTS, appointments);
      }
      return apt;
    },

    deleteAppointment(id) {
      let appointments = this.getAppointments();
      appointments = appointments.filter((a) => a.id !== id);
      this.set(STORAGE_KEYS.APPOINTMENTS, appointments);
    },

    // Check conflict: returns true if staff already has a non-cancelled booking on same date and time
    hasBookingConflict(staffId, date, time, excludeAptId = null) {
      const appointments = this.getAppointments();
      return appointments.some((a) => {
        if (excludeAptId && a.id === excludeAptId) return false;
        if (a.status === 'Cancelled') return false;
        return a.staffId === staffId && a.date === date && a.time === time;
      });
    },

    // Customers
    getCustomers() {
      return this.get(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    },

    getCustomerById(id) {
      return this.getCustomers().find((c) => c.id === id) || null;
    },

    getCustomerByPhone(phone) {
      if (!phone) return null;
      const clean = phone.replace(/\s+/g, '');
      return this.getCustomers().find((c) => c.phone.replace(/\s+/g, '') === clean) || null;
    },

    saveCustomer(customerData) {
      const customers = this.getCustomers();
      if (customerData.id) {
        const idx = customers.findIndex((c) => c.id === customerData.id);
        if (idx !== -1) {
          customers[idx] = { ...customers[idx], ...customerData };
        }
      } else {
        customerData.id = 'cust-' + Date.now();
        customerData.visitsCount = customerData.visitsCount || 1;
        customerData.totalSpent = customerData.totalSpent || 0;
        customerData.services = customerData.services || [];
        customers.unshift(customerData);
      }
      this.set(STORAGE_KEYS.CUSTOMERS, customers);
      return customerData;
    },

    syncCustomerFromAppointment(apt) {
      const customers = this.getCustomers();
      let customer = this.getCustomerByPhone(apt.customerPhone);
      if (customer) {
        if (!customer.services.includes(apt.serviceName)) {
          customer.services.push(apt.serviceName);
        }
        customer.lastVisit = apt.date;
        const idx = customers.findIndex((c) => c.id === customer.id);
        customers[idx] = customer;
        this.set(STORAGE_KEYS.CUSTOMERS, customers);
      } else {
        // Create new customer
        const newCust = {
          id: 'cust-' + Date.now(),
          name: apt.customerName,
          phone: apt.customerPhone,
          email: `${apt.customerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          lastVisit: apt.date,
          visitsCount: 1,
          totalSpent: 0,
          services: [apt.serviceName],
          notes: 'New client added via appointment booking.',
        };
        customers.unshift(newCust);
        this.set(STORAGE_KEYS.CUSTOMERS, customers);
      }
    },

    // Expenses
    getExpenses() {
      return this.get(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES);
    },

    saveExpense(expData) {
      const expenses = this.getExpenses();
      if (expData.id) {
        const idx = expenses.findIndex((e) => e.id === expData.id);
        if (idx !== -1) {
          expenses[idx] = { ...expenses[idx], ...expData };
        }
      } else {
        expData.id = 'exp-' + Date.now();
        expenses.unshift(expData);
      }
      this.set(STORAGE_KEYS.EXPENSES, expenses);
      return expData;
    },

    deleteExpense(id) {
      let expenses = this.getExpenses();
      expenses = expenses.filter((e) => e.id !== id);
      this.set(STORAGE_KEYS.EXPENSES, expenses);
    },

    // Bills
    getBills() {
      return this.get(STORAGE_KEYS.BILLS, DEFAULT_BILLS);
    },

    saveBill(billData) {
      const bills = this.getBills();
      if (!billData.id) {
        billData.id = 'INV-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
      }
      bills.unshift(billData);
      this.set(STORAGE_KEYS.BILLS, bills);

      // If tied to an appointment, mark appointment as completed
      if (billData.appointmentId) {
        this.updateAppointmentStatus(billData.appointmentId, 'Completed');
      }

      // Update customer total spent
      const customer = this.getCustomerByPhone(billData.customerPhone);
      if (customer) {
        customer.totalSpent = (Number(customer.totalSpent) || 0) + Number(billData.finalTotal);
        customer.visitsCount = (Number(customer.visitsCount) || 1) + 1;
        customer.lastVisit = billData.date;
        this.saveCustomer(customer);
      }

      return billData;
    },

    // Compute Staff Workload for today
    getStaffWorkload(staffId) {
      const today = getRelativeDate(0);
      const appointments = this.getAppointments();
      return appointments.filter(
        (a) => a.staffId === staffId && a.date === today && a.status !== 'Cancelled'
      ).length;
    },
  };

  // Initialize store on load
  window.SalonStore.init();
})();
