const outer = document.getElementById("outer-modal");
const inner = document.getElementById("inner-modal");

document.getElementById("open-outer").addEventListener("click", () => {
  outer.hidden = false;
  inner.hidden = true;
});

document.getElementById("open-inner").addEventListener("click", () => {
  inner.hidden = false;
});

document.getElementById("close-inner").addEventListener("click", () => {
  inner.hidden = true;
});

document.getElementById("close-outer").addEventListener("click", () => {
  inner.hidden = true;
  outer.hidden = true;
});