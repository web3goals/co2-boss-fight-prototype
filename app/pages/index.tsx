import Layout from "@/components/layout";
import { ExtraLargeLoadingButton } from "@/components/styled";
import { Box, Typography } from "@mui/material";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";

/**
 * Landing page.
 */
export default function Landing() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <Layout maxWidth="lg" hideToolbar sx={{ p: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        {/* Left part */}
        <Box sx={{ textAlign: { xs: "center", md: "start" }, mr: { md: 0 } }}>
          <Typography variant="h1" mt={1}>
            Fight the <strong>bosses that emit&nbsp;CO2</strong> and damage the
            environment <strong>in your city</strong>
          </Typography>
          {address ? (
            <Link href={`/bosses`}>
              <ExtraLargeLoadingButton variant="contained" sx={{ mt: 4 }}>
                Let’s go!
              </ExtraLargeLoadingButton>
            </Link>
          ) : (
            <ExtraLargeLoadingButton
              variant="contained"
              sx={{ mt: 4 }}
              onClick={() => openConnectModal?.()}
            >
              Let’s go!
            </ExtraLargeLoadingButton>
          )}
        </Box>
        {/* Right part */}
        <Box width={{ xs: "100%", md: "100%", lg: "100%" }}>
          <Image
            src="/images/pollution.png"
            alt="Pollution"
            width="100"
            height="100"
            sizes="100vw"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
      </Box>
    </Layout>
  );
}
