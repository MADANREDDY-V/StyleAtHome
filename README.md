<div align="center">

# 🛍️ StyleAtHome

<p align="center">
  <img src="https://img.shields.io/badge/React-19-00d8ff?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Clerk-6c47ff?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

<h3>The Ultimate Hybrid Fashion E-Commerce Platform</h3>
<p><i>Serverless. Enterprise-Grade. Liquid-Glass Aesthetics.</i></p>

---

</div>

## ✨ The Vision
**StyleAtHome** bridges the gap between digital convenience and physical retail. Browse from top stores, securely add items to your cart, or leverage our signature **Home Trial Booking** system to physically try outfits before making a purchase.

## 🚀 The Architecture (Zero-Backend)
We've completely overhauled our stack to be highly scalable, serverless, and lightning fast. 

* **Auth Layer:** Managed entirely by [Clerk](https://clerk.dev/) for robust, passwordless, and multi-factor authentication.
* **Database & API:** Handled securely by [Supabase](https://supabase.com/) (PostgreSQL + RLS), eliminating the need for a bloated middle-tier backend.
* **State Management:** Blazing fast global state with [Zustand](https://zustand-demo.pmnd.rs/).
* **UI/UX:** A bespoke **Bento 2.0** design system powered by Tailwind CSS v4 and `framer-motion` for liquid-spring physics.

## 🌟 Key Features
- 🛡️ **Enterprise Command Center:** Real-time telemetry, infrastructure monitoring, and order logistics directly within `/admin`.
- 🛍️ **Dual-Requisition Engine:** Separate flows for standard **Shopping** and **Wardrobe Trials**.
- 💫 **Liquid-Glass Aesthetics:** Hover states featuring magnetic physics, skeleton shimmers, and asymmetrical masonry layouts.
- 📱 **Seamless Checkout:** Multi-step layout-animated transaction protocol.
- 🔐 **Zero-Backend Security:** Postgres Row-Level-Security (RLS) policies directly securing client data.

---

## 🏎️ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/MADANREDDY-V/StyleAtHome.git
cd StyleAtHome/frontend

# 2. Install Dependencies
npm install

# 3. Environment Variables
# Duplicate .env.example to .env and inject your Clerk/Supabase keys

# 4. Fire up the development environment
npm run dev
```
Open **http://localhost:5173** and experience the future of E-Commerce.

---

## 📐 Vercel Deployment Instructions
If you are deploying this repository to **Vercel**, please ensure you use the following settings:

* **Framework Preset:** `Vite`
* **Root Directory:** `frontend`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Install Command:** `npm install`

*Make sure to inject all `VITE_CLERK_*` and `VITE_SUPABASE_*` environment variables in your Vercel Project Settings.*

<div align="center">
  <p>Built with ❤️ and high-agency design principles.</p>
</div>
