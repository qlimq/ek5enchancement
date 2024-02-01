function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.parent.postMessage(msg, "*");
}

function getPwt(){
    return sessionStorage.getItem("pwt")
}

function main() {
    send_message("debug","loaded!");
    
    function search(order, number) {
        document.querySelector('#onClearButton > button').click()
        const numberSearchInput = document.querySelector('#clientPhoneTailFilter > label > .wrapper > input');
        const orderSearchInput = document.querySelector('#orderNumberFilter input');
        if (number) {
            numberSearchInput.value = number;
            numberSearchInput.dispatchEvent(new Event("input"));
            document.querySelector('#onSearchByFilterButton > button').click();
        }
        if (order) {
            orderSearchInput.click();
            orderSearchInput.dispatchEvent(new Event("input"));
            orderSearchInput.value = order;
            orderSearchInput.dispatchEvent(new KeyboardEvent("keydown", {
                key: 'Enter',
                bubbles: true
            }));
            orderSearchInput.dispatchEvent(new KeyboardEvent("keyup", {
                key: 'Enter',
                bubbles: true
            }));
            // orderSearchInput.dispatchEvent(enter);
        }
    }

    // action panel additions
    const actionPanel = document.querySelector(".panel-action > .panel-button-block");
    const fastInvoiceBtn = document.createElement('button');
    const fastBarcodeBtn = document.createElement('button');

    function fastPrint(type, num = "null") {
        let toPrint = Array.prototype.slice.call(document.querySelectorAll("div[ref='eLeftContainer'] > div[aria-selected='true'], div[ref='eLeftContainer'] > .custom-selected-row"));
        if (!toPrint) {
            toPrint = num;
        }
        if (toPrint != 0) {
            function printRequestTemplate(body) {
                fetch("https://orderec5ng.cdek.ru/api/preback", {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "application/json",
                        "pwt": `${getPwt()}`,
                        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin"
                    },
                    "referrer": "https://orderec5ng.cdek.ru/",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": `${body}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                    })
                    .then(response => response.blob()
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const newWindow = window.open(url);
                                newWindow.print();
                        }));
            }

            if (type == "invoice") {
                const toPrintMap = toPrint.map(item => item.querySelector('a').innerText);
                const toPrintFormatted = JSON.stringify(toPrintMap).slice(1,-1).replaceAll('"', '\"');
                body = `{\"apiName\":\"orderPrint\",\"apiPath\":\"/web/print/form/order\",\"download\":true,\"orderNumbers\":[${toPrintFormatted}],\"template\":\"tpl_russia\",\"copiesCount\":1,\"lang\":\"rus\",\"method\":\"POST\"}`;
                printRequestTemplate(body);
            }
            if (type == "barcode") {
                const barcodeFormat = '"A6"' // todo https://stackoverflow.com/questions/5364062/how-can-i-save-information-locally-in-my-chrome-extension
                const toPrintMap = toPrint.map(item => {return {"orderNumber": item.querySelector('a').innerText}})
                const toPrintFormatted = JSON.stringify(toPrintMap).replaceAll('"', '\"');
                body = `{\"apiName\":\"orderPrint\",\"apiPath\":\"/web/print/form/barcode\",\"download\":true,\"orderData\": ${toPrintFormatted},\"format\":${barcodeFormat},\"lang\":\"rus\",\"method\":\"POST\"}`;
                printRequestTemplate(body);
            }
        }  
    }

    fastInvoiceBtn.classList.add('ek5CustomButton')
    fastInvoiceBtn.textContent = "накл"
    actionPanel.insertBefore(fastInvoiceBtn, document.querySelector("#bulkOperationsButton"));
    fastInvoiceBtn.addEventListener("click", () => { 
        fastPrint("invoice")
    })

    fastBarcodeBtn.classList.add('ek5CustomButton')
    fastBarcodeBtn.textContent = "шк"
    actionPanel.insertBefore(fastBarcodeBtn, fastInvoiceBtn);
    fastBarcodeBtn.addEventListener("click", () => { 
        fastPrint("barcode")
    })

    // search by number
    const targetNode = document.querySelector('.content');
    const config = { attributes: false, childList: true, subtree: false };

    function receiverNumberSearch() {
        let num = document.querySelectorAll('.details > .details__wrapper > .details-card-receiver .details-card__grid .value-wrapper > span')[3].innerText.split(" ").pop();
        if (num.length != 10) {
            num = num.slice(1);
        }
        search(null, num)
    }
    function orderDetailsEnhancement() {
        const receiverNumber = document.querySelectorAll('.details > .details__wrapper > .details-card-receiver .details-card__grid .value-wrapper')[3];
        if(receiverNumber){
            const receiverNumberSearchBtn = document.createElement("button")
            receiverNumberSearchBtn.textContent = "🔎"
            receiverNumberSearchBtn.addEventListener('click', receiverNumberSearch)
            receiverNumber.appendChild(receiverNumberSearchBtn)
        }
    }
    const observer = new MutationObserver(orderDetailsEnhancement);
    observer.observe(targetNode, config);

    const overlayWrapper = document.querySelector('div[ref="overlayWrapper"]');
    const configS = { attributes: false, childList: true, subtree: true};

    let hackCounter = 0;
    let placeColumnWidth = 0;

    function onWrapperFlash() {
        // todo: row-id check
        const openStuff = {};
        placeColumnWidth = 0;
        hackCounter++
        if (hackCounter > 1) {
            hackCounter = 0;
            // too much indenting todo: refactor
            function fetchPlace() {
                setTimeout(() => {
                    const agLeftContainer = document.querySelector('.ag-pinned-left-cols-container');
                    
    const configS = { attributes: false, childList: true, subtree: true};
                    const orders = agLeftContainer.querySelectorAll('div[col-id="orderNumber"]');
                    if (orders) {
                        const orderStatuses = Array.from(document.querySelectorAll('.ag-center-cols-container div[col-id="orderStatus"]'));
                        const readyOrdersIndices = orderStatuses.filter(w => {if (w.innerText.indexOf("Принято в оф.-п") != -1) return true}).map(g => orderStatuses.indexOf(g));
                        const readyOrders = readyOrdersIndices.map(i => orders[i]);

                        const interval = 250; // on the safer side
                        const renderPlaces = new Promise((resolve) => {
                            readyOrders.forEach( (item, index, array) => {
                                const i = item.querySelector('a').innerText;
                                setTimeout(() => {
                                    fetch("https://gateway.cdek.ru/order/web/order/detail/main/places", {
                                "headers": {
                                    "accept": "application/json, text/plain, */*",
                                    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                                    "content-type": "application/json",
                                    "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
                                    "sec-ch-ua-mobile": "?0",
                                    "sec-ch-ua-platform": "\"Windows\"",
                                    "sec-fetch-dest": "empty",
                                    "sec-fetch-mode": "cors",
                                    "sec-fetch-site": "same-site",
                                    "x-auth-token": getPwt(),
                                    "x-user-lang": "rus",
                                    "x-user-locale": "ru_RU"
                                },
                                "referrer": "https://orderec5ng.cdek.ru/",
                                "referrerPolicy": "strict-origin-when-cross-origin",
                                "body": `{\"orderNumber\":\"${i}\"}`,
                                "method": "POST",
                                "mode": "cors",
                                "credentials": "omit"
                                })
                                    .then( response => response.json())
                                    .then( data => {
                                        const f = data.places[0].shelf;
                                        openStuff[item.parentElement.getAttribute('row-id')] = {"cdekid": false, "place": f}
                                        const place = f.substr(f.indexOf(" ") + 1).slice(1,-1);
                                        const element = document.createElement('span');
                                        element.innerText = place;
                                        element.classList.add('orderPlace');
                                        item.appendChild(element);
                                        if (element.offsetWidth > placeColumnWidth) {
                                            placeColumnWidth = element.offsetWidth;
                                        }
                                        
                                    })
                                }, index * interval);
                                setTimeout(() => resolve(), array.length * interval)
                            })
                        })
                        renderPlaces.then(() => {
                            send_message('debug', "done")
                            document.querySelectorAll('.orderPlace').forEach(el => el.style.width = `${placeColumnWidth}px`);
                        })
                        send_message('debug','done')
                    } else {
                        fetchPlace();
                    }
                }, 200)
            }
            fetchPlace()
        }
    }
    

    const overlayWrapperObserver = new MutationObserver(onWrapperFlash);
    overlayWrapperObserver.observe(overlayWrapper, configS);

    // todo убрать спагетти
    // search history frontend
    let searchHistoryStorage = []; 
    const localStorageHistory = localStorage.getItem('searchHistory');
    if (localStorageHistory != null) {
        searchHistoryStorage = JSON.parse(localStorageHistory);
    }

    if (!searchHistoryStorage) {
        localStorage.setItem("searchHistory", searchHistoryStorage)
    }
    

    const searchPanel = document.querySelector(".panel-button-block");
    const searchHistoryBtn = document.createElement('button');
    const searchHistoryModal = document.createElement('div');

    searchHistoryModal.classList.add('customModal');
    searchHistoryModal.innerHTML = `
    <dialog open>

        <div class="modalHeader">
            <h3>История открытых заказов</h3>
            <button id="clearHistory" class="cdekDialogButton">Очистить</button>
            <button id="closeDialog" class="cdekDialogButton">x</button>
        </div>
        <div id="searchthing">
        </div>
        <button id="checkAll" class="cdekDialogButton">Проверить все</button>
    </dialog>
    `
    
    function searchHistory() {
        searchHistoryStorage = localStorage.getItem('searchHistory') ? JSON.parse(localStorage.getItem('searchHistory')) : []; 
        const searchHistoryToShow = searchHistoryModal.querySelector('#searchthing');
        searchHistoryToShow.innerHTML = "";
        function createRow(data) {
            const row =  document.createElement('div');
            const rowInfo =  document.createElement('span');
            const rowDate =  document.createElement('span');
            const rowButton =  document.createElement('button');
            rowInfo.classList.add('searchHistoryInfo');
            rowDate.classList.add('searchHistoryDate');

            const date = new Date(data.date);
            rowButton.innerHTML = "<span>🔎</span>"

            rowInfo.innerHTML = "<span class='searchHistoryBold'>Заказ</span>: " + `<span>${data.orderNumber}</span>`;
            rowDate.innerText = `${date.toTimeString().split(" ")[0]} ${date.toLocaleDateString('ru-RU')}`

            rowButton.addEventListener('click', e => {
                searchHistoryModal.remove();
                search(data.orderNumber, data.clientNumber)
            })
            row.append(rowInfo, rowDate,rowButton);
            return row;
        }
        searchHistoryStorage.forEach(a => searchHistoryToShow.append(createRow(a)))
        const cdekModal = document.querySelector('app-root > cdek-modal');
        
        cdekModal.appendChild(searchHistoryModal);
    }
    searchHistoryModal.querySelector('#closeDialog').addEventListener('click', () => {
        searchHistoryModal.remove();
    })
    searchHistoryModal.querySelector('#clearHistory').addEventListener('click', () => {
        localStorage.removeItem('searchHistory');
        searchHistoryStorage = [];
        searchHistoryModal.querySelector('#searchthing').innerHTML = "";
    })
    
    function checkAllOrders() {
        const orders = String(searchHistoryStorage.map(i => i.orderNumber))
        search(orders);
    }
    searchHistoryModal.querySelector('#checkAll').addEventListener('click', () => {
        checkAllOrders();
        searchHistoryModal.remove();
    })

    searchHistoryBtn.classList.add('ek5CustomButton');
    searchHistoryBtn.innerText = "🕑"
    searchPanel.appendChild(searchHistoryBtn)
    searchHistoryBtn.addEventListener('click', searchHistory);

    // app-delivery-details 
    const wrapperElement = document.querySelector('.wrapper-form');
    
    function ddEnhancement() {
        // fast print
        const ddElement = document.querySelector('app-delivery-details');
        if (ddElement) {
            const orderNum = document.querySelector('.top__header').innerText.split(" ")[1].substr(1);
            
            const printPanel = document.querySelector('.print-button');
            // too repetetive?
            const DDfastInvoiceBtn = document.createElement('button');
            const DDfastBarcodeBtn = document.createElement('button');

            DDfastInvoiceBtn.classList.add('ek5CustomButton')
            DDfastInvoiceBtn.textContent = "накл"
            printPanel.appendChild(DDfastInvoiceBtn);
            DDfastInvoiceBtn.addEventListener("click", () => { 
                fastPrint("invoice", orderNum)
            })
        
            DDfastBarcodeBtn.classList.add('ek5CustomButton')
            DDfastBarcodeBtn.textContent = "шк"
            printPanel.insertBefore(DDfastBarcodeBtn, DDfastInvoiceBtn);
            DDfastBarcodeBtn.addEventListener("click", () => { 
                fastPrint("barcode", orderNum)
            })

            // add to search history
            const newObj = {"orderNumber": orderNum, "date": Date.now()};
            if (searchHistoryStorage.length > 0) {
                if (searchHistoryStorage[0].orderNumber != newObj.orderNumber){   
                    searchHistoryStorage.unshift(newObj)
                }
            } else {
                searchHistoryStorage.push(newObj)
            }
            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryStorage))
        }

        //
    }
    const wrapperObserver = new MutationObserver(ddEnhancement);
    wrapperObserver.observe(wrapperElement, config);
}


if(location.href.indexOf("orderec5ng.cdek.ru") != -1 && location.href.indexOf('gate') == -1){
    setTimeout(main, 6000);
}