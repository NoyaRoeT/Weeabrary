const navButton = document.querySelector('.nav-button');
const navList = document.querySelector('.navbar-list');

navButton.addEventListener('click', () => {
    navList.classList.toggle('active');
})

let tabItems = document.querySelectorAll('.myworks-edit-tabs .tab-list .tab-item');
let tabPages = document.querySelectorAll('.myworks-tab-page');

for (let tabItem of tabItems) {
    tabItem.addEventListener('click', () => {
        if (tabItem.classList.contains('active')) {
            return;
        }
        for (let i of tabItems) {
            i.classList.remove('active');
        }
        tabItem.classList.add('active');

        const tabClass = `.myworks-${tabItem.id}`;
        for (let tabPage of tabPages) {
            tabPage.classList.remove('active');
        }
        document.querySelector(tabClass).classList.add('active');
    })
}