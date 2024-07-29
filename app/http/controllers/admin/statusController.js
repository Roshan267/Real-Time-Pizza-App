const Order = require('../../../models/order');

function statusController() {
    return {
        async update(req, res) {
            const { orderId, status } = req.body;

            // Validate input
            if (!orderId || !status) {
                req.flash('error', 'Order ID and status are required');
                return res.redirect('/admin/orders');
            }

            try {
                // Update order status
                await Order.updateOne({ _id: orderId }, { status });

                req.flash('success', 'Order status updated successfully');

                // Emit event
                const eventEmitter = req.app.get('eventEmitter');
                if (eventEmitter) {
                    eventEmitter.emit('orderUpdated', { id: orderId, status });
                } else {
                    console.warn('Event emitter not found');
                }

                res.redirect('/admin/orders');
            } catch (err) {
                console.error('Error updating order status:', err);
                req.flash('error', 'Something went wrong. Please try again later.');
                res.redirect('/admin/orders');
            }
        }
    };
}

module.exports = statusController;
