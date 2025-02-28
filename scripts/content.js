var DIFF = '.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard';
var TABSCONTAINER = '.mt-6.flex.flex-col.gap-3';
var TABS = '.group.flex.cursor-pointer.items-center.transition-colors.text-label-2.dark\\:text-dark-label-2.hover\\:text-label-1.dark\\:hover\\:text-dark-label-1'
var DISABLED_TAB_D = "M20.293 10.293 L 20.293 15.293 L 4.293 15.293 L 4.293 10.293";
var ENABLED_TAB_D = "M16.293 9.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L12 13.586l4.293-4.293z";
var DISABLED_TAB_OP = "0.3";

var RATES = '.mr-4.flex.items-center.space-x-2\\.5';

var DEL = ".flex.w-full.items-center.justify-between.gap-2.p-1.bg-layer-01.dark\\:bg-layer-01, .ml-4.flex-none";
var HIDE = ".mx-2.flex.items-center.py-\\[11px\\]";

var tabs = new Set(['topics', 'hint', 'companies', "similar", "discussion"]);

// keeps record of all the elements that can be altered (grouped)
// first: list of elements, second: currently shown or not, third: present in document on loading
var options = {
  'difficulty': [[], false, true], 
  'container': [[], false, true],
  'topics': [[], false, false], 
  'rates': [[], false, false], // not in a dic
  'similar': [[], false, false],  // not always there (not in a div, lik ethe acceptanec)
  'hint': [[], false, false], // not always there and not sure about number
  'discussion': [[], false, false],
  'companies': [[], false, false]
  };


// TO DO
// only allow present tab buttons to be pressed (background)
// send message from content to pop up , reponse will be to disable switches

// make sure the problem list side panel does not display diff (this is another tab | text-sd-easy, text-sd-medium, text-sd-hard)
// main problem sets page (need to use a background script) (!!!!)


// companies

// Potential fixes

// make css of pop up better
// neaten up code


// global var
var PS_counter = 0;
var counter = 0;
var extension_on = true;
var mo = new MutationObserver(onMutation);
onMutation([{addedNodes: [document.documentElement]}]);
observe();

console.log(options);

// response to buttons clicked
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse)
  { 
      if (request.action in options){

          if (tabs.has(request.action)){
            var d_path, op, style;
            options[request.action][1] == true ? d_path = DISABLED_TAB_D: d_path = ENABLED_TAB_D
            options[request.action][1] == true ? op = DISABLED_TAB_OP: op = "";
            options[request.action][1] == true ? style = "none": style = '';
            for (const n of options[request.action][0]){
              n.style.pointerEvents = style;
              n.firstElementChild.style.opacity = op;
              var svg_path = n.querySelector(".origin-center.transition-transform").firstElementChild;
              svg_path.setAttribute('d', d_path)
            }
          }
          else{
            for (const n of options[request.action][0]){
              options[request.action][1] == true ? $(n).hide(500): $(n).show(500);
            }
          }

          options[request.action][1] = !options[request.action][1];
      }
      else if (request.action === "refresh_tab") {
        const url = request.url;
        chrome.location.replace(url);
      }
      else if (request.action == "toggles"){
        // ensure user won't be able to press toggles that do nothing
        var ids = [];
        for (const key in options){
          console.log((options[key][0]));
          if (!(options[key][0])){
            ids.push(key);
          }
        }
        sendResponse(".");
        return true;
      }
  
  }
);

// alters elements as they appear when the website is loading
function onMutation(mutations) {
    let stopped;
    for (const {addedNodes} of mutations) {
      for (const n of addedNodes) {
        if (n.tagName) {
            checkElementMatch(n, DIFF, 'difficulty');
            checkElementMatch(n, TABSCONTAINER, 'container');
            checkElementMatchTabs(n);
            
            // temporaray fix for now to get rid of the rates
            checkElementMatch(n, RATES, 'rates');
            checkElementMatch(n, DEL, '');
            checkElementMatchHide(n, HIDE);

        }
      }
    }
    if (stopped) observe();
}
  
function observe() {
    mo.observe(document, {
      subtree: true,
      childList: true,
    });
}   


// Check if an element in the document has a class that we want to alter
// add to a list (optional)
function checkElementMatch(element, classes, listName){
  if (element.matches(classes)){
    stopped = true;
    mo.disconnect();
    if (listName != ""){
      options[listName][0].push(element);
    }
    $(element).hide(0);
    // needs a fix to locat prob set page
  }
  else if (element.firstElementChild && element.querySelector(classes)){
    stopped = true;
    mo.disconnect();
    for (const el of element.querySelectorAll(classes)){
      if (listName != ""){
        options[listName][0].push(el);
      }
      $(el).hide(0);
    }
  }  
}

// temp sol
function checkElementMatchHide(element, classes){
  if (element.matches(classes)){

    stopped = true;
    mo.disconnect();
    if (PS_counter >= 6){
      PS_counter = 0;
    }
    PS_counter++;
    if (PS_counter % 4 == 0|| PS_counter % 5 == 0){
      element.style.visibility = "hidden";
    }
  }
  else if (element.firstElementChild && element.querySelector(classes)){
    stopped = true;
    mo.disconnect();
    for (const el of element.querySelectorAll(classes)){
      if (PS_counter >= 6){
        PS_counter = 0;
      }
      PS_counter++;
      if (PS_counter % 4 == 0 || PS_counter % 5 == 0){
        el.style.visibility = "hidden";
      }
    }
  }  
}

function checkElementMatchTabs(element){
  if (element.matches(TABS)){
    stopped = true;
    mo.disconnect();
    element.style.pointerEvents = "none"
    element.firstElementChild.style.opacity = "0.3"

    var path = element.querySelector(".origin-center.transition-transform").firstElementChild;
    path.setAttribute('d', DISABLED_TAB_D)
    
    var text = element.textContent.split(" ")[0].toLowerCase();

    console.log(text);
    if (tabs.has(text)){
      options[text][0].push(n);
      options[text][2] = true;
    }
  }
  else if (element.firstElementChild && element.querySelector(TABS)){
    stopped = true;
    mo.disconnect();
    for (const el of element.querySelectorAll(TABS)){
      el.style.pointerEvents = "none"
      el.firstElementChild.style.opacity = "0.3"

      var path = el.querySelector(".origin-center.transition-transform").firstElementChild;
      path.setAttribute('d', DISABLED_TAB_D)
      
      var text = el.textContent.split(" ")[0].toLowerCase();

      if (tabs.has(text)){
        options[text][0].push(el);
        options[text][2] = true;
      }
    }
  }  
}

document.addEventListener('click', evt => {
  const a = evt.target.closest('a[href]');
  console.log(a.href);
  if (a) {
    evt.preventDefault();
    chrome.runtime.sendMessage({action: "newtab", url: a.href});
  }
});

document.addEventListener("DOMContentLoaded", function(){
  if (counter < 1){
    chrome.runtime.sendMessage({action: "reset"});
    couter++;
  }
})