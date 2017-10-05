// Check out https://developer.chrome.com/extensions/optionsV2
// Saves options to chrome.storage.sync.
var save_options = function () {
    chrome.storage.sync.set({}, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 2000);
    });
};
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
var restore_options = function () {
    chrome.storage.sync.get({}, function (items) {
    });
};
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
