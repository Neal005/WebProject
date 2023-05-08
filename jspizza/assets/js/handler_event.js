import { submitForm, resetForm, currentUser, showUser, hiddenUser } from "./submit_form.js";

const registerForm = document.querySelector('.register');
const modalRegister = document.querySelector('.modal-register');
const closeButtonRegister = modalRegister.querySelector('.close-button');

const loginForm = document.querySelector('.log-in');
const modalLogin = document.querySelector('.modal-login');
const closeButtonLogin = modalLogin.querySelector('.close-button');

const linkRegister = document.querySelector('.link-register');
const linkLogin = document.querySelector('.link-login');
const modalAlertFailed = document.querySelector('.modal-register-failed');

const modalLoginFailed = document.querySelector('.modal-login-failed');
const linkRegisterFromLogin = document.querySelector('.link-register-from-login');

// click open register form
registerForm.onclick = function (){
    resetForm('#form-register', ['name', 'birthday', 'gender', 'email', 'phone-number', 'password', 'confirm-password', 'checkbox']);
    modalRegister.classList.add('open');
}
// click close button on register form
closeButtonRegister.onclick = function(){
    modalRegister.classList.remove('open');
}
// click open login form
loginForm.onclick = function (){
    resetForm('#form-login', ['email', 'password']);
    modalLogin.classList.add('open');
}
// click close login form
closeButtonLogin.onclick = function(){
    modalLogin.classList.remove('open');
    resetForm('#form-login', ['email', 'password']);
}

// click open link register form from login form
linkRegister.onclick = function (){
    closeButtonLogin.onclick();
    registerForm.onclick();
}
// click open link register form from alert login failed
linkRegisterFromLogin.onclick = function (){
    closeButtonLogin.onclick();
    registerForm.onclick();
    modalLoginFailed.classList.remove('open');
}
// click open link register form from login form
linkLogin.onclick = function (){
    closeButtonRegister.onclick();
    loginForm.onclick();
    modalAlertFailed.classList.remove('open');
}
// close modal-register-successfull
const closeButtonAlert = document.querySelector('.return-main-page');
closeButtonAlert.onclick = function() {
    modalAlert.classList.remove('open');
}

// submit register form
submitForm('#form-register', ['name', 'birthday', 'gender', 'email', 'phone-number', 'password', 'confirm-password', 'checkbox']);

// submit login form
submitForm('#form-login', ['email', 'password']);

if(currentUser != null){
    showUser();
}
else {
    hiddenUser();
}

