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
// const customcssToLoad = `
// app-new-navs{
//     overflow: hidden;
// }
// app-new-navs::before{
//     content: "";
//     position: absolute;
//     z-index: -1;
//     display:block;
//     background-image: url('https://i.redd.it/fiax4nb7rxsa1.jpg');
//     background-size: cover;
//     width: 140%;
//     height: 140%;
//     left: -0.5vw;
//     top: -0.5vh;
//     filter: blur(10px) brightness(50%);
// }
// `
// const style = document.createElement('style');
//         if (style.styleSheet) {
//             style.styleSheet.cssText = customcssToLoad;
//         } else {
//             style.appendChild(document.createTextNode(customcssToLoad));
//         }
// document.getElementsByTagName('head')[0].appendChild(style);
