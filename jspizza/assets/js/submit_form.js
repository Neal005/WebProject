import { getInfoUser } from "./get_info_user.js";
import { resetForm, getElementParent } from "./reset_form.js";

// window.localStorage.clear();

// get current User
var currentUser = JSON.parse(window.localStorage.getItem('currentUser'));

// check validaiton form
const isRequired = function(inputElement, errorMessage) {
    var msgError;
    if(inputElement.value === ''){
        msgError = errorMessage;
    }
    else{
        msgError = '';
    }
    return msgError;
}
const checkEmail = function(inputElement, errorMessage) {
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var msgError;
    if(!regexEmail.test(inputElement.value)){
        msgError = errorMessage;
    }
    else{
        msgError = '';
    }
    return msgError;
}
const checkPhoneNumber = function(inputElement, errorMessage) {
    const regexPhoneNumber = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;
    var msgError;
    if(!regexPhoneNumber.test(inputElement.value)){
        msgError = errorMessage;
    }
    else{
        msgError = '';
    }
    return msgError;
}
const minLength = function(inputElement, min) {
    var msgError;
    if(inputElement.value.length < min){
        msgError = `Mật khẩu chứa ít nhất ${min} ký tự.`
    }
    else{
        msgError = '';
    }
    return msgError;
}
const confirmPassword = function(inputElement, password) {
    var msgError;
    if(inputElement.value != password){
        msgError = 'Nhập lại mật khẩu không chính xác';
    }
    else{
        msgError = '';
    }
    return msgError;
}
function checkPasswordCurrent(inputElement){
    var msgError;
    if(currentUser != null) {
        if(inputElement.value != currentUser['password'])
            msgError = 'Mật khẩu không chính xác';
        else
            msgError = '';
    }
    else msgError = '';
    return msgError;
}
const isBirthday = function(inputElement, validAge) {
    const valueBirthday = inputElement.value;
    const parts = valueBirthday.split('-');
    const currentDate = new Date();
    var msgError;
    if(currentDate.getFullYear() - parseInt(parts[0], 10) >= validAge) {
        if(currentDate.getFullYear() - parseInt(parts[0], 10) > validAge){
            msgError = '';
        }
        else if (currentDate.getFullYear() - parseInt(parts[0], 10) == validAge) {
            if(parseInt(parts[1], 10) < currentDate.getMonth()){
                msgError = '';
            }
            else if(parseInt(parts[1], 10) == currentDate.getMonth() && parseInt(parts[2], 10) <= currentDate.getDate()){
                msgError = '';
            }
            else {
                msgError = `Tuổi đăng ký tối thiểu là ${validAge} tuổi`;
            }
        }
    }
    else {
        msgError = `Tuổi đăng ký tối thiểu là ${validAge} tuổi`;
    }
    return msgError;
}
const checkGender = function(inputElement, messageError) {
    const nodeListGender = inputElement.querySelectorAll('input');
    var isCheck = false;
    Array.from(nodeListGender).forEach(function(input) {
        if(input.matches(':checked')){
            isCheck = true;
        }
    })
    var msgError;
    if(!isCheck){
        msgError = messageError;
    }
    else{
        msgError = '';
    }
    return msgError;
}

