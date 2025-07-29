"use client";

import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import ActivityToggler from "@/components/togglers/ActivityToggler";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { contentManagementRequests } from "@/requests/ourApi/contentManagementRequests";
import { ContentManagement } from "@/types/ourApiSepecifc/ContentManagement";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import React, { useCallback, useState } from "react";
import SingleContentManagementActionsDropdown from "./SingleContentManagementActionsDropdown";

type Props = {
  contentManagement: ContentManagement;
};

export default function ContentManagementSingleTableRow({
  contentManagement,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [isPublished, setIsPublished] = useState(contentManagement.isPublished);
  const [isLoading, setIsLoading] = useState(false);

  const publishTogglerHandler = useCallback(async (shouldPublish: boolean) => {
    setIsLoading(true);
    try {
      const response = shouldPublish
        ? await contentManagementRequests.publish({
            privateAxios,
            id: contentManagement.id,
          })
        : await contentManagementRequests.unpublish({
            privateAxios,
            id: contentManagement.id,
          });
      toastSuccessMessage({ dictionary, response });
      setIsPublished(shouldPublish);
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />

      <tr>
        <td>{contentManagement.id}</td>
        <td>{contentManagement.title}</td>
        <td className="max-w-[15vw] cutted-text">
          {contentManagement.description}
        </td>
        <td>{contentManagement.images?.length || 0}</td>
        <td>
          <ActivityToggler
            disabled={isLoading}
            onToggle={() => {
              if (isLoading) return;
              publishTogglerHandler(!isPublished);
            }}
            isActive={isPublished}
          />
        </td>
        <td>
          <SingleContentManagementActionsDropdown
            contentManagement={contentManagement}
          />
        </td>
      </tr>
    </>
  );
}
