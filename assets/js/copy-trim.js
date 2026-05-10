// Trim trailing whitespace (and the trailing newline that <pre><code> always
// contains) from clipboard writes. The upstream minimal-mistakes copy-code
// button copies `code.innerText`, which on rendered fenced blocks ends with a
// "\n". That extra newline lands in form fields and chat composers as an
// accidental Enter / submission. Wrapping navigator.clipboard.writeText is
// the smallest change that fixes every copy in the site without forking the
// theme JS.
(function () {
  if (!navigator.clipboard || !navigator.clipboard.writeText) return;
  var orig = navigator.clipboard.writeText.bind(navigator.clipboard);
  navigator.clipboard.writeText = function (text) {
    if (typeof text === "string") text = text.replace(/[\r\n]+$/, "");
    return orig(text);
  };
})();
