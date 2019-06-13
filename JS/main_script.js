/* ***LINK TESTER***

let testArea = document.querySelector('body');
testArea.addEventListener('click', function() {
  alert('Hello World!');
});

*/

/*
**
*
*
ALL CONSTANTS
*/
//when updating DR form, will replace current value with original
//that matches column in table. called by string of input name??
//COULD I HAVE ACHIEVED THIS WITH ID'S????
const allDRInputs = {
  cust: '<input type = "text" name = "cust">',
  pet: '<input type="text" name="pet">',
  amount: '<input type="number" name="amount">',
  serviceAdd: '<input type="text" name="serviceAdd">',
  amountAdd: '<input type="number" name="amountAdd">',
  total: '<input type="number" name="total">',
  payMethod: '<select name="payMethod"><option>-</option><option value="CA">CA</option><option value="CC">CC</option><option value="CARD">CARD</option><option value="Pre-Pay">P/P</option><option value="Will-Pay">W/P</option><option value="No Charge">N/C</option></select>',
  tipMethod: '<select name="tipMethod"><option value="">-</option><option value="CA">CA</option><option value="CC">CC</option></select>',
  tipAmount: '<input type="number" name="tipAmount">',
  comments: '<input type="text" name="comments">',
  description: '<input type="text" name="description">',
  //what does this do, exactly???
  key: function(n) {
    return this[Object.keys(this)[n]];
  }
};

//when adding service to row, will be used in addServiceDr to autofill and place service into proper
//place service into proper category in dash AND fill out table in correct spot
const addService = {
  bath: [null, 'bath'],
  groom: [null, 'groom'],
  nails: [10, 'bath'],
  gland: [10, 'bath'],
  anal: [10, 'bath']
}
/*
**
*
*
*/


/*
**
*
*
LOAD IN DOCUMENT FUNCTIONS
*/

$(document).ready(function() {
  fillRecapForms();
  //fillDateTime();
  submitDR();
  getDate();
});

/*
**
*
*

/*TO DO LIST
  add Date HEADERS
  add timers to DC customers to determine half or whole day price


ALL ONLOAD DOCUMENTS AND EVENT LISTENERS
FOR HOME PAGE

/*generates rows in daily recap forms*/
let fillRecapForms = function() {
  let recapForms = document.querySelectorAll('.leftSide div table');
  /*parse through JUST the ppwk tables
  (not the buttons table)*/
  for (let i = 0; i < recapForms.length ; i++) {
    let form = recapForms[i];
    let cellCount = form.firstElementChild.firstElementChild.childElementCount;
    /*add a row 24 times*/
    for (let j = 0; j < 24; j++) {
      let row = form.insertRow(2);
      /*and add a cell the appropriate number of times*/
      for (let k = 0; k < cellCount; k++) {
        let cell = row.insertCell(0);
        cell.style = "height: 3vh";
      }
    }
  }
}



/*add event listeners to submit buttons in DR forms*/
let submitDR = function() {
  let buttons = document.querySelectorAll('.submit');
  let forms = document.querySelectorAll('form');
  let tables = document.querySelectorAll('.leftSide table');
  /*sets vars for each table*/
  for (let i = 0; i < buttons.length; i++) {
    let currentRowDR = 1;
    let button = buttons[i];
    let form = forms[i];
    let table = tables[i];
    /*establish variables for single table and add event listener*/
    button.addEventListener('click', function(event) {
      event.preventDefault();
      /*establish number of cells for THIS table*/
      let cellCount = table.lastElementChild.lastElementChild.childElementCount;
      let row = table.insertRow(currentRowDR);
      /*creates an array of inputs pulled from the form. Each index
      is an array, so cells with 2 values has an array of two*/
      let inputs = compInputDR(form, cellCount);
      //check to see if paymethod is p/p
      //ITS BREAKING P/P into paragraphs!!!!!!!
      if (inputs[inputs.length - 3] == 'P/P') {
        //change all num inputs (before paymethod) to P/P
        inputs[inputs.length - 4] = ["P/P"];
        if (inputs.length > 7) {
          alert('Long!');
          inputs[2] = ["P/P"];
        }
      }
      for (let j = 0; j < cellCount; j++) {
        let cell = row.insertCell(j);
        /*this is the array within the larger array of ALL inputs*/
        let input = inputs[j];
        for (let k = 0; k < input.length; k++) {
          if (input[k] != undefined) {
            //text is wrapped in <p> tags so it can be grabbed and replaced
            //in function updateCellDR
            cell.innerHTML += '<p>' + input[k] + '</p>';
            cell.style = 'text-align: center';
          }
        }
      }
      table.deleteRow(-1);
      currentRowDR += 1;
      updateDash();
      revenueColorDR(i, currentRowDR);
      clearFormDR();
    });
  }
}



