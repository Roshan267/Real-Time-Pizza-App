const Order = require('../../../models/order');
const moment = require('moment');

function orderController() {
    return {
        store(req, res) {
            const { phone, address } = req.body;

            if (!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            });

            order.save()
                .then(result => {
                    return Order.populate(result, { path: 'customerId' });
                })
                .then(placedOrder => {
                    req.flash('success', 'Order placed successfully');
                    delete req.session.cart;

                    // Emit event
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderUpdated', placedOrder);
                    
                    return res.redirect('/customer/orders');
                })
                .catch(err => {
                    console.error(err);
                    req.flash('error', 'Something went wrong');
                    return res.redirect('/cart');
                });
        },

        async index(req, res) {
            try {
                const orders = await Order.find({ customerId: req.user._id }).sort({ 'createdAt': -1 });
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0');
                res.render('customer/orders', { orders, moment });
            } catch (err) {
                console.error(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            }
        },

        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id);
                // Authorize user
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customer/singleOrder', { order });
                }
                req.flash('error', 'You are not authorized to view this order');
                return res.redirect('/');
            } catch (err) {
                console.error(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/customer/orders');
            }
        }
    };
}

module.exports = orderController;
