import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");
const PORT = 3001;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
};

function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const abs = path.join(root, safe);
  if (!abs.startsWith(root)) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  const indexed = path.join(abs, "index.html");
  if (fs.existsSync(indexed)) return indexed;
  return path.join(root, "index.html");
}

http
  .createServer((req, res) => {
    const file = resolveFile(req.url ?? "/");
    if (!file) {
      res.writeHead(403);
      res.end();
      return;
    }
    const ext = path.extname(file);
    res.writeHead(200, { "Content-Type": TYPES[ext] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => {
    console.log(`Discovery Lab http://127.0.0.1:${PORT}`);
  });