var on = true;
const DISABLED_SWITCH_OP = "0.2";

const SWITCHES = ["power", "difficulty", "topics", "hint", "discussion", "rates", "similar", "container"];
//missing companies


document.addEventListener("DOMContentLoaded", function(){

  for (const s of SWITCHES){
    chrome.runtime.sendMessage({ action: "retreive", elem: s}, function (response) {
      console.log(response);
      document.getElementById(s).checked = response;
    });
  }

  /*
  chrome.runtime.sendMessage({ action: "toggles"}, function(ids){
    console.log('message se', ids);
    for (const i of ids){
        document.getElementById(i).disabled = true;
    }
  });
  */

  connectPowerSwitch("power");
  connectSwitch("difficulty");
  connectSwitch("topics");
  connectSwitch("hint");
  connectSwitch("discussion");
  connectSwitch("rates");
  connectSwitch("similar");
  connectSwitch("container");
  connectSwitch("companies");
    
});




async function send(message) {
  if (message){
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, message);
    // Optional: do something with response
    return response;
  }
}


function connectSwitch(Id){
  if (document.getElementById(Id)){
    document.getElementById(Id).addEventListener("click", function(){
      send({action: Id});
      chrome.runtime.sendMessage({ action: "store", elem: Id});
    });
  }
}

function connectPowerSwitch(Id){
  document.getElementById(Id).addEventListener("click", function(){

    const allinput= document.getElementsByTagName("input");
    for (const elem of allinput){
      
      if (elem && elem.id != "power"){
        if (elem.checked && on){
          elem.checked = false;

        }
        else{
          send({action: elem.id});
        }
        
        elem.disabled = on;
        elem.parentElement.style.opacity == DISABLED_SWITCH_OP ? elem.parentElement.style.opacity = '1': elem.parentElement.style.opacity = DISABLED_SWITCH_OP;
      }
    }
    on = !on;
  });
}