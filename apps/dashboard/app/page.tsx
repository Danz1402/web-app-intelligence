import { listDiscoverySessions } from "@wai/storage";
import { db } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sessions = await listDiscoverySessions(db());
  return (
    <main>
      <h2>Sessions</h2>
      {sessions.length === 0 ? <p>No sessions yet. Run discover.</p> : null}
      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            <a href={`/sessions/${s.id}`}>
              {s.app_name} — {s.status} — {s.start_url}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}