// move to page user
const logo_nameUser = document.querySelector('.logo-name-user');
const moveToPageUser = logo_nameUser.querySelector('.move-page-user');
moveToPageUser.onclick = () => {
    window.location.href = 'nguoidung.html';
}
// sign out account
const signOutElement = logo_nameUser.querySelector('.sign-out');
const modalSignOut = document.querySelector('.modal-sign-out');
signOutElement.onclick = () => {
    const tmpUser = null;
    hiddenUser();
    window.localStorage.setItem('currentUser', JSON.stringify(tmpUser));
    setTimeout(() => {
        modalSignOut.classList.add('modal-open');
        modalSignOut.classList.add('open-animation');
        setTimeout(() => {
            modalSignOut.classList.add('close-animation');
            setTimeout(() => {
                modalSignOut.classList.remove('modal-open');
                modalSignOut.classList.remove('open-animation');
                modalSignOut.classList.remove('close-animation');
                window.location.href = 'index.html';
            }, 500)
        }, 1000);
    }, 500)
}
// sign out account
const signOutMobileElement = document.querySelector('.mobile-logout div');
if(signOutMobileElement) {
    signOutMobileElement.onclick = () => {
        const tmpUser = null;
        hiddenUserMobile();
        window.localStorage.setItem('currentUser', JSON.stringify(tmpUser));
        setTimeout(() => {
            modalSignOut.classList.add('modal-open');
            modalSignOut.classList.add('open-animation');
            setTimeout(() => {
                modalSignOut.classList.add('close-animation');
                setTimeout(() => {
                    modalSignOut.classList.remove('modal-open');
                    modalSignOut.classList.remove('open-animation');
                    modalSignOut.classList.remove('close-animation');
                    window.location.href = 'index.html';
                }, 500)
            }, 1000);
        }, 500)
    }
}
const buttonSignOut = document.querySelector('.modal-sign-out .btn-close');
buttonSignOut.onclick = () => {
    modalSignOut.classList.remove('modal-open');
    modalSignOut.classList.remove('open-animation');
    modalSignOut.classList.remove('close-animation');
}
// show / hidden password
function show_hiddenPassword(idForm){
    const form = document.querySelector(idForm);
    if(form){
        const inputPswElements = Array.from(form.querySelectorAll('.cell-form-password'));
        inputPswElements.forEach((inputPswElement) => {
            const showEye = inputPswElement.querySelector('.show-password');
            const hideEye = inputPswElement.querySelector('.hidden-password');
            showEye.onclick = () => {
                showEye.style.display = 'none';
                hideEye.style.display = 'block';
                inputPswElement.querySelector('input').setAttribute('type', 'password');
            }
            hideEye.onclick = () => {
                showEye.style.display = 'block';
                hideEye.style.display = 'none';
                inputPswElement.querySelector('input').setAttribute('type', 'text');
            }
        })
    }
}
show_hiddenPassword('#form-register');
show_hiddenPassword('#form-login');
show_hiddenPassword('#form-update-password');

const mobileRegisterForm = document.querySelector('.mobile-register');
// click open register form
mobileRegisterForm.onclick = function (){
    resetForm('#form-register', ['name', 'birthday', 'gender', 'email', 'phone-number', 'password', 'confirm-password', 'checkbox']);
    modalRegister.classList.add('open');
}

const mobileLoginForm = document.querySelector('.mobile-login');
// click open login form
mobileLoginForm.onclick = function (){
    resetForm('#form-login', ['email', 'password']);
    modalLogin.classList.add('open');
}
// show user
const showUserMobile = () => {
    const accountSection = document.querySelector('.mobile-account');
    const accountLogin = document.querySelector('.mobile-log-in');
    accountSection.classList.add('close');
    accountLogin.classList.add('show-user');
    const nameUser = accountLogin.querySelector('p');
    nameUser.innerText = currentUser['name'];
}
// hidden user
const hiddenUserMobile = () => {
    const accountSection = document.querySelector('.mobile-account');
    const accountLogin = document.querySelector('.mobile-log-in');
    accountSection.classList.remove('close');
    accountLogin.classList.remove('show-user');
}
if(currentUser != null){
    showUserMobile();
}
else {
    hiddenUserMobile();
}
// open nav mobile
const bar = document.querySelector('#nav-mobile .bar-button');
const navOverlay = document.querySelector('.nav-overlay');
const menuMobile = document.querySelector('.menu-mobile');
bar.onclick = () => {
    navOverlay.classList.add('open-bar-nav');
    menuMobile.classList.add('open-bar-nav');
}   
navOverlay.onclick = () => {
    menuMobile.classList.add('fade-out');
    setTimeout(() => {
        navOverlay.classList.remove('open-bar-nav');
        menuMobile.classList.remove('open-bar-nav');
        menuMobile.classList.remove('fade-out');
    }, 800)
}
menuMobile.onclick = (e) => {
    e.stopPropagation();
}

const buttonSearchMobile = document.querySelector('.button-search-mobile');
const overlay = document.querySelector('.overlay');
buttonSearchMobile.onclick = () => {
    overlay.classList.add('open-bar-nav');
}
overlay.onclick = () => {
    overlay.classList.remove('open-bar-nav');
}
const inputSearchMobile = document.querySelector('.input-search-mobile');
inputSearchMobile.onclick = (e) => {
    e.stopPropagation();
}