function isValidationInputData(form, inputElement){
    var valid = true;
    const parentElement = getElementParent(inputElement, '.form-group');
    const elementMessage = parentElement.querySelector('.error-message');
    var msgError;
    msgError = isRequired(inputElement, 'Vui lòng nhập trường này');
    const selector = `${inputElement.name}`;
    switch(selector){
        case 'birthday':
            if(msgError == ''){
                msgError = isBirthday(inputElement, 16);
            }
            break;
        case 'gender':
            if(msgError == ''){
                msgError = checkGender(inputElement, 'Vui lòng nhập trường này');
            }
            break;
        case 'email':
            if(msgError == ''){
                msgError = checkEmail(inputElement, 'Email không hợp lệ');
            }
            break;
        case 'phone-number':
            if(msgError == ''){
                msgError = checkPhoneNumber(inputElement, 'Số điện thoại không hợp lệ');
            }
            break;
        case 'password':
            if(msgError == ''){
                msgError = minLength(inputElement, 8);
            }
            if(msgError == '' && currentUser != null){
                msgError = checkPasswordCurrent(inputElement);
            }
            break;
        case 'confirm-password':
            if(msgError == ''){
                const pwdInput = form.querySelector("input[name='password']");
                msgError = confirmPassword(inputElement, pwdInput.value);
            }
            break;
        case 'new-password':
            if(msgError == ''){
                msgError = minLength(inputElement, 8);
            }
            break;
        case 'confirm-new-password':
            if(msgError == ''){
                const pwdInput = form.querySelector("input[name='new-password']");
                msgError = confirmPassword(inputElement, pwdInput.value);
            }
            break;
    }
    elementMessage.innerText = msgError;
    if(msgError !== ''){
        valid = false;
        parentElement.classList.add('form-error');
    }
    else {
        elementMessage.innerText = '';
        parentElement.classList.remove('form-error');
    }
    return valid;
}
function submitForm(idForm, arraySelector) {
    const form = document.querySelector(idForm);
    var inputElements = arraySelector.reduce(function(selectors, selector) {
        return selectors.concat(form.querySelector(`[name='${selector}']`));
    }, []);
    if(form) {
        inputElements.forEach(function(inputElement) {
            if(inputElement){
                if(inputElement.name === 'checkbox'){
                    const checkElement = form.querySelector("input[name='checkbox']");
                    const parentCheck = getElementParent(checkElement, '.constraint-content');
                    const errorElement = parentCheck.querySelector('.error-message');
                    checkElement.onclick = () => {
                        errorElement.innerText = '';
                        parentCheck.classList.remove('form-error');
                    }
                }
                else {
                    inputElement.onblur = function(){
                        isValidationInputData(form, inputElement);
                        if(inputElement.name === 'password' && idForm === '#form-register'){
                            const confirmPassword = form.querySelector("input[name='confirm-password']");
                            if(confirmPassword.value != '')
                                isValidationInputData(form, confirmPassword);  
                        }
                    }
                    inputElement.oninput = function(){
                        const parentElement = getElementParent(inputElement, '.form-group');
                        const elementMessage = parentElement.querySelector('.error-message');
                        elementMessage.innerText = '';
                        parentElement.classList.remove('form-error');
                    }
                }
            }
        })
        form.onsubmit = function(e) {

            e.preventDefault();

            var isValidForm = true;
            
            var isValidInput;
            inputElements.forEach(function(inputElement) {
                if(inputElement){
                    if(inputElement.name !== 'checkbox'){
                        isValidInput = isValidationInputData(form, inputElement); 
                        if(isValidInput == false) {
                            isValidForm = false;
                        }
                    }
                }
            });
            if(idForm === '#form-register'){
                const checkElement = form.querySelector("input[name='checkbox']");
                const parentCheck = getElementParent(checkElement, '.constraint-content');
                const errorElement = parentCheck.querySelector('.error-message');
                if(isValidForm){
                    if(!checkElement.matches(':checked')){
                        parentCheck.classList.add('form-error');
                        errorElement.innerText = 'Nhấn đồng ý để đăng ký';
                        isValidForm = false;
                    }
                }
                if(isValidForm) {
                    var keyInput;
                    inputElements.forEach(function(inputElement) {
                        if(inputElement){
                            if(inputElement.name === 'email'){
                                keyInput = inputElement.value;
                            }
                        }
                    });
                    const tmpUser = window.localStorage.getItem(keyInput);
                    if(tmpUser === null){ // account not exist
                        const user = getInfoUser(idForm, ['name', 'birthday', 'gender', 'email', 'phone-number', 'password']);
                        window.localStorage.setItem(keyInput, JSON.stringify(user));
                        openAlert();
                        currentUser = user;
                        window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        showUser();
                    }
                    else { // account existed
                        alertExistedUser();
                        isValidForm = false;
                    }
                }
            }
            if(idForm === '#form-login') {
                if(isValidForm) {
                    var keyInput;
                    var pwdInputElement;
                    inputElements.forEach(function(inputElement) {
                        if(inputElement){
                            if(inputElement.name === 'email'){
                                keyInput = inputElement.value;
                            }
                            if(inputElement.name === 'password'){
                                pwdInputElement = inputElement;
                            }
                        }
                    });
                    const tmpUser = window.localStorage.getItem(keyInput);
                    if(tmpUser === null){ // account not exist
                        alertLoginFailed();
                    }
                    else { // account existed                
                        const tmpUser = JSON.parse(window.localStorage.getItem(keyInput));
                        if(pwdInputElement.value == tmpUser['password']){
                            alertLoginSuccessfull();
                            currentUser = tmpUser;
                            window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            showUser();
                        }
                        else {
                            const parentElement = getElementParent(pwdInputElement, '.form-group');
                            const elementMessage = parentElement.querySelector('.error-message');
                            const msgError = 'Mật khẩu không chính xác';
                            elementMessage.innerText = msgError;
                            parentElement.classList.add('form-error');
                        }
                    }
                }
            }
        }   
    }
}

// open modal-register-successfull
const modalAlert = document.querySelector('.modal-register-successfull');
const openAlert = () => {
    modalAlert.classList.add('open');
}
// alert user existed
const modalAlertFailed = document.querySelector('.modal-register-failed');
const alertExistedUser = () => {
    modalAlertFailed.classList.add('open');
}

// alert login successfull
const modalAlertLoginScf = document.querySelector('.modal-login-successfull');
const alertLoginSuccessfull = () => {
    modalAlertLoginScf.classList.add('open');
}

// alert login failed
const modalAlertLoginFailed = document.querySelector('.modal-login-failed');
const alertLoginFailed = () => {
    modalAlertLoginFailed.classList.add('open');
}

// show user
const showUser = () => {
    const accountSection = document.querySelector('.account-section');
    const accountLogin = document.querySelector('.account-login');
    accountSection.classList.add('close');
    accountLogin.classList.add('show-user');
    const nameUser = accountLogin.querySelector('p');
    nameUser.innerText = currentUser['name'];
}
// hidden user
const hiddenUser = () => {
    const accountSection = document.querySelector('.account-section');
    const accountLogin = document.querySelector('.account-login');
    accountSection.classList.remove('close');
    accountLogin.classList.remove('show-user');
}
export {submitForm, resetForm, currentUser, showUser, hiddenUser, isValidationInputData};
