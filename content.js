(function() {
  function log(msg) {
    console.log('JIRA D&D: ' + msg);
  }

  log('init');

  // going through Move SubTask wizard manually as JIRA doesn't provide REST API for that
  if (/MoveSubTaskChooseOperation/.test(location.pathname)) {
    var id = /id=\d+/.exec(location.search),
        to = /to=\S+/.exec(location.search);
    if (to)
      location.href = 'MoveSubTaskParent!default.jspa?' + id + '&' + to;
    return;
  }

  // autofill issue code at this page and proceed to next
  if (/MoveSubTaskParent/.test(location.pathname)) {
    var to = /to=(\S+)/.exec(location.search);
    if (to && to[1]) {
      $('#parentIssue').val(to[1]);
      $('input[type=submit]').click();
    }
    return;
  }

  // we are at the final destination, this page is not needed anymore so asking to kill the tab
  // background page will check if this tab was opened by extension and not by user before killing
  if (/\/browse\/\S+/.test(location.pathname)) {
    chrome.runtime.sendMessage({
      type: 'killmepls'
    });
    return;
  }

  // the rest of this file is the main d&d functionality in Greenhopper Board in Planning view
  (function wait() {
    log('Found board with planning view, initializing');
    var content = $('#ghx-detail-contents');
    if (content.length == 0) {
      log('waiting...')
      setTimeout(wait, 500);
    } else {
      init();
    }
  })();

  function bind() {
    $('#ghx-detail-issue tr.js-subtask-issue').each(function() {
      $(this).draggable({
        cursor: 'move',
        helper: function(event) {
          return $('<div ><table class=aui></table></div>').find('table')
               .append($(event.target).closest('tr').clone())
               .end()
               .appendTo('body');
        }
      });
    });
    $('div.js-issue').droppable({
      hoverClass: "ghx-selected",
      drop: function(event, ui) {
        var elem = ui.helper.find('tr'), 
            fromId = elem.data('issue-id'),
            fromKey = elem.data('issue-key'),
            to = $(this).data('issue-key');
        move(fromId, fromKey, to);
      }
    }) 
  }

  function move(fromId, fromKey, to) {
    log('move ' + fromKey + ' to ' + to);
    // get parent fix version
    $.get('/rest/api/2/issue/' + to + '?fields=fixVersions', function(data) {
      var version = data.fields.fixVersions;
      if (version.length > 0) {
        $.ajax({
          url: '/rest/api/2/issue/' + fromKey,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify({
            "fields": {
              "fixVersions": version
            }
          })
        });
      }
      chrome.runtime.sendMessage({
        from: fromId,
        to: to,
        protocol: location.protocol,
        host: location.host,
        version: version
      });
      $('#ghx-tab-subtasks tr[data-issue-id=' + fromId + ']').hide();
    });
  } 

  function init() {
    log("start binding");
    bind();
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
           bind(); 
        }
      });
    });

    var config = {childList: true, attributes: true, characterData: false};
    observer.observe($('#ghx-detail-contents').get(0), config);
  } 

})();