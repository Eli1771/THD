  /*
*
*
*
ONLOAD FUNCTIONS
*/

$(document).ready(function() {
  fillScheduleForm();
  activateEntry();
  getDate();
});

/*
*
*
*
*/


/*TO DO LIST
  -make all cells UNselectable... only works in DC for some reason
  -add commenting capabilities to all bookings
  -fix autofill date method so it doesnt' just default to current year
  -WEEK OF date methods adding one extra day to the BANNER
  -add DELETE capabilities to all bookings
  -add select methods to ADDED boarding rooms
  -add special selection methods to added boarding rows
  -fix getDate so that it works with January (index is '00')
*/


//Constructs tables for schedules
//Calls function for each table
let fillScheduleForm = function() {
  fillBoardSchedule();
  fillGroomSchedule();
  fillDaycareSchedule();
}

//adds event listeners to entry TABLES
let activateEntry = function() {
  enterBoard();
  enterGroom();
  enterDC();
}

//fills boarding scedule
let fillBoardSchedule = function() {
  //set column widths
  let boardTable = document.querySelector('#contentOne table');
  boardTable.style = 'width: 100%';
  let cellCount = boardTable.firstElementChild.firstElementChild.childElementCount;
  //hundreds digits for each row
  for (let j = 0; j < 4; j++) {
    //ones digits for each row
    for (let k = 0; k < 6; k++) {
      let row = boardTable.insertRow(-1);
      row.style = 'height: 5vh';
      //insert first cell into row
      let firstCell = row.insertCell(0);
      //construct room number for first cells
      let roomNumber = (j + 1) + '0' + (k + 1);
      firstCell.innerHTML = roomNumber;
      for (let l = 1; l < cellCount; l++) {
        let cell = row.insertCell(l);
        cell.style = 'width: 12.2vw';
        cell.classList.add('selectable');
      }
      if (k == 5) {
        row.style = 'border-bottom: 3px solid black; height: 5vh';
      }
      if (j == 3 && k == 2) {
        row.style = 'border-bottom: 3px solid black; height: 5vh';
      }
    }
  }
  addDCRooms();
  addBoardRooms();
  selectMultipleDates();
}

//add DC rooms to boarding schedule
let addDCRooms = function() {
  //table is all thead
  let table = document.querySelector('#contentOne table').firstElementChild;
  let rooms = ['Big Room', 'Little Room', 'Biscuit\'s room'];
  let cellCount = table.firstElementChild.childElementCount;
  for (let i in  rooms) {
    let row = table.insertRow(-1);
    row.style = 'height: 5vh';
    for (let j = 0; j < cellCount; j++) {
      let cell = row.insertCell(0);
      cell.classList.add('selectable');
    }
    let name = rooms[i];
    row.firstElementChild.innerHTML = name;
    row.firstElementChild.classList.remove('selectable');
  }
}

//method to add rows to board schedule for when we have to get creative
let addBoardRooms = function() {
  let button = document.querySelector('#addBoardRow');
  button.style = 'display: inline;';
  let entry = '<input type = "text" id = "addBoardRow">';
  button.addEventListener('click', function() {
    button.type = 'submit';
    button.innerHTML = 'Submit';
    $(button).before(entry);
    let e = document.querySelector('input#addBoardRow');
    e.style = 'display: inline; width: inherit;';
    e.focus();
    e.addEventListener('blur', function() {
      //if input is empty onblur, revert to addRow buttons
      //else, create row w/ input as label
      let v = e.value;
      if (v.length > 0) {
        let table = document.querySelector('#contentOne table').firstElementChild;
        let cellCount = table.firstElementChild.childElementCount;
        let row = table.insertRow(-1);
        row.style = 'height: 5vh';
        let label = row.insertCell(0);
        label.innerHTML = e.value;
        for (let i = 1; i < cellCount; i++) {
          let c = row.insertCell(i);
          c.classList.add('selectable');
        }
      }
      //no matter what, once you blur input button reverts and input dissapears
      //note: THERE IS NO EVENT LISTENER ON SUBMIT BUTTON. it's a trick.
      $(e).remove();
      button.type = 'button';
      button.innerHTML = 'Add Row';
      selectMultipleDates();
    });
  });
}

