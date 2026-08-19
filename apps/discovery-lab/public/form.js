const form = document.getElementById("signup");
const alertEl = document.getElementById("form-alert");
const success = document.getElementById("form-success");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  alertEl.hidden = true;

  const name = form.elements.namedItem("name");
  if (!(name instanceof HTMLInputElement) || name.value.trim().length < 2) {
    alertEl.hidden = false;
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  form.hidden = true;
  success.hidden = false;
});

document.getElementById("show-invalid").addEventListener("click", () => {
    alertEl.hidden = false;
    success.hidden = true;
    form.hidden = false;
  });