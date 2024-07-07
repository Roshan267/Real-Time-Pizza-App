import axios from 'axios';
import Noty from 'noty';

let addtoCart =document.querySelectorAll('.add-to-cart')

let cartCounter = document.querySelector('#cartCounter')


function updateCart(pizza){
    axios.post('/update-cart',pizza).then(res=>{
        console.log(res)
        cartCounter.innerText = res.data.totalQty
        
        new Noty({             // noty used  to add notification 
            type:'success',
            timeout:'1000',
            text: "Item added to cart",
            progressBar:false,
            layout:'bottomLeft'

          }).show();
        

    }).catch(err =>{
        new Noty({             // noty used  to add notification 
            type:'error',
            timeout:'1000',
            text: "Something went wrong",
            progressBar:false,
            layout:'bottomLeft'

          }).show();
        
    })
}



addtoCart.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
        
         let pizza= JSON.parse(btn.dataset.pizza)
         updateCart(pizza)
         console.log(pizza)
    })
})