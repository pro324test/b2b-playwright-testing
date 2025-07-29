"use client";

import React, { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@smastrom/react-rating";
import { FaCamera } from "react-icons/fa";
import styles from "./styles/AddReviewStyles.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import Image from "next/image";
import { reviewsRequests } from "@/requests/ourApi/reviewsRequests";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { refreshPageKey } from "@/redux/features/other/otherSlice";

type Props = {
  productId: number;
};

export default function AddReview({ productId }: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const dispatch = useAppDispatch();
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRating, setCurrentUserRating] = useState(0);
  const [currentUserReview, setCurrentUserReview] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const filesInputRef = React.useRef<HTMLInputElement>(null);
  const handleFilesInputChange = useCallback(() => {
    const files = filesInputRef.current?.files;
    if (files) {
      const filesArray = Array.from(files);
      setImages((prev) => [...prev, ...filesArray]);
    }
  }, []);

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await reviewsRequests.create({
        privateAxios,
        data,
      });
      toastSuccessMessage({ response, dictionary });
      setCurrentUserRating(0);
      setCurrentUserReview("");
      setImages([]);
      dispatch(refreshPageKey());
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        multiple
        ref={filesInputRef}
        onChange={handleFilesInputChange}
        className="hidden"
      />
      <div className="bg-white rounded-md p-4">
        <h4>{dictionary.whatIsYourRatingToThisProduct}</h4>
        <div className="my-2">
          <Rating
            style={{ maxWidth: 100 }}
            value={currentUserRating}
            onChange={setCurrentUserRating}
          />
        </div>
        <p className="my-2">{dictionary.writeYourReview}</p>
        <div className="flex  gap-4 ">
          <Textarea
            className="w-[50%]"
            placeholder={dictionary.writeYourReviewHere}
            value={currentUserReview}
            onChange={(e) => setCurrentUserReview(e.target.value)}
          />
          <div className="w-[50%] flex gap-4 overflow-x-hidden">
            <button
              className={styles["add-images-button"]}
              onClick={() => filesInputRef.current?.click()}
            >
              <span className={styles["camera-icon-container"]}>
                <FaCamera />
              </span>
              <span>{dictionary.addImages}</span>
            </button>
            <div className="mt-2">
              <Swiper
                spaceBetween={0}
                slidesPerView={"auto"}
                freeMode={true}
                modules={[FreeMode]}
                className={styles["swiper"]}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index} className={styles["swiper-slide"]}>
                    <div className="relative">
                      <button
                        className={styles["remove-image-button"]}
                        onClick={() => {
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <span>X</span>
                      </button>
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="The Image"
                        className="w-[100px] h-[100px] object-cover rounded-md"
                        width={100}
                        height={100}
                      />
                    </div>
                  </SwiperSlide>
                ))}
                <SwiperSlide className={styles["swiper-slide"]} />
              </Swiper>
            </div>
          </div>
        </div>
        <div className="flex justify-end  mt-2">
          <button
            className="main-button"
            disabled={isLoading || !currentUserRating || !currentUserReview}
            onClick={() => {
              const formData = new FormData();
              formData.append("productId", productId.toString());
              formData.append("rating", currentUserRating.toString());
              formData.append("content", currentUserReview);
              images.forEach((image) => {
                formData.append("images", image);
              });
              handleSubmit(formData);
            }}
          >
            {isLoading ? dictionary.pleaseWait : dictionary.submitYourReview}
          </button>
        </div>
      </div>
    </>
  );
}
