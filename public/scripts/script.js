const navButton = document.querySelector('.nav-button');
const navList = document.querySelector('.navbar-list');

navButton.addEventListener('click', () => {
    navList.classList.toggle('active');
})