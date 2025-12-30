const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Set limits to handle crop images without errors
app.use(express.json({ limit: '50mb' })); 
app.use(cors());

// 🔗 DIRECT CLOUD CONNECTION (No dotenv needed for college level)
const cloudDB = 'mongodb+srv://pardeships32_db_user:Farm12345678@farmbridgecluster.so2demo.mongodb.net/FarmBridge?retryWrites=true&w=majority';

mongoose.connect(cloudDB)
  .then(() => console.log("✅ SUCCESS: Cloud Database Connected"))
  .catch(err => {
    console.error("❌ DB ERROR:", err);
    process.exit(1); // Stop server if DB fails to prevent silent errors
  });

// --- DATABASE MODELS ---
const User = mongoose.model('User', new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: String }));
const Product = mongoose.model('Product', new mongoose.Schema({ productName: String, price: Number, stock: Number, category: String, saleUnit: String, image: String, farmerEmail: String }));
const Order = mongoose.model('Order', new mongoose.Schema({ buyerEmail: String, buyerName: String, address: String, phone: String, items: Array, totalAmount: Number, paymentMethod: String, status: { type: String, default: 'Pending' }, date: { type: Date, default: Date.now } }));

// --- API ROUTES ---

// 1. Authentication
app.post('/api/register', async (req, res) => { 
    try { await new User(req.body).save(); res.json({ message: "Success" }); } 
    catch (e) { res.status(400).send("User exists"); } 
});

app.post('/api/login', async (req, res) => { 
    const { email, password } = req.body; 
    const user = await User.findOne({ email, password }); 
    user ? res.json({ user }) : res.status(401).send("Auth failed"); 
});

// 2. Products
app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/add-product', async (req, res) => res.json(await new Product(req.body).save()));
app.put('/api/products/:id', async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })));
app.delete('/api/products/:id', async (req, res) => res.json(await Product.findByIdAndDelete(req.params.id)));

// 3. Orders & Stock
app.put('/api/products/:id/stock', async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock })));
app.post('/api/place-order', async (req, res) => res.json(await new Order(req.body).save()));
app.get('/api/farmer-orders/:email', async (req, res) => res.json(await Order.find({ "items.farmerEmail": req.params.email })));
app.get('/api/buyer-orders/:email', async (req, res) => res.json(await Order.find({ buyerEmail: req.params.email })));
app.put('/api/orders/:id/status', async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is live and running on port ${PORT}`);
});