//adds listener to board sch so you can select a group of cells
let selectMultipleDates = function() {
  let cells = document.querySelectorAll('#contentOne .selectable');
  for (let i = 0; i < cells.length; i++) {
    let c = cells[i];
    c.addEventListener('mousedown', function() {
      autofillBoardKennel(c);
      //first romove all other green cells
      let current = document.querySelectorAll('#contentOne .awaitingEntry');
      for (let j = 0; j < current.length; j++) {
        current[j].classList.remove('awaitingEntry');
        current[j].classList.add('selectable');
      }
      //then mark starting cell, as everything is based on its position
      c.classList.add('boardEntryStart');
      c.classList.add('awaitingEntry');
      c.classList.remove('selectable');
      let row = c.parentElement.children;
      let index = c.cellIndex;
      //loop to the right and check other cells for existing content
      let overlap;
      for (let l = index; l < row.length; l++) {
        if (row[l].childElementCount != 0) {
          overlap = l;
          break;
        }
      }
      //grabbing all cells in ALL rows to the right of selected cell
      for (let j = index - 1; j < cells.length; j++) {
        let n = cells[j];
        let nIndex = n.cellIndex;
        if (nIndex >= index) {
          n.addEventListener('mouseover', mouseOverCells);
          n.classList.add('boardingCellFeild')
        }
      }
      //kill event listener AND classes applied @ mouseup
      document.addEventListener('mouseup', function() {
        let currentAll = document.querySelectorAll('#contentOne .boardingCellFeild');
        let currentStart = document.querySelector('#contentOne .boardEntryStart');
        if (currentStart != undefined) {
          currentStart.classList.remove('boardEntryStart');
        }
        for (let k = 0; k < currentAll.length; k++) {
          let eventCell = currentAll[k];
          eventCell.removeEventListener('mouseover', mouseOverCells);
        }
        autofillBoardDates();
      });
    });
  }
}

//creates a feild of cells (right of initial) to be hovered over
let mouseOverCells = function() {
  let cell = document.querySelector('#contentOne .boardEntryStart');
  let i = cell.cellIndex;
  let n = this.cellIndex;
  let row = cell.parentElement.children;
  //first romove all other green cells
  let current = document.querySelectorAll('#contentOne .awaitingEntry');
  for (let j = 0; j < current.length; j++) {
    current[j].classList.remove('awaitingEntry');
    current[j].classList.add('selectable');
  }
  //grabs ONLY cells BETWEEN mouse position and first clicked cell
  for (let k = i; k <= n; k++) {
    let s = row[k];
    s.classList.add('awaitingEntry');
    s.classList.remove('selectable');
  }
}

//click a board cell, and this autofills the kennel designation i.e 300/200/400
let autofillBoardKennel = function(c) {
  let size = document.querySelector('#contentOne select');
  let cell = c;
  let kennel = cell.parentElement.children[0].innerHTML;
  if (kennel[0] == '1') {
    size.value = '100';
  } else if (kennel[0] == '2') {
    size.value = '200';
  } else if (kennel[0] == '3') {
    size.value = '300';
  } else if (kennel[0] == '4') {
    let lastNum = parseInt(kennel[2]);
    if (lastNum > 3) {
      size.value = '400 (bottom)';
    } else {
      size.value = '400 (top)';
    }
  } else {
    size.value = 'D/C Room';
  }
}

