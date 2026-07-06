import { redirect } from "next/navigation";

export default function SecurityIndexPage() {
  redirect("/admin/sicherheit/benutzer");
}
