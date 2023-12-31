console.log("hello");
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
    if (e.origin.indexOf("addressstorageng") != 1){
        if (e.data.type == "readOut") {
            callback(e.data.data)
        }
    }
});
function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.postMessage(msg, "*");
}
