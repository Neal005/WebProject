function showHidePassword() {
	var x = document.getElementById("password");
	console.log(x);
	if (x.type === "password") {
	x.type = "text";
	document.querySelector(".fa").classList.remove("fa-eye-slash");
	document.querySelector(".fa").classList.add("fa-eye");
	} else {
	x.type = "password";
	document.querySelector(".fa").classList.remove("fa-eye");
	document.querySelector(".fa").classList.add("fa-eye-slash");
	}
}
function showHiderePassword() {
	var x = document.getElementById("repassword");
	console.log(x);
	if (x.type === "password") {
	x.type = "text";
	document.querySelector("#retype").classList.remove("fa-eye-slash");
	document.querySelector("#retype").classList.add("fa-eye");
	} else {
	x.type = "password";
	document.querySelector("#retype").classList.remove("fa-eye");
	document.querySelector("#retype").classList.add("fa-eye-slash");
	}
}
function register(){
	event.preventDefault();
	var username=document.getElementById("username").value; 
	var password=document.getElementById("password").value;
	var repassword=document.getElementById("repassword").value;
	// var gender=document.getElementById("gender").value;
	if(password==repassword){
		var user={
		username: username,
		password: password,
		// gender: gender
		};
		var json = JSON.stringify(user);
		localStorage.setItem(username,json);
		alert("Sign Up Success");
		window.location.href="./login.html";
	}
	else alert("Re-entered password is incorrect");
}