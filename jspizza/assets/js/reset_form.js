// reset initialation form
function getElementParent(element, selector){
    while(element.parentElement){
        if(element.parentElement.matches(selector)){
            return element.parentElement;
        }
        else{
            element = element.parentElement;
        }
    }
}
function resetForm(idForm, arraySelector) {
    const form = document.querySelector(idForm);
    var inputElements = arraySelector.reduce(function (selectors, selector) {
        return selectors.concat(form.querySelector(`input[name='${selector}']`));
    }, []);
    if (form) {
        inputElements.forEach(function (inputElement) {
            if (inputElement) {
                if (inputElement.name === 'checkbox') {
                    const checkElement = form.querySelector("input[name='checkbox']");
                    const parentCheck = getElementParent(checkElement, '.constraint-content');
                    const errorElement = parentCheck.querySelector('.error-message');
                    checkElement.onclick = () => {
                        errorElement.innerText = '';
                        parentCheck.classList.remove('form-error');
                    };
                }
                else {
                    const parentElement = getElementParent(inputElement, '.form-group');
                    const elementMessage = parentElement.querySelector('.error-message');
                    elementMessage.innerText = '';
                    parentElement.classList.remove('form-error');
                }
            }
        });
    }
}

export {resetForm, getElementParent};