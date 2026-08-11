/**
 * queries.ts — React Query hooks for all data fetching.
 *
 * ALL functions now call the real MongoDB backend via realApi.ts.
 * mockApi.ts is kept as a reference but is no longer called here.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput, OrderStatus } from "./mockApi";
import {
  fetchOrdersReal,
  fetchAllOrdersReal,
  createOrderReal,
  updateOrderStatusReal,
  updateDeliveryReal,
  cancelOrderReal,
  fetchVideoSlotsReal,
  blockVideoSlotReal,
  addVideoSlotReal,
  deleteVideoSlotReal,
  reserveVideoSlotReal,
  releaseVideoSlotReal,
  fetchVideoAvailabilityReal,
  fetchVideoConfigReal,
  fetchIndividualItemsReal,
  fetchAllInventoryItemsReal,
  fetchInventoryMovementsReal,
  addStockReal,
  manualDebitStockReal,
  adjustStockReal,
  saveProductReal,
  fetchDashboardStatsReal,
  fetchScoopBookingsReal,
  fetchAllScoopBookingsReal,
  fetchCustomersReal,
  fetchScoopConfigsReal,
  fetchCategoriesReal,
  fetchNotificationsReal,
  markNotificationReadReal,
} from "./realApi";

// ── Query keys ────────────────────────────────────────────────────────────────

export const queryKeys = {
  orders: ["orders"] as const,
  allOrders: ["allOrders"] as const,
  scoopBookings: ["scoopBookings"] as const,
  allScoopBookings: ["allScoopBookings"] as const,
  videoSlots: (from: string, to: string) => ["videoSlots", from, to] as const,
  videoAvailability: (from: string, to: string) => ["videoAvailability", from, to] as const,
  videoConfig: ["videoConfig"] as const,
  individualItems: ["individualItems"] as const,
  allInventoryItems: ["allInventoryItems"] as const,
  inventoryMovements: (itemId?: string) => ["inventoryMovements", itemId ?? "all"] as const,
  customers: ["customers"] as const,
  dashboardStats: ["dashboardStats"] as const,
  scoopConfigs: ["scoopConfigs"] as const,
  categories: ["categories"] as const,
  notifications: ["notifications"] as const,
};

// ── Orders ────────────────────────────────────────────────────────────────────

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: fetchOrdersReal,
    retry: 1,
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: queryKeys.allOrders,
    queryFn: fetchAllOrdersReal,
    retry: 1,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrderReal(input as Parameters<typeof createOrderReal>[0]),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      void qc.invalidateQueries({ queryKey: queryKeys.scoopBookings });
      void qc.invalidateQueries({ queryKey: queryKeys.allScoopBookings });
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatusReal(orderId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
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
    }) => updateDeliveryReal(orderId, courier, trackingNumber, trackingUrl),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      cancelOrderReal(orderId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

// ── Video Slots ───────────────────────────────────────────────────────────────

export function useVideoSlots(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.videoSlots(from, to),
    queryFn: () => fetchVideoSlotsReal(from, to),
    enabled: !!from && !!to,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useVideoAvailability(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.videoAvailability(from, to),
    queryFn: () => fetchVideoAvailabilityReal(from, to),
    enabled: !!from && !!to,
    staleTime: 15_000,
    retry: 1,
  });
}

export function useVideoConfig() {
  return useQuery({
    queryKey: queryKeys.videoConfig,
    queryFn: fetchVideoConfigReal,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useBlockVideoSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, blocked }: { slotId: string; blocked: boolean }) =>
      blockVideoSlotReal(slotId, blocked),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["videoSlots"] });
      void qc.invalidateQueries({ queryKey: ["videoAvailability"] });
    },
  });
}

export function useAddVideoSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, startTime, endTime }: { date: string; startTime: string; endTime?: string }) =>
      addVideoSlotReal(date, startTime, endTime),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["videoSlots"] });
      void qc.invalidateQueries({ queryKey: ["videoAvailability"] });
    },
  });
}

export function useDeleteVideoSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => deleteVideoSlotReal(slotId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["videoSlots"] });
      void qc.invalidateQueries({ queryKey: ["videoAvailability"] });
    },
  });
}

export function useReserveVideoSlot() {
  return useMutation({
    mutationFn: (slotId: string) => reserveVideoSlotReal(slotId),
  });
}

export function useReleaseVideoSlot() {
  return useMutation({
    mutationFn: (reservationId: string) => releaseVideoSlotReal(reservationId),
  });
}

// ── Individual Items / Inventory ──────────────────────────────────────────────

export function useIndividualItems() {
  return useQuery({
    queryKey: queryKeys.individualItems,
    queryFn: fetchIndividualItemsReal,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAllInventoryItems() {
  return useQuery({
    queryKey: queryKeys.allInventoryItems,
    queryFn: fetchAllInventoryItemsReal,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useInventoryMovements(itemId?: string) {
  return useQuery({
    queryKey: queryKeys.inventoryMovements(itemId),
    queryFn: () => fetchInventoryMovementsReal(itemId),
    retry: 1,
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
    }) => addStockReal(itemId, qty, costPrice, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: ["inventoryMovements"] });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useManualDebit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, qty, reason }: { itemId: string; qty: number; reason: string }) =>
      manualDebitStockReal(itemId, qty, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: ["inventoryMovements"] });
    },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, newQty, reason }: { itemId: string; newQty: number; reason: string }) =>
      adjustStockReal(itemId, newQty, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: ["inventoryMovements"] });
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveProductReal,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: queryKeys.individualItems });
    },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: fetchDashboardStatsReal,
    staleTime: 60_000,
    retry: 1,
  });
}

// ── Scoop Bookings ────────────────────────────────────────────────────────────

export function useScoopBookings() {
  return useQuery({
    queryKey: queryKeys.scoopBookings,
    queryFn: fetchScoopBookingsReal,
    retry: 1,
  });
}

export function useAllScoopBookings() {
  return useQuery({
    queryKey: queryKeys.allScoopBookings,
    queryFn: fetchAllScoopBookingsReal,
    retry: 1,
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function useCustomers() {
  return useQuery({
    queryKey: queryKeys.customers,
    queryFn: fetchCustomersReal,
    retry: 1,
  });
}

// ── Scoop Configs ─────────────────────────────────────────────────────────────

export function useScoopConfigs() {
  return useQuery({
    queryKey: queryKeys.scoopConfigs,
    queryFn: fetchScoopConfigsReal,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategoriesReal,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotificationsReal,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationReadReal(notificationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

// ── Legacy stubs (kept for any route files still importing these names) ────────
// These redirect to real backend equivalents.

export { useVideoSlots as useSlots };
