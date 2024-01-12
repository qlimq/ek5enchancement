function send_message(type, data){
    const msg = {
        type: type,
        data: data
    }
    parent.parent.postMessage(msg, "*");
}

if(location.href.indexOf("warehouseng.cdek.ru") != -1 && location.href.indexOf('gate') == -1){
    window.addEventListener('message', e => { 
        console.log(e)
        if (e.data.type == "actions") {
            if (e.data.data == "focus") {
                
                console.log('focusing');
                document.querySelector('.scan input').focus();
            }
        }
    });
    setTimeout(() => {
        send_message("debug","loaded!")
        let continousString = '';
        document.addEventListener('keypress', e => {
            console.log(continousString)
            if (continousString == "!!addr") {
                send_message("goto", "Адресное хранение")
            }
            continousString += e.key;
            if (e.key == "Enter") {
                continousString = '';
            }
        })
    }, 5000)

    
}