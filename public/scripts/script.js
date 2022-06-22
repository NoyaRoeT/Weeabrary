const navButton = document.querySelector('.nav-button');
const navList = document.querySelector('.navbar-list');

navButton.addEventListener('click', () => {
    navList.classList.toggle('active');
})

let tabItems = document.querySelectorAll('.myworks-tabs .tab-list .tab-item');
let tabPages = document.querySelectorAll('.myworks-tabs-page');

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

let editor = $('#body');
if (editor.length) {
    editor.trumbowyg({
        btns: [
            ['undo', 'redo'],
            ['strong', 'em'],
            ['superscript', 'subscript'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['fullscreen']
        ],
        semantic: false,
        tagsToRemove: ['script', 'link']
    });
}

const flashCloseBtn = document.querySelector('.alert .close-btn');
flashCloseBtn.addEventListener('click', function() {
    this.parentElement.style.display = 'none';
})
