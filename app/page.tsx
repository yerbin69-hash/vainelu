import Shop from "./shop";
import { requireDemo } from "../lib/domain";
export default function Page() {
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
  return <Shop />;
}
export const dynamic = "force-dynamic";
