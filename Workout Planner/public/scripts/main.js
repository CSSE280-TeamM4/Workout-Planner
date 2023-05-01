/** namespace. */
var rhit = rhit || {};



rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#EPLogIn").onclick = (event) => {
			window.location.href = "/home.html";
		}
		document.querySelector("#rosefireButton").onclick = (event) => {
			window.location.href = "/home.html";
		}
	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	new rhit.LoginPageController();
};

rhit.main();
