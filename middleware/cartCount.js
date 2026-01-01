// middleware/cartCount.js
const Cart = require('../models/Cart');

const getCartCount = async (req, res, next) => {
    try {
        // Always set cartCount, even for non-logged-in users
        res.locals.cartCount = 0;
        
        // Only get actual count if user is logged in as customer
        if (req.session && req.session.user && req.session.user.role === 'customer') {
            const cartItems = await Cart.getCart(req.session.user.id);
            res.locals.cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        }
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.locals.cartCount = 0;
    }
    next();
};

module.exports = getCartCount;