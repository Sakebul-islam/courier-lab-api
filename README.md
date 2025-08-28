# Courier Lab API

Courier Lab is a modular, production‑ready backend for courier and parcel delivery platforms. It offers secure authentication, role‑based access control, and complete parcel workflows—from creation and tracking to status updates and delivery confirmation.

## 🚀 Features

- **Secure authentication**: JWT with hashed passwords (bcrypt)
- **Role-based access**: Admin, Sender, Receiver with granular permissions
- **End‑to‑end parcel management**: Create, update, track, confirm delivery
- **Audit-friendly status history**: Detailed status timeline and logs
- **Enforced business rules**: Validated transitions and access controls
- **Public tracking**: Anonymous parcel status lookup by tracking ID
- **Dynamic fee calculation**: Pricing based on weight, urgency, distance

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | Server runtime environment |
| Framework | Express.js | HTTP server and routing |
| Language | TypeScript | Type-safe development |
| Database | MongoDB | Document data store |
| ODM | Mongoose | MongoDB object modeling |
| Auth | JWT | Token-based authentication |
| Security | bcrypt | Password hashing |
| Validation | Zod | Schema validation |
| Env | dotenv | Environment configuration |
| CORS | cors | Cross-origin resource sharing |
| Cookies | cookie-parser | Cookie handling |

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

## 🚀 Quick Start

1) Clone
```bash
git clone https://github.com/Sakebul-islam/courier-lab-api.git
cd courier-lab-api
```

2) Install
```bash
npm install
```

3) Configure env
Create a `.env` file in the project root:
```env
# Server
PORT=8000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/courierlab

# JWT
JWT_ACCESS_SECRET=your-super-secure-secret-key
JWT_ACCESS_EXPIRES=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES=7d

# Security
BCRYPT_SALT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:3000
```

4) Start MongoDB
Make sure MongoDB is running. Collections are created on first run.

5) Run
- Development: `npm run dev`
- Production: `npm run build && npm start`

Local API: `http://localhost:5000`

Root health: `GET /` → `{ message: "Welcome to CourierLab API Server" }`

## 📚 API Endpoints

### Authentication

| Method | Endpoint                    | Description                                                                                                                                                                                                                                     | Access        |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `POST` | `/api/auth/register`        | Register a new user (email, password, name, phone, address, role). Ensures unique email, hashes password (bcrypt), returns user (without password). Default role: sender.                                                                      | Public        |
| `POST` | `/api/auth/login`           | Authenticate with email/password. Issues JWT access and refresh tokens in HTTP‑only cookies and returns user plus tokens.                                                                                                                       | Public        |
| `POST` | `/api/auth/refresh-token`   | Exchange a valid refresh token for a new access token without re‑login.                                                                                                                                                                         | Public        |
| `GET`  | `/api/auth/me`              | Return the authenticated user’s profile (personal details, address, account status). Requires a valid JWT.                                                                                                                                      | Authenticated |
| `PUT`  | `/api/auth/profile`         | Update profile fields (e.g., name, phone, address). Validates input and returns the updated profile.                                                                                                                                             | Authenticated |
| `PUT`  | `/api/auth/change-password` | Change password after verifying the current password. Hashes and saves the new password.                                                                                                                                                         | Authenticated |
| `POST` | `/api/auth/logout`          | Log out by clearing authentication cookies and invalidating the session.                                                                                                                                                                         | Authenticated |

### User Management

#### Admin-Only Routes

