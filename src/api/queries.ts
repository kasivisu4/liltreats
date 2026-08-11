/**
 * queries.ts — React Query hooks wired to mockApi.ts
 * All real backend calls (realApi.ts) will replace these in Module 30 (Supabase/MongoDB).
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSlots,
  fetchOrders,
  fetchAllOrders,
  createOrder,
  updateOrderStatus,
  updateDelivery,
  fetchVideoSlots,
  fetchAllInventoryItems,
  fetchInventoryMovements,
  addStock,
  manualDebitStock,
  adjustStock,
  saveProduct,
  fetchDashboardStats,
  fetchScoopBookings,
  fetchAllScoopBookings,
  fetchCustomers,
  fetchIndividualItems,
  blockVideoSlot,
  type CreateOrderInput,
  type OrderStatus,
} from "./mockApi";

export const queryKeys = {
  slots: ["slots"] as const,
  orders: ["orders"] as const,
  allOrders: ["allOrders"] as const,
  scoopBookings: ["scoopBookings"] as const,
  allScoopBookings: ["allScoopBookings"] as const,
  videoSlots: (from: string, to: string) => ["videoSlots", from, to] as const,
  allInventoryItems: ["allInventoryItems"] as const,
  individualItems: ["individualItems"] as const,
  inventoryMovements: (itemId?: string) => ["inventoryMovements", itemId ?? "all"] as const,
  customers: ["customers"] as const,
  dashboardStats: ["dashboardStats"] as const,
};

// ── Weekly slots (home page tier availability) ────────────────────────────────

export function useSlots() {
  return useQuery({ queryKey: queryKeys.slots, queryFn: fetchSlots, staleTime: 60_000 });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: () => fetchOrders() });
}

export function useAllOrders() {
  return useQuery({ queryKey: queryKeys.allOrders, queryFn: () => fetchAllOrders() });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      void qc.invalidateQueries({ queryKey: queryKeys.scoopBookings });
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
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
    mutationFn: ({ orderId, courier, trackingNumber, trackingUrl }: { orderId: string; courier: string; trackingNumber: string; trackingUrl: string }) =>
      updateDelivery(orderId, courier, trackingNumber, trackingUrl),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allOrders });
      void qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

// ── Video Slots ───────────────────────────────────────────────────────────────

export function useVideoSlots(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.videoSlots(from, to),
    queryFn: () => fetchVideoSlots(from, to),
    enabled: !!from && !!to,
    staleTime: 15_000,
  });
}

export function useBlockVideoSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, blocked }: { slotId: string; blocked: boolean }) =>
      blockVideoSlot(slotId, blocked),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["videoSlots"] });
    },
  });
}

// ── Inventory ─────────────────────────────────────────────────────────────────

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

export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, qty, costPrice, note }: { itemId: string; qty: number; costPrice: number; note: string }) =>
      addStock(itemId, qty, costPrice, note),
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
      manualDebitStock(itemId, qty, reason),
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
      adjustStock(itemId, newQty, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: ["inventoryMovements"] });
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveProduct,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.allInventoryItems });
      void qc.invalidateQueries({ queryKey: queryKeys.individualItems });
    },
  });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({ queryKey: queryKeys.dashboardStats, queryFn: fetchDashboardStats, staleTime: 60_000 });
}

// ── Scoop Bookings ────────────────────────────────────────────────────────────

export function useScoopBookings() {
  return useQuery({ queryKey: queryKeys.scoopBookings, queryFn: () => fetchScoopBookings() });
}

export function useAllScoopBookings() {
  return useQuery({ queryKey: queryKeys.allScoopBookings, queryFn: fetchAllScoopBookings });
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function useCustomers() {
  return useQuery({ queryKey: queryKeys.customers, queryFn: fetchCustomers });
}
