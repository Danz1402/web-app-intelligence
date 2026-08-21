document.getElementById("load-data").addEventListener("click", async () => {
    const err = document.getElementById("api-error");
    err.hidden = true;
    try {
      const res = await fetch("/api/data");
      if (!res.ok) {
        err.hidden = false;
      }
    } catch {
      err.hidden = false;
    }
  });
  
  document.getElementById("trigger-error").addEventListener("click", () => {
    throw new Error("Lab client error");
  });