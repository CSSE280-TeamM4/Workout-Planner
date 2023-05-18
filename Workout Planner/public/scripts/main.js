var rhit = rhit || {};

rhit.fbAuthManager = null;
rhit.myPlansManager = null;
rhit.existingPlansManager = null;
rhit.PLANS_COLLECTION = "Workout Plans";
rhit.EXERCISES_COLLECTION = "Exercises";
rhit.DAYS_KEY = "Days";
rhit.favoritePlan = null;

let weekday = new Date().getDay();
let streak = 0;

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

rhit.setFavorite = function (wp) {
  rhit.favoritePlan = wp;
};
//
// WORKOUT PLAN OBJECT
//
rhit.WorkoutPlan = class {
  constructor(id, name, goal, level, sessions, uid, time, favorite, exercises, startDate) {
    this.id = id;
    this.name = name;
    this.goal = goal;
    this.level = level;
    this.sessions = sessions;
    this.uid = uid;
    this.time = time;
    this.favorite = favorite;
    this.exercises = exercises;
    this.startDate = startDate;
  }
};

//
// MANAGERS
//
rhit.MyPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    this._unsubscribe = null;
  }
  add(name, goal, diff, days, favorite, time, exercises) {
    this._ref.add({
      ["Name"]: name,
      ["Goal"]: goal,
      ["Difficulty"]: diff,
      ["Days"]: days,
      ["favorite"]: favorite,
      ["uid"]: rhit.fbAuthManager.uid,
      ["time"]: time,
      ["Weekday"]: exercises,
      ["startDate"]: firebase.firestore.Timestamp.now(),
    });
  }


  addExisting(wp) {
    this.add(
      wp.name,
      wp.goal,
      wp.level,
      wp.sessions,
      wp.favorite,
      wp.time,
      wp.exercises
    );
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;
      changeListener();
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  get length() {
    return this._documentSnapshots.length;
  }
  getPlanAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(
      docSnapshot.id,
      docSnapshot.get("Name"),
      docSnapshot.get("Goal"),
      docSnapshot.get("Difficulty"),
      docSnapshot.get("Days"),
      docSnapshot.get("uid"),
      docSnapshot.get("time"),
      docSnapshot.get("favorite"),
      docSnapshot.get("Weekday"),
      docSnapshot.get("startDate")
    );
    // if (docSnapshot.get("Weekday.Friday")) {
    //   console.log(docSnapshot.get("Name") + " " + Object.keys(docSnapshot.get("Weekday.Friday")).length);

    // }
    return wp;
  }
};

rhit.ExistingPlansManager = class {
  constructor() {
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    this._unsubscribe = null;
  }

  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;
      changeListener();
    });
  }
  add(name, goal, diff, days, favorite, time, exercises) {
    this._ref.add({
      ["Name"]: name,
      ["Goal"]: goal,
      ["Difficulty"]: diff,
      ["Days"]: days,
      ["favorite"]: favorite,
      ["uid"]: rhit.fbAuthManager.uid,
      ["time"]: time,
      ["Weekday"]: exercises,
    });
  }
  addExisting(wp) {
    this.add(
      wp.name,
      wp.goal,
      wp.level,
      wp.sessions,
      wp.favorite,
      wp.time,
      wp.exercises
    );
  }
  stopListening() {
    this._unsubscribe();
  }

  get length() {
    return this._documentSnapshots.length;
  }

  getPlanAtIndex(index) {
    const docSnapshot = this._documentSnapshots[index];
    const wp = new rhit.WorkoutPlan(
      docSnapshot.id,
      docSnapshot.get("Name"),
      docSnapshot.get("Goal"),
      docSnapshot.get("Difficulty"),
      docSnapshot.get("Days"),
      docSnapshot.get("uid"),
      docSnapshot.get("time"),
      docSnapshot.get("favorite"),
      docSnapshot.get("Weekday"),
      docSnapshot.get("startDate")
    );
    return wp;
  }
};

