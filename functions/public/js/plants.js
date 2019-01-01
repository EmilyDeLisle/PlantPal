// Modal controls
$("#addPlant").submit(function(e) {
  e.preventDefault();
  if ($("#plantName").val() == "" && $("#datepicker").val() == "") {
    $("#noName").show();
    $("#noDate").show();
    $("#negDate").hide();
  } else if ($("#plantName").val() == "") {
    $("#noName").show();
    $("#noDate").hide();
  } else if ($("#datepicker").val() == "") {
    $("#noName").hide();
    $("#noDate").show();
    $("#negDate").hide();
  } else {
    $("#noName").hide();
    $("#noDate").hide();
    $("#negDate").hide();
    $("#addPlantModal").modal("hide");
    addPlant();
    // retrieveAllPlants();
  }
});

$("#reset").click(function() {
  $("#noName").hide();
  $("#noDate").hide();
  $("#negDate").hide();
});

$("#close").click(function() {
  $("#addPlantModal").modal("hide");
});

$("#add").click(function() {
  $("#plantName").val("");
  $("#datepicker").val("");
  $("#negDate").hide();
  $("#noName").hide();
  $("#noDate").hide();
});

// Enables the datepicker plugin
$(function() {
  $("#datepicker").datepicker();
});

// Enables tooltips
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

var firstRender = true;

// Toggles between the plants overview layout and the calendar layout
$("#calToggle").click(function() {
  $("#plants").toggle();
  $("#calendar").toggle();
  $("#add").toggle();
  if ($("#calButtonText").text() == "Calendar") {
    $("#calToggle").html("<i class='fas fa-leaf'></i> <span id='calButtonText'>Plants</span>");
  } else {
    $("#calToggle").html("<i class='far fa-calendar-alt'></i> <span id='calButtonText'>Calendar</span>");
  }
  // if (firstRender) {
  //   $("#calendar").fullCalendar("render");
  //   firstRender = false;
  // } else {
  //   $("#calendar").fullCalendar("refetchEvents");
  // }
  $("#calendar").fullCalendar("render");
});

// Ensures date chosen is not in the future
$("#datepicker").change(function() {
  $("#noDate").hide();
  var date = $("#datepicker").val();
  if (calculateDays(date) < 0) {
    $("#negDate").show();
    $("#datepicker").val("");
  } else {
    $("#negDate").hide();
  }
});

// Adds a new plant to the calendar and the database
function addPlant() {
  firebase.auth().onAuthStateChanged(function(user){

    // Adds plant to calendar
    var newEvent = {
              title: $("#plantName").val(),
              start: $("#datepicker").val().substr(6, 4) + "-" + $("#datepicker").val().substr(0, 2) + "-" + $("#datepicker").val().substr(3, 2)
            };
            
    $("#calendar").fullCalendar("renderEvent", newEvent);
    
    // Pushes plant to database
    var data = { 
      user: user.uid, 
      plantName: $("#plantName").val(), 
      lastWatered: $("#datepicker").val(),
      daysWatered: [$("#datepicker").val()]
      };

    $.ajax({
      url: "/addPlant",
      type: "GET",
      datatype: "json",
      data: data,
      success: function(response) {
        console.log(response);
        retrieveAllPlants();
      }
    });
  });
};

// Array other functions use to get data
var allPlants;

