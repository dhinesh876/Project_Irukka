
const shophtmllist = document.getElementById("shoplist_grid");

// Config to backend

const CONFIG = {
    BASE_URL : "https://chef-legume-corsage.ngrok-free.dev/api",
    ENDPOINTS : {
        shoplist : () => `${CONFIG.BASE_URL}/getdata`,
        adminapprove : () => `${CONFIG.BASE_URL}/adminaprove`,
        deletecomment : () => `${CONFIG.BASE_URL}/deletecomment`,
        shopclose : () => `${CONFIG.BASE_URL}/shopclose`,
    }
}

// load shop from backend

async function fetchShops() {
      shophtmllist.innerHTML = `<p class="state_msg">Loading shops...</p>`;
      try{
        const res = await fetch(CONFIG.ENDPOINTS.shoplist());

        if(!res.ok) throw new error ('Server Not Responded');

        const data = await res.json();

        console.log("Raw response from /getdata:", data); // check your browser console to see the real shape

        const shops = extractShopsArray(data);
        rendershop(shops);
      }
      catch(err)
      {
        console.log(err);
        shophtmllist.innerHTML = `<p class="state_msg state_error">Couldn't load shops. Is the backend running at ${CONFIG.BASE_URL}?</p>`;
      }
}
 
// Handles common API response shapes: a plain array, or an array
// nested under a wrapper key like { data: [...] } or { shops: [...] }
function extractShopsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.shops)) return data.shops;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.results)) return data.results;
 
  console.warn("Unrecognized response shape, defaulting to empty list:", data);
  return [];
}

//render shop to ui
function rendershop(shops)
{
    if(!shops || shops.length === 0)
    {
       shophtmllist.innerHTML = `<p class="state_msg state_error">No Shop yet</p>`;
    }

     shophtmllist.innerHTML = "";
     shophtmllist.innerHTML += shops.map(shopcardhtml).join("");
}

//asssign data into html
function shopcardhtml(shop){
    const reviews = shop.reviews && shop.reviews.length ? shop.reviews.map((r) => 
    reviewItemhtml(shop.ownerId, r)).join("") : `<p class="state_msg state_error">No Review yet</p>`;

    const htmlshopdata = `
               <div class="shop_container" data-shopid="${shop.ownerId}">

                    <div class="shop_img_container">
                      <img src= ${shop.image} || "./images/shop_list/Sathya_hotal.jpg" class="shop_imge">    
                    </div>

                    <div class="shop_name">
                        <div>SHOP NAME - ${shop.shopname}</div>
                        <div>SHOP OWNER NAME - ${shop.ownername}</div>
                        <div>PHONE - ${shop.phone}</div>
                        <div>TIMING - ${shop.hours}</div>
                        <div>CATEGORY - ${shop.category}</div>
                        <div>LOCATION - ${shop.location}</div>
                        <div>SHOP STATUS - ${shop.isOpen}</div>
                        <div>APPROVE STATUS - ${shop.admin}</div>
                    </div>

                    <div class="review_header">Reviews</div>
                    <div class="Review_name">
                    ${reviews}
                    </div>

   <div class="btn_list">
        <button class="is_close" data-action="close">Close Shop</button>
        <button class="is_approve" data-action="approve">Approve Now</button>
        <button class="is_reject" data-action="reject">Reject Now</button>
      </div>
                    </div>
    `;

    return htmlshopdata;
}


//assign review html page
function reviewItemhtml(shopId, review)
{
    return `
        <div class="review_item" data-review-id="${review.userId}">
                            <div>${review.author}</div>
                            <div${"★".repeat(review.stars || 0)}div>
                            <div>${review.comment}</div>
                            <button data-action="delete-review">Delete review</button>
                        </div>
    `;
}


//send Response to backend 
shophtmllist.addEventListener("click", async(e) => {
 
    const button = e.target.closest("button[data-action]");

    if(!button) return;

    console.log(button);

    const shopcard = button.closest(".shop_container");
    const shopId = shopcard.dataset.shopid;
    const action = button.dataset.action;

    console.log(shopId," ",action);

    try {
        
        if(action === "close")
        {
            await updateshopdata(CONFIG.ENDPOINTS.shopclose(), {
  "shop_id" : shopId,
  "isOpen" : false   
}, "PUT");
        }
        else if(action === "approve")
        {
            await updateshopdata(CONFIG.ENDPOINTS.adminapprove(), {
  "Doc_id" : shopId,
  "admin" : true   
}, "PUT");

        }
        else if(action === "reject")
        {
           await updateshopdata(CONFIG.ENDPOINTS.adminapprove(), {
  "Doc_id" : shopId,
  "admin" : false   
}, "PUT");

        }
        else if (action === "delete-review")
        {
            const reviewitem = button.closest(".review_item");
            const reviewId = reviewitem.dataset.reviewId;
            await updateshopdata(CONFIG.ENDPOINTS.deletecomment(), {
  "shop_id" : shopId,
  "review_id" : reviewId   
}, "DELETE");

            reviewitem.remove(); // update UI immediately, no full refetch needed
        }
    else{
        throw new Error("API MISSING");
    }

        fetchShops();
    } 
    catch (err) {
    console.error(`Action "${action}" failed:`, err);
    alert(`Something went wrong while trying to ${action.replace("-", " ")}. Please try again.`);  
  }

});


async function updateshopdata(shopendpoint,body, method) {

    console.log("sdsd", method, " ", body);

    const res = await fetch(shopendpoint, {
    
        method,
        headers: {"Content-Type" : "application/json"},
        body : JSON.stringify(body),
    });

    if(!res.ok) throw new Error(`Server Responded ${res.status}`);
    return res.json();
}



// ----------get things off ----------
fetchShops();
