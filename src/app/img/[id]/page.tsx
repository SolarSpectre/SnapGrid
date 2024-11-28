"use client";

import * as React from "react";

export default function PhotoModal({ params }: { params: { id: string } }) {
  const { id: photoId } = React.use(params);
  return <div>{photoId}</div>;
}
