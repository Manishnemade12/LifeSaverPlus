# 🆘 LifeSaver+

LifeSaver+ is a real-time emergency response platform built with **React + TypeScript** and **Supabase**. It enables users to instantly send SOS alerts, automatically notifying nearby hospitals and responders within a 5 km radius.

## 🚀 Features

- 🔐 **Authentication & Authorization**
  - Role-based auth for **users**, **responders**, and **hospitals**
  - Supabase Auth integration

- 🗺️ **SOS Emergency System**
  - Users can trigger an SOS alert with live geolocation
  - Real-time notifications sent to hospitals/responders within 5 km
  - Hospital dashboard receives filtered emergency requests

- 📡 **Real-Time Updates**
  - Live sync of SOS data using Supabase channels
  - No refresh needed — new alerts appear instantly

- 🏥 **Hospital Dashboard**
  - See only emergency requests relevant to the logged-in hospital
  - Mark requests as "Responded" or "Resolved"
  - Stats for active, in-progress, and resolved emergencies

- 👤 **User Dashboard**
  - Trigger SOS
  - View response status and track nearby hospitals

- 📦 **Technology Stack**
  - **Frontend**: React, TypeScript, Tailwind CSS
  - **Backend**: Supabase (PostgreSQL, Realtime, Auth)
  - **Geolocation**: HTML5 Geolocation API
  - **Routing**: React Router


🔹 Key Features:
 🧭 One-tap SOS Alert – In case of a medical or social emergency, users can send instant SOS alerts with live location.

 🩺 Smart Medical Assistance – If a user triggers a Medical SOS, the system checks for nearby hospitals within a 5 km radius and notifies them in real time.

 🚔 Fallback to Authorities – If no hospital is available nearby, the alert is automatically routed to social authorities like police for urgent intervention.

 📍 Responder & Hospital Dashboards – Designed to track, manage, and update emergency requests, with live navigation to the victim’s location.

 🔄 Real-time Communication – The system uses a connected database and efficient backend APIs to ensure smooth, live updates across all modules.

📡 Built with a vision to make emergency response faster, smarter, and more accessible — Lifesaver+ bridges the gap between the victim and responders when every second matters.
