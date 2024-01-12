// console.log("hello");
let timeout = null;
const synth = window.speechSynthesis;

const callback = (toRead) => {
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
window.addEventListener('message', e => {

    // console.log(e)
    if (e.origin.indexOf("addressstorageng") != 1){
        if (e.data.type == "readOut") {
            callback(e.data.data)
        }
    }
    
    if (e.data.type == "goto") {
        console.log(e.data.data)
        for (const a of document.querySelectorAll(".new-header-wrapper  .tab-item")) {
            if (a.textContent.includes(e.data.data)) {
                a.click();
                if (e.data.data == "Комплексный приход"){
                    send_message("https://warehouseng.cdek.ru/pwt.html", "action", "focus")
                }
                if (e.data.data == "Адресное хранение"){
                    send_message("https://addressstorageng.cdek.ru/pwt.html", "action", "focus")
                }
            }
        }
    }
});
function send_message(where, type, data){
    const iframe = document.querySelector(`iframe[src^="${where}"]`)
    const msg = {
        type: type,
        data: data
    }
    iframe.contentWindow.postMessage(msg, "*");
}
