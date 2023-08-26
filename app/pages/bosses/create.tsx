import FormikHelper from "@/components/helper/FormikHelper";
import Layout from "@/components/layout";
import { ExtraLargeLoadingButton } from "@/components/styled";
import { BOSS_DIFFICULTIES, BOSS_IMAGES } from "@/constants/bosses";
import { bossContractAbi } from "@/contracts/abi/bossContract";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import useToasts from "@/hooks/useToast";
import { theme } from "@/theme";
import { BossUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import {
  Avatar,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * Page to create a boss.
 */
export default function BossCreate() {
  const { handleError } = useError();
  const { uploadJsonToIpfs } = useIpfs();
  const { showToastSuccess } = useToasts();
  const router = useRouter();
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    image: Object.keys(BOSS_IMAGES)[0],
    name: "",
    location: "",
    health: BOSS_DIFFICULTIES.easy,
  });

  const formValidationSchema = yup.object({
    image: yup.string().required(),
    name: yup.string().required(),
    location: yup.string().required(),
    health: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Uri of uploaded data
   */
  const [dataUri, setDataUri] = useState("");

  /**
   * Contract states
   */
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.boss,
    abi: bossContractAbi,
    functionName: "create",
    args: [dataUri],
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
   * Function to handle form submit
   */
  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      // Define boss uri data
      const uriData: BossUriData = {
        image: values.image,
        name: values.name,
        location: values.location,
        health: values.health,
      };
      // Upload boss uri data to ipfs
      const { uri } = await uploadJsonToIpfs(uriData);
      setDataUri(uri);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   * Write data to contract if form was submitted
   */
  useEffect(() => {
    if (dataUri !== "" && contractWrite && !isContractWriteLoading) {
      contractWrite?.();
      setDataUri("");
      setIsFormSubmitting(false);
    }
  }, [dataUri, contractWrite, isContractWriteLoading]);

  /**
   * Listen contract events to get id of created boss
   */
  useContractEvent({
    address: chainToSupportedChainConfig(chain).contracts.boss,
    abi: bossContractAbi,
    eventName: "Transfer",
    listener(log) {
      if (log[0].args.from === zeroAddress && log[0].args.to === address) {
        showToastSuccess("Boss is created");
        router.push(`/bosses/${log[0].args.tokenId}`);
      }
    },
  });

  /**
   * Form states
   */
  const isFormLoading =
    isFormSubmitting || isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitDisabled = isFormDisabled || !contractWrite;

  return (
    <Layout maxWidth="xs">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Create a boss
      </Typography>
      <Typography textAlign="center" mt={1}>
        that emit CO2 and damage the environment in your city
      </Typography>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={submit}
      >
        {({ values, errors, touched, handleChange, setValues }) => (
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Image */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="image-label">Image</InputLabel>
              <Select
                labelId="image-label"
                id="image"
                name="image"
                value={values.image}
                label="Image"
                onChange={handleChange}
                disabled={isFormDisabled}
              >
                {Object.keys(BOSS_IMAGES).map((key, index) => (
                  <MenuItem key={index} value={key}>
                    <Avatar
                      sx={{
                        width: 128,
                        height: 128,
                        borderRadius: 2,
                        background: theme.palette.divider,
                      }}
                      src={BOSS_IMAGES[key]}
                    >
                      <Typography fontSize={48}>👾</Typography>
                    </Avatar>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Name */}
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
              placeholder="Gustav"
              multiline={true}
              minRows={1}
              value={values.name}
              onChange={handleChange}
              error={touched.name && Boolean(errors.name)}
              helperText={<>{touched.name && errors.name}</>}
              disabled={isFormDisabled}
              sx={{ mt: 2 }}
            />
            {/* Location */}
            <TextField
              fullWidth
              id="location"
              name="location"
              label="City"
              placeholder="Paris"
              multiline={true}
              minRows={1}
              value={values.location}
              onChange={handleChange}
              error={touched.location && Boolean(errors.location)}
              helperText={<>{touched.location && errors.location}</>}
              disabled={isFormDisabled}
              sx={{ mt: 2 }}
            />
            {/* Health */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="health-label">Difficulty</InputLabel>
              <Select
                labelId="health-label"
                id="health"
                name="health"
                value={values.health}
                label="Difficulty"
                onChange={handleChange}
                disabled={isFormDisabled}
              >
                <MenuItem value={BOSS_DIFFICULTIES.easy}>
                  Easy ({BOSS_DIFFICULTIES.easy} CO2)
                </MenuItem>
                <MenuItem value={BOSS_DIFFICULTIES.medium}>
                  Medium ({BOSS_DIFFICULTIES.medium} CO2)
                </MenuItem>
                <MenuItem value={BOSS_DIFFICULTIES.hard}>
                  Hard ({BOSS_DIFFICULTIES.hard} CO2)
                </MenuItem>
              </Select>
            </FormControl>
            {/* Submit button */}
            <ExtraLargeLoadingButton
              loading={isFormLoading}
              variant="contained"
              type="submit"
              disabled={isFormSubmitDisabled}
              sx={{ mt: 4 }}
            >
              Save
            </ExtraLargeLoadingButton>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}
