/** namespace. */
var rhit = rhit || {};

rhit.fbAuthManager = null;
rhit.myPlansManager = null;
rhit.PLANS_COLLECTION = "Workout Plans";
rhit.EXERCISES_COLLECTION = "Exercises";
rhit.DAYS_KEY = "Days/Week";

let weekday = new Date().getDay();
let streak = 0;

function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

rhit.MyPlansController = class {
  constructor() {
    document.querySelector("#customButton").onclick = (event) => {
      window.location.href = "/customPlans.html";
    };
    document.querySelector("#existingButton").onclick = (event) => {
      window.location.href = "/existingPlans.html";
    };


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
  _createCard(wp) {
    //brennan's code
//     return htmlToElement(
//       ` <div style="width: 18rem;">
//       <div class="card-body">
//         <h5 class="card-title">${wp.name}</h5>
//         <a href="#" class="card-link">Edit</a>
//         <a href="#" class="card-link">Favorite</a>
//         <a href="#" class="card-link">Delete</a>
//       </div>
//     </div>`);

    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${wp.name}</h5>
        <a href="#" class="card-link">Edit</a>
        <span>Favorite</span>
        <input type="radio" id="favorite" name="fav_plan" value="${wp.name}">
        <a href="#" class="card-link">Delete</a>
      </div>
    </div>`);
  }

  updateList() {
    //TODO: ONLY SHOW PLANS WITH USER UID

    const newList = htmlToElement(`<div id="plansList"></div>`);

    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      console.log("wp.uid: " + wp.uid + " auth id: " + rhit.fbAuthManager.uid);
      if (wp.uid == rhit.fbAuthManager.uid) {
      const newCard = this._createCard(wp);

      //TODO: ADD LISTENERS FOR EDIT FAVORITE AND DELETE BUTTONS

      // newCard.onclick = (event) => {
      // 	window.location.href = `/moviequote.html?id=${mq.id}`;
      // }

      newList.appendChild(newCard);
      }
    }

    const oldList = document.querySelector("#plansList");
    oldList.removeAttribute("id");
    oldList.hidden = true;

    oldList.parentElement.appendChild(newList);
  }

};

rhit.TodaysWorkoutController = class {
  constructor() {
    
  }
}


rhit.MyPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    this._unsubscribe = null;
  }
  add(name, goal, diff, days, favorite, uid, exercises) {
    this._ref.add({
      ["Name"]: name,
      ["Goal"]: goal,
      ["Difficulty"]: diff,
      ["Days/Week"]: days,
      ["favorite"]: favorite,
      ["uid"]: uid,
      ["Weekday"]: exercises
    });

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
  update() {
    //TODO: WRITE EDIT PLAN METHOD
  }
  delete(id) {
    //TODO: WRITE DELETE PLAN METHOD
  }
  get length() {
    return this._documentSnapshots.length;
  }
  getPlanAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(docSnapshot.id, docSnapshot.get("Name"), docSnapshot.get("Goal"), docSnapshot.get("Difficulty"), docSnapshot.get("Days"), docSnapshot.get("uid"));
    return wp;
  }
}

rhit.MyAccountController = class {
  constructor() {
    document.querySelector("#signOutButton").onclick = (event) => {
      rhit.fbAuthManager.signOut();
      window.location.href = '/';
    }
  }
}

rhit.CustomPlanController = class {
  constructor() {

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

rhit.PastWorkoutsController = class {
  constructor() {
    this.collapse();
  }
  collapse() {
    const coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
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
  constructor(id, name, goal, level, sessions, uid) {
    this.id = id;
    this.name = name;
    this.goal = goal;
    this.level = level;
    this.sessions = sessions;
    this.uid = uid;
  }
}



rhit.ExistingPlansController = class {
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
    rhit.existingPlansManager.beginListening(this.updateList.bind(this));

  }
  _createCard(wp) {
    //brennan's code
//     return htmlToElement(
//       ` <div style="width: 18rem;">
//       <div class="card-body">
//         <h5 class="card-title">${wp.name}</h5>
//         <a href="#" class="card-link">Edit</a>
//         <a href="#" class="card-link">Favorite</a>
//         <a href="#" class="card-link">Delete</a>
//       </div>
//     </div>`);

    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${wp.name}</h5>
        <h6 class="subtitle">${wp.level}</h6>
        <h6 class="subtitle">${wp.sessions} days per week</h6>
        <h6 class="subtitle">goal: ${wp.goal}</h6>
      </div>
    </div>`);
  }

  updateList() {

    const newList = htmlToElement(`<div id="plansList"></div>`);

    for (let i = 0; i < rhit.existingPlansManager.length; i++) {
      const wp = rhit.existingPlansManager.getPlanAtIndex(i);
      const newCard = this._createCard(wp);

      //TODO: ADD LISTENER FOR ADD BUTTON

      // newCard.onclick = (event) => {
      // 	window.location.href = `/moviequote.html?id=${mq.id}`;
      // }

      newList.appendChild(newCard);
    }

    const oldList = document.querySelector("#existingPlansList");
    oldList.removeAttribute("id");
    oldList.hidden = true;

    oldList.parentElement.appendChild(newList);
  }

};

rhit.ExistingPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    this._unsubscribe = null;
  }
  add(name, goal, level, sessions) {
    this._ref.add({
      ["name"]: name,
      ["goal"]: goal,
      ["level"]: level,
      ["sessions"]: sessions,
    });

  }
  addExisting(plan) {
    //TOOD CALL ADD WITH PARAMETERS OF GIVEN PLAN AND USER UID
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
  update() {
    //TODO: WRITE EDIT PLAN METHOD
  }
  delete(id) {
    //TODO: WRITE DELETE PLAN METHOD
  }
  get length() {
    return this._documentSnapshots.length;
  }
  getPlanAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(docSnapshot.id, docSnapshot.get("Name"), docSnapshot.get("Goal"), docSnapshot.get("Difficulty"), docSnapshot.get("Days"), docSnapshot.get("uid"));
    return wp;
  }
}


rhit.FBAuthManager = class {
  constructor() {
    this._user = null;
    // const email = document.querySelector("#inputEmail");
    // const password = document.querySelector("#inputPassword");
  }
  beginListening() {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
		});
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
  get uid() {
    return this._user.uid;
  }
};

/* Main */
/** function and class syntax examples */
rhit.main = function () {
  rhit.fbAuthManager = new rhit.FBAuthManager();
  rhit.fbAuthManager.beginListening();
  if (document.querySelector("#loginPage")) {
    this.fbAuthManager.startFirebaseUI();
  }
  if (document.querySelector("#homePage")) {
    new rhit.HomePageController();
  }
  if (document.querySelector("#accountPage")) {
    new rhit.MyAccountController();
  }
  if (document.querySelector("#pastPage")) {
    new rhit.PastWorkoutsController();
  }
  if (document.querySelector("#plansPage")) {
    this.myPlansManager = new rhit.MyPlansManager();
    new rhit.MyPlansController();
  }
  if (document.querySelector("#customPage")) {
    new rhit.CustomPlanController();
  }
  if (document.querySelector("#existingPage")) {
    this.existingPlansManager = new rhit.ExistingPlansManager();
    new rhit.ExistingPlansController();
  }


};

rhit.main();
