import { redirect } from "next/navigation";

export default function LegacyBenutzerPage() {
  redirect("/admin/sicherheit/benutzer");
}