/*creates an array of arrays of user input for submitDR function*/
/*n is the number of inputs: cellCount from submitDR*/
let compInputDR = function(form, n) {
  let inputs = [];
  let current = form;
  /*parse through each tc in active row*/
  for(let i = 0; i < n; i++) {
    let next = current.nextElementSibling;
    let inputSet = [];
    if (next.classList.contains('stackedInput')) {
      first = next.firstElementChild.value;
      second = next.firstElementChild.nextElementSibling.nextElementSibling.value;
      inputSet.push(first);
      inputSet.push(second);
    } else {
      inputSet.push(next.firstElementChild.value);
    }
    inputs.push(inputSet);
    current = next;
  }
  return inputs;
}



/*clears DR form at the end of event listener*/
let clearFormDR = function() {
  let inputs = document.querySelectorAll('.content input');
  for (let i in inputs) {
    if (inputs[i].type != "submit") {
      inputs[i].value = null;
    }
  }
  let selects = document.querySelectorAll('.content select');
  for (let r in selects) {
    selects[r].value = '-';
  }
  inputs[0].focus();
}

/*updates dashboard by calling 2 functions (revenue and dogs)*/
let updateDash = function() {
  updateDashDogs();
  updateDashMon();
}



/*updates dogCount. takes number that represents current tab*/
//Counts dogs at each submit. WILL NEED EDITS IF NUMBER OF ROWS CHANGES
let updateDashDogs = function() {
  //first change the total by counting ALL p elements from all tables and
  //assigning that number to the total
  let allDogs = 0;
  let dogsInCat = 0;
  //this is index for counting in specific categories
  let category = 1;
  let allEntries = document.querySelectorAll('.leftSide .content tbody tr');
  //grabs the second tc of each row and counts the paragraph elements;
  let rowsLeft = 24;
  for (let i = 0; i < allEntries.length; i++) {
    if (!allEntries[i].classList.contains('activeRow')) {
      allDogs += allEntries[i].children[1].children.length;
      dogsInCat += allEntries[i].children[1].children.length;
      rowsLeft -= 1;
      //else runs when row is .activeRow (meaning you've parse all existing data)
    } else {
      //assign total from table to category in dash
      document.querySelectorAll('#dashboard .content tbody td')[category].innerHTML = dogsInCat;
      //count starting from 0 for other categories
      dogsInCat = 0;
      //switch to next category in dash
      category += 1;
      i += rowsLeft;
      rowsLeft = 24;
    }
  }
  //THIS IS THE ACTUAL VALUE ASSIGNMENT
  document.querySelector('#dashboard .content tbody tr td').innerHTML = allDogs;
}



