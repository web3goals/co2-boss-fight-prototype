import { Breakpoint, Container, Toolbar, SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";
import Footer from "./Footer";
import Navigation from "./Navigation";

/**
 * Component with layout.
 */
export default function Layout(props: {
  maxWidth?: Breakpoint | false;
  hideToolbar?: boolean;
  disableGutters?: boolean;
  sx?: SxProps;
  children: any;
}) {
  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #DDA0D1 0%, #ECD0F3 0.17%, #FEF3E1 100%, #FEF1DA 100%);",
      }}
    >
      <CssBaseline />
      <Head>
        <title>CO2 Boss Fight</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Navigation />
      <Container
        maxWidth={props.maxWidth !== undefined ? props.maxWidth : "md"}
        disableGutters={props.disableGutters || false}
        sx={{ minHeight: "100vh" }}
      >
        <Box sx={{ py: 6, ...props.sx }}>
          {!props.hideToolbar && <Toolbar />}
          {props.children}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
