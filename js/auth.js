(function () {
  if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.replace("login.html");
  }
})();
