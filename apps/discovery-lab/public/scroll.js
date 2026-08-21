const list = document.getElementById("list");
const loadMore = document.getElementById("load-more");
let count = 10;
const max = 20;

function render() {
  list.replaceChildren(
    ...Array.from({ length: count }, (_, i) => {
      const li = document.createElement("li");
      li.textContent = `Item ${i + 1}`;
      return li;
    }),
  );
  loadMore.disabled = count >= max;
}

loadMore.addEventListener("click", () => {
  count = Math.min(count + 10, max);
  render();
});

render();