| Method   | Endpoint              | Description                                                                                                                                                                                                   |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/user/`          | Paginated list of users with search and filtering (role, status, etc.). Shows user details, roles, and account states.                                                                                       |
| `GET`    | `/api/user/stats`     | Aggregated user metrics: totals, active vs. blocked, role distribution, and registration trends (for dashboards/reporting).                                                                                   |
| `GET`    | `/api/user/:id`       | Detailed user record by ID, including profile, role, account status, and timestamps.                                                                                                                         |
| `PUT`    | `/api/user/:id/role`  | Change a user’s role among admin/sender/receiver with permission validation.                                                                                                                                  |
| `PUT`    | `/api/user/:id/block` | Block or unblock a user (with reason). Blocked users lose access to protected routes and parcel operations.                                                                                                   |
| `DELETE` | `/api/user/:id`       | Permanently delete a user and associated records. Irreversible.                                                                                                                                                |

#### My Profile

| Method | Endpoint                            | Description                                                                                                                                                                      |
| ------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/user/profile/me`              | Return current user profile (details, address, role, status). Requires JWT.                                                                                                      |
| `PUT`  | `/api/user/profile/update`          | Update profile fields (name, phone, address, etc.). Validates input and returns the updated record.                                                                              |
| `PUT`  | `/api/user/profile/change-password` | Change your password after verifying the current one; enforces password strength.                                                                                                |

### Parcels

#### Public

| Method | Endpoint                        | Description                                                                                                                                                                               |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/parcel/track/:trackingId` | **Track Parcel**: Public endpoint to track parcel status using tracking ID. Returns parcel details, current status, delivery information, and status history. No authentication required. |

#### Sender

| Method   | Endpoint                 | Description                                                                                                                                                                                                                        |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/parcel/`           | **Create Parcel**: Creates new parcel delivery request with receiver details, parcel specifications, delivery preferences, and urgency level. Auto-generates tracking ID, calculates fees, and sets initial status to 'REQUESTED'. |
| `GET`    | `/api/parcel/my-sent`    | **Get My Sent Parcels**: Retrieves paginated list of all parcels created by the authenticated sender. Includes filtering by status, date range, and search functionality.                                                          |
| `PUT`    | `/api/parcel/:id`        | **Update Parcel**: Allows sender to modify parcel details including receiver information, parcel specifications, and delivery preferences. Only available before parcel is dispatched (REQUESTED or APPROVED status).              |
| `DELETE` | `/api/parcel/:id/cancel` | **Cancel Parcel**: Enables sender to cancel parcel delivery with reason. Only available for parcels in REQUESTED or APPROVED status. Updates status to CANCELLED and maintains cancellation history.                               |

#### Receiver

| Method | Endpoint                           | Description                                                                                                                                                                                                                |
| ------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/parcel/my-received`          | **Get My Received Parcels**: Retrieves paginated list of all parcels addressed to the authenticated receiver. Filters parcels by receiver email and includes status filtering and search.                                  |
| `PUT`  | `/api/parcel/:id/confirm-delivery` | **Confirm Delivery**: Allows receiver to confirm successful delivery of parcel. Updates status to DELIVERED, adds confirmation note, and records delivery timestamp. Only available for parcels addressed to the receiver. |
| `GET`  | `/api/parcel/delivery-history`     | **Get Delivery History**: Retrieves paginated list of successfully delivered parcels for the authenticated receiver. Shows completed deliveries with delivery dates and confirmation details.                              |

#### Admin

| Method   | Endpoint                 | Description                                                                                                                                                                                                               |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/parcel/`           | **Get All Parcels**: Retrieves paginated list of all parcels in the system with comprehensive filtering options. Admin can filter by status, sender, receiver, date range, urgency, and tracking ID.                      |
| `PUT`    | `/api/parcel/:id/status` | **Update Parcel Status**: Allows admin to change parcel status following business rules. Validates status transitions, adds status log entry with admin details, and updates current status. Includes location and notes. |
| `PUT`    | `/api/parcel/:id/block`  | **Block/Unblock Parcel**: Enables admin to block or unblock specific parcels. Blocked parcels cannot be updated or processed further. Includes reason for blocking and maintains block history.                           |
| `PUT`    | `/api/parcel/:id/assign` | **Assign Delivery Personnel**: Allows admin to assign delivery personnel to parcels. Includes personnel details like name, email, phone, employee ID, and vehicle information.                                            |
| `GET`    | `/api/parcel/stats`      | **Get Parcel Statistics**: Provides comprehensive parcel analytics including total parcels, delivered count, in-transit count, average delivery time, revenue metrics, and status breakdown.                              |
| `DELETE` | `/api/parcel/:id`        | **Delete Parcel**: Permanently removes parcel from the system. Deletes parcel data, status history, and all associated records. Cannot be undone.                                                                         |

