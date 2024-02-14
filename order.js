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

function createButton(parent, textContent, action, styleClass = null, where = null){
    const btn = document.createElement('button');
    btn.classList.add(styleClass);
    btn.textContent = textContent;
    btn.addEventListener("click", action);
    if (where) {
        parent.insertBefore(btn, where);
    } else {
        parent.appendChild(btn)
    }
    return btn;
}

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
        const enter = {
            key: 'Enter',
            bubbles: true
        }
        orderSearchInput.dispatchEvent(new KeyboardEvent("keydown", enter));
        orderSearchInput.dispatchEvent(new KeyboardEvent("keyup", enter));
        orderSearchInput.value = '';
    }
}

async function defaultFetch(url, body){
    return await fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
            "x-auth-token": getPwt()
        },
        referrer: location.href,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(body)
        })
}

async function fastPrint(type, num = null) {
    let toPrint = Array.prototype.slice.call(document.querySelectorAll("div[ref='eLeftContainer'] > div[aria-selected='true'], div[ref='eLeftContainer'] > .custom-selected-row"));
    if (num) {
        toPrint = num;
    }
    if (toPrint != 0) { 
        let body = {};
        if (type == "invoice") {
            const toPrintMap = toPrint.map(item => item.querySelector('a').innerText);
            url = "https://gateway.cdek.ru/api-order-print/web/print/form/order";
            body = {"orderNumbers": toPrintMap, "template": "tpl_russia", "copiesCount": 1};
        }
        if (type == "barcode") {
            let barcodeFormat = chrome.storage.sync.get("barcodeFormat");
            if (!barcodeFormat) {
                barcodeFormat = "A6";
            }
            const toPrintMap = toPrint.map(item => {return {"orderNumber": item.querySelector('a').innerText}});
            url = "https://gateway.cdek.ru/api-order-print/web/print/form/barcode";
            body = {"orderData": toPrintMap, "format": "A6"}
        }

        await defaultFetch(url, body)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const newWindow = window.open(url);
                newWindow.print();
        });
    }
}  

function main() {
    send_message("debug","loaded!");
    // action panel additions
    const actionPanel = document.querySelector(".panel-action > .panel-button-block");

    const fastInvoiceBtn = createButton(
        actionPanel, 
        'накл', 
        () => {fastPrint("invoice")},
        'ek5CustomButton', 
        document.querySelector('#bulkOperationsButton')
        );

    const fastBarcodeBtn = createButton(
        actionPanel, 
        'шк', 
        () => {fastPrint("barcode")},
        'ek5CustomButton', 
        fastInvoiceBtn
        );
    
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
        if (receiverNumber){
            createButton(
                receiverNumber, 
                "🔎",
                receiverNumberSearch)
        }
    }
    const observer = new MutationObserver(orderDetailsEnhancement);
    observer.observe(targetNode, config);

    const overlayWrapper = document.querySelector('div[ref="overlayWrapper"]');
    const configS = { attributes: false, childList: true, subtree: true};

    let hackCounter = 0;
    let placeColumnWidth = 0;

    function fetchPlace() {
        // todo: row-id check
        const savedOrders = {};

        const agLeftContainer = document.querySelector('.ag-pinned-left-cols-container');
        
        const configS = { attributes: false, childList: true, subtree: true};
        const orders = agLeftContainer.querySelectorAll('div[col-id="orderNumber"]');
        const orderStatuses = Array.from(document.querySelectorAll('.ag-center-cols-container div[col-id="orderStatus"]'));
        const readyOrdersIndices = orderStatuses.filter(status => {
            if (status.innerText.indexOf("Принято в оф.-п") != -1 || status.innerText.indexOf("Не вручено") != -1) return true
        }).map(item => orderStatuses.indexOf(item));
        const readyOrders = readyOrdersIndices.map(i => orders[i]);

        const interval = 250; // on the safer side
        const renderPlaces = new Promise((resolve) => {
            readyOrders.forEach( (item, index, array) => {
                const i = item.querySelector('a').innerText;
                setTimeout(() => {
                    const url = "https://gateway.cdek.ru/order/web/order/detail/main/places";
                    const body = {"orderNumber": i };

                    defaultFetch(url, body)
                    .then( response => response.json())
                    .then( data => {
                        const f = data.places[0].shelf;
                        savedOrders[item.parentElement.getAttribute('row-id')] = {"cdekid": false, "place": f}
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
    }

    let attempts = 0;
    function onWrapperFlash() {
        const agLeftContainer = document.querySelector('.ag-pinned-left-cols-container');
        const orders = agLeftContainer.querySelectorAll('div[col-id="orderNumber"]');
        if (orders) {
            attempts = 0;
            setTimeout(() => {
                placeColumnWidth = 0;
                hackCounter++
                if (hackCounter > 1) {
                    hackCounter = 0;
                    fetchPlace()
                }
                const numberSearchInput = document.querySelector('#clientPhoneTailFilter > label > .wrapper > input');
                const totalCount = document.querySelector('#orderNumberFilter .total-count').innerText;
                /*
                if (numberSearchInput.value == 0 & totalCount === "1") {
                    (function instantNumberSearch() {
                        const agLeftContainer = document.querySelector('.ag-pinned-left-cols-container');
                        const orders = agLeftContainer.querySelectorAll('div[col-id="orderNumber"]');
                        const firstNumber = orders[0].querySelector('a').innerText;
                        defaultFetch('https://gateway.cdek.ru/order/web/order/detail/main/common',{"orderNumber": firstNumber})
                            .then(response => response.json())
                            .then(data => {
                                console.log(data)
                                const num = data.receiver.phones[0].number;
                                search(null, num);
                            })
                        console.log(firstNumber)
                    })();
                }*/
            }, 500)
        } else if(attempts < 5) {
            onWrapperFlash();
            attempts++;
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

            const DDfastInvoiceBtn = createButton(
                printPanel, 
                "накл", 
                () => {fastPrint("invoice"), orderNum},
                'ek5CustomButton'
            );
            
            const DDfastBarcodeBtn = createButton(
                printPanel, 
                "шк", 
                () => {fastPrint("barcode"), orderNum},
                'ek5CustomButton',
                DDfastInvoiceBtn
            );

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