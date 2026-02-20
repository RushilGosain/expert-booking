# Expert Booking — Backend

Node.js + Express + MongoDB + Socket.io

## Quick Start

```bash
cd backend
npm install
cp .env.example .env   # fill in your MONGODB_URI
npm run dev
```

## Folder Structure
```
src/
├── config/       → DB connection
├── controllers/  → Business logic
├── middleware/   → Error handling
├── models/       → Mongoose schemas
├── routes/       → Express routes
└── socket/       → Socket.io events
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /experts | List experts (pagination + filter) |
| GET | /experts/:id | Expert detail + time slots |
| POST | /experts/seed | Seed test data (dev only) |
| POST | /bookings | Create booking |
| GET | /bookings?email= | My bookings by email |
| PATCH | /bookings/:id/status | Update booking status |

## Query Params — GET /experts
- `page` (default: 1)
- `limit` (default: 9)
- `category` — Technology, Business, Design, Marketing, Finance, Health, Legal, Education
- `search` — text search on name

## Double Booking Prevention
Uses MongoDB transactions + atomic `findOneAndUpdate` with array filters.
A unique compound index `{ expertId, date, timeSlot }` acts as the final safety net.

## Real-Time Updates
Socket.io events:
- `joinExpert(expertId)` — subscribe to slot updates for an expert
- `slotBooked` — emitted when a slot is booked `{ expertId, date, timeSlot, isBooked: true }`
- `slotReleased` — emitted when a booking is cancelled
