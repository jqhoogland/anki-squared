// src/pages/_app.tsx
import type { AppType } from "next/dist/shared/lib/utils";
import "../styles/globals.css";
import { trpc } from "../utils/trpc";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};


export default trpc.withTRPC(MyApp);
