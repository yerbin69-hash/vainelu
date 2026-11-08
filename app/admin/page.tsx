import { requireDemo } from "../../lib/domain";
import Admin from "./panel";
export default function Page() {
  try {
    requireDemo();
    return <Admin />;
  } catch {
    return (
      <main className="page">
        <h1>Acceso no habilitado</h1>
        <p>
          La administración conectada requiere autenticación y autorización
          verificadas. No está disponible en este entorno.
        </p>
      </main>
    );
  }
}
export const dynamic = "force-dynamic";
