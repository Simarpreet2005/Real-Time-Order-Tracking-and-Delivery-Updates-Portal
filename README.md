🚀 **Real-Time Order Tracking & Delivery Platform**

A role-based, real-time delivery tracking platform designed to model the core workflows used by modern delivery and logistics systems.

The project is demonstrated using a grocery delivery use case, chosen intentionally because grocery orders are time-sensitive and require continuous delivery visibility, making them ideal for showcasing real-time tracking, order lifecycle management, and event-driven communication.


🔥 **Project Overview**

Behind every delivery app is a system that manages:

Multiple user roles

Continuous state changes

Live geolocation streaming

Real-time UI updates

This project implements these concepts in a clear, scalable, and interview-ready architecture.

🧩 **System Roles**

👤 **Customer**

Browse grocery items and place orders

View order details and history

Track order status in real time

View live delivery agent location on map


🧑‍💼 **Admin (Operations)**

View and monitor all orders

Manage order lifecycle

Assign delivery agents

Monitor active deliveries in real time (read-only)


🚴 **Delivery Agent**

View assigned orders

Accept delivery requests

Share live GPS location

Mark orders as delivered


📡 **Real-Time Tracking Architecture**

Real-time communication using Socket.IO

Location updates streamed at regular intervals

Dedicated channels per order for precise tracking

Instant map and status updates without page refresh


🔄 **Order Lifecycle**

Placed → Confirmed → Packed → Out for Delivery → Delivered


Each transition is role-controlled and time-stamped.


🏗️ **Tech Stack**


**Frontend**

React (Vite)

JavaScript

Map Rendering: Leaflet.js (OpenStreetMap)

Socket.IO Client


**Backend**

Node.js

Express.js

MongoDB

Socket.IO

JWT Authentication


🎯**Why Grocery?**

The grocery domain was selected because it closely mirrors real-world, high-frequency delivery scenarios where customers expect accurate, real-time updates.
The same architecture can be reused for food delivery, courier services, or e-commerce without changes to the core system.


⚙️ **Local Setup**

git clone https://github.com/Simarpreet2005/Real-Time-Order-Tracking-and-Delivery-Updates-Portal.git

cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev


📌 **Notes**

Focuses on delivery workflows and real-time systems

Domain chosen for realism and clarity

Designed as a desktop-first application

Certain production complexities are intentionally simplified


🧠 **Key Learnings**

Role-based access control

Real-time event handling

Order state management

Live map integrations
