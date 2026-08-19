const tabOverview = document.getElementById("tab-overview");
const tabDetails = document.getElementById("tab-details");
const panelOverview = document.getElementById("panel-overview");
const panelDetails = document.getElementById("panel-details");
const accToggle = document.getElementById("acc-toggle");
const accBody = document.getElementById("acc-body");
const openModal = document.getElementById("open-modal");
const closeModal = document.getElementById("close-modal");
const modal = document.getElementById("modal");

tabOverview.addEventListener("click", () => {
  tabOverview.setAttribute("aria-selected", "true");
  tabDetails.setAttribute("aria-selected", "false");
  panelOverview.hidden = false;
  panelDetails.hidden = true;
});

tabDetails.addEventListener("click", () => {
  tabOverview.setAttribute("aria-selected", "false");
  tabDetails.setAttribute("aria-selected", "true");
  panelOverview.hidden = true;
  panelDetails.hidden = false;
});

accToggle.addEventListener("click", () => {
  const open = accToggle.getAttribute("aria-expanded") === "true";
  accToggle.setAttribute("aria-expanded", String(!open));
  accBody.hidden = open;
});

openModal.addEventListener("click", () => {
  modal.hidden = false;
});
closeModal.addEventListener("click", () => {
  modal.hidden = true;
});