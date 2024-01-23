function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.parent.postMessage(msg, "*");
}

const customcssToLoad = `
.ek5CustomButton { 
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
    display: grid;
    place-items: center;
}
.customModal > dialog{
    margin: auto;
    padding: 20px;
    border: 0;
    box-shadow: 0 8px 16px rgba(8,35,48,.2);
    width: 420px;
}
#searchthing {
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    margin-top: 10px;
    max-height: 60vh;
    overflow-y: scroll;
    padding: 6px;
    border: 1px solid #919699;
    border-radius: 4px;
    overflow: auto;
    margin-bottom: 8px;
}
#searchthing > div {
    display: grid;
    grid-template-columns: auto max-content max-content;   
}
#searchthing > div > button {
    background-color: #069697;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border: 1px solid #069697;
    border-radius: 4px;
    width: 24px;
    height: 24px;
}

#searchthing > div > button > span{
    filter: grayscale(1) contrast(3);
}
.modalHeader{
    display:grid;
    grid-template-columns: auto max-content max-content;
    gap: 6px;
}
.searchHistoryBold{
    font-weight: 500;
}
.searchHistoryInfo{
    font-size: 1.2rem;
}
.searchHistoryDate{
    opacity: 0.7;
    cursor: default;
}
#clearHistory, #closeDialog{
    color: #069697;
    border: 1px solid #069697;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 16px;
    gap: 7px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    background: inherit;
}
#clearHistory:hover, #closeDialog:hover, #searchthing > div > button:hover {
    background-color: #80cbc4;
    border-color: #80cbc4;
    color: white;
}
#closeDialog{
    width: 22px;
    background-color: #069697;
    color: white;
}
`;

function getPwt(){
    return sessionStorage.getItem("pwt")
}

function main() {
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
        if (number) {
            numberSearchInput.value = number;
            numberSearchInput.dispatchEvent(new Event("input"));
            document.querySelector('#onSearchByFilterButton > button').click();
        }
        if (order) {
            orderSearchInput.focus();
            /*
            const enter = new Event("keypress", {
                trusted: true,
                code: 'Enter',
                key: 'Enter',
                charCode: 13,
                keyCode: 13,
                which: 13,
                view: window,
                bubbles: true
            }); */
            orderSearchInput.value = order;
            // orderSearchInput.dispatchEvent(enter);
        }
    }

    // action panel additions
    const actionPanel = document.querySelector(".panel-action > .panel-button-block");
    const fastInvoiceBtn = document.createElement('button');
    const fastBarcodeBtn = document.createElement('button');

    function fastPrint(type) {
        const toPrint = Array.prototype.slice.call(document.querySelectorAll("div[ref='eLeftContainer'] > div[aria-selected='true'], div[ref='eLeftContainer'] > .custom-selected-row"));

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
                const toPrintMap = toPrint.map(item => item.innerText);
                const toPrintFormatted = JSON.stringify(toPrintMap).slice(1,-1).replaceAll('"', '\"');
                body = `{\"apiName\":\"orderPrint\",\"apiPath\":\"/web/print/form/order\",\"download\":true,\"orderNumbers\":[${toPrintFormatted}],\"template\":\"tpl_russia\",\"copiesCount\":1,\"lang\":\"rus\",\"method\":\"POST\"}`;
                printRequestTemplate(body);
            }
            if (type == "barcode") {
                const barcodeFormat = '"A6"' // todo https://stackoverflow.com/questions/5364062/how-can-i-save-information-locally-in-my-chrome-extension
                const toPrintMap = toPrint.map(item => {return {"orderNumber": item.innerText}})
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
            rowButton.innerHTML = "<span>🔎</span>"
            rowInfo.innerHTML = `${data.orderNumber ? "<span class='searchHistoryBold'>Заказ</span>: " + data.orderNumber : ""} ${data.clientNumber ? "<span class='searchHistoryBold'>Номер</span>: " + data.clientNumber : ""} `
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

    const configS = { attributes: true, childList: false, subtree: false};

    function writeNums(e) { 
        orderNumber = orderNumberInput.value;
        clientNumber = clientNumberInput.value;
    }

    function dumbReset() {
        orderNumberInput = document.querySelector('#orderNumberFilter input');
        clientNumberInput = document.querySelector('#clientPhoneTailFilter input');
        orderNumberInput.addEventListener('keydown', writeNums);
        clientNumberInput.addEventListener('keydown', writeNums);
    }
    dumbReset();

    document.querySelector('#onClearButton').addEventListener('click', dumbReset);
    document.querySelector('#collapsedFilterButton').addEventListener('click', dumbReset);

    // hack: не знаю как сделать так чтобы один раз изменение видно было, при загрузке два раза мигает дом
    let hackCounter = 0;
    function onsearchButtonClick() {
        hackCounter++
        if (hackCounter > 1 && (orderNumber || clientNumber)) {
            console.log(` ${orderNumber} ${clientNumber}`);
            const newObj = {"orderNumber": orderNumber, "clientNumber": clientNumber, "date": Date.now()};
            if (searchHistoryStorage.length > 0) {
                if (searchHistoryStorage.at(-1).orderNumber != newObj.orderNumber 
                    || searchHistoryStorage.at(-1).clientNumber != newObj.clientNumber){   
                    searchHistoryStorage.push(newObj)
                }
            } else {
                searchHistoryStorage.push(newObj)
            }
            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryStorage))
            orderNumber, clientNumber = null;
            hackCounter = 0;
        }
    } 

    const searchButtonObserver = new MutationObserver(onsearchButtonClick);
    searchButtonObserver.observe(overlayWrapper, configS);
}


if(location.href.indexOf("orderec5ng.cdek.ru") != -1 && location.href.indexOf('gate') == -1){
    setTimeout(main, 6000);
}