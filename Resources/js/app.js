import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin';

const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartCounter = document.querySelector('#cartCounter');

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then(res => {
        console.log(res);
        cartCounter.innerText = res.data.totalQty;

        new Noty({
            type: 'success',
            timeout: 1000,
            text: "Item added to cart",
            progressBar: false,
            layout: 'bottomLeft'
        }).show();

    }).catch(err => {
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

initAdmin();