#### Shared (Role-based access)

| Method | Endpoint                         | Description                                                                                                                                                                                                                  |
| ------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/parcel/:id`                | **Get Parcel Details**: Retrieves detailed parcel information including sender, receiver, parcel details, pricing, current status, and delivery information. Access restricted to parcel owner (sender), receiver, or admin. |
| `GET`  | `/api/parcel/:id/status-history` | **Get Status History**: Retrieves complete status history of parcel including all status changes, timestamps, updater information, locations, and notes. Access restricted to parcel owner, receiver, or admin.              |

## 🏗️ Architecture & Deployment

- **Runtime**: Express app exported (no `listen` in serverless entry)
- **Serverless**: `src/api/index.ts` exports `default` handler; reuses a single MongoDB connection per cold start
- **Build**: TypeScript → `dist/` via `tsc` (also used by Vercel `vercel-build`)
- **Vercel**: `vercel.json` rewrites all traffic to `dist/api/index.js` using `@vercel/node`

### Required Environment Variables
- PORT, NODE_ENV
- DB_URL
- BCRYPT_SALT_ROUNDS
- JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES
- JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES
- SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD
- FRONTEND_URL
- EXPRESS_SESSION_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL

Note: For production, prefer a persistent session store (e.g., connect-mongo) instead of the default memory store.

## 👥 User Roles & Permissions

### Admin

- View and manage all users and parcels
- Block or unblock users and parcels
- Update parcel delivery statuses
- Assign delivery personnel
- Access system-wide analytics and reports
- Full CRUD operations on all resources

### Sender

- Create parcel delivery requests
- Cancel parcels (only if not dispatched)
- View all their created parcels
- Track parcel status and history
- Update parcel details (before dispatch)

### Receiver

- View incoming parcels addressed to them
- Confirm parcel delivery receipt
- Access delivery history
- Track parcel status

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds ≥ 12
- **Role-Based Access Control**: Granular permissions per role
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error responses

## 📊 Data Models

### User Schema

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string; // unique
  password: string; // hashed
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  role: "admin" | "sender" | "receiver";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Parcel Schema

```typescript
interface IParcel {
  _id: ObjectId;
  trackingId: string; // Format: TRK-YYYYMMDD-XXXXXX
  sender: ObjectId; // Reference to User
  receiver: {
    name: string;
    email: string;
    phone: string;
    address: Address;
  };
  parcelDetails: {
    type: "document" | "package" | "fragile" | "electronics" | "other";
    weight: number; // in kg
    dimensions?: Dimensions;
    description: string;
    value?: number;
  };
  deliveryInfo: {
    preferredDeliveryDate?: Date;
    deliveryInstructions?: string;
    urgency: "standard" | "express" | "urgent";
  };
  pricing: {
    baseFee: number;
    weightFee: number;
    urgencyFee: number;
    totalFee: number;
    discount?: number;
    couponCode?: string;
  };
  currentStatus: ParcelStatus;
  statusHistory: IStatusLog[]; // Embedded status logs
  isBlocked: boolean;
  isCancelled: boolean;
  deliveryPersonnel?: IDeliveryPersonnel;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Testing

### API Testing

The project includes comprehensive API testing capabilities:

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### API Testing with Postman

You can create a Postman collection by importing your running endpoints manually or exporting from your API client. A curated collection will be added to this repository in a future update.

## 🧭 Roadmap
- Add persistent session store for production (e.g., connect-mongo)
- Add rate limiting and request logging middleware
- Publish official Postman collection and OpenAPI schema
- CI for lint, build, and deploy