// Draws list of plants from database and populates page
function retrieveAllPlants(){
  $("#plants").html("<p>Loading...</p>");

  firebase.auth().onAuthStateChanged(function(user){

    var data = { user: user.uid };

    $.ajax({
      url: "/getPlants",
      type: "GET",
      datatype: "json",
      data: data,
      success: function(data) {
        allPlants = data;
        $("#plants").html("<p>Loading...</p>");
        populatePlants();
        createWaterEvents();
        $('#calendar').fullCalendar(caldata);
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
}

retrieveAllPlants();

// Generates a new Date object for today's date
var today = new Date();
var todayMonth = today.getMonth() + 1;
todayMonth = todayMonth.toString();

if (todayMonth.length < 2) {
  todayMonth = "0" + todayMonth;
}

var todayDay = today.getDate();
todayDay = todayDay.toString();

if (todayDay.length < 2) {
  todayDay = "0" + todayDay;
}

var todayString = todayMonth + "/" + todayDay +  "/" + today.getFullYear();

// Calculates the days between the last watered date and today
function calculateDays(date) {
 let wateredDate = new Date(date);
  var timeDiff = today.getTime() - wateredDate.getTime();
  var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
  return diffDays;
}

// Creates a card for each plant and populates the page
function populatePlants() {
  $("#plants").html("");

  var plantsArray = [];

  for (var plant in allPlants) {
    let htmlStr = "<div class='col-sm-4 plantCard'><h3>" + allPlants[plant].plantName + " <span style='display: none' class='plantID'>" + plant + "</span><i class='fas fa-pencil-alt editPlant' style='display: none' data-toggle='tooltip' data-placement='left' title='Edit plant name'></i><i class='fas fa-tint waterPlant' data-toggle='tooltip' data-placement='left' title='Water this plant'></i></h3><p>Last watered: <span class='lastWateredDate'>" + allPlants[plant].lastWatered + "<span></p><p class='days'>";

    let days = calculateDays(allPlants[plant].lastWatered);

    if (days == 0) {
      htmlStr += "Today";
    } else if (days == 1) {
      htmlStr += "Yesterday";
    } else {
      htmlStr += days + " days ago";
    }

    htmlStr += "</p></div>"

    plantsArray.push(htmlStr);
  }

  // Determines the amount of rows needed for the page
  var totalPlants = Object.keys(allPlants).length;
  var rows = Math.ceil(totalPlants / 3);
  var columns;

  let count = 0;
  for (let i = 0; i < rows; i++) {
    let htmlStr = "<div class='row'>";

    if (totalPlants - count >= 3) {
      columns = 3;
    } else {
      columns = totalPlants - count;
    }
    
    for (let j = 0; j < columns; j++) {
      htmlStr += plantsArray[count];
      count++;
    }
    htmlStr += "</div>";
    $("#plants").append(htmlStr).hide().fadeIn();
  }

  // Displays the edit plant icon when the plant card is hovered over
  // $(".plantCard").hover(
  //   function() {
  //     $(this).find(".editPlant").fadeIn(200);},
  //   function() {
  //     $(this).find(".editPlant").fadeOut(200);}
  // );

  // Updates both the page and the database and changes the last watered date to today's date
  $(".waterPlant").click(function() {
    var plantID = $(this).siblings(".plantID").text();
    waterPlant(plantID);

    var date = $(this).parent().next().find(".lastWateredDate");
    var days = $(this).parent().siblings(".days");

    date.text(todayString).css("color", "#61ED29").animate({"color": "#FFF"}, 700);
    days.text("Today").css("color", "#61ED29").animate({"color": "#FFF"}, 700);

    var newEvent = {
      title: allPlants[plantID].plantName,
      start: todayString.substr(6, 4) + "-" + todayString.substr(0, 2) + "-" + todayString.substr(3, 2)
    }

    if (!checkDuplicateEvents(newEvent)) {
      $("#calendar").fullCalendar("renderEvent", newEvent);
      events.push(newEvent);
    }
  });
}

// Ensures the watering event is only on the calendar once (to protect against extra clicks)
function checkDuplicateEvents(plantEvent) {
  var duplicate = false;
  for (let i = 0; i < events.length; i++) {
    if (events[i].title == plantEvent.title && events[i].start == plantEvent.start) {
      duplicate = true;
    }
  }
  return duplicate;
}

// Updates the database with the new last watered date
function waterPlant(plant) {
  firebase.auth().onAuthStateChanged(function(user){

    var data = {
      user: user.uid,
      date: todayString,
      plantID: plant
    }

    $.ajax({
      url: "/waterPlant",
      type: "GET",
      datatype: "json",
      data: data
    });
  });
}

// Calendar

// Creates array of plant watering date objects for the calendar
var events = [];

function createWaterEvents() {
  for (var plant in allPlants) {
    for (let i = 0; i < allPlants[plant].daysWatered.length; i++) {
      let dateStr = allPlants[plant].daysWatered[i];
      let formattedDate = dateStr.substr(6, 4) + "-" + dateStr.substr(0, 2) + "-" + dateStr.substr(3, 2);

      let waterEvent = {
        title: allPlants[plant].plantName,
        start: formattedDate
      }
      events.push(waterEvent);
    }
  }
}

// Data used to initialize calendar
var caldata = {
          defaultView : "month",
          height: "20em",
          events: events,
          eventLimit: true
        };

// Logout button
$("#logout").click(function() {
  firebase.auth().signOut().then(function() {
    window.location = "/";
  });
});