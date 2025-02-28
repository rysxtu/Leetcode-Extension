var states = {
   "power": true, 
   "difficulty": false , 
   "topics": false,
   "hint": false,
   "discussion" : false,
   "rates" : false,
   "similar" : false,
   "container": false
};
// missing comapnies

const re_problems_page = "(https:\/\/.+problems\/[^\/]*)";
var tabs_url = {};
var current_tab_url;
const website = "leetcode.com";
// need to use tabs to remember


chrome.tabs.onActivated.addListener(function(){
   getCurrentTab().then((result) =>{
      console.log("active", result.url)
      // extension only works if it is a leetcode link
      if (result.url.includes(website)){
         chrome.action.enable()
      }
      else{
         chrome.action.disable();
      }

      // get first group in the regex match (our root url)
      const root_url = Array.from(result.url.matchAll(re_problems_page), m => m[1])[0];
      console.log(root_url, current_tab_url, "activated");
      console.log(root_url);
      current_tab_url = root_url;
      
      if (!(root_url in tabs_url)){
         tabs_url[root_url] = JSON.parse(JSON.stringify(states));
      }
      
      console.log(tabs_url);
   })
});

// might be a bug currently to do with reloading when running code/writing

// think onupdated occurs before on activated
chrome.tabs.onUpdated.addListener(function(){
   getCurrentTab().then((result) => {
      // extension only works if it is a leetcode link
      result.url.includes(website) ? chrome.action.enable() : chrome.action.disable();
      // close pop up on change

      const root_url = Array.from(result.url.matchAll(re_problems_page), m => m[1])[0];
      console.log(root_url, current_tab_url, "reloaded");
      // root_url is not always correct some have /description some dont
      if (root_url != current_tab_url){
         // reload page to ensure elements are hidden properly

         if (current_tab_url){
            chrome.tabs.reload();
         }

         // delete states of the page we left
         delete  tabs_url[current_tab_url];
         current_tab_url = root_url;

         // if a different new page is clicked on, add new states to that page
         if (!(root_url in tabs_url)){
            tabs_url[root_url] = JSON.parse(JSON.stringify(states));
         }
      }

      
      console.log(tabs_url);
    })
});

chrome.tabs.onRemoved.addListener(function(tabid, removed) {
   delete  tabs_url[current_tab_url];
   console.log("closed", current_tab_url);
})
  

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if (message.action == "store") {
      tabs_url[current_tab_url][message.elem] = !tabs_url[current_tab_url][message.elem];
      console.log("store", current_tab_url, tabs_url[current_tab_url]);
   }
   else if (message.action == "retreive"){
      console.log("retreive");
      sendResponse( tabs_url[current_tab_url][message.elem]);
      return true;
   }
   else if (message.action == "newtab"){
      chrome.tabs.create({url: message.url, active: false});
   }
   else if (message.action == "reset"){
      tabs_url[current_tab_url] = JSON.parse(JSON.stringify(states));
   }
});

async function send(message) {
   if (message){
     const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
     const response = await chrome.tabs.sendMessage(tab.id, message);
     // Optional: do something with response
     return response;
   }
}

async function getCurrentTab() {
   let queryOptions = { active: true, lastFocusedWindow: true };
   // `tab` will either be a `tabs.Tab` instance or `undefined`.
   let [tab] = await chrome.tabs.query(queryOptions);
   return tab;
}
