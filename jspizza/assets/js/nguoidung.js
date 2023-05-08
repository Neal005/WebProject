import { hiddenUser, currentUser } from "./submit_form.js";


// show info user
const showInfoUser = () => {
    if(currentUser != null){
        const accountName = document.querySelector('.account-name strong');
        accountName.innerText = currentUser['name'];

        const infoUser = document.querySelector('.info');
        const arrSelector = ['name', 'birthday', 'gender', 'email', 'phone-number'];

        for(var i = 0; i < arrSelector.length; ++i){
            var infoElement = infoUser.querySelector(`.${arrSelector[i]}`);
            if(arrSelector[i] === 'gender'){
                const valueGender = currentUser[`${arrSelector[i]}`];
                switch(valueGender){
                    case 'male':
                        infoElement.innerText = 'Nam';
                        break;
                    case 'female':
                        infoElement.innerText = 'Nữ';
                        break;
                    case 'other':
                        infoElement.innerText = 'Khác';
                        break;
                }
            }
            else
                infoElement.innerText = currentUser[`${arrSelector[i]}`];
        }
    }
}
showInfoUser();

const infoUser = document.querySelector('.info-user');
infoUser.onclick = () => {
    window.location.href = 'nguoidung.html';
}
const cartShopping = document.querySelector('.cart-shopping');
cartShopping.onclick = () => {
    window.location.href = 'cart.html';
}