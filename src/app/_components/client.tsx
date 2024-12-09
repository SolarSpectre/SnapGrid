"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import LoadMore from "./load-more";
import { ImageStoreProvider } from "~/store/zustandProvider";
export default function ClientOnly({ initialImages }: { initialImages: any }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Create the QueryClient only on the client side
  const queryClient = React.useMemo(() => new QueryClient(), []);

  if (!isClient) return null; // Render nothing on the server

  return (
    <QueryClientProvider client={queryClient}>
      <ImageStoreProvider>
        <LoadMore initialImages={initialImages} />
      </ImageStoreProvider >
    </QueryClientProvider>
  );
}