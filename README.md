# SalonSmart Mini 🌸
> **“Beauty and You.”**  
> *A clean, modern, and elegant Gen-Z style beauty parlour & salon management system.*

---

## 🌟 Overview
**SalonSmart Mini** is a complete, fully interactive, frontend-only beauty salon management web application designed for boutique studios, luxury parlours, and modern wellness spas. 

Built exclusively with **semantic HTML5, modern vanilla CSS3, and vanilla JavaScript (ES6+)**, it runs directly in any web browser without needing Node.js, PHP, backend servers, or external databases. Data persistence is handled smoothly via browser `localStorage` and pre-populated with realistic dummy data.

---

## 🎨 Design System & Aesthetic
- **Theme**: Soft feminine beauty-tech aesthetic with rounded cards, subtle shadows, glassmorphism accents, and smooth micro-transitions.
- **Palette**:
  - Main Background: `#FFF7FA`
  - Secondary Background: `#F8F3FF`
  - Cards: `#FFFFFF`
  - Primary Rose: `#C94F7C`
  - Soft Hot Pink: `#E96A9A`
  - Violet Accent: `#8B6BAE`
  - Text: `#352C35`
  - Secondary Text: `#817581`
  - Border: `#EADDE5`
- **Typography**: Clean modern type pairing using Google Fonts:
  - **Plus Jakarta Sans**: High-legibility UI typography
  - **Playfair Display**: Refined, boutique serif accents for headings and branding
- **Responsiveness**: Fully responsive layout that adapts across desktop screens, tablets, and mobile devices (with off-canvas navigation drawer).

---

## 🚀 Key Modules & Pages

### 1. 🔐 Authentication / Login View
- Centered card with brand mark and tagline.
- Client-side validation for email format and password length.
- Show/Hide password toggle.
- "Remember me" simulation and demo login helper.

### 2. 📊 Dashboard Overview
- Time-aware greeting (`Good Morning`, `Good Afternoon`, `Good Evening`) with live formatted calendar date.
- **4 Key KPI Metric Cards**:
  - Today's Appointments & Confirmed Count
  - Today's Sales Revenue
  - Today's Expenses Outflow
  - Active & Available Staff count
- **Sales Trend Line Chart**: Visualizing daily sales trajectory.
- **Upcoming Appointments Widget**: Chronologically ordered schedule for the day.
- **Recent Transactions Widget**: Latest paid customer bills.
- **Staff Availability Widget**: Real-time specialist availability.
- **Quick Action Buttons**: Instant access to create appointments, services, bills, or expenses.

### 3. 🗓️ Appointments Management
- Search filter by customer name, phone, or assigned specialist.
- Date filter & status filter (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
- Quick status switcher directly from the table.
- **Conflict Prevention Engine**: Intelligent frontend check preventing duplicate bookings for the same stylist on overlapping date/time slots.
- Add, Edit, Delete, and "Quick Bill" direct checkout actions.

### 4. 💇 Service Menu
- Organized beauty catalog categorized across **Hair**, **Skin & Facial**, **Makeup**, and **Nails & Spa**.
- Service cards displaying duration, price, tags, and descriptions.
- Add Service, Edit, and Delete modal workflows with input validation.

### 5. 👩‍🎨 Staff & Specialists
- Staff profile cards with specialty roles, phone contact, and working hours.
- Live availability states: `Available`, `Busy`, `Off Duty`.
- **Dynamic Workload Tracker**: Real-time counter of appointments assigned to each stylist today.
- Add and Edit staff management modals.

### 6. 🧾 Billing & Thermal Receipts
- Appointment auto-fill selector (select an appointment to auto-populate client, service, and price).
- Live calculation engine for Base Price, Discounts, and GST / Service Tax.
- Payment modes: `UPI / GPay`, `Cash`, `Card`.
- **Real-time Live Invoice Preview**: Updates subtotal, discounts, and final total instantly as you type.
- **Printable Thermal Receipt Modal**: Itemized invoice preview formatted with dedicated `@media print` CSS for standard paper and receipt printers.

### 7. 💸 Expense Management
- Category tracking: `Rent`, `Salary`, `Products`, `Electricity`, `Water`, `Other`.
- Expense breakdown summaries (Total Outflow, Products inventory, Studio overhead).
- Add, Edit, and Delete operational expenses with category filtering.

### 8. 👥 Client Directory (CRM)
- Customer profiles with phone numbers, emails, visit counts, and total lifetime spend.
- **Customer Detail Modal**:
  - Visit and appointment history timeline.
  - Editable reminder notes (allergies, hair formulas, preferences) saved to `localStorage`.
  - Direct "Book New Appointment" button pre-populating client info.

### 9. 📈 Analytics & Reports
- Financial summary cards: Gross Sales, Total Expenses, Estimated Net Profit, Profit Margin %, and Appointment Success Rate.
- **Interactive Charts (Chart.js)**:
  - Monthly Revenue Trend Comparison
  - Expense Category Distribution Donut Chart
- Popular Services ranking table and Staff Performance Workload distribution.
- One-click report export / printing.

### 10. ⚙️ Settings
- Salon branding configuration (Salon Name, Tagline, Phone, Email, Physical Studio Address).
- Currency selector (`₹`, `$`, `€`, `£`, `AED`) and customizable GST / Tax rate.
- System notification preferences (SMS alerts, email receipts, conflict checks).
- **"Reset Demo Data"** action: Restores fresh sample data with confirmation guard.

---

## 💻 How to Run

### Method 1: Direct File Opening (No Installation Required!)
Simply double-click `index.html` in Windows Explorer or open it in Google Chrome, Microsoft Edge, Firefox, or Safari:
```
file:///path/to/Saloon-SmartMini/index.html
```

### Method 2: Local HTTP Server (Python / VS Code Live Server)
```bash
# Using Python 3
python -m http.server 8080

# Open in browser:
http://localhost:8080
```

---

## 📁 Project Directory Structure
```
Saloon-SmartMini/
│
├── index.html          # Semantic single-page HTML layout with modals & print receipt
│
├── css/
│   └── style.css       # Complete CSS design system, responsive media queries, print styles
│
├── js/
│   ├── data.js         # Mock dataset & LocalStorage state store (SalonStore)
│   ├── ui.js           # UI utilities (Toasts, Confirmation modals, Formatters)
│   └── app.js          # App controller, view router, calculations, Chart.js integrations
│
└── README.md           # Project documentation and student internship guide
```

---

## 🎓 Internship & Academic Project Note
This project demonstrates:
- Pure Vanilla JavaScript DOM manipulation and event delegation.
- Responsive CSS Grid and Flexbox layout engineering without relying on heavy third-party CSS frameworks.
- Local storage persistence and state management pattern.
- User experience best practices: non-blocking toast notifications, accessible modals, responsive mobile drawer, and print stylesheet optimization.