/*NOTICE::: needs to prevent total expected (and everything else)
from increasing if payMethod = Card, pp, wp, or nc - DON'T FORGET*/
/*takes the index of the table (to determine service)to update dashboard revenue*/
let updateDashMon = function() {
  //declare incrementers
  let totalA = 0;
  let totalE = 0;
  let form = 0;
  let allEntries = document.querySelectorAll('.leftSide .content tbody tr');
  let switches = [0, 1, 4, 3];
  let totalCatA = 0;
  let totalCatE = 0;
  let tipA = 0;
  let tipE = 0;
  let monTable = document.querySelectorAll('#dashboard .content tbody')[1];
  let rowsLeft = 24
  //because of tips, the service categories won't line up w/ tab
  //indexes. Create array of JUST the four main services
  //PARSE ALL TABLES. FIRST - make sure row is not .activeRow
  for (let i = 0; i < allEntries.length; i++) {
    if (!allEntries[i].classList.contains('activeRow')) {
      let rowLength = allEntries[i].children.length;
      //NEXT - check payment METHODS
      //new table data selectors
      let amount = 0;
      let tipAmount = 0;
      if (allEntries[i].children[rowLength - 4].firstElementChild.innerHTML.length > 0) {
        amount = parseInt(allEntries[i].children[rowLength - 4].firstElementChild.innerHTML);
      }
      if (allEntries[i].children[rowLength - 2].lastElementChild.innerHTML.length > 0) {
        tipAmount = parseInt(allEntries[i].children[rowLength - 2].lastElementChild.innerHTML);
      }
      let payMethod = allEntries[i].children[rowLength - 3].firstElementChild.innerHTML;
      let tipMethod = allEntries[i].children[rowLength - 2].firstElementChild.innerHTML;
      if (payMethod == '-' || payMethod == 'CA' || payMethod == 'CC') {
        totalE += amount;
        totalCatE += amount;
      }
      if (payMethod == 'CA' || payMethod == 'CC') {
        totalA += amount;
        totalCatA += amount;
      }
      if (tipMethod == '-' || tipMethod == 'CA' || tipMethod == 'CC') {
        tipE += tipAmount;
        totalE += tipAmount;
      }
      if (tipMethod == 'CA' || tipMethod == 'CC') {
        tipA += tipAmount;
        totalA += tipAmount;
      }
      rowsLeft -= 1;
    } else {
      //assign total for category then jump to next table
      monTable.children[switches[form]].children[2].innerHTML = totalCatE;
      monTable.children[switches[form]].children[1].innerHTML = totalCatA;
      totalCatE = 0;
      totalCatA = 0;
      form += 1;
      i += rowsLeft;
      rowsLeft = 24;
    }
  }
  //assign master totals
  monTable.children[5].children[2].innerHTML = totalE;
  monTable.children[5].children[1].innerHTML = totalA;
  //assign Tips
  monTable.children[2].children[2].innerHTML = tipE;
  monTable.children[2].children[1].innerHTML = tipA;
  dashColor();
}



/*color codes the right half of the table to represent revenue status.
n is the TABLE index and m is the index of the row to be colored*/
let revenueColorDR = function(n, m) {
  /*establish default conditions of table before ANY input*/
  let isPaid = false;
  let isCorrect = true;
  let payMethod = $("[name=payMethod]")[n];
  /*establish field to be colored in the end*/
  let table = document.querySelectorAll('.leftSide table')[n];
  let row = table.lastElementChild.children[m - 2];
  let rowSet = [];
  /*puts all fields except first 2 into the field to be colored*/
  for (let i = 2; i < row.children.length; i++) {
    rowSet.push(row.children[i]);
  }
  /*establish boolean table conditions AFTER input*/
  if (payMethod.value != '-') {
    isPaid = true;
  }
  //checks to see if initial plus additional amounts add up to total
  if (n < 2) {
    let init = $('[name=amount]')[n].value;
    let add = $('[name=amountAdd]')[n].value;
    let total = $('[name=total]')[n].value;
    /*check to see if form field is empty. if so change value to 0*/
    let isItEmpty = [];
    isItEmpty.push(init)
    isItEmpty.push(add)
    isItEmpty.push(total)
    for (let i = 0; i < isItEmpty.length; i++) {
      if (isItEmpty[i] == '') {
        isItEmpty[i] = 0;
      }
      isItEmpty[i] = parseInt(isItEmpty[i]);
    }
    if (isItEmpty[0] + isItEmpty[1] != isItEmpty[2]) {
      isCorrect = false;
    }
  }
  /*assign color bassed on initial 2 booleans*/
  //GREEN
  if (isPaid == true && isCorrect == true) {
    for (let k = 0; k < rowSet.length; k++) {
      rowSet[k].style = 'background-color: #dbffc4';
    }
    //YELLOW
  } else if (isPaid == false && isCorrect == true) {
    for (let k = 0; k < rowSet.length; k++) {
      rowSet[k].style = 'background-color: #fffec4';
    }
    //YELLOW
  } else if (isPaid == false && isCorrect == false) {
    for (let k = 0; k < rowSet.length; k++) {
      rowSet[k].style = 'background-color: #fffec4';
    }
    //RED
  } else {
    for (let k = 0; k < rowSet.length; k++) {
      rowSet[k].style = 'background-color: #ffd6d6';
    }
  }
}



//turn row green in dash > revenue if actual == expected
/*let dashColor = function() {
  let totals = document.querySelectorAll('#dashboard .tab .monCount tbody tr');
  for (let i = 0; i < 6; i++) {
    let row = totals[i];
    let actual = parseInt(row.firstElementChild.nextElementSibling.innerHTML);
    let expected = parseInt(row.firstElementChild.nextElementSibling.nextElementSibling.innerHTML);
    if (actual == expected && expected != 0) {
      row.firstElementChild.nextElementSibling.style = 'color: green';
      row.firstElementChild.nextElementSibling.nextElementSibling.style = 'color: green';
    } else {
      row.firstElementChild.nextElementSibling.style = 'color: black';
      row.firstElementChild.nextElementSibling.nextElementSibling.style = 'color: black';
    }
  }
}*/


