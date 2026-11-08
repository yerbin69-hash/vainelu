"use client";
import { useEffect, useState } from "react";
import { products, money } from "../../lib/domain";
export default function Admin() {
  const [orders, setOrders] = useState<any[]>([]),
    [quotes, setQuotes] = useState<any[]>([]),
    [drafts, setDrafts] = useState(products),
    [closed, setClosed] = useState(""),
    [saved, setSaved] = useState("");
  useEffect(() => {
    setOrders(JSON.parse(localStorage.getItem("vainelu-orders") || "[]"));
    setQuotes(JSON.parse(localStorage.getItem("vainelu-quotes") || "[]"));
    setDrafts(
      JSON.parse(localStorage.getItem("vainelu-catalog-drafts") || "null") ||
        products,
    );
    setClosed(localStorage.getItem("vainelu-closed") || "");
  }, []);
  return (
    <>
      <div className="demo">
        Administración demo local · Sin cuentas, cobros ni datos reales
      </div>
      <main className="page">
        <a className="brand" href="/">
          Vainelú
        </a>
        <h1>El obrador</h1>
        <p>
          Solo datos de este navegador. Este panel público es una simulación: no
          concede permisos en Supabase.
        </p>
        <div role="status">{saved}</div>
        <div className="admin-grid">
          <section>
            <h2>Pedidos de demostración</h2>
            {!orders.length && <p>Aún no hay simulaciones.</p>}
            {orders.map((o) => (
              <article key={o.id}>
                <strong>
                  {o.id.slice(0, 8)} · {money(o.total)}
                </strong>
                <p>
                  {o.date} · {o.status}
                </p>
                <select
                  aria-label={`Estado del pedido ${o.id.slice(0, 8)}`}
                  value={o.status}
                  onChange={(e) => {
                    const next = orders.map((x) =>
                      x.id === o.id ? { ...x, status: e.target.value } : x,
                    );
                    setOrders(next);
                    localStorage.setItem(
                      "vainelu-orders",
                      JSON.stringify(next),
                    );
                    setSaved(
                      "Estado demo guardado. No se ha realizado ningún reembolso.",
                    );
                  }}
                >
                  {[
                    "Confirmado · simulación",
                    "En preparación",
                    "Listo",
                    "Entregado",
                    "Cancelado",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </article>
            ))}
          </section>
          <section>
            <h2>Solicitudes de presupuesto</h2>
            {!quotes.length && <p>No hay solicitudes demo.</p>}
            {quotes.map((q) => (
              <article key={q.id}>
                <b>
                  {q.date} · {q.servings} raciones
                </b>
                <p>{q.description}</p>
                <p>{q.email}</p>
                <label>
                  Estado
                  <select
                    value={q.status || "Pendiente"}
                    onChange={(e) => {
                      const next = quotes.map((x) =>
                        x.id === q.id ? { ...x, status: e.target.value } : x,
                      );
                      setQuotes(next);
                      localStorage.setItem(
                        "vainelu-quotes",
                        JSON.stringify(next),
                      );
                    }}
                  >
                    <option>Pendiente</option>
                    <option>En revisión</option>
                    <option>Cerrada</option>
                  </select>
                </label>
              </article>
            ))}
          </section>
          <section>
            <h2>Catálogo · borradores locales</h2>
            <p>
              Permite preparar cambios. Publicación y precios canónicos se
              mantienen en config/catalogo.demo.json hasta conectar la
              persistencia administrativa.
            </p>
            {drafts.map((p, i) => (
              <article key={p.id}>
                <label>
                  Nombre
                  <input
                    value={p.name}
                    onChange={(e) =>
                      setDrafts((c) =>
                        c.map((x, j) =>
                          j === i ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    value={p.description}
                    onChange={(e) =>
                      setDrafts((c) =>
                        c.map((x, j) =>
                          j === i ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
                {p.variants.map((v, k) => (
                  <label key={v.id}>
                    {v.label} · precio en céntimos
                    <input
                      type="number"
                      min={1}
                      value={v.price_cents}
                      onChange={(e) =>
                        setDrafts((c) =>
                          c.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  variants: x.variants.map((a, b) =>
                                    b === k
                                      ? {
                                          ...a,
                                          price_cents: Math.max(
                                            1,
                                            Number(e.target.value),
                                          ),
                                        }
                                      : a,
                                  ),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
              </article>
            ))}
            <button
              onClick={() => {
                localStorage.setItem(
                  "vainelu-catalog-drafts",
                  JSON.stringify(drafts),
                );
                setSaved("Borradores guardados; no se han publicado cambios.");
              }}
            >
              Guardar borradores
            </button>
          </section>
          <section>
            <h2>Disponibilidad demo</h2>
            <p>
              80 raciones por día. Puedes cerrar días para las simulaciones de
              este navegador.
            </p>
            <label>
              Fechas cerradas (AAAA-MM-DD, separadas por comas)
              <textarea
                value={closed}
                onChange={(e) => setClosed(e.target.value)}
              />
            </label>
            <button
              onClick={() => {
                localStorage.setItem("vainelu-closed", closed);
                setSaved("Cierres demo guardados en este navegador.");
              }}
            >
              Guardar cierres
            </button>
            <p>
              Sin reserva transaccional compartida en demo. El esquema SQL
              prepara el bloqueo por día para el modo conectado.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
