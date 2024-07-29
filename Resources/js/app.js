import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin';
import moment from 'moment';

const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartCounter = document.querySelector('#cartCounter');

function updateCart(pizza) {
    axios.post('/update-cart', pizza)
        .then(res => {
            console.log(res);
            cartCounter.innerText = res.data.totalQty;

            new Noty({
                type: 'success',
                timeout: 1000,
                text: "Item added to cart",
                progressBar: false,
                layout: 'bottomLeft'
            }).show();
        })
        .catch(err => {
            console.error('Error updating cart:', err);

            new Noty({
                type: 'error',
                timeout: 1000,
                text: "Something went wrong",
                progressBar: false,
                layout: 'bottomLeft'
            }).show();
        });
}

addToCartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
        console.log(pizza);
    });
});

// Remove alert messages after 2 seconds
const alertMsg = document.querySelector('#success-alert');

if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove();
    }, 2000);
}

// Change order status
const statuses = document.querySelectorAll('.status_line');
const hiddenInput = document.querySelector('#hiddenInput');
const order = hiddenInput ? JSON.parse(hiddenInput.value) : null;
const time = document.createElement('small');

function updateStatus(order) {
    statuses.forEach(status => {
        status.classList.remove('step-completed', 'current');
    });

    let stepCompleted = true;
    statuses.forEach(status => {
        const dataProp = status.dataset.status;

        if (stepCompleted) {
            status.classList.add('step-completed');
        }

        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);

            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
        }
    });
}

if (order) {
    updateStatus(order);
}

// Socket setup
const socket = io();

// Join order room
if (order) {
    socket.emit('join', `order_${order._id}`);
}

// Join admin room if in admin area
const adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}

// Listen for order updates
socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);

    new Noty({
        type: 'success',
        timeout: 1000,
        text: "Order Updated",
        progressBar: false,
        layout: 'bottomLeft'
    }).show();
});
