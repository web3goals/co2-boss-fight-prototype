import Layout from "@/components/layout";
import { FullWidthSkeleton, LargeLoadingButton } from "@/components/styled";
import { BOSS_IMAGES } from "@/constants/bosses";
import { bossContractAbi } from "@/contracts/abi/bossContract";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { theme } from "@/theme";
import { BossUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import {
  Avatar,
  Box,
  CircularProgress,
  circularProgressClasses,
  SxProps,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContractRead, useNetwork } from "wagmi";

/**
 * Page with a boss.
 */
export default function Boss() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();

  /**
   * Define uri and uri data
   */
  const { data: uri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.boss,
    abi: bossContractAbi,
    functionName: "tokenURI",
    args: [BigInt(id as string)],
  });
  const { data: uriData } = useUriDataLoader<BossUriData>(uri);

  return (
    <Layout maxWidth="sm">
      {uriData ? (
        <>
          <BossDescription id={Number(id)} uriData={uriData} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function BossDescription(props: {
  id: number;
  uriData: BossUriData;
  sx?: SxProps;
}) {
  const currentHealth = 3200; // TODO: Define real data

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Avatar
        sx={{
          width: 264,
          height: 264,
          borderRadius: 5,
          background: theme.palette.divider,
        }}
        src={BOSS_IMAGES[props.uriData.image]}
      >
        <Typography fontSize={48}>👾</Typography>
      </Avatar>
      <Typography variant="h4" fontWeight={700} mt={2}>
        👾 {props.uriData.name}
      </Typography>
      <Typography mt={1}>
        The boss who damages the environment in{" "}
        <strong>{props.uriData.location}</strong>
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          background: "#FFFFFF",
          border: "solid",
          borderColor: theme.palette.divider,
          borderWidth: 3,
          borderRadius: 8,
          px: 3,
          pt: 2,
          pb: 1,
          mt: 2,
        }}
      >
        {/* Health progress bar */}
        <Box sx={{ position: "relative" }}>
          <CircularProgress
            variant="determinate"
            sx={{ color: theme.palette.divider }}
            size={78}
            thickness={4}
            value={100}
          />
          <CircularProgress
            variant="determinate"
            value={(currentHealth / props.uriData.health) * 100}
            disableShrink
            sx={{
              color: "#000000",
              animationDuration: "550ms",
              position: "absolute",
              left: 0,
              [`& .${circularProgressClasses.circle}`]: {
                strokeLinecap: "round",
              },
            }}
            size={78}
            thickness={4}
          />
        </Box>
        {/* Health label */}
        <Stack direction="column" alignItems="center">
          <Typography fontWeight={700}>
            {currentHealth} / {props.uriData.health}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Emitted CO2
          </Typography>
        </Stack>
      </Stack>
      {/* Share button */}
      <Link href={`/bosses/share/${props.id}`}>
        <LargeLoadingButton variant="outlined" sx={{ mt: 3 }}>
          Share
        </LargeLoadingButton>
      </Link>
    </Box>
  );
}