//COME BACK TO This
//Function is not grabbing image for some reason
let dashColor = function() {
  //parse each row in tables
  let rows = document.querySelectorAll('#dashboard .content tbody')[1].children;
  for (let i = 0; i < rows.length; i++) {
    let a = rows[i].children[1].innerHTML;
    let e = rows[i].children[2].innerHTML;
    //p is for percentage
    if (e > 0) {
      //find percentage of actual out of totalA
      let p = (a/e) * 100;
      //w is width
      let w = $(rows[i]).width();
      let pixels = w * p;
      //create opaque div over row starting from left
      rows[i].style.backgroundImage = "../Images/green.png";
      rows[i].style.backgroundSize = p + '% 100%';
      rows[i].style.backgroundRepeat = "no-repeat";
    }
  }
}



//create event listeners for all updated fields for future editing
//DOUBLE CLICKING PAY METHODS DEFAULTS TO '-' FOR SOME REASON*****
let updateCellDR = function(cell, name) {
//get all the current cell information
  let allInputs = Object.keys(allDRInputs);
  let i = allInputs.indexOf(name);
  var input = allDRInputs.key(i);
  var secondInput = allDRInputs.key(i + 1);
  //add 2 event listeners, one for each chunk of html (serarated by
  //the <br>!)

  //This ONLY aplies to stacked input
  if (i == 3 || i == 7) {
    let all = cell.innerHTML;
    let value = all.substring(3, all.indexOf('</p>'));
    let secondValue = all.substring(all.indexOf('</p>') + 7, all.length - 4);
    //built input tags for FIRST and SECOND
    let begin = input.substring(0, input.indexOf('>'));
    let middle = ' value = ' + '\"' + value + '\"';
    let end = input.substring(input.indexOf('>'));
    let secondBegin = secondInput.substring(0, secondInput.indexOf('>'));
    let secondMiddle = ' value = ' + '\"' + secondValue + '\"';
    let secondEnd = secondInput.substring(secondInput.indexOf('>'));
    //now construct first and second inputs (to replace the innerHTML
    //to which you are about to add event listeners)
    input = begin + middle + end;
    secondInput = secondBegin + secondMiddle + secondEnd;
    //now add event listeners to each HTML value
    let firstCell = cell.children[0];
    let secondCell = cell.children[1];
    //each event listener will have a SUB event listener to turn
    //input BACK intop <p> element. will also call functions to
    //update form
    firstCell.addEventListener('dblclick', function() {
      firstCell.innerHTML = input;
      let inputNode = firstCell.firstElementChild;
      inputNode.focus();
      inputNode.addEventListener('blur', function() {
        value = inputNode.value;
        firstCell.innerHTML = value;
        //this alows unlimited edits, but it throws a DOM exception error****
        updateCellDR(cell, name);
      });
    });
    secondCell.addEventListener('dblclick', function() {
      secondCell.innerHTML = secondInput;
      let inputNode = secondCell.firstElementChild;
      inputNode.focus();
      inputNode.addEventListener('blur', function() {
        secondValue = inputNode.value;
        secondCell.innerHTML = secondValue;
        //read comment from copied f(x) above
        updateCellDR(cell, name);
      });
    });
    //Same method for NON stacked input
  } else {
    var value = cell.innerHTML.substring(3, cell.innerHTML.length - 4);
    let begin = input.substring(0, input.indexOf('>'));
    let middle = ' value = ' + '\"' + value + '\"';
    let end = input.substring(input.indexOf('>'));
    input = begin + middle + end;
    cell.addEventListener('dblclick', function() {
      cell.innerHTML = input;
      let inputNode = cell.firstElementChild;
      inputNode.focus();
      inputNode.addEventListener('blur', function() {
        value = inputNode.value;
        cell.innerHTML = value;
        //this alows unlimited edits, but it throws a DOM exception error****
        updateCellDR(cell, name);
      });
    });
  }
}

//fills out date for any dateTime elements
let fillDateTime = function() {
//pull dateTime
  let d = new Date();
  let dString = d.toDateString();
}

setInterval(fillDateTime, 1000);

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

/*calls several functions to update all forms, etc. when "resubmitting"*/
/*let resubmitDR = function() {

}*/
