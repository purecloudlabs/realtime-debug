const script = document.createElement('script');
script.src = window.chrome.runtime.getURL('debug.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  script.parentNode.removeChild(script);
};
