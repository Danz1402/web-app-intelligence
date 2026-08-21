document.getElementById("gen-download").addEventListener("click", () => {
    const blob = new Blob(["name,score\nAda,10\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "generated.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  
  document.getElementById("upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const res = await fetch(form.action, { method: "POST", body: new FormData(form) });
    if (!res.ok) return;
    document.getElementById("upload-result").hidden = false;
  });