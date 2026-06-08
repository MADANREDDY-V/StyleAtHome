# StyleAtHome — Hybrid Fashion E-Commerce Platform

**Try Before You Buy** — Browse fashion from 16 top stores and schedule Home Trial Sessions before purchasing.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green) ![MySQL](https://img.shields.io/badge/MySQL-8-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## Core Features

- **16 Fashion Stores** — Wrogn, Zudio, Trends, Westside, Max, Pantaloons, and more
- **Home Trial Booking** — Add products to a separate Trial Cart, pick date/time slot, book a home session
- **Firebase Phone OTP Auth** — Mobile login with JWT session management
- **Dual Cart System** — Shopping Cart (purchase) + Trial Cart (home trial) kept separate
- **Product Catalog** — Filters (brand, price, color, size, rating), sorting, search with suggestions
- **User Dashboard** — Profile, orders, trial bookings, wishlist, addresses
- **Admin Dashboard** — Users, products, stores, orders, bookings, slot management, analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios, Context API |
| Backend | Spring Boot, Spring Security, JWT, JPA/Hibernate |
| Database | MySQL |
| Auth | Firebase Phone OTP + JWT |

## Quick Start

```bash
# 1. Start MySQL and create database
mysql -u root -p < database/schema.sql

# 2. Start backend
cd java-backend && ./mvnw spring-boot:run

# 3. Start frontend
cd e-commerce-front-end && npm install && npm run dev
```

Open **http://localhost:5173**

See [docs/SETUP.md](docs/SETUP.md) for detailed instructions and [docs/API.md](docs/API.md) for API reference.

## Home Trial Workflow

```
Store → Product Selection → Add to Trial Cart → Select Date → Select Time Slot → Select Address → Confirm Booking
```

## Default Admin

- Mobile: `9999999999`
- Demo OTP: any 4-digit code (without Firebase configured)

## Documentation

- [Setup Instructions](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Database Schema](database/schema.sql)
