import { products } from "./products.js";

const arrProducts = Object.values(products);

function setListItem(value){
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
                  var id;
                  if(index < 9)
                    id = `sp00${index+1}`;
                  else 
                    id = `sp0${index+1}`;
                    if(product['name'].toLowerCase().search(subValue.toLowerCase()) != -1 && mark[index] == 0){
                        listNameProduct += `
                        <div class="col-md-6 col-lg-3">
                          <div class="card card-dgrid" id="${id}">
                            <div class="comp-img-resize card-img-top">
                              <a role="button" href="#" class="comp-img-resize-img shimmer order-link" data-bs-toggle="modal"
                                data-bs-target="#exampleModal">
                                <img loading="lazy" src="${product['path_image']}" class="card-img-top" alt="...">
                              </a>
                            </div>
                            <div class="card-body">
                              <h5 class="card-title">${product['name']}</h5>
                              <p class="card-text">${product['description']}</p>
                              <button type="button" class="btn color_btn btn-danger order-btn" data-bs-toggle="modal"
                                data-bs-target="#exampleModal">
                                ${product['price']}
                              </button>
                            </div>
                          </div>
                        </div>`;
                        mark[index] = 1;
                    }
                })
            }
            --l;
        }
    }
    return listNameProduct;
}
const searchProductName = window.localStorage.getItem('searchProductName');
const title = document.querySelector('.title');
title.append(`: '${searchProductName}'`)

const listItem = document.querySelector('.list-item');

listItem.innerHTML = setListItem(searchProductName);
