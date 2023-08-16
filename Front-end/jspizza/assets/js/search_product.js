import { products } from "./products.js";

const arrProducts = Object.values(products);

function showListHint(value){
    const listProductsHint = document.querySelector('.list-products-hint');
    var length = value.length;
    if(length > 0){
        var l = length;
        var listNameProduct = '';
        var mark = [];
        for(var i = 0; i < arrProducts.length; ++i){
            mark[i] = 0;
        }
        while(l > 0){
            for(let i = 0; i <= length-l; ++i){
                var subValue = value.substring(i, i+l);
                arrProducts.forEach((product, index) => {
                    if(product['name'].toLowerCase().search(subValue.toLowerCase()) != -1 && mark[index] == 0){
                        listNameProduct += `<li class="list-product py-2 px-2">${product['name']}</li>`;
                        mark[index] = 1;
                    }
                })
            }
            listProductsHint.innerHTML = listNameProduct;
            --l;
        }
    }
    else 
        listProductsHint.innerHTML = '';
}

const inputSearch = document.querySelector('.input-search');

function handlerSearch() {
    const listProductsHint = document.querySelector('.list-products-hint');
    var iterList;
    inputSearch.oninput = (e) => {
        showListHint(e.target.value); 
        const list = Array.from(listProductsHint.querySelectorAll('li'));
        list.forEach((item, index) => {
            item.onclick = () => {
                inputSearch.value = item.innerText;
                checkSearch();
            }
        })
        iterList = -1;
    }
    inputSearch.onfocus = (e) => {
        showListHint(e.target.value);
        iterList = -1;
    }
    inputSearch.onkeydown = function(e) {
        const listItems = Array.from(listProductsHint.querySelectorAll('li'));
        if(e.keyCode == 38){
            if(iterList >= 0 && iterList < listItems.length)
                listItems[iterList].classList.remove('product-focus');
            --iterList;
            if(iterList < 0){
                iterList = listItems.length-1;
            }
            listItems[iterList].classList.add('product-focus');
            inputSearch.value = listItems[iterList].innerText;
        }
        if(e.keyCode == 40){
            if(iterList >= 0 && iterList < listItems.length)
                listItems[iterList].classList.remove('product-focus');
            ++iterList;
            if(iterList >= listItems.length){
                iterList = 0;
            }
            listItems[iterList].classList.add('product-focus');
            inputSearch.value = listItems[iterList].innerText;
        }
        if(e.keyCode == 13){
            checkSearch();
        }
    }
    const buttonSearch = document.querySelector('.button-search');
    buttonSearch.onclick = () => {
        checkSearch();
    }
    const bodyElement = document.querySelector('body');
    bodyElement.onclick = () => {
        listProductsHint.innerHTML = '';
    }
    const barSearch = document.querySelector('.bar-but-search');
    barSearch.onclick = (event) => {
        event.stopPropagation();
    }
}

function checkSearch(){
    if(inputSearch.value == '')
        alert('Vui lòng nhập sản phẩm tìm kiếm');
    else {
        window.localStorage.setItem('searchProductName', inputSearch.value);
        window.location.href = 'timkiem.html';
    }
}

handlerSearch();

const inputSearchMobile = document.querySelector('.input-search-mobile');
inputSearchMobile.onkeydown = (e) => {
    if(e.keyCode == 13){
        if(inputSearchMobile.value == '')
            alert('Vui lòng nhập sản phẩm tìm kiếm');
        else {
            window.localStorage.setItem('searchProductName', inputSearchMobile.value);
            inputSearchMobile.value = '';
            window.location.href = 'timkiem.html';
        }
    }
}
