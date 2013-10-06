var openedTabsIds = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "killmepls") {
      var i = openedTabsIds.indexOf(sender.tab.id);
      if (i > -1) {
        chrome.tabs.remove(sender.tab.id, function() {
          openedTabsIds.splice(i, 1);
        });  
      }
    } else {
      chrome.tabs.create({
        url: request.protocol + '//' + request.host + 
             '/secure/MoveSubTaskChooseOperation!default.jspa?id=' + 
             request.from + '&to=' + request.to,
        active: false
      }, function(tab) {
        openedTabsIds.push(tab.id);
      })
    }
  }
);