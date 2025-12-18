(function () {
  const key = "oreya_cookie_consent";
  const banner = document.getElementById("cookie-banner");
  if (!banner) return;
  if (!localStorage.getItem(key)) banner.hidden = false;

  window.acceptCookies = () => { localStorage.setItem(key, "accepted"); banner.hidden = true; };
  window.rejectCookies = () => { localStorage.setItem(key, "rejected"); banner.hidden = true; };
})();
