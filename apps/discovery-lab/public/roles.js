const COOKIE = "lab-role";

function getRole() {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.split("=")[1];
}

function setRole(role) {
  if (role) document.cookie = `${COOKIE}=${role}; path=/`;
  else document.cookie = `${COOKIE}=; path=/; max-age=0`;
  render();
}

function render() {
  const role = getRole();
  const signedOut = document.getElementById("signed-out");
  const signedIn = document.getElementById("signed-in");
  const label = document.getElementById("role-label");
  const deleteAll = document.getElementById("delete-all");
  const manageUsers = document.getElementById("manage-users");

  if (!role) {
    label.textContent = "Signed out";
    signedOut.hidden = false;
    signedIn.hidden = true;
    return;
  }

  label.textContent = role === "admin" ? "Signed in as Admin" : "Signed in as Employee";
  signedOut.hidden = true;
  signedIn.hidden = false;
  deleteAll.hidden = role !== "admin";
  manageUsers.hidden = role !== "admin";
}

document.querySelectorAll("[data-role]").forEach((btn) => {
  btn.addEventListener("click", () => setRole(btn.getAttribute("data-role")));
});

document.getElementById("sign-out").addEventListener("click", () => setRole(null));

render();