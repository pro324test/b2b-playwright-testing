"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/redux/config/hooks";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";

import { Shop } from "@/types/ourApiSepecifc/Shop";
import MultipleSelector, {
  MultipleSelectorOption,
} from "@/components/globals/MultipleSelector";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/globals/DateTimePicker";
import { AxiosResponse } from "axios";
import { Product } from "@/types/ourApiSepecifc/Product";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { promotionsRequests } from "@/requests/ourApi/promotionsRequests";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import IphoneLoader from "@/components/loaders/IphoneLoader";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shop: Shop;
};

export default function CreatePromotionOfBogoDifferentModal({
  isOpen,
  setIsOpen,
  shop,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [buyQuantity, setBuyQuantity] = useState("");
  const [getQuantity, setGetQuantity] = useState("");
  const [isGettingCategories, setIsGettingCategories] = useState(false);
  const [categoriesOptions, setCategoriesOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    MultipleSelectorOption[]
  >([]);
  const [isGettingProducts, setIsGettingProducts] = useState(false);
  const [productsResponse, setProductsResponse] =
    useState<PaginatedResponse<Product> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    name != "" &&
    description != "" &&
    buyQuantity != "" &&
    getQuantity != "" &&
    selectedProductId != null &&
    selectedCategories.length > 0;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await promotionsRequests.create({
        privateAxios,
        data,
      });
      toastSuccessMessage({ dictionary, response });
      router.refresh();
    } catch (error) {
      extractErrorAndToastIt({ error, dictionary });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(
    () => {
      async function fetchCategories() {
        setIsGettingCategories(true);
        try {
          const response: AxiosResponse<PaginatedResponse<Product>> =
            await categoriesRequests.getAll({
              queryParams: {
                limit: "1000",
              },
            });

          const categoriesOptions: MultipleSelectorOption[] =
            response.data.data.map((category) => ({
              label: category.name,
              value: category.id.toString(),
            }));
          setCategoriesOptions(categoriesOptions);
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        } finally {
          setIsGettingCategories(false);
        }
      }
      async function fetchProducts() {
        setIsGettingProducts(true);
        try {
          const response: AxiosResponse<PaginatedResponse<Product>> =
            await productsRequests.getProductsByShopId({
              privateAxios,
              shopId: shop.id,
              queryParams: {
                limit: "1000",
              },
            });

          setProductsResponse(response.data);
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        } finally {
          setIsGettingProducts(false);
        }
      }
      if (isOpen) {
        fetchCategories();
        fetchProducts();
      }
    },
    // eslint-disable-next-line
    [isOpen]
  );

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="min-w-[50%] hide-x-button"
        dir={websiteDirection}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Create Category Promotion To Get One Product Free
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data: any = {
                    name,
                    type: "bogo_different",
                    description,
                    shopId: shop.id,
                    bogoRule: {
                      buyQuantity: +buyQuantity,
                      getQuantity: +getQuantity,
                      sameProduct: false,
                      discountPercent: 100,

                      freeProductId: selectedProductId,
                      applicableCategoryIds: selectedCategories.map(
                        (category) => +category.value
                      ),
                    },
                  };
                  if (startDate) {
                    data.startDate = startDate.toISOString();
                  }
                  if (endDate) {
                    data.endDate = endDate.toISOString();
                  }
                  handleSubmit(data);
                }}
              >
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="start-date">Start Date</Label>
                  <DateTimePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="end-date">End Date</Label>
                  <DateTimePicker date={endDate} setDate={setEndDate} />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="buy-quantity">Buy Quantity</Label>
                  <Input
                    type="number"
                    id="buy-quantity"
                    placeholder="2"
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="get-quantity">Get Quantity</Label>
                  <Input
                    type="number"
                    id="get-quantity"
                    placeholder="1"
                    value={getQuantity}
                    onChange={(e) => setGetQuantity(e.target.value)}
                  />
                </div>

                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="products">Product</Label>
                  {isGettingProducts ? (
                    <IphoneLoader />
                  ) : (
                    <Select
                      value={selectedProductId?.toString()}
                      onValueChange={(newValue) => {
                        setSelectedProductId(+newValue);
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Product</SelectLabel>
                          {productsResponse?.data.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={product.id.toString()}
                            >
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="categories">Categories</Label>
                  <MultipleSelector
                    value={selectedCategories}
                    loadingIndicator={isGettingCategories}
                    options={categoriesOptions}
                    onChange={(selectedOptions) => {
                      setSelectedCategories(selectedOptions);
                    }}
                    placeholder="Select Categories"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={!canSubmit || isLoading}
                    className="mt-8 bg-green-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-green-700"
                  >
                    {isLoading ? dictionary.pleaseWait : dictionary.confirm}
                  </button>
                  <button
                    disabled={isLoading}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="mt-8 bg-red-600  py-2 px-6 rounded-xl text-white transition-colors hover:bg-red-700"
                  >
                    {dictionary.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
