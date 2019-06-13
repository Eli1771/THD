/*
*
*
*
ONLOAD FUNCTIONS
*/

$(document).ready(function() {
  filterButton();
});

/*
*
*
*
*/

//add functionality to filter tab so it drops down
let filterButton = function() {
  let b = document.querySelector('#filtersButton');
  let f = document.querySelector('#filters');
  console.log(b);
  b.addEventListener('click', function() {
    if (b.checked) {
      f.style = 'display:inline-block; z-index:1;';
    } else {
      f.style = 'display:none';
    }
  });
}
