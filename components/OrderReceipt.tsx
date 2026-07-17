import { money } from "@/lib/format";
import { trackingUrl } from "@/lib/tracking";

type Item = { name: string; sku: string | null; unit_price: number; qty: number };
export type OrderLike = {
  id: string;
  created_at?: string;
  status?: string;
  subtotal?: number;
  freight?: number;
  total?: number;
  ship_name?: string | null;
  ship_company?: string | null;
  ship_address?: string | null;
  ship_city?: string | null;
  ship_state?: string | null;
  ship_zip?: string | null;
  ship_phone?: string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  order_items?: Item[];
};

const STATUS_LABEL: Record<string, string> = {
  submitted: "Order received",
  processing: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
function tone(s?: string) {
  if (s === "delivered" || s === "shipped") return "ok";
  if (s === "processing" || s === "submitted") return "warn";
  if (s === "cancelled") return "mut";
  return "info";
}

export default function OrderReceipt({ order }: { order: OrderLike }) {
  const items = order.order_items ?? [];
  const subtotal = Number(order.subtotal) || items.reduce((s, it) => s + Number(it.unit_price) * it.qty, 0);
  const freight = Number(order.freight) || 0;
  const total = Number(order.total) || subtotal + freight;
  const tax = total - subtotal - freight;
  const track = trackingUrl(order.carrier, order.tracking_number);
  const hasShip = order.ship_name || order.ship_address;
  // Only show money when we actually have it — never fabricate a $0.00 receipt
  // from an order the lookup couldn't fully resolve.
  const hasTotals = order.total != null || items.length > 0;

  return (
    <div className="receipt">
      <div className="receipt-head">
        <div><span className="receipt-lbl">Order</span><b>#{order.id.slice(0, 8).toUpperCase()}</b></div>
        {order.created_at && <div><span className="receipt-lbl">Placed</span>{new Date(order.created_at).toLocaleDateString()}</div>}
        <div><span className="receipt-lbl">Status</span><span className={`pill ${tone(order.status)}`}>{STATUS_LABEL[order.status ?? ""] ?? order.status ?? "—"}</span></div>
      </div>

      {track && (
        <a className="btn btn-line btn-sm receipt-track" href={track} target="_blank" rel="noreferrer">
          Track shipment{order.carrier ? ` · ${order.carrier}` : ""} →
        </a>
      )}

      <div className="receipt-lines">
        {items.length === 0 ? (
          <div className="receipt-line"><span>Line items are on your emailed confirmation.</span></div>
        ) : items.map((it, i) => (
          <div className="receipt-line" key={i}>
            <span>{it.qty} × {it.name}{it.sku ? <em> · {it.sku}</em> : null}</span>
            <span>{money(Number(it.unit_price) * it.qty)}</span>
          </div>
        ))}
      </div>

      {hasTotals && (
        <div className="receipt-totals">
          <div><span>Subtotal</span><b>{money(subtotal)}</b></div>
          <div><span>Freight</span><b>{freight ? money(freight) : "FREE"}</b></div>
          {tax > 0.005 && <div><span>Tax</span><b>{money(tax)}</b></div>}
          <div className="receipt-grand"><span>Total</span><b>{money(total)}</b></div>
        </div>
      )}

      {hasShip && (
        <div className="receipt-ship">
          <span className="receipt-lbl">Ship to</span>
          <div>
            {order.ship_name && <div>{order.ship_name}{order.ship_company ? ` · ${order.ship_company}` : ""}</div>}
            {order.ship_address && <div>{order.ship_address}</div>}
            {(order.ship_city || order.ship_state || order.ship_zip) && <div>{[order.ship_city, order.ship_state].filter(Boolean).join(", ")} {order.ship_zip}</div>}
            {order.ship_phone && <div>{order.ship_phone}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
