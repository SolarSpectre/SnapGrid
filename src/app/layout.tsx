import "~/styles/globals.css";
import "@uploadthing/react/styles.css";
import { ClerkProvider} from '@clerk/nextjs'
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import TopNav from "./_components/topnav.tsx";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: "T3 Gallery",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${GeistSans.variable} flex flex-col gap-4`}>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)}
        />
      <body>
        <TopNav/>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
