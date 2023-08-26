import Layout from "@/components/layout";
import { useRouter } from "next/router";

/**
 * Page with a boss.
 */
export default function Boss() {
  const router = useRouter();
  const { id } = router.query;

  return <Layout maxWidth="sm">...</Layout>;
}
