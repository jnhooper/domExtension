// Check out https://developer.chrome.com/extensions/optionsV2

declare var chrome: any;

// Saves options to chrome.storage.sync.
const save_options = () => {
  chrome.storage.sync.set({
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');

    if (status) {
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    }
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restore_options = () => {
  chrome.storage.sync.get({
  }, function(items: Object) {
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
const saveButton = document.getElementById('save');
if (saveButton) {
  saveButton.addEventListener('click', save_options);
}
