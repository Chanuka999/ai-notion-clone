"use client";
import Document from "@/components/Document";
import React, { use } from "react";

const DocumentPAge = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  return (
    <div>
      <Document id={id} />
    </div>
  );
};

export default DocumentPAge;
