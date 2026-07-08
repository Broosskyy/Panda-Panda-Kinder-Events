import { adminDynamicView } from "@/lib/admin/dynamic-view";

const PostsView = adminDynamicView(
  () => import("@/components/admin/views/PostsView"),
  "PostsView",
);

export default function AdminPostsPage() {
  return <PostsView />;
}
