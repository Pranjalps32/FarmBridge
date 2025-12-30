const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/farmbridge')
  .then(() => console.log("✅ SUCCESS: Database Connected"))
  .catch(err => console.error("❌ DB ERROR:", err));

// MODELS
const User = mongoose.model('User', new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: String }));
const Product = mongoose.model('Product', new mongoose.Schema({ productName: String, price: Number, stock: Number, category: String, saleUnit: String, image: String, farmerEmail: String }));
const Order = mongoose.model('Order', new mongoose.Schema({ buyerEmail: String, buyerName: String, address: String, phone: String, items: Array, totalAmount: Number, paymentMethod: String, status: { type: String, default: 'Pending' }, date: { type: Date, default: Date.now } }));

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => { 
    try { await new User(req.body).save(); res.json({ message: "Success" }); } 
    catch (e) { res.status(400).send("User exists"); } 
});

app.post('/api/login', async (req, res) => { 
    const { email, password } = req.body; 
    const user = await User.findOne({ email, password }); 
    user ? res.json({ user }) : res.status(401).send("Auth failed"); 
});

// --- PRODUCT MANAGEMENT (Add, Edit, Delete) ---
app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/add-product', async (req, res) => res.json(await new Product(req.body).save()));

// EDIT: Updates all product fields (Name, Price, Category, etc.)
app.put('/api/products/:id', async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })));

// DELETE: Removes the crop from MongoDB permanently
app.delete('/api/products/:id', async (req, res) => res.json(await Product.findByIdAndDelete(req.params.id)));

// --- ORDER & STOCK ROUTES ---
// Updates only the stock count after a purchase
app.put('/api/products/:id/stock', async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock })));
app.post('/api/place-order', async (req, res) => res.json(await new Order(req.body).save()));
app.get('/api/farmer-orders/:email', async (req, res) => res.json(await Order.find({ "items.farmerEmail": req.params.email })));
app.get('/api/buyer-orders/:email', async (req, res) => res.json(await Order.find({ buyerEmail: req.params.email })));
app.put('/api/orders/:id/status', async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));