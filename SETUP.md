# Role-Based Authentication Setup

## Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Update `.env` file with your JWT secret:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## Frontend Setup

Frontend is already configured. Make sure backend is running.

## Testing Different Roles

The system has 3 test users configured:

1. **Admin Only**: `admin@example.com`
   - Can access Admin Panel
   - Cannot place bids

2. **Bidder Only**: `bidder@example.com`
   - Can place bids
   - Cannot access Admin Panel

3. **Both Roles**: `both@example.com`
   - Can access Admin Panel
   - Can place bids

4. **New Users**: Any other email
   - Automatically assigned Bidder role

## Workflow

1. User logs in via Google OAuth
2. Backend receives email and generates JWT with roles (isAdmin, isBidder)
3. Frontend stores JWT and user info
4. Home page shows role badges and available actions
5. Clicking "Create Auction" → checks isAdmin → opens Admin Panel
6. Clicking "Place Bid" → checks isBidder → opens Bidding Interface

## API Endpoints

- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/verify` - Verify JWT token
