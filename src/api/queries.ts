import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createOrder,
  fetchInventory,
  fetchOrders,
  fetchSlots,
  type CreateOrderInput,
} from "./mockApi";

export const queryKeys = {
  slots: ["slots"] as const,
  inventory: ["inventory"] as const,
  orders: ["orders"] as const,
};

export function useSlots() {
  return useQuery({
    queryKey: queryKeys.slots,
    queryFn: fetchSlots,
    staleTime: 30_000,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: fetchInventory,
    staleTime: 60_000,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: fetchOrders,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: () => {
      // Booking changes slot counts and order history — refetch both.
      qc.invalidateQueries({ queryKey: queryKeys.slots });
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}
