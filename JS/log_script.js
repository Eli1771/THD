/*
*
*
*
ONLOAD FUNCTIONS
*/

$(document).ready(function() {
  fillLog();
  allButtons();
  getDate();
});

/*
*
*
*
*/

//add 20? rows to log forms
let fillLog = function() {
  let logTable = document.querySelector('#log');
  let cellCount = logTable.firstElementChild.firstElementChild.childElementCount;
  for (let i = 0; i < 20; i++) {
    let row = logTable.insertRow(1);
    row.style = 'height: 2em;';
    for (let j = 0; j < cellCount; j++) {
      let cell = row.insertCell(0);
    }
  }
}

let allButtons = function() {
  logSubmit();
  contentSlider();
  checkTasks();
  addTask();
}

//add functionality to submit button on log
let logSubmit = function() {
  let s = document.querySelector('div#addEntryLog .s');
  let inputs = document.querySelectorAll('div#addEntryLog tr input');
  let check = inputs[1];
  //format follow-up input
  for (let i = 0; i < inputs.length; i++) {
    let inp = inputs[i];
    if (inp.disabled == true) {
      inp.style = 'background:#929292';
      inp.classList.add('fu');
    }
  }
  s.addEventListener('click', function() {
    //grab data
    let values = []
    values.push(getTime());
    values.push(inputs[0].value);
    values.push(inputs[2].value);
    values.push(inputs[3].value);
    //input to log;
    table = document.querySelector('table#log');
    let row = table.insertRow(1);
    for (let j = 0; j < values.length; j++) {
      let d = row.insertCell(-1);
      d.innerHTML = values[j];
      d.style = 'text-align: center';
    }
    if (inputs[1].checked == true) {
      fuButton();
    }
    clearForm();
  });
  check.addEventListener('click', function() {
    let fuInput = document.querySelector('input.fu');
    if (this.checked == true) {
      fuInput.style = 'background:white';
      fuInput.disabled = false;
    } else {
      fuInput.style = 'background:#929292';
      fuInput.disabled = true;
    }
  });
}

let clearForm = function() {
  //grab inputs and clear them
  let inputs = document.querySelectorAll('input');
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    if (input.type == 'text' || input.type == 'number') {
      input.value = '';
      if (input.classList.contains('fu')) {
        input.disabled = true;
        input.style = 'background:#929292';
      }
    } else if (input.type == 'checkbox') {
      input.checked = false;
    }
  }
}

let fuButton = function() {
  //locate cell
  let cell = document.querySelector('#log').firstElementChild.children[1].children[2];
  let button = ' <input type = "button" name = "fuComplete" class = "fuButton" value = "Complete?">';
  cell.innerHTML += button;
  button = document.querySelector('input.fuButton');
  //add functionality to button
  button.addEventListener('click', function() {
    let c = confirm('Follow up completed?');
    //grab row
    let r = this.parentElement.parentElement;
    let cells = r.children;
    if (c == true) {
      $(this).remove();
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        cell.style = 'background: #dbffc4; text-align: center';
      }
    }
  });
}

//add functionality to the contents window button in the PRICES AND POLICIES div
let contentSlider = function() {
  let check = document.querySelector('input#contentSlider');
  let contentBox = document.querySelector('#policyContentsWindow');
  let links = document.querySelectorAll('#policyContentsWindow a');
  check.addEventListener('click', function() {
    if (check.checked == true) {
      contentBox.style = 'display: inline-block';
    } else {
      contentBox.style = 'display: none';
    }
  });
  //now make an event listener that causes all links to uncheck the box
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    link.addEventListener('click', function() {
      check.checked = false;
      contentBox.style = 'display: none';
    });
  }
}

//add task to checklist
let addTask = function() {
  //the add task button
  let b = document.querySelector('#addTask');
  //the table that you'll be adding the checkbox item to
  let t = document.querySelectorAll('#dailyChecklist table')[1];
  b.addEventListener('click', function() {
    //value of text box
    let v = document.querySelector('#newTask').value;
    let row = t.insertRow(-1);
    let cell = row.insertCell(0);
    let index = t.firstElementChild.children.length;
    let idString = 'miscTask' + index;
    let string = '<input type = "checkBox" class = "task" id = "' + idString + '"><label for = "' + idString + '">' + v + '</label>';
    document.querySelector('#newTask').value = '';
    cell.innerHTML = string;
    checkTasks();
  });
}

//turns rows green in checklist
let checkTasks = function() {
  let tasks = document.querySelectorAll('.task');
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    task.classList.remove('task');
    task.addEventListener('click', function() {
      let c = confirm('Task completed?');
      if (c == true) {
        let row = this.parentElement;
        $(this).remove();
        row.style = 'background: #dbffc4';
      } else {
        this.checked = false;
      }
    });
  }
}

//DATETIME METHODS ONLY
/*
*
*
*
*/

//coll to create a string hh:mm am/pm for current time
let getTime = function() {
  let d = new Date();
  let h = d.getHours();
  let m = d.getMinutes();
  let e = ' AM';
  //format hours
  if (h == 0) {
    h = 12;
  } else if (h > 12) {
    h = h - 12;
    e = ' PM'
  }
  //format minutes
  if (m < 10) {
    m = '0' + m;
  }
  let s = h + ':' + m + e;
  return s;
}

//need function to gather current date and assign it throughout
//the PAGE
let getDate = function() {
  let d = new Date();
  let today = d.toDateString();
  let m = d.getTime();
  //there are 8640000 milliseconds in 24 hurs
  let tomorrow = d.setTime(m + 8640000);
  today = today.substring(0, today.length - 5) + ',' + today.substring(today.length - 5);
  document.querySelector('.dateNav h4').innerHTML = today;
}
