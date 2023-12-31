function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.postMessage(msg, "*");
}

let lastOrder = -1;

if(location.href.indexOf("addressstorageng.cdek.ru") != -1){
    setTimeout(() => {
        send_message("debug","loaded!")
        const targetNode = document.querySelector("div[ref='eCenterContainer']");
        const config = { attributes: false, childList: true, subtree: false };

        function callback() {
            const desiredNode = document.querySelector(".ag-cell[col-id='waybillNumber']");
            const desiredNodePlace = document.querySelector(".ag-cell[col-id='cargoPlaceShelf']")
            if (desiredNode){
                let message = desiredNode.innerHTML.slice(-4).split("").join(" ");
                if (desiredNodePlace.innerText != '') {
                    const place = desiredNodePlace.innerText.match(/\(([^)]+)\)/)[1].replace("-"," ");
                    message += ` ${place}`;
                    if (lastOrder == desiredNode.innerText && lastPlace != desiredNodePlace.innerText) {
                        message = place;
                        lastOrder = -1;
                    }
                }
                if (desiredNode.parentElement.style.background == 0){
                    message = `не принят ${message}`
                }
                send_message("readOut", message);
                lastOrder = desiredNode.innerText;
                lastPlace = desiredNodePlace.innerText;
            }
        };
        const observer = new MutationObserver(callback);
        
        observer.observe(targetNode, config);
    }, 5000)

    
}