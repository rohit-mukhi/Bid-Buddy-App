# Bid Buddy - PostgreSQL + Cloudinary Setup Guide

## Architecture Overview

### Data Flow:
1. User creates auction → Frontend sends form + base64 image
2. Backend validates JWT → Gets user_id from database
3. Upload image to Cloudinary → Get secure_url and public_id
4. Store auction in PostgreSQL with Cloudinary URL
5. Fetch auctions → Query by user_id → Return with image URLs
6. Delete auction → Delete from Cloudinary → Delete from PostgreSQL (cascades)

### Database Schema:

**Users Table:**
- Stores user information from Google OAuth
- Links to auctions and bids via foreign keys

**Auctions Table:**
- Stores auction details
- References user_id (creator)
- Stores Cloudinary image_url and public_id
- Tracks status (active/completed/cancelled)

**Bids Table:**
- Stores bid history
- References auction_id and user_id
- Tracks bid amounts and timestamps

---

## Setup Instructions

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE bid_buddy;

# Create user (optional)
CREATE USER bid_buddy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bid_buddy TO bid_buddy_user;

# Exit
\q
```

### 3. Setup Cloudinary

1. Sign up at: https://cloudinary.com/users/register/free
2. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 4. Configure Environment Variables

Update `/backend/.env`:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bid_buddy
DB_USER=postgres  # or bid_buddy_user
DB_PASSWORD=your_postgres_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Install Dependencies

```bash
cd backend
npm install
```

### 6. Start Server

```bash
npm start
```

The server will automatically:
- Connect to PostgreSQL
- Create tables if they don't exist
- Initialize Cloudinary connection

---

## How It Works

### Creating an Auction:

1. **Frontend** sends POST to `/api/auctions/create`:
   ```json
   {
     "title": "Vintage Watch",
     "description": "...",
     "startingBid": "100",
     "category": "collectibles",
     "duration": "24",
     "image": "data:image/jpeg;base64,..."
   }
   ```

2. **Backend** processes:
   - Validates JWT → Gets user email
   - Queries/creates user in PostgreSQL
   - Uploads base64 image to Cloudinary
   - Stores auction with Cloudinary URL in PostgreSQL
   - Returns auction data

3. **Cloudinary** stores image:
   - Folder: `bid-buddy/auctions/`
   - Optimized: 800x600, auto quality, auto format
   - Returns: `secure_url` and `public_id`

### Fetching Auctions:

1. **GET** `/api/auctions/my-auctions` (requires JWT)
   - Queries auctions by user_id
   - Joins with bids table to get bid count
   - Returns auctions with Cloudinary image URLs

2. **GET** `/api/auctions/all`
   - Returns all active auctions
   - Includes seller email and bid count

### Deleting an Auction:

1. **DELETE** `/api/auctions/:id` (requires JWT)
   - Verifies user owns the auction
   - Deletes image from Cloudinary using public_id
   - Deletes auction from PostgreSQL (cascades to bids)

---

## Database Relationships

```
users (1) ----< (many) auctions
users (1) ----< (many) bids
auctions (1) ----< (many) bids
```

- One user can create many auctions
- One user can place many bids
- One auction can have many bids
- Deleting a user cascades to their auctions and bids
- Deleting an auction cascades to its bids

---

## Security Features

1. **JWT Authentication**: All create/delete operations require valid JWT
2. **User Ownership**: Users can only delete their own auctions
3. **SQL Injection Protection**: Using parameterized queries
4. **Image Optimization**: Cloudinary auto-optimizes images
5. **Cascade Deletion**: Orphaned records automatically cleaned up

---

## Testing

1. Create auction → Check PostgreSQL + Cloudinary
2. View auctions → Verify images load from Cloudinary
3. Delete auction → Verify removed from both PostgreSQL and Cloudinary

```bash
# Check PostgreSQL
psql -U postgres -d bid_buddy
SELECT * FROM auctions;
SELECT * FROM users;

# Check Cloudinary
# Login to dashboard: https://cloudinary.com/console
# Navigate to Media Library → bid-buddy/auctions/
```

---

## Troubleshooting

**PostgreSQL Connection Error:**
- Check if PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`
- Check database exists: `psql -U postgres -l`

**Cloudinary Upload Error:**
- Verify credentials in `.env`
- Check image size (max 10MB)
- Ensure base64 format is correct

**Image Not Loading:**
- Check Cloudinary URL in database
- Verify public_id is stored correctly
- Check Cloudinary dashboard for uploaded images
