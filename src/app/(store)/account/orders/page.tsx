import type { Metadata } from "next";
import { requireUser } from "@/server/auth-guards";
import { getUserOrders } from "@/server/queries/orders";
import { OrderList } from "@/components/account/order-list";

export const metadata: Metadata = { title: "Order history", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await getUserOrders(user.id);
  return (
    <section aria-labelledby="orders-heading">
      <h2 id="orders-heading" className="sr-only">
        Order history
      </h2>
      <OrderList orders={orders} />
    </section>
  );
}
