import EntityList from "@/components/entity/EntityList";
import Layout from "@/components/layout";
import {
  CardBox,
  FullWidthSkeleton,
  LargeLoadingButton,
} from "@/components/styled";
import { BOSS_IMAGES } from "@/constants/bosses";
import { bossContractAbi } from "@/contracts/abi/bossContract";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { theme } from "@/theme";
import { BossUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Avatar, Box, Link as MuiLink, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import Link from "next/link";
import {
  paginatedIndexesConfig,
  useContractInfiniteReads,
  useNetwork,
} from "wagmi";

/**
 * Page with bosses.
 */
export default function Bosses() {
  const { chain } = useNetwork();

  const { data, fetchNextPage } = useContractInfiniteReads({
    cacheKey: "bosses",
    ...paginatedIndexesConfig(
      (index: bigint) => {
        return [
          {
            address: chainToSupportedChainConfig(chain).contracts.boss,
            abi: bossContractAbi,
            functionName: "tokenURI",
            args: [index],
          },
        ];
      },
      { start: 1, perPage: 10, direction: "increment" }
    ),
  });

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
      <EntityList
        entities={data?.pages?.[0]}
        renderEntityCard={(data, index) => (
          <BossCard id={index + 1} dataUri={data?.result} key={index} />
        )}
        noEntitiesText="😐 no bosses"
        sx={{ mt: 4 }}
      />
    </Layout>
  );
}

function BossCard(props: { id: number; dataUri: string }) {
  const { data } = useUriDataLoader<BossUriData>(props.dataUri);

  if (!props.dataUri) {
    return <></>;
  }

  if (!data) {
    return <FullWidthSkeleton />;
  }

  const currentHealth = "3200"; // TODO: Define real data
  const fighters = "42"; // TODO: Define real data

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row" }}>
      {/* Left part */}
      <Box>
        {/* Image */}
        <Avatar
          sx={{
            width: 164,
            height: 164,
            borderRadius: 3,
            background: theme.palette.divider,
          }}
          src={BOSS_IMAGES[data.image]}
        >
          <Typography fontSize={48}>👾</Typography>
        </Avatar>
      </Box>
      {/* Right part */}
      <Box
        width={1}
        ml={3}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
      >
        {/* Name */}
        <Link href={`/bosses/${props.id}`} passHref legacyBehavior>
          <MuiLink variant="h6" fontWeight={700}>
            {data.name}
          </MuiLink>
        </Link>
        {/* Location */}
        <Typography>
          Damage the environment in <strong>{data.location}</strong>
        </Typography>
        <Stack direction="row" spacing={2} mt={1.5}>
          {/* Health */}
          <Stack
            alignItems="center"
            sx={{
              background: grey[300],
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body2">
              <strong>
                {currentHealth} / {data.health}
              </strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Emitted CO2
            </Typography>
          </Stack>
          {/* Fighters */}
          <Stack
            alignItems="center"
            sx={{
              background: grey[200],
              borderRadius: 2,
              px: 2,
              py: 1,
            }}
          >
            <Typography variant="body2">
              <strong>{fighters}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fighters
            </Typography>
          </Stack>
        </Stack>
        <Link href={`/bosses/${props.id}`}>
          <LargeLoadingButton variant="outlined" sx={{ mt: 3 }}>
            ⚔️ Fight
          </LargeLoadingButton>
        </Link>
      </Box>
    </CardBox>
  );
}
