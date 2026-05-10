/* Convert kramdown-rendered GitHub-flavored alert syntax into styled
   callouts. Lab markdown uses `> [!IMPORTANT]` / `> [!TIP]` / `> [!NOTE]` /
   `> [!WARNING]` / `> [!CAUTION]` — kramdown renders these as plain
   <blockquote> elements with the literal "[!TYPE]" marker as text. This
   script finds those blockquotes, strips the marker, adds an accent header,
   and tags the element with classes that the stylesheet paints.

   No-ops on blockquotes that don't begin with the marker, so non-alert
   quotes render unchanged.
*/
(function () {
  var TYPES = {
    IMPORTANT: 'important',
    TIP:       'tip',
    NOTE:      'note',
    WARNING:   'warning',
    CAUTION:   'caution'
  };
  var LABELS = {
    important: 'Important',
    tip:       'Tip',
    note:      'Note',
    warning:   'Warning',
    caution:   'Caution'
  };
  var RE = /^\s*\[!(IMPORTANT|TIP|NOTE|WARNING|CAUTION)\]\s*/;

  function convert(bq) {
    if (bq.classList.contains('github-alert')) return; // already processed
    var firstP = bq.querySelector(':scope > p');
    if (!firstP) return;
    var firstNode = firstP.firstChild;
    if (!firstNode || firstNode.nodeType !== Node.TEXT_NODE) return;
    var match = firstNode.nodeValue.match(RE);
    if (!match) return;

    var key = TYPES[match[1].toUpperCase()];
    if (!key) return;

    // Strip the marker from the text node. Markers are typically followed by
    // a newline (kramdown collapses to a leading newline inside the <p>).
    firstNode.nodeValue = firstNode.nodeValue.replace(RE, '');
    if (!firstNode.nodeValue.replace(/^\s+/, '')) {
      // Marker was on its own line — drop the empty text and any leading <br>.
      var next = firstNode.nextSibling;
      firstNode.remove();
      if (next && next.nodeName === 'BR') next.remove();
    } else {
      // Trim leading whitespace left over after marker removal.
      firstNode.nodeValue = firstNode.nodeValue.replace(/^\s+/, '');
    }

    bq.classList.add('github-alert', 'github-alert--' + key);
    var header = document.createElement('div');
    header.className = 'github-alert__header';
    header.textContent = LABELS[key];
    bq.insertBefore(header, bq.firstChild);
  }

  function run() {
    document.querySelectorAll('.page__content blockquote').forEach(convert);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