//enter board bookings
let enterBoard = function() {
  let s = document.querySelectorAll('#contentOne input')[6];
  let inputs = document.querySelectorAll('#contentOne input');
  s.addEventListener('click', function() {
    let lName = inputs[0].value;
    let fName = inputs[1].value;
    //cells are all the blue selected cells
    let cells = document.querySelectorAll('#contentOne .awaitingEntry');
    let sCell = cells[0];
    let eCell;
    if (cells.length == 1) {
      eCell = sCell.parentElement.children[sCell.cellIndex + 1];
    } else {
      eCell = cells[cells.length - 1];
      for (let i = 1; i < cells.length - 1; i++) {
        cells[i].innerHTML = fName;
      }
    }
    sCell.innerHTML = '<div class = "splitBoardCell"></div><img src = "Images/leftBracket.png"><div class = "splitBoardCell filledBoardCell">'
    + fName + '<br>' + lName + '</div>';
    eCell.innerHTML = '<div class = "splitBoardCell filledBoardCell">p/u <br>' + fName +
    '</div><img src = "Images/rightBracket.png"><div class = "splitBoardCell"></div>';
    //now clear the inputs
    for (let j = 0; j < inputs.length - 1; j++) {
      let input = inputs[j];
      if (input.type == 'text' || input.type == 'date') {
        input.value = '';
      }
    }
    document.querySelector('#contentOne select').value = '300';
    for (let k = 0; k < cells.length; k++) {
      cells[k].classList.remove('awaitingEntry');
    }
  });
}

//fills Grooming Schedules
let fillGroomSchedule = function() {
  //first, shorten columns that contain times
  let groomTables = document.querySelectorAll('#contentTwo table');
  groomTables.style = 'width: 50%';
  for (let i = 0; i < groomTables.length; i++) {
    if (groomTables[i].classList.contains("schedule")) {
      let groomTable = groomTables[i];
      let cellCount = groomTable.firstElementChild.firstElementChild.childElementCount;
      for (let j = 0; j < cellCount; j++) {
        let cell = groomTable.firstElementChild.firstElementChild.children[j];
        if (cell.innerHTML == 'Time') {
          cell.style = 'width: 4vw';
        } else {
          cell.style = 'width: 10.4vw';
        }
      }
      //then add 14 rows
      for (let j = 0; j < 14; j++) {
        let row = groomTable.insertRow(1);
        row.style = 'height: 8vh';
        for (let k = 0; k < cellCount; k++) {
          let cell = row.insertCell(0);
          //add event listener to TIME columns
          if (k == 1 || k == 3 || k == 5) {
            cell.addEventListener('dblclick', editValue);
          } else {
            cell.classList.add('selectable');
          }
        }
      }
    }
  }
  fillBathTimes();
  addGroomer();
  selectGroomCell();
}

//just pre-fills the norm. bath times on each table
let fillBathTimes = function() {
  let tables = document.querySelectorAll('#contentTwo table');
  let bTimes = [9, 10, 11, 12, 1, 2, 'Small <br> 3'];
  //query selector grabs the input tables too, loop stops at index 1
  for (let i = 0; i < 2; i++) {
    //tables have no body, only thead
    let table = tables[i].firstElementChild;
    for (let j = 0; j < bTimes.length; j++) {
      //the cell we need is at index 4
      let row = table.children[j + 1];
      let time = '<p>' + bTimes[j] + '</p>';
      row.children[4].innerHTML = time;
    }
  }
}

//addEventListener to add groomer NAME
let addGroomer = function() {
  let b = document.querySelectorAll('button.assignGroomer');
  let input = '<input type = "text">';
  for (let i = 0; i < 4; i++) {
    let button = b[i];
    button.addEventListener('click', function() {
      let container = button.parentElement;
      container.innerHTML = input;
      let field = container.firstElementChild;
      field.focus();
      field.addEventListener('blur', assignValue);
      defaultGroomTimes(container);
    });
  }
}

//add default groom times when a groomer's name is added
let defaultGroomTimes = function(c) {
  let column = $(c).index() - 1;
  let times = [9, 9, 10, 11, 12, 1, 'Small <br> 1'];
  let table = c.parentElement.parentElement;
  //loop through times and add one to each row based on the column index
  for (let i = 0; i < times.length; i++) {
    //index is i + 1 because we need to skip the top row
    let row = table.children[i + 1];
    row.children[column].innerHTML = '<p>' + times[i] + '</p>';
  }
}

