/** namespace. */
var rhit = rhit || {};

rhit.LoginPageController = class {
  constructor() {
    document.querySelector("#EPLogIn").onclick = (event) => {
      window.location.href = "/home.html";
    };
    document.querySelector("#rosefireButton").onclick = (event) => {
      window.location.href = "/home.html";
    };
  }
};

rhit.HomePageController = class {
  constructor() {
    document.querySelector("#TodaysWorkout").onclick = (event) => {
      window.location.href = "/todaysWorkout.html";
    };
    document.querySelector("#workoutStreak").onclick = (event) => {
      window.location.href = "/Calendar.html";
    };
    document.querySelector("#myPlansbtn").onclick = (event) => {
      window.location.href = "/MyPlans.html";
    };
    document.querySelector("#calendarbtn").onclick = (event) => {
      window.location.href = "/Calendar.html";
    };
    document.querySelector("#logbtn").onclick = (event) => {
      window.location.href = "/workoutLog.html";
    };
    document.querySelector("#settingsbtn").onclick = (event) => {
      window.location.href = "/account.html";
    };
  }
};

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	if (document.querySelector("#loginPage")) {
		new rhit.LoginPageController();
	}
	if (document.querySelector("#homePage")){
		new rhit.HomePageController();
	}
};

rhit.main();
