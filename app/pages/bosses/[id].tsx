import AccountAvatar from "@/components/account/AccountAvatar";
import AccountLink from "@/components/account/AccountLink";
import EntityList from "@/components/entity/EntityList";
import Layout from "@/components/layout";
import {
  CardBox,
  FullWidthSkeleton,
  LargeLoadingButton,
  ThickDivider,
} from "@/components/styled";
import { BOSS_IMAGES } from "@/constants/bosses";
import { CO2_G_PER_KM } from "@/constants/co2";
import { bossContractAbi } from "@/contracts/abi/bossContract";
import { hypercertsContractAbi } from "@/contracts/abi/hypercertsContract";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import useToasts from "@/hooks/useToast";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { theme } from "@/theme";
import { BossFightRecord, BossUriData, ProfileUriData } from "@/types";
import { isAddressesEqual } from "@/utils/addresses";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { getBossFightRecords, saveBossFightRecord } from "@/utils/co2storage";
import { calculateDistance } from "@/utils/geo";
import { prepareHypercertUriData } from "@/utils/hypercerts";
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
import { chain } from "lodash";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

/**
 * Page with a boss.
 */
export default function Boss() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();
  const { handleError } = useError();
  const [fights, setFights] = useState<BossFightRecord[] | undefined>();
  const [currentHealth, setCurrentHealth] = useState<number | undefined>();

  /**
   * Define owner
   */
  const { data: owner } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.boss,
    abi: bossContractAbi,
    functionName: "ownerOf",
    args: [id ? BigInt(id as string) : BigInt(0)],
    enabled: id !== undefined,
  });

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

  /**
   * Function to load fights from co2 storage
   */
  async function loadFights() {
    try {
      setFights(undefined);
      if (id) {
        getBossFightRecords(id as string)
          .then((records) => setFights(records))
          .catch((error) => handleError(error, true));
      }
    } catch (error: any) {
      handleError(error, true);
    }
  }

  /**
   * Define fights
   */
  useEffect(() => {
    loadFights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Define health
   */
  useEffect(() => {
    setCurrentHealth(undefined);
    if (uriData && fights) {
      let currentHealth = uriData.health;
      for (const fight of fights) {
        currentHealth -= fight.co2;
      }
      setCurrentHealth(currentHealth > 0 ? currentHealth : 0);
    }
  }, [uriData, fights]);

  return (
    <Layout maxWidth="sm">
      {owner && uriData && fights && currentHealth !== undefined ? (
        <>
          <BossDescription
            id={Number(id)}
            uriData={uriData}
            currentHealth={currentHealth}
          />
          {currentHealth > 0 ? (
            <BossTrackMovementBlock
              id={Number(id)}
              uriData={uriData}
              onTracked={() => {}}
              sx={{ mt: 4 }}
            />
          ) : (
            <BossDefeatedBlock
              id={Number(id)}
              owner={owner}
              uriData={uriData}
              fights={fights}
              sx={{ mt: 4 }}
            />
          )}
          <BossFights uriData={uriData} fights={fights} sx={{ mt: 4 }} />
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
  currentHealth: number;
  sx?: SxProps;
}) {
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
            value={(props.currentHealth / props.uriData.health) * 100}
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
            {props.currentHealth.toFixed(0)} / {props.uriData.health}
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

function BossTrackMovementBlock(props: {
  id: number;
  uriData: BossUriData;
  onTracked: () => void;
  sx?: SxProps;
}) {
  const router = useRouter();
  const { dev } = router.query;
  const { address } = useAccount();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();
  const [isTracking, setIsTracking] = useState<boolean | undefined>();
  const [isSavingTracking, setIsSavingTracking] = useState<boolean>(false);
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
      showToastSuccess(
        "You successfully damaged the boss, data will be updated soon"
      );
      props.onTracked();
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
            loading={isSavingTracking}
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

function BossDefeatedBlock(props: {
  id: number;
  owner: `0x${string}`;
  uriData: BossUriData;
  fights: BossFightRecord[];
  sx?: SxProps;
}) {
  const { address } = useAccount();

  return (
    <CardBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h6" textAlign="center">
        🎉 The <strong>boss is defeated</strong> and the environment in{" "}
        <strong>{props.uriData.location} is safe</strong>
      </Typography>
      {isAddressesEqual(address, props.owner) && (
        <>
          <ThickDivider sx={{ mt: 2 }} />
          <BossCreateHypercertForm
            id={props.id}
            uriData={props.uriData}
            fights={props.fights}
            sx={{ mt: 2 }}
          />
        </>
      )}
    </CardBox>
  );
}

function BossCreateHypercertForm(props: {
  id: number;
  uriData: BossUriData;
  fights: BossFightRecord[];
  sx?: SxProps;
}) {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { handleError } = useError();
  const { uploadJsonToIpfs, uploadJsonToIpfsAlternative } = useIpfs();
  const { showToastSuccess } = useToasts();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [hypercertUri, setHypercertUri] = useState("");
  const [hypercert, setHypercert] = useState<string | undefined>();

  /**
   * Handle form submit
   */
  async function submit() {
    try {
      setIsFormSubmitting(true);
      // Define fighters
      const fighters = new Set<`0x${string}`>();
      for (const fight of props.fights) {
        fighters.add(fight.account);
      }
      // Upload data to ipfs
      const hypercertUriData = prepareHypercertUriData(
        props.id,
        props.uriData.name,
        props.uriData.location,
        `${global.window.location.origin}/bosses/${props.id}`,
        Array.from(fighters)
      );
      const { uri } = await uploadJsonToIpfs(hypercertUriData);
      const { uri: uriAlternative } = await uploadJsonToIpfsAlternative(
        hypercertUriData
      );
      setHypercertUri(uri);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   * Contract states to mint hypercert
   */
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.hypercerts,
    abi: hypercertsContractAbi,
    functionName: "mintClaim",
    args: [address as `0x${string}`, BigInt(10000), hypercertUri, 2],
    chainId: chainToSupportedChainConfig(chain).chain.id,
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Mint hypercert if uri is ready
   */
  useEffect(() => {
    if (hypercertUri !== "" && contractWrite && !isContractWriteLoading) {
      contractWrite?.();
      setHypercertUri("");
      setIsFormSubmitting(false);
    }
  }, [hypercertUri, contractWrite, isContractWriteLoading]);

  /**
   * Listen contract events to get id of minted hypercert
   */
  useContractEvent({
    address: chainToSupportedChainConfig(chain).contracts.hypercerts,
    abi: hypercertsContractAbi,
    eventName: "TransferSingle",
    listener(log) {
      if (
        log[0].args.operator === address &&
        log[0].args.from === zeroAddress &&
        log[0].args.to === zeroAddress
      ) {
        setHypercert(log[0].args.id?.toString());
        showToastSuccess("Hypercert is created");
      }
    },
  });

  /**
   * Form states
   */
  const isFormLoading =
    isFormSubmitting || isContractWriteLoading || isTransactionLoading;
  const isFormDisabled =
    !contractWrite || isFormLoading || isTransactionSuccess;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      {hypercert ? (
        <LargeLoadingButton
          href={`https://testnet.hypercerts.org/app/view#claimId=0x822f17a9a5eecfd66dbaff7946a8071c265d1d07-${hypercert}`}
          target="_blank"
          variant="contained"
        >
          Open hypercert
        </LargeLoadingButton>
      ) : (
        <>
          <Typography color="text.secondary" textAlign="center">
            🎖️ Create a hypercert to keep in history the impact of all the
            fighters (contributors) who participated in this battle
          </Typography>
          <LargeLoadingButton
            variant="contained"
            sx={{ mt: 2 }}
            loading={isFormLoading}
            disabled={isFormDisabled}
            onClick={() => submit()}
          >
            Create
          </LargeLoadingButton>
        </>
      )}
    </Box>
  );
}

function BossFights(props: {
  uriData: BossUriData;
  fights: BossFightRecord[];
  sx?: SxProps;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h4" fontWeight={700} mt={2}>
        ⚔️ Fights
      </Typography>
      <Typography mt={1}>
        that reduced the amount of CO2 emitted by {props.uriData.name}
      </Typography>
      <EntityList
        entities={props.fights}
        renderEntityCard={(fight, index) => (
          <BossFightCard key={index} fight={fight} />
        )}
        noEntitiesText="😐 no fights"
        sx={{ mt: 2 }}
      />
    </Box>
  );
}

function BossFightCard(props: { fight: BossFightRecord }) {
  const { chain } = useNetwork();

  /**
   * Define account profile uri data
   */
  const { data: profileUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [props.fight.account],
  });
  const { data: accountProfileUriData } =
    useUriDataLoader<ProfileUriData>(profileUri);

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row" }}>
      {/* Left part */}
      <Box>
        <AccountAvatar
          account={props.fight.account}
          accountProfileUriData={accountProfileUriData}
          size={48}
          emojiSize={20}
        />
      </Box>
      {/* Right part */}
      <Box width={1} ml={1.5} display="flex" flexDirection="column">
        <AccountLink
          account={props.fight.account}
          accountProfileUriData={accountProfileUriData}
        />
        <Typography variant="body2" color="text.secondary">
          {new Date(props.fight.date).toLocaleString()}
        </Typography>
        <Typography variant="body2" mt={1}>
          Tracked <strong>{props.fight.distance} km</strong> and reduced CO2
          emissions by <strong>{props.fight.co2}g</strong>
        </Typography>
      </Box>
    </CardBox>
  );
}
