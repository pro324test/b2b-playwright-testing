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

import { CouponTypeValue } from "@/types/ourApiSepecifc/Coupon";
import { Shop } from "@/types/ourApiSepecifc/Shop";
import MultipleSelector, {
  MultipleSelectorOption,
} from "@/components/globals/MultipleSelector";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import { DateTimePicker } from "@/components/globals/DateTimePicker";
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { couponsRequests } from "@/requests/ourApi/couponsRequests";
import { Vendor } from "@/types/ourApiSepecifc/Vendor";
import { shopsRequests } from "@/requests/ourApi/shopsRequests";
import { categoriesRequests } from "@/requests/ourApi/categoriesRequests";
import { Category } from "@/types/ourApiSepecifc/Category";
import { ManageCouponModalType } from "@/types/app_specific/coupons/ManageCouponModalType";

const couponTypes: CouponTypeValue[] = ["percentage", "fixed", "free_shipping"];

type Props = {
  shop?: Shop;
  vendor?: Vendor;
  typeOfCreation: ManageCouponModalType;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateCouponModal({
  shop,
  vendor,
  typeOfCreation,
  isOpen,
  setIsOpen,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CouponTypeValue>("percentage");
  const [value, setValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const [isGettingProducts, setIsGettingProducts] = useState(false);
  const [productsOptions, setProductsOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<
    MultipleSelectorOption[]
  >([]);
  const [isGettingShops, setIsGettingShops] = useState(false);
  const [shopsOptions, setShopsOptions] = useState<MultipleSelectorOption[]>(
    []
  );
  const [selectedShops, setSelectedShops] = useState<MultipleSelectorOption[]>(
    []
  );
  const [isGettingCategories, setIsGettingCategories] = useState(false);
  const [categoriesOptions, setCategoriesOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<
    MultipleSelectorOption[]
  >([]);

  let canSubmit =
    code != "" && value != "" && usageLimit != "" && perUserLimit != "";
  if (type == "percentage") {
    canSubmit = canSubmit && minOrderAmount != "" && maxDiscountAmount != "";
  }
  if (type == "fixed") {
    canSubmit = canSubmit && minOrderAmount != "";
  }
  if (typeOfCreation == "multiple_shops") {
    canSubmit = canSubmit && selectedShops.length > 0;
  }
  if (typeOfCreation == "multiple_categories") {
    canSubmit = canSubmit && selectedCategories.length > 0;
  }

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await couponsRequests.create({
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
      async function fetchProducts(shopId: number) {
        setIsGettingProducts(true);
        try {
          const response: AxiosResponse<PaginatedResponse<Product>> =
            await productsRequests.getProductsByShopId({
              privateAxios,
              shopId,
              queryParams: {
                limit: "1000",
              },
            });

          const options: MultipleSelectorOption[] = response.data.data.map(
            (product) => ({
              label: product.name,
              value: product.id.toString(),
            })
          );
          setProductsOptions(options);
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        } finally {
          setIsGettingProducts(false);
        }
      }
      async function fetchShops(vendorId: number) {
        setIsGettingShops(true);
        try {
          const response: AxiosResponse<PaginatedResponse<Shop>> =
            await shopsRequests.getShopsByVendorId({
              privateAxios,
              vendorId,
              queryParams: {
                limit: "1000",
              },
            });

          const options: MultipleSelectorOption[] = response.data.data.map(
            (shop) => ({
              label: shop.name,
              value: shop.id.toString(),
            })
          );
          setShopsOptions(options);
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        } finally {
          setIsGettingShops(false);
        }
      }
      async function fetchCategories() {
        setIsGettingCategories(true);
        try {
          const response: AxiosResponse<PaginatedResponse<Category>> =
            await categoriesRequests.getAll({
              queryParams: {
                limit: "1000",
              },
            });

          const options: MultipleSelectorOption[] = response.data.data.map(
            (category) => ({
              label: category.name,
              value: category.id.toString(),
            })
          );
          setCategoriesOptions(options);
        } catch (error) {
          extractErrorAndToastIt({ error, dictionary });
        } finally {
          setIsGettingCategories(false);
        }
      }
      if (isOpen && shop) {
        fetchProducts(shop.id);
      }
      if (isOpen && typeOfCreation != "single_shop" && vendor) {
        fetchShops(vendor.id);
      }
      if (isOpen && typeOfCreation == "multiple_categories") {
        fetchCategories();
      }
    },
    // eslint-disable-next-line
    [isOpen]
  );

  return (
    <>
      <Dialog open={isOpen}>
        <DialogContent
          className="min-w-[50%] hide-x-button"
          dir={websiteDirection}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl text-center">
              Create Coupon
            </DialogTitle>
            <div>
              <div className="mt-12 mb-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isLoading || !canSubmit) return;
                    const data: any = {
                      code,
                      type,
                      description,

                      usageLimit: +usageLimit,
                      perUserLimit: +perUserLimit,
                    };
                    if (typeOfCreation == "single_shop" && shop) {
                      data.shopIds = [shop.id];
                    }
                    if (typeOfCreation != "single_shop") {
                      data.shopIds = selectedShops.map((shop) => +shop.value);
                      data.applicableCategoryIds = selectedCategories.map(
                        (category) => +category.value
                      );
                    }

                    if (type == "percentage") {
                      data.value = +value;
                      data.minOrderAmount = +minOrderAmount;
                      data.maxDiscountAmount = +maxDiscountAmount;
                    } else if (type == "fixed") {
                      data.value = +value;
                      data.minOrderAmount = +minOrderAmount;
                    }
                    if (startDate) {
                      data.startDate = startDate.toISOString();
                    }
                    if (endDate) {
                      data.endDate = endDate.toISOString();
                    }
                    if (
                      selectedProducts.length > 0 &&
                      type != "free_shipping"
                    ) {
                      data.applicableProductIds = selectedProducts.map(
                        (product) => +product.value
                      );
                    }
                    if (
                      (authEntity?.role == "admin" ||
                        authEntity?.role == "superadmin") &&
                      vendor
                    ) {
                      data.onBehalfOfVendorId = vendor.id;
                    }

                    handleSubmit(data);
                  }}
                >
                  <div className="grid w-full  items-center gap-1.5 mb-4">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      type="text"
                      id="code"
                      placeholder="COUPON"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="grid w-full  items-center gap-1.5 mb-4">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      type="text"
                      id="description"
                      placeholder="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid w-full  items-center gap-1.5 mb-4">
                    <Label htmlFor="type">type</Label>
                    <Select
                      onValueChange={(newValue) => {
                        setType(newValue as CouponTypeValue);
                      }}
                      value={type}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select a Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Type</SelectLabel>
                          {couponTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {type == "free_shipping" ? (
                    ""
                  ) : (
                    <div className="grid w-full  items-center gap-1.5 mb-4">
                      <Label htmlFor="value">Value</Label>
                      <Input
                        type="number"
                        id="value"
                        placeholder="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="grid w-full  items-center gap-1.5 mb-4">
                    <Label htmlFor="min-order-amount">Min Order Amount</Label>
                    <Input
                      type="number"
                      id="min-order-amount"
                      placeholder="0"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                    />
                  </div>
                  {type == "percentage" ? (
                    <div className="grid w-full  items-center gap-1.5 mb-4">
                      <Label htmlFor="max-discount-amount">
                        Max Discount Amount
                      </Label>
                      <Input
                        type="number"
                        id="max-discount-amount"
                        placeholder="0"
                        value={maxDiscountAmount}
                        onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="grid w-full  items-center gap-1.5 mb-4">
                    <Label htmlFor="usage-limit">Usage Limit</Label>
                    <Input
                      type="number"
                      id="usage-limit"
                      placeholder="0"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                    />
                  </div>
                  <div className="grid w-full  items-center gap-1.5 mb-4">
                    <Label htmlFor="per-user-limit">Per User Limit</Label>
                    <Input
                      type="number"
                      id="per-user-limit"
                      placeholder="0"
                      value={perUserLimit}
                      onChange={(e) => setPerUserLimit(e.target.value)}
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
                  {type == "free_shipping" ||
                  typeOfCreation != "single_shop" ? (
                    ""
                  ) : (
                    <div className="grid w-full  items-center gap-1.5 mb-4">
                      <Label htmlFor="products">Products</Label>
                      {isGettingProducts ? (
                        <IphoneLoader />
                      ) : (
                        <MultipleSelector
                          value={selectedProducts}
                          loadingIndicator={isGettingProducts}
                          options={productsOptions}
                          onChange={(selectedOptions) => {
                            setSelectedProducts(selectedOptions);
                          }}
                          placeholder="Select products"
                        />
                      )}
                    </div>
                  )}

                  {typeOfCreation != "single_shop" ? (
                    <>
                      <div className="grid w-full  items-center gap-1.5 mb-4">
                        <Label htmlFor="shops">Shops</Label>
                        {isGettingShops ? (
                          <IphoneLoader />
                        ) : (
                          <MultipleSelector
                            value={selectedShops}
                            loadingIndicator={isGettingShops}
                            options={shopsOptions}
                            onChange={(selectedOptions) => {
                              setSelectedShops(selectedOptions);
                            }}
                            placeholder="Select Shops"
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    ""
                  )}

                  {typeOfCreation == "multiple_categories" ? (
                    <div className="grid w-full  items-center gap-1.5 mb-4">
                      <Label htmlFor="categories">Categories</Label>
                      {isGettingCategories ? (
                        <IphoneLoader />
                      ) : (
                        <MultipleSelector
                          value={selectedCategories}
                          loadingIndicator={isGettingCategories}
                          options={categoriesOptions}
                          onChange={(selectedOptions) => {
                            setSelectedCategories(selectedOptions);
                          }}
                          placeholder="Select Categories"
                        />
                      )}
                    </div>
                  ) : (
                    ""
                  )}

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
    </>
  );
}