//select a cell/date by clicking chart in groom schedule
let selectGroomCell = function() {
  let cells = document.querySelectorAll('#contentTwo .selectable');
  for (let i = 0; i < cells.length; i++) {
    let c = cells[i];
    //event listener changes cell class to 'awaitingEntry'
    c.addEventListener('click', function() {
      let current = document.querySelector('#contentTwo td.awaitingEntry');
      if (current != undefined) {
        current.classList.remove('awaitingEntry');
        current.classList.add('selectable');
      }
      c.classList.remove('selectable');
      c.classList.add('awaitingEntry');
    });
  }
}

//activates groom entry tables
let enterGroom = function() {
  let inputs = document.querySelectorAll('#contentTwo input');
  let s = inputs[6];
  s.addEventListener('click', function() {
    let c = document.querySelector('#contentTwo td.awaitingEntry');
    if (c == undefined) {
      alert('Please select appointment block')
    } else {
      let first = ' ' + inputs[0].value + '</p>';
      let last = '<p>' + inputs[1].value;
      let breed = '<p>' + inputs[2].value + '</p>';
      let numA = '<p>' + inputs[3].value + '</p>';
      let numB = '<p>' + inputs[4].value + '</p>';
      c.innerHTML = last + first + breed + numA + numB;
      for (let i = 0; i < inputs.length - 1; i++) {
        inputs[i].value = '';
      }
      let allPs = c.children;
      for (let i = 0; i < allPs.length; i++) {
        let p = allPs[i];
        p.style = 'margin: inherit';
      }
      c.addEventListener('dblclick', editValue);
    }
    c.classList.remove('awaitingEntry');
  });
  //to do: add a coments section and a hover box that contains Comments
  //also, format phone numbers
}

//fills out daycare schedule
let fillDaycareSchedule = function() {
  let dcTable = document.querySelector('#contentThree table');
  dcTable.style = 'width: 100%';
  let colCount = dcTable.firstElementChild.firstElementChild.children.length;
  for (let i = 0; i < 25; i++) {
    let row = dcTable.insertRow(-1);
    //first cell of each row needs to be numbered
    let firstCell = row.insertCell(0);
    firstCell.innerHTML = i + 1;
    for (let j = 1; j < colCount; j++) {
      let cell = row.insertCell(j);
      cell.style = 'width: 12.5vw; height: 6vh;';
    }
  }
  selectDCCell();
}

//allows you to select date for dc entry
let selectDCCell = function() {
  let table = $('#contentThree table')[0].firstElementChild;
  let rows = table.children;
  let cells = document.querySelectorAll('#contentThree table.schedule td:not(:first-child):not(:last-child), #contentThree table.schedule th:not(:first-child):not(:last-child)');
  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i];
    let index = cell.cellIndex;
    //FIX: table heads not highlighting
    cell.addEventListener('mouseover', function() {
      //loop through the ROWS and add class to cell w/ index in each
      for (let j = 0; j < rows.length; j++) {
        let r = rows[j];
        r.children[index].classList.add('selectCol');
      }
    });
    //grabs all cells with highlight class and removes that class
    cell.addEventListener('mouseout', function() {
      let highlighted = document.querySelectorAll('.selectCol');
      for (let k = 0; k < highlighted.length; k++) {
        highlighted[k].classList.remove('selectCol');
      }
    });
    //FOR ACTUALLY SELECTING
    cell.addEventListener('click', function() {
      let current = document.querySelectorAll('.colAwaiting');
      let highlighted = document.querySelectorAll('.selectCol');
      if (current.length != 0) {
        for (let l = 0; l < current.length; l++) {
          let cur = current[l];
          cur.classList.remove('colAwaiting');
        }
      }
      for (let m = 0; m < highlighted.length; m++) {
        let h = highlighted[m];
        h.classList.remove('selectCol');
        h.classList.add('colAwaiting');
      }
    });
  }
}

