import {products} from './products.js'
import {currentUser} from './submit_form.js'


function show(code){
    let name = products[code]["name"];
    let img = products[code]["path_image"];
    let add = document.querySelector('.image-here');
    let price = products[code]["price"];
    let descript = products[code]["description"];
    
    let count = 0;
    document.getElementById('qual').innerHTML = count;
    document.getElementById('decreaseBtn').onclick = function (){
        if(count > 0)
            count -= 1;
        document.getElementById('qual').innerHTML = count;
    }
    document.getElementById('increaseBtn').onclick = function (){
        count += 1;
        document.getElementById('qual').innerHTML = count;
    }
    price = price + "&#8363;";
    document.querySelector('#exampleModalLabel').innerText = name;
    document.querySelector("#description").innerText = descript;
    add.setAttribute("src", img);

    document.querySelector("#total").onclick = () => {
       
        if(count == 0){
            alert("vui long nhap so luong");
        }
        // else if(currentUser['products'] == 'undefined'){
        //     currentUser['products'] = [];
        //     currentUser['products'].push({
        //         'code' : code,
        //         'quantity' : count
        //     })
            
        // }
        else{
            if(typeof localStorage[code] === "undefined"){
                window.localStorage.setItem(code, count);
            }
            else{
                let numberof = (document.getElementById('qual'));
                let current = parseInt(window.localStorage.getItem(code));
                window.localStorage.setItem(code, numberof + current);
                
             }
        }
    };
}

const cards = Array.from(document.querySelectorAll('.card'));
cards.forEach((card, index) => {
    const orderLink = card.querySelector('.order-link');
    const orderBtn = card.querySelector('.order-btn');
    orderLink.onclick = () => {
        show(card.id)
    }
    orderBtn.onclick = () => {
        show(card.id)
    }
})
