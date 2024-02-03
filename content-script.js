// console.log("hello");
let timeout = null;
const synth = window.speechSynthesis;

const readOut = (toRead) => {
    clearTimeout(timeout);
    // synth.cancel();
    function say(){
        const utterThis = new SpeechSynthesisUtterance(toRead);
        utterThis.lang = "ru-RU";
        utterThis.rate = 2;
        utterThis.pitch = 1.2;
        synth.speak(utterThis);
    }
    say();
    // timeout = setTimeout(say, 1000)
}

chrome.runtime.onMessage.addListener(ev => {
    console.log(ev)
})
  

window.addEventListener('message', e => {

    if (e.origin.indexOf("addressstorageng") != 1){
        if (e.data.type == "readOut") {
            readOut(e.data.data)
        }
    }
    if (e.data.type == "debug") {
        console.log({"origin": e.origin, "data": e.data.data})
    }
    if (e.data.type == "goto") {
        console.log(e.data.data)
        for (const a of document.querySelectorAll(".new-header-wrapper  .tab-item")) {
            if (a.textContent.includes(e.data.data)) {
                a.click();
                if (e.data.data == "Комплексный приход"){
                    setTimeout(() => {
                        send_message("https://warehouseng.cdek.ru/pwt.html", "action", "focus")
                    }, 200);
                }
                if (e.data.data == "Адресное хранение"){
                    setTimeout(() => {
                        send_message("https://addressstorageng.cdek.ru/pwt.html", "action", "focus")
                    }, 200)
                }
            }
        }
    }

    
    if (e.data.type == "complexReader") {
        const g = document.querySelector(".new-header-wrapper > .dndList");
        const f = document.querySelector(".new-header-wrapper > .dndList > .active");
        const complexOriginIndex = [...g.childNodes].indexOf(f);
        
        for (const a of document.querySelectorAll(".new-header-wrapper  .tab-item")) {
            if (a.textContent.includes("Адресное хранение")) {
                a.click();
                send_message("https://addressstorageng.cdek.ru/pwt.html", "complexReader", e.data.data);
                setTimeout(() => {
                    g.childNodes[complexOriginIndex].click();
                }, 500)
            }
        }
    }
});
function send_message(where, type, data){
    const iframe = document.querySelector(`iframe[src^="${where}"]`);
    if (iframe) {
        const msg = {
            type: type,
            data: data
        }
        iframe.contentWindow.postMessage(msg, "*");
    }
}
/*
chrome.storage.sync.get(items => {
    console.log(items)
    switch(items.favoriteColor){
        case ("red"):
            document.body.style.filter = 'hue-rotate(75deg)'
            break;
        
        case ("green"):
            document.body.style.filter = 'hue-rotate(150deg)';
            break;
        
        case ("blue"):
            document.body.style.filter = 'hue-rotate(225deg)';
            break;

        case ("yellow"):
            document.body.style.filter = 'hue-rotate(320deg)';
            break;
                                
    }

})*/