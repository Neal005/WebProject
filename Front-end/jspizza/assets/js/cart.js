import { products } from "./products.js";
import {currentUser} from './submit_form.js'

jQuery( function (){
    if(localStorage.length > 0){
        let vanchuyen = 32000;
        let total = 0;
        for(let i = 0 ; i < localStorage.length ; i++){
          try{
            let key = localStorage.key(i);
            let number = localStorage.getItem(key);
            let pizza = products[key]["name"];
            let description = products[key]["description"];
            let price = products[key]["price"];
            let image = products[key]["path_image"];
            total = total + price * number;
            let tr = "<tr class=\"product\" id=\"" + key +"\">" + 
            "<th scope=\"row\">" + "<img src=\"" + image +"\" style=\"width: 104px; border-radius: 5px;\" alt=\"\">" + "</th>" + 
            "<td style=\"font-weight: 600;\">" + pizza + "</td>" +
            "<td style=\"font-weight: 600;\">" + description + "</td>" + 
            "<td style=\"font-weight: 600;\">" + price + "&#8363;" + "</td>" +
            "<td style=\"font-weight: 600;\">" + "x" + "</td>" +
            "<td style=\"font-weight: 600;\">" + number + "</td>" +
            "<td style=\"font-weight: 600;\">" + "<button class=\"remove\" style=\"border: none;\">" + "<i class=\"fas fa-thin fa-circle-xmark\"></i>"+ "</button>" + "</td>" +
            "</tr>";
            $("#tbody").append(tr);
          }
          catch{
            continue;
          }
        }
        if(total != 0){
        let thanhtoan = total + 32000;
        let div = "<div class=\"row justify-content-end no-gutters px-3 pb-4\" id=\"cash-form\">" +
        "<div class=\"col-12 col-lg-6 offset-lg-2\">" +
          "<div class=\"mb-2\">"+
            "<div class=\"row\">" + 
              "<div class=\"col-8\"><p style=\"font-weight:600;\">Tổng Thanh Toán</p></div>" +
              "<div class=\"col-4\" style=\"font-weight:600; text-align: right ;\">" + total + "&#8363;" + "</div>" + 
            "</div>" +
            "<div class=\"row\">" +
              "<div class=\"col-8\" style=\"font-weight:600;\">Phí vận chuyển</div>" +
              "<div class=\"col-4\" style=\"font-weight:600; text-align: right ;\">" + vanchuyen + "&#8363;" + "</div>" + 
            "</div>" +
            "<div class=\"row\">" +
              "<div class=\"col-8\" style=\"font-weight:600;\">Tổng chi phí</div>" +
              "<div class=\"col-4\" style=\"font-weight:600; text-align: right ;\">" + thanhtoan + "&#8363;" + "</div>" + 
            "</div>" +
            "<div class=\"d-flex justify-content-lg-end mt-1 mt-lg-0 \" id=\"thanhtoan\">" + 
                "<button class=\"btn btn-danger btn-coke align-middle w-100 \">"+ "Thanh Toán" +"</button>" + 
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";
        $("#cashier").append(div);
        }
        else{
          let div1 = "<div style=\"margin-left: 150px; margin-right: 150px;\">" +
          "<div>" +
            "<h1 style=\"text-align: center;\">Giỏ hàng trống</h1>" +
          "</div>" + 
          "<img src=\"./assets/images/sanpham/emptybag.jpg\">" + 
          "<div>" + 
            "<h6 style=\"text-align: center;\">Hiện tại bạn chưa có sản phẩm nào trong giỏ hàng. </h6>" +
          "</div>" +
        "</div>";
        $("#cashier").append(div1);
        }
        
        // for(let i = 0; i < localStorage.length ; i ++){
        //     let Element = document.querySelectorAll(".remove")[i];
        //     Element.onclick = () => {
        //       let key = localStorage.key(i);
        //         console.log(key);
        //         localStorage.removeItem(key);
        //       console.log(Element.parentElement.parentElement);
        //         Element.parentElement.parentElement.remove();
                
                
        //     };
        // }
        const list = Array.from(document.querySelectorAll(".product"));
        list.forEach((Element) => {
          let removeBtn = Element.querySelector('.remove');
          removeBtn.onclick = () => {
            let id = Element.getAttribute("id");
            localStorage.removeItem(id);
            Element.remove();
            console.log(Element);
            location.reload();
          }
        });
        let tt = document.querySelector("#thanhtoan");
        console.log(tt.querySelector(".btn"));
        tt.querySelector('.btn').onclick = () => {
          console.log(currentUser);
          if((typeof currentUser === 'undefined') || currentUser == null)
            alert("Bạn cần phải đăng nhập để thanh toán");
          else if(total == 0){
              vanchuyen = 0;
             alert("Bạn phải chọn đơn hàng để có thể thanh toán");
             
          }
          else{
            alert("Đặt hàng thành công\nCảm ơn bạn đã đặt hàng <3");
            list.forEach((Element) => {
              let id = Element.getAttribute("id");
              localStorage.removeItem(id);
              Element.remove();
              
              
            });
            
          }
          document.querySelector("#cash-form").remove();
        }
    }
    
    
});
