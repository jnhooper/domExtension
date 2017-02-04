// Check out https://developer.chrome.com/extensions/optionsV2

// Saves options to chrome.storage.sync.
const save_options = () => {
  var fallbackGracePeriodSeconds = 5;
  var rawTurnNotifierGracePeriodSeconds= document.getElementById('turnNotifierGracePeriodSeconds').value;
  var turnNotifierGracePeriodSeconds = parseInt(rawTurnNotifierGracePeriodSeconds, 10) || fallbackGracePeriod;
  chrome.storage.sync.set({
    turnNotifierGracePeriodSeconds: turnNotifierGracePeriodSeconds
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restore_options = () => {
  chrome.storage.sync.get({
    turnNotifierGracePeriodSeconds: '5'
  }, function(items) {
    document.getElementById('turnNotifierGracePeriodSeconds').value = items.turnNotifierGracePeriodSeconds;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
