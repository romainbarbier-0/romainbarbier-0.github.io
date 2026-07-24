// Makes "Envoyer un mail" reliably open a new email.
// Uses the visitor's default mail client (mailto) when one exists;
// if nothing happens after a moment (no client configured), it opens
// the Gmail compose page in a new tab so a fresh email is always ready.
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href^="mailto:"]');
  if (!a) return;

  var mail = a.getAttribute('href').slice('mailto:'.length).split('?')[0];
  var start = Date.now();

  // If the default mail app opens, the page loses focus — cancel the fallback.
  var cancelled = false;
  var onBlur = function () { cancelled = true; };
  window.addEventListener('blur', onBlur, { once: true });

  setTimeout(function () {
    window.removeEventListener('blur', onBlur);
    if (cancelled) return;
    if (document.hasFocus() && Date.now() - start < 2500) {
      window.open(
        'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(mail),
        '_blank',
        'noopener'
      );
    }
  }, 600);
}, false);

// Phone button: on a phone, tel: places the call directly.
// On desktop (where tel: does nothing useful), copy the number instead
// and show a brief confirmation so the visitor can paste/dial it.
var isMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href^="tel:"]');
  if (!a || isMobile) return; // let the phone place the call

  e.preventDefault();
  var num = a.textContent.trim().replace(/\s+/g, ' ');
  var done = function () {
    var prev = a.getAttribute('data-copied-label') || a.childNodes[0].nodeValue;
    if (!a.getAttribute('data-copied-label')) a.setAttribute('data-copied-label', num);
    a.childNodes[0].nodeValue = 'Numéro copié ✓ ';
    setTimeout(function () { a.childNodes[0].nodeValue = num + ' '; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(num).then(done).catch(function () {});
  }
}, false);
