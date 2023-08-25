import Layout from "@/components/layout";
import { LargeLoadingButton } from "@/components/styled";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

/**
 * Page with bosses.
 */
export default function Bosses() {
  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        ⚔️ Choose a boss to fight
      </Typography>
      <Typography textAlign="center" mt={1}>
        or create one that emit CO2 and damage the environment in your city
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <Link href="/bosses/create">
          <LargeLoadingButton variant="contained">
            Create Boss
          </LargeLoadingButton>
        </Link>
      </Box>
      <Typography>...</Typography>
    </Layout>
  );
}
