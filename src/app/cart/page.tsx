import { redirect } from "next/navigation";
import { MEMBER_APP_URL, ORDERING_ENABLED } from "@/lib/appLinks";

export default function CartPage() {
  redirect(ORDERING_ENABLED ? MEMBER_APP_URL : "/shop");
}
