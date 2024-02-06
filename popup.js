const navRadio = document.querySelectorAll('nav label');
const menu = document.querySelectorAll('.menu');

navRadio.forEach((item, index) => {
    item.addEventListener('click', () => {
        menu.forEach(item => item.classList.remove('active'));
        menu[index].classList.add('active');
    })

})

function checkforUpdates() {
    let version = null;
    fetch('./VERSION')
        .then(response => response.text())
        .then(data => {
            version = data;
            document.querySelector('#version').textContent = version;
            const lastChecked = localStorage.getItem('lastChecked');
            let updateAvailableSaved = localStorage.getItem('newVersionAvailable');

            function showUpdatePopup(ver) {
                const newVer = document.querySelector('.new-version');
                newVer.classList.add('active');
                newVer.querySelector('span').innerText = ver;
            }
            
            if (!updateAvailableSaved) {
                if (lastChecked === null || lastChecked - new Date() > 3600000) {
                    fetch('https://raw.githubusercontent.com/qlimq/ek5enchancement/main/VERSION')
                    .then(response => response.text())
                    .then(data => {
                        if (data > version) {
                            const newVer = data.match(/[0-9]{1,2}[.]\d{1,2}/)[0];
                            showUpdatePopup(newVer);
                            localStorage.setItem('newVersionAvailable', newVer);
                        }
                    })
                }
            } else {
                if (updateAvailableSaved > version) {
                    showUpdatePopup(updateAvailableSaved)
                }
            }
            localStorage.setItem('lastChecked', new Date());

        });

}
checkforUpdates()

const settingsInputs = document.querySelectorAll('#options input');

const defaultSettings = {
    "keepHistory": true,
    "fastPrint": true,
    "barcodeFormat": "A6",
    "orderPlace": false,
    "readOut": true,
    "readOutRepeat": false,
    "readOutPlace": true,
    "readOutReady": true,
    "complexReadOut": true
}

function setSettings(source) {
    for(const [key,value] of Object.entries(source)) {
        const option = document.querySelector(`#options #${key}`);
        if (option.type === "checkbox") {
            option.checked = value;
        } else {
            option.value = value;
        }
    }
}

if(localStorage.length === 0){
    const newSettings = {...obj, ...defaultSettings};
    saveOptions()
}

const obj = {};

for (const key of Array.from(settingsInputs)) {
     obj[key.id] = key.type === "checkbox" ? key.checked : key.value;
}
console.log(obj)
const saveOptions = () => {
    const obj = {};

    for (const key of yourArray) {
         obj[key] = whatever;
    }

    chrome.storage.sync.set(settings, () => {
            chrome.tabs.query({active : true, lastFocusedWindow : true}, function (tabs) {
                var currentTab = tabs[0];
                chrome.tabs.sendMessage(currentTab.id, settings)

            })  
        }
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        { favoriteColor: 'red', likesColor: false },
        (items) => {
            console.log(items)
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
