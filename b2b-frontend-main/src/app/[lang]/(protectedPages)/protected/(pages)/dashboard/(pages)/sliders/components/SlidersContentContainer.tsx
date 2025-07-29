"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import NoDataFound from "@/components/globals/NoDataFound";
import LoadingInDashboard from "@/components/loaders/LoadingInDashboard";
import { useAppSelector } from "@/redux/config/hooks";
import { slidersRequests } from "@/requests/ourApi/slidersRequests";
import { DefaultQueryParams } from "@/types/global/DefaultQueryParams";
import { Slider } from "@/types/ourApiSepecifc/Slider";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import React, { useEffect, useState } from "react";
import SliderSingleTableRow from "./SliderSingleTableRow";
import CreateSliderButtonWithDialog from "./CreateSliderButtonWithDialog";

type Props = {
  queryParams: DefaultQueryParams;
};

export default function SlidersContentContainer({ queryParams }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sliders, setSliders] = useState<Slider[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      setIsLoading(true);
      try {
        const response = await slidersRequests.getAll({ queryParams });
        setSliders(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSliders();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <HeadingTitle label="Sliders" />
        <CreateSliderButtonWithDialog />
      </div>
      {isLoading ? (
        <LoadingInDashboard />
      ) : (
        <>
          {sliders.length == 0 ? (
            <NoDataFound />
          ) : (
            <div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Image</th>
                    <th>Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sliders.map((slider) => (
                    <SliderSingleTableRow key={slider.id} slider={slider} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
