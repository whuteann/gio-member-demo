import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AppStateProvider } from "@/context/AppStateContext";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${fraunces.variable} ${jakarta.variable} font-sans`}>
      <AppStateProvider>
        <Component {...pageProps} />
      </AppStateProvider>
    </div>
  );
}
