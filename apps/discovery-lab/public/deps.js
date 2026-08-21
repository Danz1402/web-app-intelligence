const country = document.getElementById("country");
const stateWrap = document.getElementById("state-wrap");
const provinceWrap = document.getElementById("province-wrap");
const hasCompany = document.getElementById("has-company");
const companyPanel = document.getElementById("company-panel");

function renderCountry() {
  stateWrap.hidden = country.value !== "us";
  provinceWrap.hidden = country.value !== "ca";
}

country.addEventListener("change", renderCountry);

hasCompany.addEventListener("change", () => {
  companyPanel.hidden = !hasCompany.checked;
});

renderCountry();