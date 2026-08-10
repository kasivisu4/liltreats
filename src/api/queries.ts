import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addStock,
  adjustStock,
  blockVideoSlot,
  createOrder,
  fetchAllInventoryItems,
  fetchAllOrders,
  fetchAllScoopBookings,
  fetchCustomers,
  fetchDashboardStats,
  fetchIndividualItems,
  fetchInventory,
  fetchInventoryMovements,
  fetchOrders,
  fetchScoopBookings,
  fetchSlots,
  fetchVideoSlots,
  manualDebitStock,
  saveProduct,
  updateDelivery,
  updateOrderStatus,
  type CreateOrderInput,
  type OrderStatus,
} from "./mockApi";

export const queryKeys = {
  slots: ["slots"] as const,
  inventory: ["inventory"] as const,
  orders: ["orders"] as const,
  allOrders: ["allOrders"] as const,
  scoopBookings: ["scoopBookings"] as const,
  allScoopBookings: ["allScoopBookings"] as const,
  videoSlots: (from: string, to: string) => ["videoSlots", from, to] as const,
  individualItems: ["individualItems"] as const,
  allInventoryItems: ["allInventoryItems"] as const,
  inventoryMovements: (itemId?: string) => ["inventoryMovements", itemId ?? "all"] as const,
  customers: ["customers"] as const,
  dashboardStats: ["dashboardStats"] as const,
};

export function useSlots() {
  return useQuery({ queryKey: queryKeys.slots, queryFn: fetchSlots, staleTime: 30_000 });
}

export function useInventory() {
  return useQuery({ queryKey: queryKeys.inventory, queryFn: fetchInventory, staleTime: 60_000 });
}

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: () => fetchOrders() });
}

export function useAllOrders() {
  return useQuery({ queryKey: queryKeys.allOrders, queryFn: fetchAllOrders });
}

export function useScoopBookings() {
  return useQuery({ queryKey: queryKeys.scoopBookings, queryFn: () => fetchScoopBookings() });
}

export function useAllScoopBookings() {
  return useQuery({ queryKey: queryKeys.allScoopBookings, queryFn: fetchAllScoopBookings });
}

export function useVideoSlots(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.videoSlots(from, to),
    queryFn: () => fetchVideoSlots(from, to),
    enabled: !!from && !!to,
    staleTime: 15_000,
  });
}

export function useIndividualItems() {
  return useQuery({ queryKey: queryKeys.individualItems, queryFn: fetchIndividualItems, staleTime: 60_000 });
}

export function useAllInventoryItems() {
  return useQuery({ queryKey: queryKeys.allInventoryItems, queryFn: fetchAllInventoryItems, staleTime: 30_000 });
}

export function useInventoryMovements(itemId?: string) {
  return useQuery({
    queryKey: queryKeys.inventoryMovements(itemId),
    queryFn: () => fetchInventoryMovements(itemId),
  });
}

export function useCustomers() {
  return useQuery({ queryKey: queryKeys.customers, queryFn: fetchCustomers });
}

export function useDashboardStats() {
  return useQuery({ queryKey: queryKeys.dashboardStats, queryFn: fetchDashboardStats, staleTime: 60_000 });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.slots });
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      qc.invalidateQueries({ queryKey: queryKeys.scoopBookings });
      qc.invalidateQueries({ queryKey: queryKeys.allScoopBookings });
      qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useUpdateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      courier,
      trackingNumber,
      trackingUrl,
    }: {
      orderId: string;
      courier: string;
      trackingNumber: string;
      trackingUrl: string;
    }) => updateDelivery(orderId, courier, trackingNumber, trackingUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      qty,
      costPrice,
      note,
    }: {
      itemId: string;
      qty: number;
      costPrice: number;
      note: string;
    }) => addStock(itemId, qty, costPrice, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      qc.invalidateQueries({ queryKey: queryKeys.inventoryMovements() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useManualDebit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      qty,
      reason,
    }: {
      itemId: string;
      qty: number;
      reason: string;
    }) => manualDebitStock(itemId, qty, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      qc.invalidateQueries({ queryKey: queryKeys.inventoryMovements() });
    },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      newQty,
      reason,
    }: {
      itemId: string;
      newQty: number;
      reason: string;
    }) => adjustStock(itemId, newQty, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      qc.invalidateQueries({ queryKey: queryKeys.inventoryMovements() });
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      qc.invalidateQueries({ queryKey: queryKeys.individualItems });
    },
  });
}

export function useBlockVideoSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, blocked }: { slotId: string; blocked: boolean }) =>
      blockVideoSlot(slotId, blocked),
    onSuccess: (_data, vars) => {
      // Invalidate all video slot queries
      qc.invalidateQueries({ queryKey: ["videoSlots"] });
    },
  });
}
