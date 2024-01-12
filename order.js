function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.postMessage(msg, "*");
}

const customcssToLoad = `.ek5CustomButton { 
    padding: 2px 8px;
    border: 1px solid #97063c;
    color: #97063c;
    border-radius: 4px;
    background:inherit;
    font-size: inherit;
    font-family: inherit;
    font-weight: 500;
    text-transform: uppercase;
}
.ek5CustomButton:hover{
    background: #97063c;
    color: white;
    cursor:pointer;
}
.ek5CustomButton:active{
    background: #4e0520;
    border: 1px solid #4e0520;
}
.ek5CustomButtonGray{
    border: 1px solid #4a4446;
    color: #4a4446;
    cursor: inherit;
}
.customModal{
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.2);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
}
.customModal > dialog{
    margin: auto;
    padding: 20px;
    max-height: 70%;
    overflow-y: scroll;
    
}
#searchthing {
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    margin-top: 10px;
}
#searchthing > div {
    display: flex;
    gap: 4px;   
}
.modalHeader{
    display:flex;
    justify-content: space-between
}
.searchHistoryBold{
    font-weight: 600;
}
.searchHistoryInfo{
    font-size: 1.2rem;
}
.searchHistoryDate{
    opacity: 0.7;
    cursor: default;
}
`;

function getPwt(){
    return sessionStorage.getItem("pwt")
}

