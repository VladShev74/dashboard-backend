# Fitness Center Dashboard Backend

This is the backend API for the Fitness Center Dashboard, built with **Node.js**, **Express**, and **MongoDB**.  
It provides RESTful endpoints for managing fitness classes and membership plans.

---

## Features

- **CRUD API** for fitness classes and membership plans
- MongoDB Atlas integration
- CORS enabled for frontend development
- Simple, clean code structure

---

## Tech Stack

- Node.js
- Express
- MongoDB (using the official MongoDB Node.js driver)
- dotenv

---

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dashboard-backend.git
   cd dashboard-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory and add your MongoDB password:
   ```
   DB_CONNECTION_PASS=your_mongodb_password
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   The server will run on port `3000` by default.

---

## API Endpoints

### Classes

- `GET    /api/classes`           — Get all fitness classes
- `GET    /api/classes/:id`       — Get a class by ID
- `POST   /api/classes`           — Create a new class
- `PUT    /api/classes/:id`       — Update a class by ID
- `DELETE /api/classes/:id`       — Delete a class by ID

### Membership Plans

- `GET    /api/plans`             — Get all membership plans
- `POST   /api/plan`              — Create a new membership plan
- `PUT    /api/plan/:id`          — Update a membership plan by ID
- `DELETE /api/plan/:id`          — Delete a membership plan by ID

---

## Example `.env`

```
DB_CONNECTION_PASS=your_mongodb_password
```

---

## Notes

- Make sure your MongoDB Atlas cluster is running and accessible.
- The backend expects the frontend to send and receive `id` as a string (mapped from MongoDB's `_id`).
- CORS is enabled for development convenience.

---

## Related

- [dashboard-frontend](https://github.com/VladShev74/dashboard-frontend) — Vue 3 frontend for this API

---

## License

MIT