rhit.FBAuthManager = class {
  constructor() {
    this._user = null;
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
    firebase
      .auth()
      .signOut()
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

rhit.ExercisesManager = class {
  constructor(planId) {
    this._documentSnapshot = {};
    this._unsubscribe = null;
    this._ref = firebase.firestore().collection("Workout Plans").doc(planId);
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((doc) => {
      if (doc.exists) {
        console.log("Document data: ", doc.data());
        this._documentSnapshot = doc;
        changeListener();
      } else {
        console.log("No such document!");
      }
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  getExercisesFor(day) {
    return this._documentSnapshot.get("Weekday")[day];
  }

  update(day, exName, sets, reps, weight) {
    this._ref
      .update({
        ["Weekday." + day + "." + exName]: {
          sets: sets,
          reps: reps,
          weight: weight,
        },
      })
      .then(() => {
        console.log("document successfulle updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  delete() {
    return this._ref.delete();
  }
  // get exName() {
  //   return this._documentSnapshot.get("Name");
  // }

}
rhit.SinglePlanManager = class {
  constructor(planId) {
    this._documentSnapshot = {};
    this._unsubscribe = null;
    this._ref = firebase.firestore().collection("Workout Plans").doc(planId);
  }
  beginListening(changeListener) {
    this._unsubscribe = this._ref.onSnapshot((doc) => {
      if (doc.exists) {
        console.log("Document data: ", doc.data());
        this._documentSnapshot = doc;
        changeListener();
      } else {
        console.log("No such document!");
        // window.location.href = "/"'
      }
    });
  }
  stopListening() {
    this._unsubscribe();
  }

  setFav(fav) {
    this._ref
      .update({
        ["favorite"]: fav
      })
      .then(() => {
        console.log("document successfully updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  update(name, goal, diff, days, favorite, time, exercises) {
    // console.log("update quote movie");
    this._ref
      .update({
        ["Name"]: name,
        ["Goal"]: goal,
        ["Difficulty"]: diff,
        ["Days"]: days,
        ["favorite"]: favorite,
        ["uid"]: rhit.fbAuthManager.uid,
        ["time"]: time,
        ["favorite"]: favorite,
        ["Weekday"]: exercises,
      })
      .then(() => {
        console.log("document successfulle updated");
      })
      .catch(function (error) {
        console.log("Error adding document: ", error);
      });
  }

  delete() {
    return this._ref.delete();
  }

  get name() {
    return this._documentSnapshot.get("Name");
  }

  get goal() {
    return this._documentSnapshot.get("Goal");
  }
};

//
// PAGE CONTROLLERS
//
rhit.MyPlansController = class {
  constructor() {
    document.querySelector("#submitCustomDialog").onclick = (event) => {
      const planName = document.querySelector("#inputPlanName").value;
      rhit.myPlansManager.add(planName, "", "", "", false, "", "");
    };
    document.querySelector("#existingButton").onclick = (event) => {
      window.location.href = "/existingPlans.html";
    };

    $("#addCustomDialog").on("show.bs.modal", (event) => {
      document.querySelector("#inputPlanName").value = "";
    });
    rhit.myPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(wp) {
    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="card favorite-${wp.favorite}">
        <h5 class="card-title">&nbsp;&nbsp;&nbsp;&nbsp;${wp.name}</h5>
        
      </div>
    </div>`
    );
  }

  updateList() {
    const newList = htmlToElement(`<div id="plansList"></div>`);

    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.favorite == true) {
        rhit.favoritePlan = wp;
      }
      const newCard = this._createCard(wp);

      newCard.onclick = (event) => {
        window.location.href = `/plan.html?id=${wp.id}`;
      };
      //TODO: ADD LISTENERS FOR EDIT FAVORITE AND DELETE BUTTONS
      if (wp.uid == rhit.fbAuthManager.uid) {
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

rhit.SinglePlanController = class {
  constructor(planId) {
    document.querySelector("#backPlan").onclick = (event) => {
      window.location.href = "myPlans.html";
    };
    document.querySelector("#editPlan").onclick = (event) => {
      window.location.href = `/customPlans.html?id=${planId}`;
    };

    document
      .querySelector("#submitDeletePlan")
      .addEventListener("click", (event) => {
        rhit.singlePlanManager
          .delete()
          .then(function () {
            window.location.href = "/myPlans.html";
          })
          .catch(function (error) {
            console.log("error removing doc", error);
          });
      });

    document.querySelector("#customSetActive").onclick = (event) => {
      for (let i = 0; i < rhit.myPlansManager.length; i++) {
        // console.log(rhit.myPlansManager.length);
        const wp = rhit.myPlansManager.getPlanAtIndex(i);
        this.singlePlanManager = new rhit.SinglePlanManager(wp.id);

        // wp.favorite
        if (wp.uid == rhit.fbAuthManager.uid) {
          console.log(wp.id);
          if (wp.id === planId) {
            console.log(wp.id);
            this.singlePlanManager.setFav(true);
          }
          else {
            this.singlePlanManager.setFav(false);
          }
        }
      }
      alert("This plan has been set has active");
    };

    rhit.myPlansManager.beginListening(this.updateView.bind(this));
    rhit.singlePlanManager.beginListening(this.updateView.bind(this));
  }
  updateView() {
    document.querySelector("#cardPlan").innerHTML = rhit.singlePlanManager.name;
    document.querySelector("#cardGoal").innerHTML = "bbbbbb";
  }
};

rhit.TodaysWorkoutController = class {
  constructor() {
    this.favoritePlan = null;
    this._documentSnapshots = [];
    this._ref = firebase.firestore().collection("Workout Plans");
    console.log(this.favArg);
    this.favoritePlan = this.getFavorite();
    console.log(this.favArg);
    this.displayPlan();
  }

  getFavorite() {
    let fav = null;
    this._unsubscribe = this._ref.onSnapshot((querySnapshot) => {
      this._documentSnapshots = querySnapshot.docs;

      for (let i = 0; i < this._documentSnapshots.length; i++) {
        const docSnapshot = this._documentSnapshots[i];

        const wp = new rhit.WorkoutPlan(
          docSnapshot.id,
          docSnapshot.get("Name"),
          docSnapshot.get("Goal"),
          docSnapshot.get("Difficulty"),
          docSnapshot.get("Days"),
          docSnapshot.get("uid"),
          docSnapshot.get("time"),
          docSnapshot.get("favorite"),
          docSnapshot.get("Weekday"),
          docSnapshot.get("startDate")
        );
        if (wp.favorite == true && wp.uid == rhit.fbAuthManager.uid) {
          fav = wp;
          return fav;
        }
      }
      
      
    });

  }
  displayPlan() {
    console.log(this.favoritePlan);
  }
};

rhit.MyAccountController = class {
  constructor() {
    document.querySelector("#signOutButton").onclick = (event) => {
      rhit.fbAuthManager.signOut();
      window.location.href = "/";
    };
  }
};

rhit.CustomPlanController = class {
  constructor(planId) {

    let day = "";
    document.querySelector("#monButton").onclick = (event) => {
      day = "Monday";
    };
    document.querySelector("#tueButton").onclick = (event) => {
      day = "Tuesday";
    };
    document.querySelector("#wedButton").onclick = (event) => {
      day = "Wednesday";
    };
    document.querySelector("#thuButton").onclick = (event) => {
      day = "Thursday";
    };
    document.querySelector("#friButton").onclick = (event) => {
      day = "Friday";
    };
    document.querySelector("#satButton").onclick = (event) => {
      day = "Saturday";
    };
    document.querySelector("#sunButton").onclick = (event) => {
      day = "Sunday";
    };
    document.querySelector("#submitAddCustom").onclick = (event) => {
      let exName;
      if (document.querySelector("#customName").value) {
        exName = document.querySelector("#customName").value;
      }
      else {
        // console.log(exName = document.querySelector("#exercise-names").innerHTML);
        var s = document.getElementsByName('exercise-names')[0];
        var text = s.options[s.selectedIndex].text;
        console.log(text);
        exName = text;
      }
      const sets = document.querySelector("#inputSets").value;
      const reps = document.querySelector("#inputReps").value;
      const weight = document.querySelector("#inputWeight").value;
      rhit.exercisesManager.update(day, exName, sets, reps, weight);
    };
    $("#addCustomDialog").on("show.bs.modal", (event) => {

      document.querySelector("#customName").value = "";
      document.querySelector("#inputSets").value = "";
      document.querySelector("#inputReps").value = "";
      document.querySelector("#inputWeight").value = "";
      document.querySelector("#exercise-names").value = "custom";
      document.getElementById("ifYes").style.display = "block";
    });

    document.querySelector("#customBack").onclick = (event) => {
      window.location.href = "/myPlans.html";
    };

    document.querySelector("#customSetActive").onclick = (event) => {
      for (let i = 0; i < rhit.myPlansManager.length; i++) {
        const wp = rhit.myPlansManager.getPlanAtIndex(i);
        this.singlePlanManager = new rhit.SinglePlanManager(wp.id);

        if (wp.uid == rhit.fbAuthManager.uid) {
          if (wp.id === planId) {
            this.singlePlanManager.setFav(true);
          }
          else {
            this.singlePlanManager.setFav(false);
          }
        }
      }
      alert("This plan has been set has active");
    };
    rhit.exercisesManager.beginListening(this.updateList.bind(this));

    rhit.myPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(key, val) {
    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="excard">
        <h5 class="extitle">${key}</h5>
        <p class="extext">&nbsp;&nbsp;&nbsp;&nbsp;Sets: ${val.sets}</p>
        <p class="extext">&nbsp;&nbsp;&nbsp;&nbsp;Reps: ${val.reps}</p>
        <p class="extext">&nbsp;&nbsp;&nbsp;&nbsp;Weight: ${val.weight} lb</p>
        
      </div>
    </div>`
    );
    // <button id="edit${key}" type="button" class="btn bmd-btn-fab" data-toggle="modal" data-target="#addCustomDialog">
    //     <i class="material-icons">edit</i>
    //     </button>
    //     <button id="delete${key}" type="button" class="btn bmd-btn-fab" data-toggle="modal" data-target="#addCustomDialog">
    //     <i class="material-icons">delete</i>
    //     </button>
    // <input type="radio" id="favorite" name="fav_plan" value="${wp.name}">
    //     <label for="favorite">Favorite</label><br></br>
  }

  updateList() {
    let day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let oldList = "";
    let newList = "";
    for (let i = 0; i < day.length; i++) {
      if (day[i] === "Monday") {
        console.log("working");
        oldList = document.querySelector("#monList");
        newList = htmlToElement(`<div id="monList"></div>`);
      }
      else if (day[i] === "Tuesday") {
        oldList = document.querySelector("#tueList");
        newList = htmlToElement(`<div id="tueList"></div>`);
      }
      else if (day[i] === "Wednesday") {
        oldList = document.querySelector("#wedList");
        newList = htmlToElement(`<div id="wedList"></div>`);
      }
      else if (day[i] === "Thursday") {
        oldList = document.querySelector("#thuList");
        newList = htmlToElement(`<div id="thuList"></div>`);
      }
      else if (day[i] === "Friday") {
        oldList = document.querySelector("#friList");
        newList = htmlToElement(`<div id="friList"></div>`);
      }
      else if (day[i] === "Saturday") {
        oldList = document.querySelector("#satList");
        newList = htmlToElement(`<div id="satList"></div>`);
      }
      else if (day[i] === "Sunday") {
        oldList = document.querySelector("#sunList");
        newList = htmlToElement(`<div id="sunList"></div>`);
      }

      // console.log(rhit.exercisesManager.getExercisesFor('Monday'));

      let exercises = rhit.exercisesManager.getExercisesFor(day[i]);
      if (exercises) {

        for (const [key, value] of Object.entries(exercises)) {
          console.log(key, value);
          // const wp = [key, value];
          const getKey = key;
          const getVal = value;
          // console.log([key, value]);
          const newCard = this._createCard(getKey, getVal);
          newCard.onclick = (event) => {
            // window.location.href = `/plan.html?id=${wp.id}`;
          };
          newList.appendChild(newCard);
          // if (wp.uid == rhit.fbAuthManager.uid) {
          //   console.log("working");
          // }
        }


        oldList.removeAttribute("id");
        oldList.hidden = true;

        oldList.parentElement.appendChild(newList);
      }
    }
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
      window.location.href = "/myPlans.html";
    };
    document.querySelector("#calendarbtn").onclick = (event) => {
      window.location.href = "/Calendar.html";
    };
    // document.querySelector("#logbtn").onclick = (event) => {
    //   window.location.href = `/workoutLog.html`;
    //   // window.location.href = `/plan.html?id=${wp.id}`;
    // };
    document.querySelector("#settingsbtn").onclick = (event) => {
      window.location.href = "/account.html";
    };
    this.updateView();
    rhit.myPlansManager.beginListening(this.updateView.bind(this));
  }

  updateView() {
    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid && wp.favorite == true) {
        document.querySelector("#logbtn").onclick = (event) => {
          window.location.href = `/workoutLog.html?id=${wp.id}`;
          // window.location.href = `/plan.html?id=${wp.id}`;
        };
      }
    }
    let date = new Date().toUTCString().slice(5, 16);
    document.querySelector("#dateLabel").innerHTML = `${date}`;
    document.querySelector(
      "#streakText"
    ).innerHTML = `You've Completed Your Last <br> ${streak} <br> Workouts`;
  }
};

rhit.PastWorkoutsController = class {
  constructor() {
    rhit.exercisesManager.beginListening(this.updateList.bind(this));
    rhit.myPlansManager.beginListening(this.updateList.bind(this));
    this.collapse();


    // var dt = new Date("December 25, 1995 23:15:00");
    // console.log(dt.getDay());

    //next monday
    // var d = new Date();
    // d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
    // console.log(d);

    //prev monday

    // var prevMonday = new Date();
    // prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + (7 - 1)) % 7);
    // console.log(prevMonday);

    //  document.write("getDay() : " + dt.getDay() ); 
    // for (let i = 0; i < rhit.myPlansManager.length; i++) {
    //   const wp = rhit.myPlansManager.getPlanAtIndex(i);
    //   if (wp.uid == rhit.fbAuthManager.uid && wp.favorite == true) {

    //     console.log(wp.name);
    // const newCard = this._createCard(wp);

    // newCard.onclick = (event) => {
    //   console.log(wp.exercises);
    //   rhit.existingPlansManager.addExisting(wp);
    // };

    // newList.appendChild(newCard);
    //   }
    // }

    document.querySelector("#backPlan").onclick = (event) => {
      // window.location.href = "/account.html";
      console.log(rhit.myPlansManager.length);

    };
    // document.getElementsByClassName("collapsible").onclick = (event) => {
    //   console.log(rhit.myPlansManager.length);
    // };

  }
  _createCard(prev) {
    // console.log(wp.name);
    return htmlToElement(
      ` <button type="button" class="collapsible">${prev}</button>`
    );
  }
  _contentCard(key, val) {
    return htmlToElement(
      `<div id="appear">
      ${key}: ${val.sets}x${val.reps}
      </div>`
    );
  }

  updateList() {
    const newList = htmlToElement(`<div id="pastList"></div>`);
    for (let i = 0; i < rhit.myPlansManager.length; i++) {
      const wp = rhit.myPlansManager.getPlanAtIndex(i);
      if (wp.uid == rhit.fbAuthManager.uid && wp.favorite == true) {
        this.exercisesManager = new rhit.ExercisesManager(wp.id);
        // this.exercisesManager.beginListening(this.updateList.bind(this));
        // wp.id
        var newCard;
        var prevMonday = new Date();
        var lastDay = wp.startDate.toDate();
        var content;
        lastDay.setDate(lastDay.getDate() - (lastDay.getDay() - 7));
        // console.log(lastDay);

        while (prevMonday >= lastDay) {
          if (prevMonday.getDay() == 1) {
            prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 7));
          } else {
            prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + ((7) - 1)) % 7);
          }
          newCard = this._createCard(prevMonday);
          console.log(prevMonday);

          let exercises = rhit.exercisesManager.getExercisesFor("Monday");
          if (exercises) {

            for (const [key, value] of Object.entries(exercises)) {
              console.log(key, value);
              // const wp = [key, value];
              const getKey = key;
              const getVal = value;
              // console.log([key, value]);
              // const newCard = this._createCard(getKey, getVal);

              content = this._contentCard(getKey, getVal);
            }
          }
          newCard.onclick = (event) => {
            // console.log(wp.exercises);
            if (document.querySelector("#appear")) {
              // newList.removeChild(content);
              document.querySelector("#appear").remove();
            } else {
              newList.appendChild(content);
            }
          };

          newList.appendChild(newCard);

        }
        // if (prevMonday >= wp.startDate.toDate()){
        //   console.log("hi");
        // }
        // while (prevMonday >= wp.startDate.toDate()) {
        // i++;
        // if (prevMonday >= wp.startDate.toDate()){
        //   console.log("hi");
        // }
        // }



        console.log(wp.exercises);
        // const newCard = this._createCard(wp);

        // console.log(newList);
        // console.log(document.querySelector("appear"));
        // newCard.onclick = (event) => {
        //   // console.log(wp.exercises);
        //   const content = this._contentCard(wp);
        //   if (document.querySelector("#appear")) {
        //     // newList.removeChild(content);
        //     document.querySelector("#appear").remove();
        //   } else {
        //     newList.appendChild(content);
        //   }
        // };

        // newList.appendChild(newCard);
      }
    }

    const oldList = document.querySelector("#pastList");
    oldList.removeAttribute("id");
    oldList.hidden = true;

    oldList.parentElement.appendChild(newList);
  }
  collapse() {
    const coll = document.getElementsByClassName("collapsible");
    var i;
    console.log(coll.length);

    for (i = 0; i < coll.length; i++) {
      console.log("hi");
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

rhit.ExistingPlansController = class {
  constructor() {
    document.querySelector("#existingDone").onclick = (event) => {
      window.location.href = "/myPlans.html";
    };

    rhit.existingPlansManager.beginListening(this.updateList.bind(this));
  }
  _createCard(wp) {
    console.log(wp.name);
    return htmlToElement(
      ` <div style="width: 18rem;">
      <div class="card">
        <h5 class="card-title">${wp.name}</h5>
        <h6 class="subtitle">${wp.level}</h6>
        <h6 class="subtitle">${wp.sessions} days per week</h6>
        <h6 class="subtitle">goal: ${wp.goal}</h6>
        <a href="#" class="card-link">Add</a>
      </div>
    </div>`
    );
  }

  updateList() {
    const newList = htmlToElement(`<div id="existingPlansList"></div>`);

    for (let i = 0; i < rhit.existingPlansManager.length; i++) {
      const wp = rhit.existingPlansManager.getPlanAtIndex(i);
      if (wp.uid == "") {
        const newCard = this._createCard(wp);

        newCard.onclick = (event) => {
          console.log(wp.exercises);
          rhit.existingPlansManager.addExisting(wp);
        };

        newList.appendChild(newCard);
      }
    }

    const oldList = document.querySelector("#existingPlansList");
    oldList.removeAttribute("id");
    oldList.hidden = true;

    oldList.parentElement.appendChild(newList);
  }
};

//
// MAIN
//
rhit.main = function () {
  rhit.fbAuthManager = new rhit.FBAuthManager();
  rhit.fbAuthManager.beginListening();
  rhit.myPlansManager = new rhit.MyPlansManager();
  // rhit.myPlansManager.beginListening(updateList());
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
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }
    this.exercisesManager = new rhit.ExercisesManager(planId);
    
    new rhit.PastWorkoutsController();
  }
  if (document.querySelector("#plansPage")) {
    new rhit.MyPlansController();
  }
  if (document.querySelector("#customPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }

    this.exercisesManager = new rhit.ExercisesManager(planId);

    new rhit.CustomPlanController(planId);
  }
  if (document.querySelector("#existingPage")) {
    this.existingPlansManager = new rhit.ExistingPlansManager();
    new rhit.ExistingPlansController();
  }
  if (document.querySelector("#planPage")) {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const planId = urlParams.get("id");

    if (!planId) {
      window.location.href = "/";
    }
    this.singlePlanManager = new rhit.SinglePlanManager(planId);
    new rhit.SinglePlanController(planId);
  }
  if (document.querySelector("#todayPage")) {
    new rhit.TodaysWorkoutController();
  }
};

rhit.main();
