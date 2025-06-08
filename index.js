import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.c2gwoqc.mongodb.net/tutorBooking?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = decoded;
    next();
  });
};

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  photoURL: String,
  provider: String
});
const User = mongoose.model('User', userSchema);

// Tutor Schema
const tutorSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  language: String,
  price: Number,
  description: String,
  review: { type: Number, default: 0 }
});
const Tutor = mongoose.model('Tutor', tutorSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  tutorId: String,
  image: String,
  language: String,
  price: Number,
  tutorEmail: String,
  email: String
});
const Booking = mongoose.model('Booking', bookingSchema);

// Auth: Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });
    const user = new User({ name, email, password, photoURL, provider: 'local' });
    await user.save();
    const token = jwt.sign({ email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name, email, photoURL } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Auth: Google Login
app.post('/api/google-login', async (req, res) => {
  try {
    const { email, name, photoURL } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email, provider: 'google' });

    if (!user) {
      user = new User({
        name: name || email,
        email,
        photoURL,
        provider: 'google',
        password: '', 
      });
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign({ email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, provider: 'local' });
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email, photoURL: user.photoURL } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add Tutor (private)
app.post('/api/tutorials', verifyJWT, async (req, res) => {
  try {
    const { name, email, image, language, price, description } = req.body;
    const tutor = new Tutor({ name, email, image, language, price, description });
    await tutor.save();
    res.status(201).json({ message: 'Tutorial added', tutor });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get All Tutors
app.get('/api/tutorials', async (req, res) => {
  try {
    const { language } = req.query;
    const filter = language ? { language: { $regex: language, $options: 'i' } } : {};
    const tutors = await Tutor.find(filter);
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Tutors by Category
app.get('/api/tutorials/category/:category', async (req, res) => {
  try {
    const tutors = await Tutor.find({ language: req.params.category });
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tutor Details (private)
app.get('/api/tutorials/:id', verifyJWT, async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) return res.status(404).json({ error: 'Not found' });
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book Tutor (private)
app.post('/api/bookings', verifyJWT, async (req, res) => {
  try {
    const { tutorId, image, language, price, tutorEmail } = req.body;
    const booking = new Booking({ tutorId, image, language, price, tutorEmail, email: req.user.email });
    await booking.save();
    res.status(201).json({ message: 'Tutor booked', booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// My Booked Tutors (private)
app.get('/api/my-bookings', verifyJWT, async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.user.email });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Review Tutor (private)
app.patch('/api/tutorials/:id/review', verifyJWT, async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { $inc: { review: 1 } },
      { new: true }
    );
    if (!tutor) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Review added', review: tutor.review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// My Tutorials (public)
app.get('/api/my-tutorials', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const tutorials = await Tutor.find({ email });
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Tutorial (public)
app.delete('/api/tutorials/:id', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const deleted = await Tutor.findOneAndDelete({ _id: req.params.id, email });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Tutorial deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Tutorial (public)
app.put('/api/tutorials/:id', async (req, res) => {
  try {
    const { email, image, language, price, description } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const updated = await Tutor.findOneAndUpdate(
      { _id: req.params.id, email },
      { image, language, price, description },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Tutorial updated', updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stats
app.get('/api/stats', async (req, res) => {
  try {
    const tutorCount = await Tutor.countDocuments();
    const reviewCount = await Tutor.aggregate([{ $group: { _id: null, total: { $sum: "$review" } } }]);
    const languages = await Tutor.distinct('language');
    const userCount = await User.countDocuments();
    res.json({
      tutorCount,
      reviewCount: reviewCount[0]?.total || 0,
      languageCount: languages.length,
      userCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', async (req, res) => {
  res.send('Welcome to Tutorfinder')
});


// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});