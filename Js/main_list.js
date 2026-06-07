import { shop_list } from "./shop_list.js";

let shophtmllist = document.getElementById("shoplist_grid");

let shopdatalist = '';


shop_list.forEach((shopdata) => {

    shopdatalist += `               
     <div class="shop_container">

                    <div class="shop_img_container">
                        <img src="${shopdata.shopimg}" class="shop_imge">
                    </div>

                    <div class="shop_name">
                        ${shopdata.shopname}
                    </div>

                    <div class="${shopdata.shopupdte === "Close" ? "is_close" : "shop_update"}">
                        ${shopdata.shopupdte}
                    </div>
                </div>`;
});



console.log(shopdatalist);

shophtmllist.innerHTML = shopdatalist;

