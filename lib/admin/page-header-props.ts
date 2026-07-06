import { ADMIN_PAGE_META, type AdminPageId } from "./page-meta";

export function adminPageHeaderProps(id: AdminPageId) {
  const meta = ADMIN_PAGE_META[id];
  return {
    title: meta.title,
    description: meta.description,
    whereVisible: "whereVisible" in meta ? meta.whereVisible : undefined,
    helpItems: [...meta.help],
  };
}
