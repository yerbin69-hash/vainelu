"use client";
import Gallery from "./gallery";
import { useEffect, useState, useRef } from "react";
import {
  CakeSlice,
  Pencil,
  CalendarDays,
  ShoppingCart,
  Menu,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Line, products, price, money } from "../lib/domain";
import settings from "../config/demo.settings.json";
type Order = {
  id: string;
  token: string;
  date: string;
  slot: string;
  total: number;
  items: ReturnType<typeof price>["items"];
  status: string;
};
export default function Shop() {
  const submitting = useRef(false);
  const [quoteIdea,setQuoteIdea]=useState("");
  const [cart, setCart] = useState<Line[]>([]),
    [ready, setReady] = useState(false),
    [category, setCategory] = useState("Todas"),
    [view, setView] = useState("home"),
    [product, setProduct] = useState(products[0]),
    [variant, setVariant] = useState(products[0].variants[0].id),
    [message, setMessage] = useState(""),
    [quantity, setQuantity] = useState(1),
    [editing, setEditing] = useState(-1),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [dates, setDates] = useState<string[]>([]),
    [date, setDate] = useState(""),
    [slot, setSlot] = useState("demo-pickup-1200"),
    [order, setOrder] = useState<Order | null>(null),
    [menu, setMenu] = useState(false);
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("vainelu-cart") || "[]");
      if (c.length) price(c);
      setCart(c);
    } catch {
      localStorage.removeItem("vainelu-cart");
    }
    setReady(true);
    fetch("/api/demo")
      .then((r) => r.json())
      .then((d) => setDates(d.dates || []));
    const hash = location.hash.slice(1);
    if (hash.startsWith("pedido/")) {
      const [, id, token] = hash.split("/");
      const o = JSON.parse(localStorage.getItem("vainelu-orders") || "[]").find(
        (o: Order) => o.id === id && o.token === token,
      );
      if (o) {
        setOrder(o);
        setView("confirmation");
      } else {
        setError("No hay acceso a este pedido en esta sesión demo.");
        setView("cart");
      }
    }
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("vainelu-cart", JSON.stringify(cart));
  }, [cart, ready]);
  function go(v: string) {
    setView(v);
    setError("");
    setMenu(false);
    window.scrollTo(0, 0);
  }
  function open(p: (typeof products)[number], i = -1) {
    setProduct(p);
    setVariant(i >= 0 ? cart[i].variantId : p.variants[0].id);
    setMessage(i >= 0 ? cart[i].message : "");
    setQuantity(i >= 0 ? cart[i].quantity : 1);
    setEditing(i);
    go("product");
  }
  function add() {
    localStorage.removeItem("vainelu-operation");
    const line = {
      productId: product.id,
      variantId: variant,
      message,
      quantity,
    };
    setCart((c) =>
      editing >= 0 ? c.map((l, i) => (i === editing ? line : l)) : [...c, line],
    );
    setNotice("Tarta añadida a la cesta.");
    go("home");
  }
  const total = cart.length ? price(cart).total : 0;
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: cart, date, slot }),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      if (!date) throw Error("Selecciona la fecha de recogida.");
      const orders: Order[] = JSON.parse(
        localStorage.getItem("vainelu-orders") || "[]",
      );
      const closed = (localStorage.getItem("vainelu-closed") || "")
        .split(",")
        .map((d: string) => d.trim());
      if (closed.includes(date))
        throw Error("La fecha está cerrada. Elige otro día.");
      const used = orders
        .filter((o) => o.date === date && o.status !== "Cancelado")
        .reduce(
          (n, o) =>
            n + o.items.reduce((s, l) => s + l.servings * l.quantity, 0),
          0,
        );
      if (used + data.servings > settings.capacity.daily_limit)
        throw Error("Esa fecha acaba de completarse. Elige otro día.");
      const payload = JSON.stringify({ cart, date, slot });
      let operation = JSON.parse(
        localStorage.getItem("vainelu-operation") || "null",
      );
      if (!operation || operation.payload !== payload) {
        operation = { id: crypto.randomUUID(), payload };
        localStorage.setItem("vainelu-operation", JSON.stringify(operation));
      }
      const previous = orders.find((o) => o.id === operation.id);
      if (previous) {
        setOrder(previous);
        setCart([]);
        location.hash = `pedido/${previous.id}/${previous.token}`;
        go("confirmation");
        return;
      }
      const o: Order = {
        id: operation.id,
        token: crypto.randomUUID() + crypto.randomUUID(),
        date,
        slot,
        total: data.total,
        items: data.items,
        status: "Confirmado · simulación",
      };
      localStorage.setItem("vainelu-orders", JSON.stringify([...orders, o]));
      setOrder(o);
      setCart([]);
      location.hash = `pedido/${o.id}/${o.token}`;
      go("confirmation");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <div className="demo">
        Demostración · No se realizan pedidos, cobros ni envíos reales.
      </div>
      <header>
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            location.hash = "";
            go("home");
          }}
        >
          Vainelú
        </a>
        <button
          className="menu icon"
          aria-label="Abrir navegación"
          onClick={() => setMenu(!menu)}
        >
          <Menu />
        </button>
        <nav className={menu ? "expanded" : ""}>
          <a href="#catalogo" onClick={() => go("home")}>
            Tartas
          </a>
          <button onClick={() => go("quote")}>Personalizadas</button>
          <a href="#pasos" onClick={() => go("home")}>
            Cómo pedir
          </a>
        </nav>
        <button
          className="basket icon"
          onClick={() => go("cart")}
          aria-label={`Cesta, ${count} tartas`}
        >
          <ShoppingCart size={35} />
          <span>{count}</span>
        </button>
      </header>
      <div role="status" className={notice ? "toast" : ""}>
        {notice && (
          <>
            {notice}{" "}
            <button
              onClick={() => {
                setNotice("");
                go("cart");
              }}
            >
              Ver cesta
            </button>
            <button
              className="icon"
              aria-label="Cerrar aviso"
              onClick={() => setNotice("")}
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {view === "home" && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <h1>
                Tu tarta.
                <br />A tu manera.
              </h1>
              <p>Elige tu favorita y ponle tu toque.</p>
              <div className="actions">
                <a className="button" href="#catalogo">
                  Ver tartas
                </a>
                <button className="outline" onClick={() => go("quote")}>
                  Personaliza la tuya
                </button>
              </div>
            </div>
            <img
              className="hero-image"
              src="/images/hero.webp"
              alt="Tarta de pistacho con frambuesas, junto a una porción que muestra su relleno"
            />
          </section>
          <section className="steps" id="pasos" aria-label="Cómo pedir">
            <div>
              <CakeSlice />
              <b>1. Elige tu tarta</b>
            </div>
            <div>
              <Pencil />
              <b>2. Personalízala</b>
            </div>
            <div>
              <CalendarDays />
              <b>3. Elige fecha</b>
            </div>
          </section>
          <section className="catalog" id="catalogo">
            <div className="catalog-head">
              <h2>Encuentra tu favorita</h2>
              <div className="filters">
                {["Todas", "Cumpleaños", "Clásicas", "Personalizadas"].map(
                  (c) => (
                    <button
                      key={c}
                      aria-pressed={category === c}
                      className={category === c ? "active" : ""}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="cards">
              {products
                .filter(
                  (p) =>
                    category === "Todas" ||
                    p.category_ids.includes(
                      category === "Clásicas"
                        ? "clasicas"
                        : category === "Cumpleaños"
                          ? "cumpleanos"
                          : "personalizadas",
                    ),
                )
                .map((p) => (
                  <article key={p.id} className="cake-card">
                    <img
                      src={`/images/${p.slug}.webp`}
                      alt={`Tarta de ${p.name.toLowerCase()} de demostración`}
                    />
                    <div>
                      <h3>{p.name}</h3>
                      <p>
                        Desde{" "}
                        <strong>{money(p.variants[0].price_cents)}</strong>
                      </p>
                      <button onClick={() => open(p)}>Elegir</button>
                    </div>
                  </article>
                ))}
            </div>
            {category === "Personalizadas" && (
              <div className="empty">
                <p>No hay tartas en esta categoría.</p>
                <button onClick={() => setCategory("Todas")}>
                  Ver todas
                </button>{" "}
                <button className="outline" onClick={() => go("quote")}>
                  Solicitar presupuesto
                </button>
              </div>
            )}
          </section>
        <Gallery onQuote={title=>{setQuoteIdea(title?`Me gustaría una tarta inspirada en «${title}».`:"");go("quote");}}/>
          </main>
      )}
      {view === "product" && (
        <main className="page">
          <button className="back" onClick={() => go("home")}>
            <ArrowLeft /> Volver a las tartas
          </button>
          <div className="product">
            <img
              src={`/images/${product.slug}.webp`}
              alt={`Tarta de ${product.name}`}
            />
            <section>
              <h1>{product.name}</h1>
              <p>{product.description}</p>
              <p className="info">
                Ingredientes y alérgenos pendientes de verificar. Producto
                ficticio, no disponible para venta real.
              </p>
              <label>
                Tamaño
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} · {money(v.price_cents)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Mensaje sobre la tarta (opcional)
                <input
                  maxLength={40}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <small>{message.length}/40 caracteres</small>
              </label>
              {message && <p>Vista previa: «{message}»</p>}
              <label>
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                    )
                  }
                />
              </label>
              <button onClick={add}>
                {editing >= 0 ? "Guardar cambios" : "Añadir a la cesta"} ·{" "}
                {money(
                  product.variants.find((v) => v.id === variant)!.price_cents *
                    quantity,
                )}
              </button>
            </section>
          </div>
        </main>
      )}
      {view === "cart" && (
        <main className="page">
          <h1>Tu cesta</h1>
          {!cart.length ? (
            <div className="empty">
              <p>Aún no has elegido tu tarta.</p>
              <button onClick={() => go("home")}>Elegir una tarta</button>
            </div>
          ) : (
            <div className="checkout-grid">
              <section>
                {cart.map((l, i) => {
                  const p = products.find((p) => p.id === l.productId)!;
                  const v = p.variants.find((v) => v.id === l.variantId)!;
                  return (
                    <article className="cart-line" key={i}>
                      <img src={`/images/${p.slug}.webp`} alt="" />
                      <div>
                        <h3>{p.name}</h3>
                        <p>
                          {v.label} · {money(v.price_cents)} / tarta
                        </p>
                        <p>{l.message}</p>
                        <div className="quantity">
                          <button
                            aria-label={`Restar ${p.name}`}
                            onClick={() =>
                              setCart((c) =>
                                c.flatMap((x, j) =>
                                  j === i
                                    ? x.quantity > 1
                                      ? [{ ...x, quantity: x.quantity - 1 }]
                                      : []
                                    : [x],
                                ),
                              )
                            }
                          >
                            <Minus size={16} />
                          </button>
                          <span>{l.quantity}</span>
                          <button
                            aria-label={`Añadir otra ${p.name}`}
                            disabled={l.quantity >= 10}
                            onClick={() =>
                              setCart((c) =>
                                c.map((x, j) =>
                                  j === i
                                    ? { ...x, quantity: x.quantity + 1 }
                                    : x,
                                ),
                              )
                            }
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            className="outline"
                            onClick={() => open(p, i)}
                          >
                            Editar
                          </button>
                          <button
                            className="icon"
                            aria-label={`Eliminar ${p.name}`}
                            onClick={() =>
                              setCart((c) => c.filter((_, j) => j !== i))
                            }
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <strong>{money(v.price_cents * l.quantity)}</strong>
                      </div>
                    </article>
                  );
                })}
                <button className="outline" onClick={() => go("home")}>
                  Seguir eligiendo
                </button>
              </section>
              <form className="summary" onSubmit={checkout}>
                <h2>Fecha y recogida</h2>
                <p>
                  Recogida presencial simulada. Sin dirección real ni reparto.
                </p>
                <label>
                  Fecha
                  <select
                    aria-label="Fecha"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  >
                    <option value="">Elige un día</option>
                    {dates.map((d) => (
                      <option key={d} value={d}>
                        {d.split("-").reverse().join("/")}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Franja
                  <select
                    aria-label="Franja"
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                  >
                    {settings.availability.slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.start_local}–{s.end_local}
                      </option>
                    ))}
                  </select>
                </label>
                <p>
                  48 horas de antelación · hasta 80 raciones por día demo. La
                  disponibilidad se comprueba al simular.
                </p>
                <label>
                  Nombre ficticio
                  <input required defaultValue="Cliente demo" maxLength={80} />
                </label>
                <label>
                  Correo ficticio
                  <input
                    type="email"
                    required
                    defaultValue="cliente@example.test"
                    pattern=".+@.+\.test"
                    title="Usa un correo ficticio terminado en .test"
                  />
                </label>
                <p>
                  Utiliza solo datos ficticios. No se enviarán comunicaciones.
                </p>
                <div className="total">
                  <b>Total demo</b>
                  <strong>{money(total)}</strong>
                </div>
                <p>
                  Sin cargos. Fiscalidad pendiente de configuración comercial.
                </p>
                <label className="check">
                  <input type="checkbox" required /> Entiendo que se simula un
                  pedido sin compra ni cobro.
                </label>
                <button disabled={busy}>
                  {busy ? "Validando…" : "Simular pedido"}
                </button>
              </form>
            </div>
          )}
        </main>
      )}
      {view === "confirmation" && order && (
        <main className="page receipt">
          <CalendarDays size={42} />
          <h1>Pedido de demostración</h1>
          <p className="info">
            Simulación completada. No se ha cobrado ni creado un pedido real.
          </p>
          <h2>{order.status}</h2>
          <p>Referencia demo: {order.id.slice(0, 8).toUpperCase()}</p>
          <p>
            Recogida simulada · {order.date} ·{" "}
            {
              settings.availability.slots.find((s) => s.id === order.slot)
                ?.start_local
            }
          </p>
          {order.items.map((l, i) => (
            <p key={i}>
              {l.quantity} × {l.name} · {l.variant}{" "}
              {l.message && `· «${l.message}»`} — {money(l.total)}
            </p>
          ))}
          <h2>{money(order.total)}</h2>
          <p>
            La consulta se conserva únicamente en este navegador. El enlace
            privado requiere su token y los datos locales; no se comparte entre
            dispositivos.
          </p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(location.href);
              setNotice(
                "Enlace demo copiado. Solo funciona en este navegador.",
              );
            }}
          >
            Copiar enlace privado demo
          </button>{" "}
          <button
            className="outline"
            onClick={() => {
              location.hash = "";
              go("home");
            }}
          >
            Volver al catálogo
          </button>
        </main>
      )}
      {view === "quote" && (
        <main className="page narrow">
          <h1>Una tarta muy tuya</h1>
          <p>
            Cuéntanos tu idea. Los encargos fuera del catálogo requieren
            presupuesto: no tienen precio ni fecha confirmados y no reservan
            capacidad.
          </p>
          <form
            className="summary"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const requests = JSON.parse(
                localStorage.getItem("vainelu-quotes") || "[]",
              );
              localStorage.setItem(
                "vainelu-quotes",
                JSON.stringify([
                  ...requests,
                  { id: crypto.randomUUID(), ...Object.fromEntries(form) },
                ]),
              );
              setNotice(
                "Solicitud demo guardada en este navegador. No se ha enviado ninguna comunicación.",
              );
              go("home");
            }}
          >
            <label>
              Fecha deseada
              <input name="date" type="date" required min={dates[0]} />
            </label>
            <label>
              Raciones orientativas
              <input name="servings" type="number" min={1} max={200} required />
            </label>
            <label>
              Describe tu idea
              <textarea name="description" defaultValue={quoteIdea} required maxLength={1500} rows={5} />
            </label>
            <label>
              Correo ficticio
              <input
                name="email"
                type="email"
                pattern=".+@.+\.test"
                defaultValue="cliente@example.test"
                required
              />
            </label>
            <p>
              Solo datos ficticios. No se adjuntan archivos en esta versión.
            </p>
            <button>Solicitar presupuesto demo</button>
          </form>
        </main>
      )}
      <footer>
        <span>Vainelú</span>
        <p>
          Catálogo demo y fotografías de creaciones · Información comercial, ingredientes y
          alérgenos pendientes.
        </p>
        <a href="/admin">Administración demo</a>
        <details>
          <summary>Privacidad y condiciones de la demostración</summary>
          <p>
            Esta demo almacena la cesta, solicitudes y simulaciones solo en este
            navegador. No introduzcas datos personales. Puedes eliminar los
            datos del sitio desde tu navegador. Las condiciones de venta real
            están pendientes.
          </p>
        </details>
      </footer>
    </>
  );
}
