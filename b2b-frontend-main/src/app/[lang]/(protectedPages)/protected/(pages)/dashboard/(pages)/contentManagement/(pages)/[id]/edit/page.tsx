import React from "react";
import EditContentManagementContentContainer from "./components/EditContentManagementContentContainer";
import { contentManagementRequests } from "@/requests/ourApi/contentManagementRequests";
import NoDataFound from "@/components/globals/NoDataFound";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  if (isNaN(+id)) {
    return <div>Invalid ID</div>;
  }
  try {
    const response = await contentManagementRequests.findById(+id);
    return (
      <EditContentManagementContentContainer
        contentManagement={response.data}
      />
    );
  } catch {
    return <NoDataFound />;
  }
}