//add dog to dc schedule
let enterDC = function() {
  let inputs = document.querySelectorAll('#contentThree input');
  let s = inputs[4];
  let size = document.querySelector('#contentThree select');
  s.addEventListener('click', function() {
    let side = 0;
    let first = inputs[1].value;
    let last = inputs[0].value;
    let string = first + '<br>' + last;
    if (size.value == 'Littles') {
      side = 1;
    }
    let col = document.querySelectorAll('.colAwaiting');
    //parse the highlighted column to find first unoccupied row
    for (let i = 1; i < col.length; i++) {
      let cell = col[i];
      //if it's not broken into divs it's totally empty: break into
      //divs and occupy proper cell
      if (!cell.hasChildNodes()) {
        let d = '<div class = "dcSchedDiv"></div>';
        $(cell).append(d);
        $(cell).append(d);
        cell.children[side].innerHTML = string;
        break;
      } else {
        //if it IS broken up, check the proper side for content
        if (!cell.children[side].innerHTML.length > 0) {
          let c = cell.children[side];
          c.innerHTML = string;
          break;
        }
      }
    }
    inputs[1].value = '';
    inputs[0].value = '';
    size.value = 'Bigs';
    for (let j = 0; j < col.length; j++) {
      col[j].classList.remove('colAwaiting');
    }
  });
}







/*DATE METHODS
*
*
*
*
*/

//need function to gather current date and assign it throughout
//the PAGE
let getDate = function() {
  let d = new Date();
  //uncomment below to alter date vvv
  //d.setDate(d.getDate() + 4);
  let today = d.toDateString();
  let m = d.getTime();
  today = today.substring(0, today.length - 5) + ',' + today.substring(today.length - 5);
  document.querySelector('#dateTime h3').innerHTML = today;
  boardDates(d);
  dcDates(d);
  groomDates(d);
}

//addDate to Boarding
let boardDates = function(date) {
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let bRow = document.querySelector('div#contentOne table tr');
  //the week's dates will be offset by where we are in the week
  //subtract DATE by WEEKDAY index to get first value.
  let dayOfWeek = date.getDay();
  let dayOfMonth = date.getDate();
  date.setDate(dayOfMonth - dayOfWeek);
  //set week of values
  let start = months[date.getMonth()] + ' ' + date.getDate();
  //remember that table rows have start with a blank cell
  //and end with a comments column
  for (let i = 1; i < bRow.children.length; i++) {
    //set Date to next day at END of loop
    //after loop, reset date to actual day (for safety)
    let bCell = bRow.children[i];
    let d = date.getDate();
    let m = months[date.getMonth()];
    let string = ' ' + d;
    bCell.innerHTML += string;
    date.setDate(d + 1);
  }
  let end = months[date.getMonth()] + ' ' + date.getDate();
  date.setDate(dayOfMonth);
  document.querySelectorAll('.dateNav h4')[0].innerHTML = 'Week of ' + start + ' - ' + end;
}

//addDate to dayCare
let dcDates = function(date) {
  //SEE PREVIOUS FUNCTIONS FOR NOTES
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let dcRow = document.querySelector('div#contentThree table tr');
  //remember this week starts on monday
  let dayOfWeek = date.getDay() - 1;
  let dayOfMonth = date.getDate();
  //if current day is sunday, numbers will need to be backed up by another WEEKDAY
  if (dayOfWeek != -1) {
    date.setDate(dayOfMonth - dayOfWeek);
  } else {
    date.setDate(dayOfMonth - 6);
  }
  //set week of values
  let start = months[date.getMonth()] + ' ' + date.getDate();
  for (let i = 1; i < dcRow.children.length; i++) {
    let dcCell = dcRow.children[i];
    let d = date.getDate();
    let m = months[date.getMonth()];
    let string = ' ' + d;
    dcCell.innerHTML += string;
    date.setDate(d + 1);
  }
  let end = months[date.getMonth()] + ' ' + date.getDate();
  date.setDate(dayOfMonth);
  document.querySelectorAll('.dateNav h4')[2].innerHTML = 'Week of ' + start + ' - ' + end;
}

//add dates to groom schedules
let groomDates = function(date) {
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novevmer', 'December'];
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let w = days[date.getDay()];
  let m = months[date.getMonth()];
  let d = date.getDate();
  let today = '<div id = "groomSchedDate1">' + w + ', ' + m + ' ' + d + '</div>';
  date.setDate(date.getDate() + 1);
  let w2 = days[date.getDay()];
  let m2 = months[date.getMonth()];
  let d2 = date.getDate();
  let tomorrow = '<div id = "groomSchedDate2">' + w2 + ', ' + m2 + ' ' + d2 + '</div>';
  document.querySelectorAll('.dateNav h4')[1].innerHTML = today + tomorrow;
}

