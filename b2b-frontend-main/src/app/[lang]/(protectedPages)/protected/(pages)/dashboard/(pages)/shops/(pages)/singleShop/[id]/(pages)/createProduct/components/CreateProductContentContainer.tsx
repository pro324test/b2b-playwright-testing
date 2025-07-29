"use client";

import HeadingTitle from "@/components/dashboard/HeadingTitle";
import ImageWithCaption from "@/components/globals/ImageWithCaption";
import MultipleSelector, {
  MultipleSelectorOption,
} from "@/components/globals/MultipleSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { useAppSelector } from "@/redux/config/hooks";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Category } from "@/types/ourApiSepecifc/Category";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImageWithCaptionActionHandler } from "@/components/globals/actionHandlers/ImageWithCaptionActionHandler";
import { ImageWithCaptionType } from "@/components/globals/types/ImageWithCaptionType";
import { Brand } from "@/types/ourApiSepecifc/Brand";
import { brandsRequest } from "@/requests/ourApi/brandsRequests";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingWithOverlay from "@/components/loaders/LoadingWithOverlay";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routesConstants";
import useLang from "@/hooks/useLang";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  shopId: number;
};

export default function CreateProductContentContainer({ shopId }: Props) {
  const lang = useLang();
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({ contentType: "multipart/form-data" });
  const theShop = useRef(
    authEntity?.vendor?.shops?.find((shop) => shop.id === shopId)
  );
  const router = useRouter();
  const [brandsResponse, setBrandsResponse] =
    useState<PaginatedResponse<Brand> | null>(null);
  const [categoriesOptions, setCategoriesOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [imagesWithCaptions, setImagesWithCaptions] = useState<
    ImageWithCaptionType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const canSubmit =
    !!name &&
    basePrice != "" &&
    initialQuantity != "" &&
    lowStockThreshold != "" &&
    !!brandId &&
    categoryIds.length;

  const imagesWithCaptionsRefs = useRef<
    Map<number, React.RefObject<ImageWithCaptionActionHandler | null>>
  >(new Map());
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleXClick = useCallback((id: number) => {
    setImagesWithCaptions((prevState) =>
      prevState.filter((imageWithCaption) => imageWithCaption.id !== id)
    );
    imagesWithCaptionsRefs.current.delete(id);
  }, []);

  const submitHandler = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await productsRequests.create({
        privateAxios,
        data,
        shopId,
      });
      toastSuccessMessage({
        dictionary,
        response,
      });
      router.push(routes.dashboardSingleShop.href({ lang, id: shopId }));
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function getCategories() {
      try {
        const response: AxiosResponse<PaginatedResponse<Category>> =
          await categoriesRequests.getAll({
            queryParams: { limit: "1000" },
          });
        const categoriesOptions: MultipleSelectorOption[] =
          response.data.data.map((category) => ({
            value: `${category.id}`,
            label: category.name,
          }));
        setCategoriesOptions(categoriesOptions);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    }
    async function getBrands() {
      try {
        const response: AxiosResponse<PaginatedResponse<Brand>> =
          await brandsRequest.getAll({
            queryParams: { limit: "1000" },
          });
        setBrandsResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    }
    if (theShop.current) {
      getCategories();
      getBrands();
    }
    // eslint-disable-next-line
  }, []);

  if (!theShop.current) {
    return <h2>You Are Not Authorized To Reach This Page</h2>;
  }

  return (
    <>
      <LoadingWithOverlay isLoading={isLoading} />
      <div className="mb-4">
        <HeadingTitle label={`Create Product For ${theShop.current.name}`} />
      </div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="base-price">Base Price</Label>
              <Input
                type="number"
                id="base-price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="initial-quantity">Quantity</Label>
              <Input
                type="number"
                id="initial-quantity"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
              <Input
                type="number"
                id="low-stock-threshold"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="initial-quantity">Categories</Label>
              <MultipleSelector
                className={`bg-white`}
                options={categoriesOptions}
                placeholder="Select Categories"
                onChange={(options) => {
                  const selectedCategoryIds = options.map(
                    (option) => +option.value
                  );
                  setCategoryIds(selectedCategoryIds);
                }}
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select
                onValueChange={(newValue) => {
                  setBrandId(+newValue);
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Brands</SelectLabel>
                    {brandsResponse?.data.map((brand) => (
                      <SelectItem key={brand.id} value={`${brand.id}`}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center my-8">
              <button
                className="py-2 px-6 bg-blue-600 text-white transition-colors hover:bg-blue-700"
                onClick={() => {
                  if (inputFileRef.current) {
                    inputFileRef.current.click();
                  }
                }}
              >
                {imagesWithCaptions.length ? "Add More Images" : "Add Images"}
              </button>
            </div>
            {imagesWithCaptions.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-8">
                {imagesWithCaptions.map((imageWithCaption) => {
                  if (
                    !imagesWithCaptionsRefs.current.has(imageWithCaption.id)
                  ) {
                    imagesWithCaptionsRefs.current.set(
                      imageWithCaption.id,
                      React.createRef()
                    );
                  }
                  return (
                    <ImageWithCaption
                      key={imageWithCaption.id}
                      imageWithCaption={imageWithCaption}
                      onXClick={handleXClick}
                      ref={imagesWithCaptionsRefs.current.get(
                        imageWithCaption.id
                      )}
                    />
                  );
                })}
              </div>
            ) : (
              ""
            )}
          </div>
          <input
            hidden
            ref={inputFileRef}
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files?.length) {
                const newImagesWithCaptions: ImageWithCaptionType[] = [];
                for (let i = 0; i < e.target.files.length; i++) {
                  newImagesWithCaptions.push({
                    caption: "",
                    file: e.target.files[i],
                    id: Math.random(),
                  });
                }
                setImagesWithCaptions((prevState) => [
                  ...prevState,
                  ...newImagesWithCaptions,
                ]);
              }
            }}
          />
          <button
            type="button"
            disabled={!canSubmit || isLoading}
            className="py-2 px-6 mt-8 bg-green-600 text-white transition-colors hover:bg-green-700"
            onClick={() => {
              const imagesWithCaptionsData = Array.from(
                imagesWithCaptionsRefs.current.values()
              )
                .map((ref) => ref.current?.triggerAction())
                .filter((item) => item !== undefined);
              const formData = new FormData();
              formData.append("name", name);
              formData.append("basePrice", basePrice);
              formData.append("initialQuantity", initialQuantity);
              formData.append("description", description);
              formData.append("lowStockThreshold", lowStockThreshold);
              if (categoryIds.length) {
                categoryIds.forEach((categoryId) => {
                  formData.append("categoryIds[]", `${categoryId}`);
                });
              }
              if (brandId) {
                formData.append("brandId", `${brandId}`);
              }
              const captions: string[] = [];
              imagesWithCaptionsData.forEach((imageWithCaption) => {
                formData.append("images", imageWithCaption?.file);
                captions.push(imageWithCaption?.caption);
              });
              formData.append("captions", JSON.stringify(captions));
              submitHandler(formData);
            }}
          >
            Create Product
          </button>
        </form>
      </div>
    </>
  );
}
