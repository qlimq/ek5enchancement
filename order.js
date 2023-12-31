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
    
}
#searchthing {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.modalHeader{
    display:flex;
    justify-content: space-between
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
            document.querySelector('#onClearButton > button').click()
                let num = document.querySelectorAll('.details > .details__wrapper > .details-card-receiver .details-card__grid .value-wrapper > span')[3].innerText.split(" ").pop();
                if (num.length != 10) {
                    num = num.slice(1);
                }
                const numSearchInput = document.querySelector('#clientPhoneTailFilter > label > .wrapper > input');
                numSearchInput.value = num;
                const evt = new Event("input");
                numSearchInput.dispatchEvent(evt);
                document.querySelector('#onSearchByFilterButton > button').click()
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

        // search history frontend
        let searchHistoryStorage = localStorage.getItem('searchHistory'); 
        const searchPanel = document.querySelector(".panel-button-block");
        const searchHistoryBtn = document.createElement('button');

        const searchHistoryModal = document.createElement('div');
        searchHistoryModal.classList.add('customModal');
        searchHistoryModal.innerHTML = `
        <dialog open>

            <div class="modalHeader">
                <h3>История поиска</h3>
                <button id="closeDialog">x</button>
            </div>
            <div id="searchthing">
                <button>
                Заказ: 1493593502
                </button>
                <button>
                Номер: 9841037350
                </button>
                <button>
                Заказ: 1493593502
                </button>
                <button>
                Номер: 9841037350
                </button>
                <button>
                Заказ: 1493593502
                </button>
                <button>
                Номер: 9841037350
                </button>
                <button>
                Заказ: 1493593502
                </button>
                <button>
                Номер: 9841037350
                </button>
            </div>
        </dialog>
        `
        
        function searchHistory() {
            const cdekModal = document.querySelector('app-root > cdek-modal');
            cdekModal.appendChild(searchHistoryModal);
        }
        searchHistoryModal.querySelector('#closeDialog').addEventListener('click', () => {
            searchHistoryModal.remove();
        })
        const searchHistoryToShow = searchHistoryModal.querySelector('#searchthing')
        searchHistoryToShow

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
            clientNumber = clientNumberInput.value;
            console.log(` ${orderNumber} ${clientNumber}`);
        }

        orderNumberInput.addEventListener('keydown', writeUntilClicked);
        clientNumberInput.addEventListener('keydown', writeUntilClicked);

        function onsearchButtonClick() {
            // clientNumber = orderNumberInput ? orderNumberInput.value : document.querySelectorAll('.collapsed-filter__main .item-value')[1].innerText.replace(/\s+/g, '')
            console.log(` ${orderNumber} ${clientNumber}`);
            orderNumber, clientNumber = null;
            
            // orderNumberInput = document.querySelector('#orderNumberFilter input');
            // clientNumberInput = document.querySelector('#clientPhoneTailFilter input');
            // localStorage.setItem("searchHistory", )
        } 
        const searchButtonObserver = new MutationObserver(onsearchButtonClick);

        searchButtonObserver.observe(overlayWrapper, configS);

    }, 5000)

    
}