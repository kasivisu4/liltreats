import { useState } from "react";
import { Search, ChevronDown, User, Mail, Phone, Instagram } from "lucide-react";
import { useCustomers, useAllOrders } from "../../api/queries";
import type { Customer } from "../../api/mockApi";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CustomerRow({ customer, orderCount, totalSpend, lastOrder }: {
  customer: Customer;
  orderCount: number;
  totalSpend: number;
  lastOrder: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-line bg-white/70">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] font-serif text-[16px] font-bold text-deep">
          {customer.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-bold text-deep">{customer.name}</span>
            <span className="rounded-lg bg-[#D8F0D8] px-2 py-0.5 text-[10px] font-bold text-[#2A6030]">
              {orderCount} orders
            </span>
          </div>
          <div className="text-[11px] text-ink-mute">{customer.phone} · {customer.email}</div>
        </div>
        <div className="text-right">
          <div className="font-serif text-[16px] font-bold text-deep">
            ₹{totalSpend.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-semibold text-ink-mute">total spent</div>
        </div>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 text-ink-mute transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-4">
          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2.5">
              <Phone size={13} className="flex-shrink-0 text-ink-mute" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">Phone</div>
                <div className="text-[12px] font-bold text-deep">{customer.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2.5">
              <Mail size={13} className="flex-shrink-0 text-ink-mute" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">Email</div>
                <div className="text-[12px] font-bold text-deep truncate">{customer.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2.5">
              <Instagram size={13} className="flex-shrink-0 text-ink-mute" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">Instagram</div>
                <div className="text-[12px] font-bold text-deep">{customer.instagram || "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2.5">
              <User size={13} className="flex-shrink-0 text-ink-mute" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">Member since</div>
                <div className="text-[12px] font-bold text-deep">{fmtDate(customer.joinedAt)}</div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-line bg-white/50 p-3 text-center">
              <div className="font-serif text-[20px] font-bold text-deep">{orderCount}</div>
              <div className="text-[10px] font-bold uppercase text-ink-mute">Orders</div>
            </div>
            <div className="rounded-xl border border-[#B0DEB8] bg-[#E8F4EA] p-3 text-center">
              <div className="font-serif text-[14px] font-bold text-[#2A6030]">
                ₹{totalSpend.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] font-bold uppercase text-ink-mute">Total spent</div>
            </div>
            <div className="rounded-xl border border-line bg-white/50 p-3 text-center">
              <div className="text-[11px] font-bold text-deep">{fmtDate(lastOrder)}</div>
              <div className="text-[10px] font-bold uppercase text-ink-mute">Last order</div>
            </div>
          </div>

          {/* Saved addresses */}
          {customer.addresses.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
                Saved addresses
              </div>
              <div className="space-y-1.5">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start gap-2 rounded-xl bg-white/50 px-3 py-2.5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-deep">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-gold-pale px-1.5 py-[1px] text-[9px] font-bold text-gold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-ink-soft">
                        {addr.building}, {addr.area}, {addr.city} – {addr.pin}
                      </div>
                      <div className="text-[10px] text-ink-mute">{addr.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminCustomersRoute() {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: allOrders = [] } = useAllOrders();
  const [search, setSearch] = useState("");

  const enriched = customers.map((c) => {
    const orders = allOrders.filter((o) => o.customerId === c.id);
    const totalSpend = orders.reduce((s, o) => s + o.total, 0);
    const lastOrder = orders.length > 0
      ? orders.sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0].placedAt
      : null;
    return { customer: c, orderCount: orders.length, totalSpend, lastOrder };
  });

  const filtered = enriched.filter((e) =>
    e.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    e.customer.email.toLowerCase().includes(search.toLowerCase()) ||
    e.customer.phone.includes(search),
  );

  const totalRevenue = enriched.reduce((s, e) => s + e.totalSpend, 0);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Customers</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          {customers.length} customers · ₹{totalRevenue.toLocaleString("en-IN")} total revenue
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-line bg-white/70 p-3 text-center">
          <div className="font-serif text-[20px] font-bold text-deep">{customers.length}</div>
          <div className="text-[10px] font-bold uppercase text-ink-mute">Total</div>
        </div>
        <div className="rounded-2xl border border-[#B0DEB8] bg-[#E8F4EA] p-3 text-center">
          <div className="font-serif text-[14px] font-bold text-[#2A6030]">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-bold uppercase text-ink-mute">Revenue</div>
        </div>
        <div className="rounded-2xl border border-line bg-white/70 p-3 text-center">
          <div className="font-serif text-[14px] font-bold text-deep">
            ₹{customers.length > 0 ? Math.round(totalRevenue / customers.length).toLocaleString("en-IN") : 0}
          </div>
          <div className="text-[10px] font-bold uppercase text-ink-mute">Avg. spend</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-full rounded-xl border border-line bg-white/70 py-2.5 pl-9 pr-3 text-[12px] outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[40px]">👤</div>
          <p className="mt-2 font-serif text-[16px] font-bold text-deep">No customers found</p>
        </div>
      ) : (
        filtered.map(({ customer, orderCount, totalSpend, lastOrder }) => (
          <CustomerRow
            key={customer.id}
            customer={customer}
            orderCount={orderCount}
            totalSpend={totalSpend}
            lastOrder={lastOrder}
          />
        ))
      )}
    </div>
  );
}
