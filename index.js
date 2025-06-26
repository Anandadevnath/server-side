import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.c2gwoqc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const roommateSchema = new mongoose.Schema({
  title: String,
  location: String,
  rent: Number,
  roomType: String,
  lifestyle: [String],
  description: String,
  contactInfo: String,
  availability: { type: String, enum: ['available', 'not available'], default: 'available' },
  userEmail: String,
  userName: String,
  likeCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

const Roommate = mongoose.model('Roommate', roommateSchema);

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root endpoint
app.get('/', async (req, res) => {
  try {
    res.send('RoommateFinder API is running! 🚀');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new roommate listing
app.post('/roommates', async (req, res) => {
  try {
    const data = req.body;
    const roommate = new Roommate(data);
    await roommate.save();
    res.status(201).json({ message: 'Roommate listing created', roommate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all roommates (original endpoint)
app.get('/roommates', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const filter = req.query.available === 'true' ? { availability: 'available' } : {};
    const roommates = await Roommate.find(filter).limit(limit).sort({ createdAt: -1 });
    res.json(roommates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enhanced All Items endpoint with sorting and filtering
app.get('/all-items', async (req, res) => {
  try {
    const {
      sort = 'newest',
      order = 'desc',
      search = '',
      location = '',
      minRent = 0,
      maxRent = 10000,
      roomType = '',
      availability = '',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (roomType && roomType !== 'All') {
      filter.roomType = roomType;
    }
    
    if (availability && availability !== 'All') {
      filter.availability = availability;
    }
    
    filter.rent = { $gte: parseInt(minRent), $lte: parseInt(maxRent) };

    // Build sort object
    let sortOption = {};
    switch (sort) {
      case 'rent':
        sortOption.rent = order === 'asc' ? 1 : -1;
        break;
      case 'likes':
        sortOption.likeCount = order === 'asc' ? 1 : -1;
        break;
      case 'title':
        sortOption.title = order === 'asc' ? 1 : -1;
        break;
      case 'oldest':
        sortOption.createdAt = 1;
        break;
      default: // newest
        sortOption.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      Roommate.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Roommate.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard statistics endpoint
app.get('/dashboard/stats', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const [
      totalItems,
      myItems,
      availableItems,
      myLikes,
      recentItems
    ] = await Promise.all([
      Roommate.countDocuments(),
      Roommate.countDocuments({ userEmail: email }),
      Roommate.countDocuments({ availability: 'available' }),
      Roommate.aggregate([
        { $match: { userEmail: email } },
        { $group: { _id: null, totalLikes: { $sum: '$likeCount' } } }
      ]),
      Roommate.find({ userEmail: email })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title rent createdAt likeCount')
    ]);

    const totalLikes = myLikes.length > 0 ? myLikes[0].totalLikes : 0;

    res.json({
      totalItems,
      myItems,
      availableItems,
      totalLikes,
      recentItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get filter options for dropdowns
app.get('/filter-options', async (req, res) => {
  try {
    const [roomTypes, locations] = await Promise.all([
      Roommate.distinct('roomType'),
      Roommate.distinct('location')
    ]);

    const rentRange = await Roommate.aggregate([
      {
        $group: {
          _id: null,
          minRent: { $min: '$rent' },
          maxRent: { $max: '$rent' }
        }
      }
    ]);

    res.json({
      roomTypes: roomTypes.filter(type => type), // Remove empty values
      locations: locations.filter(loc => loc).slice(0, 20), // Limit to top 20 locations
      rentRange: rentRange[0] || { minRent: 0, maxRent: 5000 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending/popular listings
app.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const trending = await Roommate.find({ availability: 'available' })
      .sort({ likeCount: -1, viewCount: -1, createdAt: -1 })
      .limit(limit);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get search suggestions
app.get('/search-suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const suggestions = await Roommate.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: '$title' },
          locations: { $addToSet: '$location' }
        }
      },
      {
        $project: {
          suggestions: { $concatArrays: ['$titles', '$locations'] }
        }
      }
    ]);

    const results = suggestions[0]?.suggestions || [];
    const filtered = results
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single roommate by ID
app.get('/roommates/:id', async (req, res) => {
  try {
    const roommate = await Roommate.findById(req.params.id);
    if (!roommate) return res.status(404).json({ error: 'Not found' });
    
    // Increment view count
    await Roommate.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    res.json(roommate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a roommate listing
app.put('/roommates/:id', async (req, res) => {
  try {
    const updated = await Roommate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Roommate listing updated', updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a roommate listing
app.delete('/roommates/:id', async (req, res) => {
  try {
    const deleted = await Roommate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Roommate listing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's listings
app.get('/my-listings', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const listings = await Roommate.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a roommate listing
app.patch('/roommates/:id/like', async (req, res) => {
  try {
    const roommate = await Roommate.findByIdAndUpdate(
      req.params.id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    if (!roommate) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Liked', likeCount: roommate.likeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get analytics data for admin/dashboard
app.get('/analytics', async (req, res) => {
  try {
    const [
      totalListings,
      availableListings,
      totalLikes,
      totalViews,
      recentListings,
      topLocations,
      priceStats
    ] = await Promise.all([
      Roommate.countDocuments(),
      Roommate.countDocuments({ availability: 'available' }),
      Roommate.aggregate([
        { $group: { _id: null, total: { $sum: '$likeCount' } } }
      ]),
      Roommate.aggregate([
        { $group: { _id: null, total: { $sum: '$viewCount' } } }
      ]),
      Roommate.find().sort({ createdAt: -1 }).limit(10),
      Roommate.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Roommate.aggregate([
        {
          $group: {
            _id: null,
            avgRent: { $avg: '$rent' },
            minRent: { $min: '$rent' },
            maxRent: { $max: '$rent' }
          }
        }
      ])
    ]);

    res.json({
      totalListings,
      availableListings,
      totalLikes: totalLikes[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      recentListings,
      topLocations,
      priceStats: priceStats[0] || { avgRent: 0, minRent: 0, maxRent: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get similar listings based on location and price range
app.get('/roommates/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const roommate = await Roommate.findById(id);
    if (!roommate) return res.status(404).json({ error: 'Not found' });

    const priceRange = roommate.rent * 0.2; // 20% price range
    const similar = await Roommate.find({
      _id: { $ne: id },
      location: { $regex: roommate.location, $options: 'i' },
      rent: { 
        $gte: roommate.rent - priceRange, 
        $lte: roommate.rent + priceRange 
      },
      availability: 'available'
    }).limit(4);

    res.json(similar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch operations
app.post('/roommates/batch', async (req, res) => {
  try {
    const { action, ids } = req.body;
    
    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    let result;
    switch (action) {
      case 'delete':
        result = await Roommate.deleteMany({ _id: { $in: ids } });
        break;
      case 'toggle-availability':
        const items = await Roommate.find({ _id: { $in: ids } });
        for (const item of items) {
          item.availability = item.availability === 'available' ? 'not available' : 'available';
          await item.save();
        }
        result = { modifiedCount: items.length };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ message: `Batch ${action} completed`, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RoommateFinder API Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🗄️  Database: MongoDB Connected`);
});