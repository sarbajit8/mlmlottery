import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { drawSlotsApi } from '@/api/drawSlots';
import { seriesApi } from '@/api/series';
import { ticketsApi } from '@/api/tickets';
import { customersApi } from '@/api/customers';
import { salesApi } from '@/api/sales';
import { apiErrorMessage } from '@/api/axiosClient';
import { useCartStore } from '@/store/cartStore';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/store/toastStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReceiptModal } from './ReceiptModal';
import { formatCurrency, todayIso } from '@/utils/format';
import { IconCart, IconSearch, IconTicket, IconX } from '@/components/ui/icons';
import type { SaleResult } from '@/types/api';

export function SellTicketsPage() {
  const [drawDate, setDrawDate] = useState(todayIso());
  const [drawSlotId, setDrawSlotId] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const cart = useCartStore();
  const [customer, setCustomer] = useState({ name: '', mobile: '', whatsapp: '', email: '' });
  const [saleResult, setSaleResult] = useState<SaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: slots } = useQuery({ queryKey: ['draw-slots'], queryFn: drawSlotsApi.list, refetchInterval: 30000 });
  const { data: seriesList } = useQuery({ queryKey: ['series'], queryFn: seriesApi.list });

  const openSlots = slots ?? [];

  useEffect(() => {
    if (drawSlotId && drawDate) cart.setContext(Number(drawSlotId), drawDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawSlotId, drawDate]);

  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ['ticket-search', drawSlotId, drawDate, seriesId, debouncedSearch],
    queryFn: () =>
      ticketsApi.search({
        drawSlotId: Number(drawSlotId),
        drawDate,
        seriesId: seriesId ? Number(seriesId) : undefined,
        q: debouncedSearch || undefined,
        pageSize: 60,
      }),
    enabled: Boolean(drawSlotId && drawDate),
  });

  const debouncedMobile = useDebounce(customer.mobile, 500);
  useEffect(() => {
    if (debouncedMobile.length < 6) return;
    customersApi.lookup(debouncedMobile).then((found) => {
      if (found) setCustomer((c) => ({ ...c, name: found.name, whatsapp: found.whatsapp ?? '' }));
    });
  }, [debouncedMobile]);

  const totalSem = cart.items.reduce((sum, t) => sum + Number(t.semValue), 0);
  const totalAmount = cart.items.reduce((sum, t) => sum + Number(t.price), 0);

  const saleMut = useMutation({
    mutationFn: () => salesApi.create({ ticketIds: cart.items.map((t) => t.id), customer }),
    onSuccess: (result) => {
      setSaleResult(result);
      cart.clear();
      setCustomer({ name: '', mobile: '', whatsapp: '', email: '' });
      setError(null);
    },
    onError: (err) => {
      setError(apiErrorMessage(err));
      toast.error(apiErrorMessage(err));
    },
  });

  const selectedSlot = openSlots.find((s) => s.id === Number(drawSlotId));
  const slotIsSellable = selectedSlot?.status === 'OPEN_NOW';

  return (
    <div>
      <PageHeader title="Sell Tickets" description="Search available tickets, build a cart, and complete the sale." />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormField label="Draw Date">
          <Input type="date" value={drawDate} onChange={(e) => setDrawDate(e.target.value)} />
        </FormField>
        <FormField label="Draw Slot">
          <Select value={drawSlotId} onChange={(e) => setDrawSlotId(e.target.value)}>
            <option value="">Select slot</option>
            {openSlots.map((s) => (
              <option key={s.id} value={s.id} disabled={s.status === 'CLOSED' || s.status === 'DRAW_DONE'}>
                {s.name} — {s.status.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Series">
          <Select value={seriesId} onChange={(e) => setSeriesId(e.target.value)}>
            <option value="">All series</option>
            {seriesList?.filter((s) => s.status === 'ACTIVE').map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {drawSlotId && !slotIsSellable && (
        <p className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          This slot is currently {selectedSlot?.status.replace('_', ' ').toLowerCase()}. Sales are only accepted while a slot is "Open Now".
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Available Tickets</CardTitle>
            <div className="relative w-48">
              <IconSearch className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <Input placeholder="Ticket # or last 4" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
          </CardHeader>
          <CardBody>
            {!drawSlotId ? (
              <EmptyState title="Choose a draw date and slot" description="Available tickets will appear here once you select a slot." icon={<IconTicket className="h-8 w-8" />} />
            ) : searching ? (
              <p className="py-8 text-center text-sm text-slate-500">Searching…</p>
            ) : !searchResults?.items.length ? (
              <EmptyState title="No available tickets match" icon={<IconTicket className="h-8 w-8" />} />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {searchResults.items.map((t) => {
                  const inCart = cart.items.some((c) => c.id === t.id);
                  return (
                    <button
                      key={t.id}
                      disabled={inCart || !slotIsSellable}
                      onClick={() => cart.add(t)}
                      className="flex flex-col items-start gap-0.5 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="font-mono text-xs text-slate-200">{t.ticketNumber}</span>
                      <span className="text-[10px] text-slate-500">
                        {t.series?.name} &middot; {formatCurrency(t.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>
              Cart ({cart.items.length}) <IconCart className="ml-1 inline h-4 w-4 align-text-bottom text-emerald-400" />
            </CardTitle>
            {cart.items.length > 0 && (
              <Button size="sm" variant="ghost" onClick={cart.clear}>
                Clear
              </Button>
            )}
          </CardHeader>
          <CardBody>
            {cart.items.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No tickets selected yet.</p>
            ) : (
              <div className="mb-4 max-h-48 space-y-1.5 overflow-y-auto">
                {cart.items.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                    <span className="font-mono text-xs text-slate-200">{t.ticketNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatCurrency(t.price)}</span>
                      <button onClick={() => cart.remove(t.id)} className="text-slate-500 hover:text-red-400">
                        <IconX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1 border-t border-white/8 pt-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Total SEM</span>
                <span>{formatCurrency(totalSem)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-emerald-300">
                <span>Total Payable</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
              <FormField label="Customer Mobile" required>
                <Input required value={customer.mobile} onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })} placeholder="10-digit mobile" />
              </FormField>
              <FormField label="Customer Name" required>
                <Input required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              </FormField>
              <FormField label="WhatsApp (for receipt)">
                <Input value={customer.whatsapp} onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })} placeholder="Defaults to mobile if blank" />
              </FormField>
            </div>

            {error && <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <Button
              accent="emerald"
              className="mt-4 w-full"
              disabled={cart.items.length === 0 || !customer.mobile || !customer.name}
              loading={saleMut.isPending}
              onClick={() => saleMut.mutate()}
            >
              Save Sale &amp; Get WhatsApp Link
            </Button>
          </CardBody>
        </Card>
      </div>

      {saleResult && <ReceiptModal sale={saleResult} onClose={() => setSaleResult(null)} />}
    </div>
  );
}
