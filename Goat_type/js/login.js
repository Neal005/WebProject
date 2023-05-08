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

function login() {
	event.preventDefault();
	var username=document.getElementById("username").value;
	var password=document.getElementById("password").value;
	var user=localStorage.getItem(username);
	var data=JSON.parse(user);
	if(user==null){
	alert("You don't have an account yet, please register!")
	}
	else if(username==data.username&&password==data.password){
		var checklogin = "yes";
		localStorage.setItem("checklogin", checklogin);
		window.location.href="./index.html"
	}
	else alert("Username or password is incorrect");
}