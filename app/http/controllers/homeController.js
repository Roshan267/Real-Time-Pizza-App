const Menu = require('../../models/menu')

function homeController(){
 
    return {
      async index(req,res){
      
      //   const pizzas= await Menu.find()
      //  return  res.render('index', {pizzas:pizzas})
        Menu.find().then((pizzas)=>{
         console.log
          return  res.render('index', {pizzas:pizzas})
        })
    


   
      }
    }  

}

module.exports = homeController;