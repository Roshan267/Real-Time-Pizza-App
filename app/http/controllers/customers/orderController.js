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
                    req.flash('success', 'Order placed successfully');
                    delete req.session.cart;
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
                const orders = await Order.find({ customerId: req.user._id })
                    .sort({ 'createdAt': -1 });

                res.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0');
                res.render('customer/orders', { orders, moment });
            } catch (err) {
                console.error(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            }
        }
    }
}

module.exports = orderController;
