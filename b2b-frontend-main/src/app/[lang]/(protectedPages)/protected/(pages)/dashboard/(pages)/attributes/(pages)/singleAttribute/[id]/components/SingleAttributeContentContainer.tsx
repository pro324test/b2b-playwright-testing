"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import AddNewValueToAttributeModal from "../../../../components/modals/AddNewValueToAttributeModal";
import { FaRegPlusSquare } from "react-icons/fa";
import { Attribute } from "@/types/ourApiSepecifc/Attribute";
import { attributesRequests } from "@/requests/ourApi/attributesRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import AttributeSingleTableRow from "../../../../components/AttributeSingleTableRow";

type Props = {
  attributeId: number;
};

export default function SingleAttributeContentContainer({
  attributeId,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNewValueModalOpen, setIsAddingNewValueModalOpen] =
    useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await attributesRequests.findById({
          privateAxios,
          id: attributeId,
        });
        setAttribute(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return <LoadingInDashboard />;
  }
  if (attribute == null) {
    return <NoDataFound />;
  }
  return (
    <>
      <AddNewValueToAttributeModal
        isOpen={isAddingNewValueModalOpen}
        setIsOpen={setIsAddingNewValueModalOpen}
        attribute={attribute}
      />
      <div className="mb-4 flex items-center justify-between">
        <HeadingTitle label={`${attribute?.name || ""}`} />
        <button
          className={
            "py-2 px-6 bg-green-600 text-white flex gap-4 justify-center items-center"
          }
          onClick={() => {
            setIsAddingNewValueModalOpen(true);
          }}
        >
          <FaRegPlusSquare />

          <span> Add New Value</span>
        </button>
      </div>

      <div>
        <table className="custom-table my-8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AttributeSingleTableRow
              key={attribute.id}
              attribute={attribute}
              disableIdLink
            />
          </tbody>
        </table>
        {attribute.values == null ||
        attribute.values == undefined ||
        attribute.values.length == 0 ? (
          ""
        ) : (
          <div className="my-8">
            <h4 className="mb-2 text-2xl font-bold">Values</h4>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {attribute.values?.map((attributeValue) => (
                  <tr key={attributeValue.id}>
                    <td>{attributeValue.id}</td>
                    <td>{attributeValue.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
