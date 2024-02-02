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