//autofill start date in the board entry div for Boarding
let autofillBoardDates = function() {
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let s = document.querySelectorAll('#contentOne input')[2];
  let e = document.querySelectorAll('#contentOne input')[3];
  let selected = document.querySelectorAll('#contentOne .awaitingEntry');
  let sIndex = selected[0].cellIndex;
  let eIndex = selected[selected.length - 1].cellIndex;
  if (sIndex == eIndex) {
    eIndex += 1;
  }
  //string at top of page w/ WEEK OF
  let week = document.querySelector('#contentOne h4').innerHTML;
  //string at top of column
  let sDay = document.querySelector('#contentOne .schedule tr').children[sIndex].innerHTML;
  let eDay = document.querySelector('#contentOne .schedule tr').children[eIndex].innerHTML;
  let sDayNum = sDay.substring(sDay.length - 2);
  if (sDayNum[0] == ' ') {
    sDayNum = '0' + sDayNum[1];
  }
  let eDayNum = eDay.substring(eDay.length - 2);
  if (eDayNum[0] == ' ') {
    eDayNum = '0' + eDayNum[1];
  }
  let sMonth;
  let eMonth;
  //check to see if week contains 2 months
  let month1 = week.substring(week.indexOf('of') + 3, week.indexOf('of') + 6);
  let month2 = week.substring(week.indexOf('-') + 2, week.indexOf('-') + 5);
  if (month1 != month2 && sDayNum[0] == 0) {
      sMonth = month2;
  } else {
    sMonth = month1
  }
  if (month1 != month2 && eDayNum[0] == 0) {
      eMonth = month2;
  } else {
    eMonth = month1
  }
  let sMonthNum = months.indexOf(sMonth);
  if (sMonthNum < 10) {
    sMonthNum = '0' + sMonthNum;
  }
  let eMonthNum = months.indexOf(eMonth);
  if (eMonthNum < 10) {
    eMonthNum = '0' + eMonthNum;
  }
  //FIX THIS LATER. DEFAULTS TO CURRENT YEAR FOR NOW
  let year = document.querySelector('#dateTime h3').innerHTML;
  let yearNum = year.substring(year.length - 4);
  s.value = yearNum + '-' + sMonthNum + '-' + sDayNum;
  e.value = yearNum + '-' + eMonthNum + '-' + eDayNum;
}







/*UNIVERSAL methods
*
*
*
*
*
REMINDER TO SELF: these editing methods only work if a container is either EMPTY
of if it contains a <p> element, which you are editing. consider while
writing other methods that require editing values
*
*/
//KEEP THESE TOGETHER!!!! vvv
//takes an input and turns it into a <p> element w/ text from inputs
let assignValue = function() {
  if (this.value.length > 0) {
    //class is added so I can select this in a minute
    let p = '<p class = "editing">' + this.value + '</p>';
    let container = this.parentElement;
    $(this).replaceWith(p);
    p = document.querySelector('p.editing');
    p.style = 'margin: 0px';
    p.classList.remove('editing');
    p.addEventListener('dblclick', editValue);
  }
}

//takes CERTAIN <p> elements and converts to a text inputs
let editValue = function(e) {
  //class is added so I can select this in a minute
  let input = '<input type = "text" class = "editing">';
  let p = e.target;
  if (p.hasChildNodes()) {
    $(p).replaceWith(input);
  } else {
    $(p).append(input);
  }
  let field = document.querySelector('input.editing');
  field.focus();
  field.classList.remove('editing');
  field.addEventListener('blur', assignValue);
}
//KEEP THESE TOGETHER!!!! ^^^

//find the index of a node within its parent element
//NOT CURRENTLY USED. Replaced with cellIndex attribute
let indexInParent = function(node) {
  let siblings = node.parentElement.children;
  for (let i = 0; i < siblings.length; i++) {
    let sib = siblings[i];
    if (sib === node) {
      return i;
    }
  }
}
