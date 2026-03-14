import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import pool from '../config/database.js';
import { uploadImage, deleteImage } from '../utils/cloudinaryHelper.js';

const router = express.Router();

// Create auction
router.post('/create', verifyToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, description, startingBid, category, duration, image } = req.body;
    const userEmail = req.user.email;

    // Get or create user
    let userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userEmail]
    );

    let userId;
    if (userResult.rows.length === 0) {
      const insertUser = await client.query(
        'INSERT INTO users (email, is_admin, is_bidder) VALUES ($1, $2, $3) RETURNING id',
        [userEmail, req.user.isAdmin, req.user.isBidder]
      );
      userId = insertUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Upload image to Cloudinary
    const { url: imageUrl, publicId } = await uploadImage(image);

    // Calculate expiry date
    const expiresAt = new Date(Date.now() + parseInt(duration) * 60 * 60 * 1000);

    // Insert auction into database
    const result = await client.query(
      `INSERT INTO auctions 
       (user_id, title, description, starting_bid, current_bid, category, duration_hours, image_url, cloudinary_public_id, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [userId, title, description, parseFloat(startingBid), parseFloat(startingBid), category, parseInt(duration), imageUrl, publicId, expiresAt]
    );

    res.status(201).json({ 
      success: true, 
      auction: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ error: 'Failed to create auction' });
  } finally {
    client.release();
  }
});

// Get auctions by user
router.get('/my-auctions', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await pool.query(
      `SELECT a.*, 
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bids
       FROM auctions a
       JOIN users u ON a.user_id = u.id
       WHERE u.email = $1
       ORDER BY a.created_at DESC`,
      [userEmail]
    );

    res.json({ auctions: result.rows });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get all active auctions
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              u.email as seller_email,
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bids
       FROM auctions a
       JOIN users u ON a.user_id = u.id
       WHERE a.status = 'active' AND a.expires_at > NOW()
       ORDER BY a.created_at DESC`
    );

    res.json({ auctions: result.rows });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
              u.email as seller_email,
              (SELECT COUNT(*) FROM bids WHERE auction_id = a.id) as bids
       FROM auctions a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json({ auction: result.rows[0] });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// Delete auction
router.delete('/:id', verifyToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userEmail = req.user.email;

    // Get auction with user check
    const auctionResult = await client.query(
      `SELECT a.*, u.email 
       FROM auctions a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (auctionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const auction = auctionResult.rows[0];

    if (auction.email !== userEmail) {
      return res.status(403).json({ error: 'Not authorized to delete this auction' });
    }

    // Delete image from Cloudinary
    if (auction.cloudinary_public_id) {
      await deleteImage(auction.cloudinary_public_id);
    }

    // Delete auction from database (cascades to bids)
    await client.query('DELETE FROM auctions WHERE id = $1', [req.params.id]);

    res.json({ success: true, message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({ error: 'Failed to delete auction' });
  } finally {
    client.release();
  }
});

export default router;
