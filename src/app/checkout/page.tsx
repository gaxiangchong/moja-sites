import { redirect } from "next/navigation";
import { MEMBER_APP_URL } from "@/lib/appLinks";

export default function CheckoutPage() {
  redirect(MEMBER_APP_URL);
}
