import Layout from "@/components/layout";
import {
  CardBox,
  FullWidthSkeleton,
  LargeLoadingButton,
} from "@/components/styled";
import { BOSS_IMAGES } from "@/constants/bosses";
import { CO2_G_PER_KM } from "@/constants/co2";
import { bossContractAbi } from "@/contracts/abi/bossContract";
import useError from "@/hooks/useError";
import useToasts from "@/hooks/useToast";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { theme } from "@/theme";
import { BossUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { saveBossFightRecord } from "@/utils/co2storage";
import { calculateDistance } from "@/utils/geo";
import {
  Avatar,
  Box,
  CircularProgress,
  circularProgressClasses,
  SxProps,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Stack } from "@mui/system";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";

/**
 * Page with a boss.
 */
export default function Boss() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const isAlive = true; // TODO: Define real data

  /**
   * Define uri and uri data
   */
  const { data: uri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.boss,
    abi: bossContractAbi,
    functionName: "tokenURI",
    args: [id ? BigInt(id as string) : BigInt(0)],
    enabled: id !== undefined,
  });
  const { data: uriData } = useUriDataLoader<BossUriData>(uri);

  return (
    <Layout maxWidth="sm">
      {uriData ? (
        <>
          <BossDescription id={Number(id)} uriData={uriData} />
          {isConnected && isAlive && (
            <BossTrackMovement
              id={Number(id)}
              uriData={uriData}
              sx={{ mt: 4 }}
            />
          )}
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

function BossTrackMovement(props: {
  id: number;
  uriData: BossUriData;
  sx?: SxProps;
}) {
  const router = useRouter();
  const { dev } = router.query;
  const { address } = useAccount();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();
  const [isTracking, setIsTracking] = useState<boolean | undefined>();
  const [isSavingTracking, setIsSavingTracking] = useState<boolean>(false); // TODO: Use it
  const [tracker, setTracker] = useState<NodeJS.Timeout | undefined>();
  const [currentPosition, setCurrentPosition] = useState<
    GeolocationPosition | undefined
  >();
  const [previousPosition, setPreviousPosition] = useState<
    GeolocationPosition | undefined
  >();
  const [distance, setDistance] = useState(0.0);

  async function startTracking() {
    try {
      setIsTracking(true);
      const tracker = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentPosition(position);
          },
          (error) => {
            handleError(new Error(error.message), true);
          }
        );
      }, 3_000);
      setTracker(tracker);
    } catch (error: any) {
      handleError(error, true);
      setIsTracking(false);
    }
  }

  async function stopTracking() {
    try {
      setIsSavingTracking(true);
      clearTimeout(tracker);
      await saveBossFightRecord(
        props.id.toString(),
        props.uriData.image,
        props.uriData.name,
        props.uriData.location,
        props.uriData.health,
        address as `0x${string}`,
        distance,
        distance * CO2_G_PER_KM
      );
      showToastSuccess("You successfully damaged the boss");
      // TODO: Update boss health and fighters data
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setDistance(0.0);
      setTracker(undefined);
      setIsSavingTracking(false);
      setIsTracking(false);
    }
  }

  /**
   * Update distance using position
   */
  useEffect(() => {
    if (currentPosition && previousPosition) {
      if (dev) {
        setDistance(distance + 0.42);
      } else {
        setDistance(
          distance +
            calculateDistance(
              currentPosition.coords.latitude,
              currentPosition.coords.longitude,
              previousPosition.coords.latitude,
              previousPosition.coords.longitude
            )
        );
      }
    }
    setPreviousPosition(currentPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition]);

  return (
    <CardBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h6" textAlign="center">
        <strong>🛰️ Track your movement</strong> using{" "}
        <strong>alternative transportation</strong> to defeat the boss
      </Typography>
      {!isTracking && (
        <Typography variant="body2" textAlign="center" mt={1}>
          1 km reduces CO2 emissions by {CO2_G_PER_KM}g
        </Typography>
      )}
      {isTracking ? (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          mt={2}
          sx={{ background: grey[200], pr: 4, borderRadius: "78px" }}
        >
          <LargeLoadingButton
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isSavingTracking}
            onClick={() => stopTracking()}
          >
            Stop
          </LargeLoadingButton>
          <Stack alignItems="center">
            <Typography variant="body2" fontWeight={700}>
              {distance.toFixed(2)} km / {(distance * CO2_G_PER_KM).toFixed(2)}{" "}
              g CO2
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You’ve tracked (reduced)
            </Typography>
          </Stack>
        </Stack>
      ) : (
        <LargeLoadingButton
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSavingTracking}
          onClick={() => startTracking()}
        >
          Start
        </LargeLoadingButton>
      )}
    </CardBox>
  );
}
