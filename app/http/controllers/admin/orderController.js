const Order = require('../../../models/order');

function orderController() {
    return {
        async index(req, res) {
            try {
                // Fetch orders that are not completed, sort by creation date, and populate customerId excluding password
                const orders = await Order.find({ status: { $ne: 'completed' } })
                    .sort({ 'createdAt': -1 })
                    .populate('customerId', '-password');

                // Check if orders were found
                if (!orders || orders.length === 0) {
                    console.warn('No orders found or orders array is empty.');
                }

                // If the request is an AJAX request, respond with JSON
                if (req.xhr) {
                    return res.json(orders);
                } else {
                    // Otherwise, render the orders page
                    return res.render('admin/orders', { orders });
                }
            } catch (err) {
                console.error('Error fetching orders:', err.message, err.stack);
                // Respond with a server error message
                req.flash('error', 'Error fetching orders. Please try again later.');
                return res.status(500).send('Server Error');
            }
        }
    };
}

module.exports = orderController;
