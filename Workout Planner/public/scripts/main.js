/** namespace. */
var rhit = rhit || {};

this.fbAuthManager = null;
this.myPlansManager = null;
this.PLANS_COLLECTION = "Workout Plans";
this.EXERCISES_COLLECTION = "Exercises";

let streak = 0;

function htmlToElement(html){
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.MyPlansController = class {
  constructor() {
  

  // will come back to this
  //   $("#addCustomDialog").on("show.bs.modal", (event) => {
  //     //pre animation
  //     document.querySelector("#inputQuote").value = "";
  //     document.querySelector("#inputMovie").value = "";
  //   });
  //   $("#addCustomDialog").on("shown.bs.modal", (event) => {
  //     //post animation
  //     document.querySelector("#inputQuote").focus();
  //     // document.querySelector("#inputMovie").value = "";
  //   });
    rhit.myPlansManager.beginListening(this.updateList.bind(this));

  }
  _createCard(wp){
		return htmlToElement(
      `<div class="card">
        <div class="card-body">
          <h5 class="card-title">${wp.name}</h5>
        </div>
      </div>`);
	}

	updateList () {
		const newList = htmlToElement(`<div id="plansList"></div>`);

		for(let i = 0; i < rhit.myPlansManager.length; i ++){
			const wp = rhit.myPlansManager.getPlanAtIndex(i);
			const newCard = this._createCard(wp);

			// newCard.onclick = (event) => {
			// 	window.location.href = `/moviequote.html?id=${mq.id}`;
			// }

			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#plansList");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		oldList.parentElement.appendChild(newList);
	}
  
};


rhit.MyPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Workout Plans");
		this._unsubscribe = null;
  }
  add(){
		this._ref.add({
			//TODO: ADD NEW PLAN METHOD
		})
		
	}
	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
		})
	}
	stopListening() {
		this._unsubscribe();
	}
	get length() {
		return this._documentSnapshots.length;
	}
	getPlanAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(docSnapshot.id, docSnapshot.get("Name"));
    return wp
	}
}

rhit.myAccountController = class {
  constructor() {
    document.querySelector("#signOutButton").onclick = (event) => {
      rhit.fbAuthManager.signOut();
      window.location.href = '/';
    }
  }
}

rhit.HomePageController = class {
  constructor() {
    document.querySelector("#TodaysWorkout").onclick = (event) => {
      window.location.href = "/todaysWorkout.html";
    };
    document.querySelector("#workoutStreak").onclick = (event) => {
      window.location.href = "/Calendar.html";
    };
    document.querySelector("#myPlansbtn").onclick = (event) => {
      window.location.href = "/myPlans.html";
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
    this.updateView();
  }

  updateView() {
    let date = new Date().toUTCString().slice(5, 16);
    document.querySelector("#dateLabel").innerHTML = `${date}`;
    document.querySelector("#streakText").innerHTML = `You've Completed Your Last <br> ${streak} <br> Workouts`
  }

};

rhit.pastWorkoutsController = class {
  constructor() {
    this.collapse();
  }
  collapse(){
    const coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  }
};

rhit.WorkoutPlan = class {
	constructor(id, name) {
    this.id = id;
		this.name = name;
	}
}




rhit.FBAuthManager = class {
  constructor() {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        var displayName = user.displayName;
        var email = user.email;
        var phoneNumber = user.phoneNumber;
        var uid = user.uid;
      }
    });

    // const email = document.querySelector("#inputEmail");
    // const password = document.querySelector("#inputPassword");
  }

  startFirebaseUI = function () {
    var uiConfig = {
      signInSuccessUrl: "/home.html",
      signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    };
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start(`#firebaseui-auth-container`, uiConfig);
  };

  signOut = function () {
    firebase.auth().signOut()
      .then(function () {
        console.log("Sign out successful");
      })
      .catch(function (error) {
        console.log("Sign out failed");
      });
  };
};

/* Main */
/** function and class syntax examples */
rhit.main = function () {
  rhit.fbAuthManager = new rhit.FBAuthManager();
  if (document.querySelector("#loginPage")) {
    rhit.fbAuthManager.startFirebaseUI();
  }
  if (document.querySelector("#homePage")) {
    new rhit.HomePageController();
  }
  if (document.querySelector("#accountPage")) {
    new rhit.myAccountController();
  }
  if (document.querySelector("#pastPage")) {
    new rhit.pastWorkoutsController();
  }
  if (document.querySelector("#plansPage")) {
    this.myPlansManager = new rhit.MyPlansManager();
    new rhit.MyPlansController();
    
  }
};

rhit.main();
