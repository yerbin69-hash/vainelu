import Shop from "./shop";
import { requireDemo } from "../lib/domain";
import { loadCatalog } from "../lib/server/catalog";
export default async function Page() {
  try {
    requireDemo();
  } catch {
    return (
      <main className="page">
        <h1>Integración pendiente</h1>
        <p>
          Este modo requiere servicios conectados y verificados. Las ventas
          permanecen desactivadas.
        </p>
      </main>
    );
  }
  try {
    return <Shop products={await loadCatalog()} />;
  } catch {
    return <Shop products={[]} catalogUnavailable />;
  }
}
export const dynamic = "force-dynamic";
