const routes = {
    "/": { title: "Discovery Lab — Home", heading: "Home", kind: "full document" },
    "/dashboard": {
      title: "Discovery Lab — Dashboard",
      heading: "Dashboard",
      kind: "spa",
    },
    "/settings": {
      title: "Discovery Lab — Settings",
      heading: "Settings",
      kind: "spa",
    },
  };
  
  function render(pathname) {
    const r = routes[pathname];
    if (!r) return;
    document.title = r.title;
    document.getElementById("view").textContent = r.heading;
    document.getElementById("kind").textContent = r.kind;
  }
  
  document.querySelectorAll('a[data-nav="spa"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState({}, "", a.getAttribute("href"));
      render(location.pathname);
    });
  });
  
  window.addEventListener("popstate", () => render(location.pathname));
  render(location.pathname);