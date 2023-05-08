import { currentUser } from "./submit_form.js";
import { submitForm } from "./submit_form.js";
import { isValidationInputData } from "./submit_form.js";
import { getElementParent } from "./reset_form.js";

function setValueForm(idForm, arrInputName){
    const formUpdate = document.forms[idForm];
    arrInputName.forEach((inputName) => {
        if(inputName == 'gender-selection')
            formUpdate.elements[inputName].value = currentUser['gender'];
        else
            formUpdate.elements[inputName].value = currentUser[inputName];
    })
}

function submitFormUpdate(idForm, arraySelector){
    const formUpdate = document.forms[idForm];
    var inputElements = arraySelector.reduce(function(selectors, selector) {
        return selectors.concat(formUpdate.querySelector(`[name='${selector}']`));
    }, []);
    formUpdate.onsubmit = (e) => {
        e.preventDefault();

        var isValidForm = true;
            
        var isValidInput;
        inputElements.forEach(function(inputElement) {
            if(inputElement){
                isValidInput = isValidationInputData(formUpdate, inputElement); 
                if(isValidInput == false) {
                    isValidForm = false;
                }
            }
        });
        if(isValidForm){
            window.localStorage.removeItem(`${currentUser['email']}`);
            if(idForm == 'form-update-personal-user'){
                const user = getInfoUser(`#${idForm}`, arraySelector);
                console.log(user);
                for(let i = 0; i < arraySelector.length; ++i){
                    if(inputElements[i].name == undefined)
                        currentUser['gender'] = user['gender'];
                    else
                        currentUser[`${inputElements[i].name}`] = user[`${inputElements[i].name}`];
                }
            }
            if(idForm == 'form-update-password') {
                currentUser['password'] = formUpdate.querySelector("[name='new-password']").value;
            }
            window.localStorage.setItem(`${currentUser['email']}`, JSON.stringify(currentUser));
            window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
            const buttonSubmit = formUpdate.querySelector('button');
            buttonSubmit.innerText = '';
            buttonSubmit.innerHTML = '<span class="spinner-grow spinner-grow-sm me-1"></span>Đang cập nhật...';
            buttonSubmit.setAttribute('disabled', '');
            inputElements.forEach(function(inputElement) {
                if(inputElement)
                    inputElement.setAttribute('disabled', '');
            });
            setTimeout(() => {
                buttonSubmit.innerText = 'Lưu thay đổi';
                const textSuccess = '<i class="fa-solid fa-check me-1"></i>Cập nhật thành công';
                formUpdate.querySelector('.alert-submit-form').innerHTML = textSuccess;
                setTimeout(() => {
                    formUpdate.querySelector('.alert-submit-form').innerHTML = '';
                    inputElements.forEach(function(inputElement) {
                        if(inputElement)
                            inputElement.disabled = false;
                    });
                    buttonSubmit.disabled = false;
                    window.location.href = 'nguoidung.html';
                }, 2000);
            }, 2000);
        }
    }
}

const getInfoUser = function(idForm, arraySelector) {
    const form = document.querySelector(idForm);
    var inputElements = arraySelector.reduce(function(selectors, selector) {
        return selectors.concat(form.querySelector(`[name='${selector}']`));
    }, []);
    var user = {};
    if(form) {
        inputElements.forEach(function(inputElement) {
            if(inputElement){
                if(inputElement.name == undefined){
                    const nodeListGender = inputElement.querySelectorAll('input');
                    console.log(nodeListGender)
                    Array.from(nodeListGender).forEach(function(input) {
                        if(input.matches(':checked')){
                            user['gender'] = input.value;
                        }
                    })
                }
                else {
                    user[`${inputElement.name}`] = inputElement.value;
                }
            }
        })     
    }
    return user;
}


setValueForm('form-update-personal-user', ['name', 'birthday', 'gender-selection', 'email', 'phone-number']);

submitForm('#form-update-personal-user', ['name', 'birthday', 'email', 'phone-number']);

submitForm('#form-update-password', ['password', 'new-password', 'confirm-new-password']);

submitFormUpdate('form-update-personal-user', ['name', 'birthday', 'gender', 'email', 'phone-number']);

submitFormUpdate('form-update-password', ['password', 'new-password', 'confirm-new-password']);
