const rows = [
    { name: "Alice", status: "active" },
    { name: "Bob", status: "active" },
    { name: "Carol", status: "inactive" },
    { name: "Dave", status: "active" },
    { name: "Eve", status: "inactive" },
    { name: "Frank", status: "active" },
  ];
  
  const PAGE_SIZE = 3;
  let page = 1;
  let filter = "all";
  
  const tbody = document.getElementById("rows");
  const summary = document.getElementById("summary");
  const statusFilter = document.getElementById("status-filter");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  
  function filtered() {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }
  
  function render() {
    const list = filtered();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
  
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
  
    tbody.replaceChildren(
      ...slice.map((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.name}</td>
          <td>${r.status}</td>
          <td><button type="button">View ${r.name}</button></td>
        `;
        return tr;
      }),
    );
  
    const filterLabel =
      filter === "all" ? "All statuses" : filter === "active" ? "Active only" : "Inactive only";
    summary.textContent = `Page ${page} of ${totalPages} · ${filterLabel}`;
  
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  }
  
  statusFilter.addEventListener("change", () => {
    filter = statusFilter.value;
    page = 1;
    render();
  });
  
  prevBtn.addEventListener("click", () => {
    page -= 1;
    render();
  });
  
  nextBtn.addEventListener("click", () => {
    page += 1;
    render();
  });
  
  render();