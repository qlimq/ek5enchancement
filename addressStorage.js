function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.postMessage(msg, "*");
}

if(location.href.indexOf("addressstorageng.cdek.ru") != -1){
    let lastOrder = -1;

    window.addEventListener('message', e => {
        if (e.data.type == "action") {
            if (e.data.data == "focus") {
                console.log('focusing');
                document.querySelector('cdek-input[formcontrolname="barcode"] input').focus();
            }
        }
        if (e.data.type == "complexReader") {
            const cdekInput = document.querySelector('cdek-input[formcontrolname="barcode"] input');
            cdekInput.value = e.data.data;
            cdekInput.dispatchEvent(new Event("input"));
            const addressAdd = document.querySelector('form button');
            addressAdd.click();
        }
    });
    

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
        /*
        let continousString = '';
        document.addEventListener('keypress', e => {
            console.log(continousString)
            if (continousString == "!!cplxp" || continousString == "!!сздчз") {
                send_message("goto", "Комплексный приход")
            }
            continousString += e.key;
            if (e.key == "Enter") {
                continousString = '';
            }
        })
        */
    }, 5000)

    
}