# ParkEase — Smart Parking Management Platform

> **Final-Year Academic Project Demonstration**  
> Built with the **MERN Stack**: React (Vite) • Node.js • Express.js • MongoDB • Tailwind CSS • Leaflet OpenStreetMap • Recharts


 
## 🅿️ Project Overview

**ParkEase** is a comprehensive, presentation-ready Smart Parking Management Platform designed to eliminate urban parking congestion, automate lot operations, provide transparent real-time pricing, and offer interactive slot selection.

Unlike basic CRUD student projects, ParkEase implements a realistic multi-tier architecture supporting **Drivers**, **Parking Operators**, and **System Administrators** with real MongoDB persistence, dynamic price calculations on the server, telemetric check-in/checkout timers, and automated gate operations.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS 3.4 (Deep Navy `#0A0F1D`, Slate Gray, and Emerald Green `#10B981`)
- **Routing:** React Router v6
- **HTTP Client:** Axios with demo identity interceptors
- **Icons:** Lucide React
- **Mapping:** Leaflet & OpenStreetMap
- **Data Visualization:** Recharts
- **State Management:** React Context API (Auth, Toast, Notifications)

### Backend
- **Runtime:** Node.js v26
- **Server Framework:** Express.js
- **Database & ODM:** MongoDB with Mongoose
- **Zero-Config Storage:** Embedded MongoDB Memory Server fallback with automated seed data generator
- **Architecture:** RESTful APIs, centralized asynchronous error handling, atomic reservation transitions

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Start the Backend Server
```bash
cd "/Users/user/Downloads/MERN PROJECT/backend"
npm install
node server.js
```
*The backend automatically binds to port **5001** (or 5000), checks for MongoDB, launches an in-memory database if a local daemon is unavailable, and auto-seeds all sample facilities, slots, vehicles, and reservations.*

