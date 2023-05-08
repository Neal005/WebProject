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

export {getInfoUser};