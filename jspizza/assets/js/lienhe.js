

const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const mess = document.getElementById('mess');

form.addEventListener('submit', e => {
    e.preventDefault();

    checkInputs();
});

function checkInputs() {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const messValue = mess.value.trim();
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (usernameValue === '') {
        setErrorFor(username, 'Tên người dùng không thể để trống');
    } else {
        setSuccessFor(username);
    }


    if (emailValue === '') {
        setErrorFor(email, 'Email không được để trống');
    } else if (!filter.test(emailValue)) {
        setErrorFor(email, 'Vui lòng nhập lại email của bạn');
    } else {
        setSuccessFor(email);
    }

    if (messValue === '') {
        setErrorFor(mess, 'Tin nhắn không được để trống');
    } else {
        alert('Gửi thành công!!!!!')
        setSuccessFor(mess);
    }

}

function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    formControl.className = 'form-control error';
    small.innerText = message;
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}

function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}