if(location.href.indexOf("orderec5ng.cdek.ru") != -1 && location.href.indexOf('gate') == -1){
    setTimeout(() => {
        send_message("debug","loaded!");

        // creating custom css for extension
        const style = document.createElement('style');
        if (style.styleSheet) {
            style.styleSheet.cssText = customcssToLoad;
        } else {
            style.appendChild(document.createTextNode(customcssToLoad));
        }
        document.getElementsByTagName('head')[0].appendChild(style);

        
        function search(order, number) {
            document.querySelector('#onClearButton > button').click()
            const numberSearchInput = document.querySelector('#clientPhoneTailFilter > label > .wrapper > input');
            const orderSearchInput = document.querySelector('#orderNumberFilter input');
            const evt = new Event("input");
            if (number) {
                numberSearchInput.value = number;
                numberSearchInput.dispatchEvent(evt);
            }
            if (order) {
                orderSearchInput.value = order;
                orderSearchInput.dispatchEvent(evt);
            }
            document.querySelector('#onSearchByFilterButton > button').click()
        }

        // action panel additions
        const actionPanel = document.querySelector(".panel-action > .panel-button-block");
        const fastInvoiceBtn = document.createElement('button');
        const fastBarcodeBtn = document.createElement('button');

        // TODO: create one function to remove repetition
        function fastInvoice(){
            const toPrint = Array.prototype.slice.call(document.querySelectorAll("div[ref='eLeftContainer'] > div[aria-selected='true'], div[ref='eLeftContainer'] > .custom-selected-row")).map(item => item.innerText);
            const toPrintFormatted = JSON.stringify(toPrint).slice(1,-1).replaceAll('"', '\"');
            let pwt = getPwt();
            function attemptPrinting() {
                fetch("https://orderec5ng.cdek.ru/api/preback", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                    "content-type": "application/json",
                    "pwt": `${pwt}`,
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin"
                },
                "referrer": "https://orderec5ng.cdek.ru/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `{\"apiName\":\"orderPrint\",\"apiPath\":\"/web/print/form/order\",\"download\":true,\"orderNumbers\":[${toPrintFormatted}],\"template\":\"tpl_russia\",\"copiesCount\":1,\"lang\":\"rus\",\"method\":\"POST\"}`,
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
            if (toPrint != 0) {
                
                attemptPrinting()
            }
        }
        function fastBarcode(){
            const toPrint = Array.prototype.slice.call(document.querySelectorAll("div[ref='eLeftContainer'] > div[aria-selected='true'], div[ref='eLeftContainer'] > .custom-selected-row")).map(item => {
                return {"orderNumber": item.innerText}
            });
            const toPrintFormatted = JSON.stringify(toPrint).replaceAll('"', '\"');
            let pwt = getPwt();
            function attemptPrinting() {
                fetch("https://orderec5ng.cdek.ru/api/preback", {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "application/json",
                        "pwt": `${pwt}`,
                        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin"
                    },
                    "referrer": "https://orderec5ng.cdek.ru/",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": `{\"apiName\":\"orderPrint\",\"apiPath\":\"/web/print/form/barcode\",\"download\":true,\"orderData\": ${toPrintFormatted},\"format\":\"A4\",\"lang\":\"rus\",\"method\":\"POST\"}`,
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
            
            if (toPrint != 0) {
                
                attemptPrinting()
            }
        }

        fastInvoiceBtn.classList.add('ek5CustomButton')
        fastInvoiceBtn.textContent = "накл"
        actionPanel.insertBefore(fastInvoiceBtn, document.querySelector("#bulkOperationsButton"));
        fastInvoiceBtn.addEventListener("click", fastInvoice)

        fastBarcodeBtn.classList.add('ek5CustomButton')
        fastBarcodeBtn.textContent = "шк"
        actionPanel.insertBefore(fastBarcodeBtn, fastInvoiceBtn);
        fastBarcodeBtn.addEventListener("click", fastBarcode)

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

        // todo убрать спагетти
        // search history frontend
        let searchHistoryStorage = []; 
        if (localStorage.getItem('searchHistory')) {
            JSON.parse(searchHistoryStorage);
        }
        console.log(searchHistoryStorage)
        if (!searchHistoryStorage) {
            searchHistoryStorage = [];
            localStorage.setItem("searchHistory", searchHistoryStorage)
        }
        

        const searchPanel = document.querySelector(".panel-button-block");
        const searchHistoryBtn = document.createElement('button');

        const searchHistoryModal = document.createElement('div');
        searchHistoryModal.classList.add('customModal');
        searchHistoryModal.innerHTML = `
        <dialog open>

            <div class="modalHeader">
                <h3>История поиска</h3>
                <button id="clearHistory">Очистить</button>
                <button id="closeDialog">x</button>
            </div>
            <div id="searchthing">
            </div>
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
                rowInfo.innerHTML = `${data.orderNumber ? "<span class='searchHistoryBold'>Заказ</span>: " + data.orderNumber : ""} ${data.clientNumber ? "<span class='searchHistoryBold'>Номер</span>: " + data.clientNumber : ""} `
                rowDate.innerText = `${date.toTimeString().split(" ")[0]} ${date.toLocaleDateString('ru-RU')}`

                rowButton.innerText = '🔎';
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
        

        searchHistoryBtn.classList.add('ek5CustomButton');
        searchHistoryBtn.innerText = "🕑"
        searchPanel.appendChild(searchHistoryBtn)
        searchHistoryBtn.addEventListener('click', searchHistory);

        //search history backend
        const overlayWrapper = document.querySelector('div[ref="overlayWrapper"]');
        let orderNumberInput = document.querySelector('#orderNumberFilter input');
        let clientNumberInput = document.querySelector('#clientPhoneTailFilter input');
        let orderNumber;
        let clientNumber;

        const configS = { attributes: true, childList: false, subtree: false}

        function writeUntilClicked() {
            
            orderNumber = orderNumberInput.value;
            clientNumber = clientNumberInput ? clientNumberInput.value : document.querySelectorAll('.collapsed-filter__main .item-value')[1].innerText.replace(/\s+/g, '');
            console.log(`${orderNumber}, ${clientNumber}`)
        }
        function writeIfPressedEnter(evt) { 
            if (evt.key == "Enter") writeUntilClicked();
        }
        orderNumberInput.addEventListener('blur', writeUntilClicked);
        clientNumberInput.addEventListener('blur', writeUntilClicked);
        orderNumberInput.addEventListener('keydown', writeIfPressedEnter);
        clientNumberInput.addEventListener('keydown', writeIfPressedEnter);

        function dumbReset() {
            orderNumberInput = document.querySelector('#orderNumberFilter input');
            clientNumberInput = document.querySelector('#clientPhoneTailFilter input');
            orderNumberInput.addEventListener('blur', writeUntilClicked);
            clientNumberInput.addEventListener('blur', writeUntilClicked);
            orderNumberInput.addEventListener('keydown', writeIfPressedEnter);
            clientNumberInput.addEventListener('keydown', writeIfPressedEnter);
        }

        document.querySelector('#onClearButton').addEventListener('click', dumbReset);
        document.querySelector('#collapsedFilterButton').addEventListener('click', dumbReset)
        // bad
        let hackCounter = 0
        function onsearchButtonClick() {
            hackCounter++
            if (hackCounter > 1) {
                if (orderNumber || clientNumber) {
                    console.log(` ${orderNumber} ${clientNumber}`);
                    const newObj = {"orderNumber": orderNumber, "clientNumber": clientNumber, "date": Date.now()};
                    if (searchHistoryStorage.length > 0) {
                        console.log(searchHistoryStorage)
                        if (searchHistoryStorage.at(-1).orderNumber != newObj.orderNumber 
                            || searchHistoryStorage.at(-1).clientNumber != newObj.clientNumber){   
                            searchHistoryStorage.push(newObj)
                        }
                    } else {
                        searchHistoryStorage.push(newObj)
                    }
                    localStorage.setItem("searchHistory", JSON.stringify(searchHistoryStorage))
                }
                orderNumber, clientNumber = null;
                hackCounter = 0;
            }
        } 
        const searchButtonObserver = new MutationObserver(onsearchButtonClick);

        searchButtonObserver.observe(overlayWrapper, configS);

    }, 5000)

    
}