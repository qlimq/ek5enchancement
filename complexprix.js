function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.parent.postMessage(msg, "*");
}

if(location.href.indexOf("warehouseng.cdek.ru") != -1 && location.href.indexOf('gate') != -1){
    window.addEventListener('message', e => { 
        console.log(e)
        document.querySelector('iframe').contentWindow.postMessage(e.data);
    });
}

if(location.href.indexOf("warehouseng.cdek.ru") != -1 && location.href.indexOf('gate') == -1){
    setTimeout(() => {
        window.addEventListener('message', e => { 
            if (e.data.type == "action") {
                if (e.data.data == "focus") {
                    console.log('focusing');
                    document.querySelector('cdek-input[formcontrolname="barcode"] input').focus();
                }
            }
        });
        send_message("debug","loaded!")
        let continousString = '';
        document.addEventListener('keypress', e => {
            console.log(continousString)
            if (continousString == "!!addr" || continousString == "!!фввк") {
                send_message("goto", "Адресное хранение")
            }
            continousString += e.key;
            if (e.key == "Enter") {
                continousString = '';
            }
        })
    }, 5000)

    
}