### 2. Start the Frontend Client
```bash
cd "/Users/user/Downloads/MERN PROJECT/frontend"
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 👥 Demo Identity System & Role Switcher

For academic evaluation and grading ease, ParkEase implements a **demonstration identity system** rather than production passwords or OTPs:

| Role | Pre-configured Email | Name | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Driver** | `driver@parkease.demo` | Dev Driver | Search parking, reserve slots, active session timer, vehicle management, reviews |
| **Driver 2** | `user@parkease.demo` | Uma User | Secondary driver profile with independent bookings |
| **Parking Operator**| `operator@parkease.demo` | Om Operator | Gate entry/exit terminal, slot maintenance toggles, capacity management |
| **System Admin** | `admin@parkease.demo` | Alex Admin | Platform usage analytics, user account roles, system-wide booking audit |

> ℹ️ **Switch roles at any time:** Use the persistent **Top Demo Banner** or the **Profile Menu** to switch personas instantly without losing application state.

---

## 🗺️ Page Directory & Routes

### Public Pages
1. **Home Page (`/`):** Hero headline, search panel, smart recommendation engine, EV charging spotlight, covered parking options, how it works, pricing calculator, and FAQs.
2. **Find Parking (`/find`):** Advanced search filters (city, rate, vehicle type, EV, security, covered, accessible), sorting (price, availability, rating), and toggleable **Leaflet Map View**.
3. **Facility Details (`/facilities/:id`):** Multi-image gallery, operating hours, capacity breakdown meter, pricing rules schedule, amenities, driver reviews list, and review submission modal.
4. **Slot Selection (`/slots/:facilityId`):** Visual interactive floor layout with individually selectable spaces (e.g. `A01`, `B04`), EV fast charging markers, and real-time total cost calculation.
5. **Reservation Confirmation (`/confirmation/:id`):** Digital booking pass, unique reference (`PK...`), simulated QR barrier code, and arrival instructions.
6. **Compare Facilities (`/compare`):** Side-by-side comparison matrix of up to 3 facilities with normalized rates for chosen duration and vehicle type.
7. **Cost Calculator (`/calculator`):** Transparent rate estimator with vehicle tiers, duration sliders, and daily cap discounts.
8. **Demo Login (`/login`):** One-click persona switcher and custom email profile creator.
9. **Help & FAQ (`/faq`):** Categorized support questions regarding bookings, cancellations, and gate entry.
10. **About ParkEase (`/about`):** Full-stack architecture, Mongoose schema documentation, and academic disclaimers.

### Driver Portal Pages
11. **Driver Dashboard (`/driver`):** Upcoming booking alert, active session banner, spending summary chart, vehicle shortcuts, and favorites.
12. **My Reservations (`/driver/reservations`):** Filter by status (Confirmed, Checked-In, Completed, Cancelled) with cancellation and check-in actions.
13. **Active Parking Session (`/driver/active-session`):** Real-time duration timer derived from stored database timestamps, live accrued fee meter, parking extension modal, and checkout exit receipt.
14. **Vehicle Management (`/driver/vehicles`):** Register cars, motorcycles, SUVs; set primary default; EV indicator; delete safeguards.
15. **Favorites (`/driver/favorites`):** Bookmarked parking facilities with one-click reservation links.
16. **Notifications (`/driver/notifications`):** Activity inbox for confirmations, reminders, and system updates.

### Operator Portal Pages
17. **Operator Dashboard (`/operator`):** Total spaces, current occupancy, arrivals/departures, and quick barrier gate pass lookup.
18. **Facility Management (`/operator/facilities`):** Create new complexes, edit vehicle rates, configure operating hours, and deactivate lots.
19. **Slot Inventory Management (`/operator/slots`):** Bulk space generator (e.g. Section E, 20 spaces), mark bays for maintenance, and delete slots.
20. **Gate Entry & Departure Terminal (`/operator/gate`):** Barcode scanner simulation, license plate lookup, open entry barrier (marks slot occupied), and open exit barrier (frees slot and calculates duration).

### Administrator Portal Pages
21. **Admin Dashboard (`/admin`):** Platform metrics, booking volume timeseries, capacity distribution, and system-wide audit table.
22. **User Management (`/admin/users`):** Directory of registered demo users, role assignment dropdown, and active/suspend toggle.
23. **Usage Analytics (`/admin/analytics`):** Recharts graphs for daily reservations volume, facility capacity breakdown, and peak arrival hours histogram.
24. **Settings (`/settings`):** Profile preferences, email alert toggles, and database reset controls (reset sessions or complete re-seed).

---

## 🔒 Academic Disclosure & Production Roadmap

### Demo Identity Notice
This platform is developed specifically for academic demonstration. The identity system utilizes client-side demo headers (`x-demo-email`) to facilitate seamless role evaluation and role switching.

### Production Deployment Requirements
For a real-world commercial deployment, the following architecture would be integrated:
1. **Authentication:** Password hashing with Argon2id or OAuth 2.0 PKCE with refresh tokens.
2. **Session Security:** Signed JWTs stored in HTTP-only, `SameSite=Strict`, `Secure` cookies.
3. **Authorization:** Server-side Role-Based Access Control (RBAC) middleware verifying permissions on every endpoint.
4. **Payment Gateway:** Integration with Razorpay / Stripe webhooks with cryptographic signature verification.
5. **Physical Hardware:** Automated License Plate Recognition (ANPR) cameras and barrier relay APIs.

---

## 🚀 Recent Presentation Updates & Enhancements
- **3 Dedicated Role Login Portals:** Separate, themed entryways for Commuters/Drivers (`/login/driver`), Parking Lot Operators (`/login/operator`), and Platform Administrators (`/login/admin`), alongside the Universal Multi-Role Gateway (`/login`).
- **Comprehensive Admin Deletion Controls:** System Administrators have unrestricted cascading deletion authority over facilities (with child slots/reservations cascade), individual slots, demo user accounts, and platform reservation audit records.
- **Dynamic Slot State & Unreserve:** Real-time synchronization between reservation actions and slot status in MongoDB; drivers can unreserve/cancel bookings anytime to immediately free spaces.
- **Cinematic Ambient Motion Background:** Hardware-accelerated glowing aurora orbs and drifting cybernetic grid for a modern, presentation-grade aesthetic.
- **Global Error Boundaries:** Seamless runtime error containment with quick reload and recovery options.

---

## 📄 License
Academic demonstration build — created for presentation and grading.
