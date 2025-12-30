import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getStyles } from '../Styles';

const FarmerDashboard = ({ user, products, fetchAll, API, onLogout }) => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [orders, setOrders] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ 
        productName: '', price: '', stock: '', 
        category: 'Fresh Veggies', saleUnit: 'per 1kg', image: '' 
    });
    const s = getStyles();

    // 🔄 Fetch orders whenever the "Orders" tab is clicked
    useEffect(() => { 
        if (activeTab === 'orders') fetchOrders(); 
    }, [activeTab]);

    const fetchOrders = async () => { 
        try {
            const res = await axios.get(`${API}/farmer-orders/${user.email}`); 
            setOrders(res.data || []); 
        } catch (e) { console.error("Fetch error: ", e); }
    };

    // 🗑️ Delete crop from database
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this crop?")) {
            try {
                await axios.delete(`${API}/products/${id}`);
                alert("Crop deleted successfully! 🗑️");
                fetchAll(); 
            } catch (e) { alert("Delete failed"); }
        }
    };

    // 📄 Print Bill / Invoice for buyers
    const handlePrint = (order) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = order.items.map(item => 
            `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>₹${item.price}</td><td>₹${item.price * item.quantity}</td></tr>`
        ).join('');

        printWindow.document.write(`
            <html>
                <body style="font-family: Arial; padding: 20px;">
                    <h1 style="color: #2d4d2d;">FarmBridge Invoice</h1>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Farmer:</strong> ${user.name}</p>
                    <hr/>
                    <p><strong>Buyer:</strong> ${order.buyerName}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <tr style="background: #eee;"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                        ${itemsHtml}
                    </table>
                    <h3 style="text-align: right;">Grand Total: ₹${order.totalAmount}</h3>
                    <script>window.print(); window.close();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleSave = async () => {
        if (!form.productName || !form.price || !form.image) return alert("Please fill all fields and upload a photo!");
        try {
            if (editingId) await axios.put(`${API}/products/${editingId}`, form);
            else await axios.post(`${API}/add-product`, { ...form, farmerEmail: user.email });
            
            alert("Success!"); setEditingId(null); fetchAll(); setActiveTab('inventory');
        } catch (e) { alert("Save failed"); }
    };

    const handleStatusUpdate = async (id) => {
        await axios.put(`${API}/orders/${id}/status`, { status: 'Delivered' });
        alert("Marked as Delivered! ✅");
        fetchOrders();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f4' }}>
            {/* SIDEBAR NAVIGATION */}
            <div style={{ width: '260px', background: '#1a2e1a', color: 'white', position: 'fixed', height: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#ffd700' }}>Farmer Panel</h2>
                <nav style={{ marginTop: '40px', flex: 1 }}>
                    <div onClick={() => setActiveTab('inventory')} style={{ padding: '12px', cursor: 'pointer', background: activeTab === 'inventory' ? '#2d4d2d' : 'transparent', borderRadius: '8px', marginBottom: '10px' }}>📊 Inventory</div>
                    <div onClick={() => {setActiveTab('new'); setEditingId(null); setForm({productName:'', price:'', stock:'', category:'Fresh Veggies', saleUnit:'per 1kg', image:''})}} 
                         style={{ padding: '12px', cursor: 'pointer', background: activeTab === 'new' ? '#2d4d2d' : 'transparent', borderRadius: '8px', marginBottom: '10px' }}>
                         ➕ Add New
                    </div>
                    <div onClick={() => setActiveTab('orders')} style={{ padding: '12px', cursor: 'pointer', background: activeTab === 'orders' ? '#2d4d2d' : 'transparent', borderRadius: '8px' }}>🚚 Orders</div>
                </nav>
                <button onClick={onLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
            </div>

            <div style={{ marginLeft: '260px', padding: '40px', flex: 1 }}>
                
                {/* 1. INVENTORY VIEW WITH EDIT/DELETE */}
                {activeTab === 'inventory' && (
                    <div style={s.grid}>
                        {products.filter(p => p.farmerEmail === user.email).map(p => (
                            <div key={p._id} style={s.card}>
                                <img src={p.image} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} alt="crop" />
                                <div style={{marginTop: '10px'}}>
                                    <span style={{fontSize:'10px', background:'#e8f5e9', padding:'2px 8px', borderRadius:'10px', color:'#2d4d2d'}}>{p.category}</span>
                                    <h4 style={{margin: '5px 0'}}>{p.productName}</h4>
                                    <p style={{fontWeight: 'bold', color: '#2d4d2d'}}>₹{p.price} / {p.saleUnit}</p>
                                    <div style={{display:'flex', gap:'5px', marginTop: '10px'}}>
                                        <button style={{...s.btnPrimary, padding:'5px', flex:1}} onClick={() => {setEditingId(p._id); setForm({...p}); setActiveTab('new')}}>Edit ✏️</button>
                                        <button style={{background:'#ff4d4d', color:'white', border:'none', borderRadius:'5px', padding:'5px', flex:1, cursor:'pointer'}} onClick={() => handleDelete(p._id)}>Delete 🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. ADD / EDIT FORM */}
                {activeTab === 'new' && (
                    <div style={{ ...s.card, maxWidth: '600px' }}>
                        <h2>{editingId ? "Edit Crop Details" : "List New Harvest"}</h2>
                        <input style={s.input} value={form.productName} placeholder="Crop Name" onChange={e => setForm({...form, productName: e.target.value})} />
                        
                        <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                            <div style={{flex:1}}>
                                <label style={{fontWeight:'bold', fontSize:'12px'}}>Category</label>
                                <select style={s.input} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                    <option value="Fresh Veggies">Fresh Veggies</option>
                                    <option value="Leafy Greens">Leafy Greens</option>
                                    <option value="Gourds">Gourds</option>
                                    <option value="Beans">Beans</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Dairy">Dairy</option>
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label style={{fontWeight:'bold', fontSize:'12px'}}>Pricing Unit</label>
                                <select style={s.input} value={form.saleUnit} onChange={e => setForm({...form, saleUnit: e.target.value})}>
                                    <option value="per 1kg">per 1kg</option>
                                    <option value="per unit">per unit</option>
                                    <option value="per 100gm">per 100gm</option>
                                    <option value="per bunch">per bunch</option>
                                </select>
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                            <input style={s.input} value={form.price} placeholder="Price (₹)" type="number" onChange={e => setForm({...form, price: e.target.value})} />
                            <input style={s.input} value={form.stock} placeholder="Stock" type="number" onChange={e => setForm({...form, stock: e.target.value})} />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Crop Photo</label>
                            <input type="file" accept="image/*" onChange={e => { 
                                const r = new FileReader(); 
                                r.onload = () => setForm({...form, image: r.result}); 
                                r.readAsDataURL(e.target.files[0]); 
                            }} />
                        </div>
                        
                        <button style={{ ...s.btnPrimary, width: '100%', marginTop: '30px' }} onClick={handleSave}>Confirm</button>
                    </div>
                )}

                {/* 3. ORDERS VIEW WITH PRINTING */}
                {activeTab === 'orders' && (
                    <div>
                        <h2>Incoming Orders</h2>
                        {orders.map(o => (
                            <div key={o._id} style={{...s.card, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <strong>{o.buyerName}</strong>
                                    <p style={{margin:'5px 0', fontSize: '14px', color: '#666'}}>📍 {o.address} | 📞 {o.phone}</p>
                                    <div style={{marginTop:'5px'}}>
                                        {o.items.map((item, idx) => (
                                            <span key={idx} style={{background:'#eee', padding:'2px 8px', borderRadius:'4px', marginRight:'5px', fontSize:'11px'}}>
                                                {item.productName} x{item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <p style={{fontWeight:'bold'}}>Total: ₹{o.totalAmount}</p>
                                    <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                                        <button style={{...s.btnPrimary, background:'#555'}} onClick={() => handlePrint(o)}>📄 Print Bill</button>
                                        {o.status !== 'Delivered' ? (
                                            <button style={{...s.btnPrimary, background:'#2e7d32'}} onClick={() => handleStatusUpdate(o._id)}>Deliver</button>
                                        ) : <span style={{color:'green', fontWeight:'bold', padding:'8px'}}>✓ Sent</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default FarmerDashboard;