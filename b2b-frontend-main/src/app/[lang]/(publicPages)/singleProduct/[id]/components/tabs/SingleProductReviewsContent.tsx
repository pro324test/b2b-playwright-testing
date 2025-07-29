"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Rating } from "@smastrom/react-rating";

import "@smastrom/react-rating/style.css";
import AddReview from "./reviews/AddReview";
import { useAppSelector } from "@/redux/config/hooks";
import { useEffect, useState } from "react";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Review } from "@/types/ourApiSepecifc/Review";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { reviewsRequests } from "@/requests/ourApi/reviewsRequests";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { AxiosResponse } from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import Image from "next/image";
import { formatFileUrl } from "@/utils/formatFileUrl";
import styles from "./styles/SingleProductReviewsContentStyles.module.css";

type Props = {
  tabValue: string;
  productId: number;
};

export default function SingleProductReviewsContent({
  tabValue,
  productId,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<PaginatedResponse<Review> | null>(
    null
  );
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      try {
        const response: AxiosResponse<PaginatedResponse<Review>> =
          await reviewsRequests.getReviewsOfProduct({
            productId,
            queryParams: { limit: "100" },
          });
        setResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <TabsContent value={tabValue}>
        {isLoading ? (
          <div className="my-8 flex justify-center items-center">
            <IphoneLoader />
          </div>
        ) : response == null ||
          response.data == null ||
          response?.data?.length == 0 ? (
          <div>
            <p className="text-center  my-8 text-3xl font-bold">
              {dictionary.sorryWeDidNotFindAny}
            </p>
          </div>
        ) : (
          response.data.map((review, index) => {
            const isLast = index === response.data.length - 1;
            return (
              <div
                key={review.id}
                className={` py-4 px-2 ${isLast ? "" : "mb-2 border-b"} `}
              >
                <div className="flex gap-4 items-start">
                  <p>{review.user?.username || "Unknown User"}</p>
                  <Rating
                    style={{ maxWidth: 100 }}
                    value={review.rating}
                    readOnly
                  />
                </div>
                <p className="my-2">{review.content}</p>

                <div>
                  {review.images?.length ? (
                    <Swiper
                      slidesPerView={"auto"}
                      spaceBetween={10}
                      freeMode={true}
                      modules={[FreeMode]}
                      className={styles["swiper"]}
                    >
                      {review.images.map((image, index) => (
                        <SwiperSlide
                          className={styles["swiper-slide"]}
                          key={index}
                          // onClick={() => setActiveImage(formatFileUrl(image.path))}
                        >
                          <Image
                            src={formatFileUrl(image.imageUrl)}
                            alt={review.content}
                            width={1000}
                            height={1000}
                            className=""
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            );
          })
        )}

        <AddReview productId={productId} />
      </TabsContent>
    </>
  );
}
