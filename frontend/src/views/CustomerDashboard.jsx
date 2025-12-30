import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getStyles } from '../Styles';

const CustomerDashboard = ({ user, products, fetchAll, API, onLogout }) => {
    const [activeTab, setActiveTab] = useState('market');
    const [myOrders, setMyOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All'); 
    const [showAddress, setShowAddress] = useState(false);
    const [shipping, setShipping] = useState({ flat: '', street: '', phone: '', paymentMethod: 'Cash on Delivery' });
    
    const categories = ['All', 'Fresh Veggies', 'Leafy Greens', 'Gourds', 'Beans', 'Fruits', 'Dairy'];
    const s = getStyles();

    useEffect(() => { if (activeTab === 'orders') fetchMyOrders(); }, [activeTab]);
    const fetchMyOrders = async () => { 
        const res = await axios.get(`${API}/buyer-orders/${user.email}`); 
        setMyOrders(res.data); 
    };

    // 🛒 BASKET MANAGEMENT LOGIC
    const basketItems = cart.reduce((acc, item) => {
        const found = acc.find(i => i._id === item._id);
        if (found) found.quantity += 1; else acc.push({ ...item, quantity: 1 });
        return acc;
    }, []);

    const total = cart.reduce((acc, item) => acc + Number(item.price), 0);

    // Function to remove one instance of an item
    const decreaseQty = (productId) => {
        const index = cart.findLastIndex(item => item._id === productId);
        if (index !== -1) {
            const newCart = [...cart];
            newCart.splice(index, 1);
            setCart(newCart);
        }
    };

    const handlePlaceOrder = async () => {
        if (shipping.phone.length !== 10) return alert("Enter 10-digit phone number!");
        const fullAddress = `${shipping.flat}, ${shipping.street}`;
        await axios.post(`${API}/place-order`, { 
            buyerEmail: user.email, buyerName: user.name, address: fullAddress, 
            phone: shipping.phone, items: basketItems, totalAmount: total, 
            paymentMethod: shipping.paymentMethod 
        });
        for (const item of basketItems) { 
            await axios.put(`${API}/products/${item._id}/stock`, { stock: item.stock - item.quantity }); 
        }
        alert("Order Placed Successfully!"); setCart([]); setActiveTab('orders'); fetchAll();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7f4' }}>
            {/* SIDEBAR */}
            <div style={{ width: '260px', background: '#1a2e1a', color: 'white', position: 'fixed', height: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#ffd700' }}>FarmBridge</h2>
                <nav style={{ marginTop: '40px', flex: 1 }}>
                    <div onClick={() => setActiveTab('market')} style={{ padding: '12px', background: activeTab === 'market' ? '#2d4d2d' : 'transparent', cursor: 'pointer', borderRadius: '8px' }}>🛒 Shop Market</div>
                    <div onClick={() => setActiveTab('orders')} style={{ padding: '12px', background: activeTab === 'orders' ? '#2d4d2d' : 'transparent', cursor: 'pointer', borderRadius: '8px', marginTop: '10px' }}>📦 My Orders</div>
                </nav>
                <button onClick={onLogout} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
            </div>

            <div style={{ marginLeft: '260px', display: 'flex', flex: 1, padding: '30px', gap: '30px' }}>
                {activeTab === 'market' ? (
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <input style={{...s.input, maxWidth:'250px', margin: 0}} placeholder="🔍 Search crops..." onChange={e => setSearchTerm(e.target.value.toLowerCase())} />
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '5px 10px', borderRadius: '15px', border: '1px solid #2d4d2d', cursor: 'pointer', fontSize: '11px', background: selectedCategory === cat ? '#2d4d2d' : 'white', color: selectedCategory === cat ? 'white' : '#2d4d2d' }}>{cat}</button>
                                ))}
                            </div>
                        </div>

                        <div style={s.grid}>
                            {products.filter(p => p.productName.toLowerCase().includes(searchTerm)).filter(p => selectedCategory === 'All' || p.category === selectedCategory).map(p => (
                                <div key={p._id} style={{...s.card, opacity: p.stock <= 0 ? 0.6 : 1}}>
                                    <img src={p.image} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} alt="crop" />
                                    <h4 style={{margin: '8px 0 2px'}}>{p.productName}</h4>
                                    <p style={{fontSize: '13px', margin: '0 0 8px'}}>₹{p.price} / {p.saleUnit}</p>
                                    <button disabled={p.stock <= 0} style={{...s.btnPrimary, width: '100%'}} onClick={() => setCart([...cart, p])}>{p.stock <= 0 ? "Sold Out" : "Add to Basket"}</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1 }}>
                        <h2>My Order History</h2>
                        {myOrders.map(o => (
                            <div key={o._id} style={{ ...s.card, marginBottom: '10px' }}>
                                <strong>Order #{o._id.slice(-5)} - {o.status || 'Pending'}</strong>
                                {o.items.map((i, idx) => <div key={idx} style={{fontSize:'13px'}}>• {i.productName} (x{i.quantity})</div>)}
                                <div style={{ textAlign: 'right', fontWeight:'bold' }}>Total: ₹{o.totalAmount}</div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* 🛒 IMPROVED BASKET SUMMARY */}
                {activeTab === 'market' && cart.length > 0 && (
                    <div style={{ width: '320px' }}>
                        <div style={{...s.card, position: 'sticky', top: '30px'}}>
                            <h3 style={{marginTop: 0}}>Your Basket</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '15px' }}>
                                {basketItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                        <div style={{ fontSize: '14px' }}>
                                            <b>{item.productName}</b><br/>
                                            ₹{item.price * item.quantity}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button style={{ background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px' }} onClick={() => decreaseQty(item._id)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button style={{ background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px' }} onClick={() => setCart([...cart, item])}>+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Total: ₹{total}</div>

                            {!showAddress ? <button style={{...s.btnPrimary, width:'100%'}} onClick={() => setShowAddress(true)}>Proceed to Checkout</button> : (
                                <div style={{marginTop:'15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                                    <input style={s.input} placeholder="House/Flat No" onChange={e => setShipping({ ...shipping, flat: e.target.value })} />
                                    <input style={s.input} placeholder="Area/Street" onChange={e => setShipping({ ...shipping, street: e.target.value })} />
                                    <input style={s.input} placeholder="Phone" maxLength="10" onChange={e => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g,'') })} />
                                    <button style={{...s.btnPrimary, width:'100%', marginTop: '10px'}} onClick={handlePlaceOrder}>Confirm Order</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CustomerDashboard;