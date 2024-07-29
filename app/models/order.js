const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: Object,
        required: true,
        validate: {
            validator: function(v) {
                return Object.keys(v).length > 0;
            },
            message: 'Order must contain at least one item.'
        }
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /\d{10}/.test(v);
            },
            message: 'Phone number must be 10 digits.'
        }
    },
    address: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        enum: ['COD', 'Credit Card', 'Debit Card', 'Net Banking', 'UPI'],
        default: 'COD'
    },
    status: {
        type: String,
        enum: ['order_placed', 'confirmed', 'prepared', 'delivered', 'completed', 'cancelled'],
        default: 'order_placed'
    }
}, { timestamps: true });

orderSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
