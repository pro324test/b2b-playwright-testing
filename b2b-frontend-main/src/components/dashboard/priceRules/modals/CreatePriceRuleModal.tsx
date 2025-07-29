"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/redux/config/hooks";
import useWebsiteDirection from "@/hooks/useWebsiteDirection";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import usePrivateAxios from "@/hooks/usePrivateAxios";
import { toastSuccessMessage } from "@/utils/toastSuccessMessage";
import { extractErrorAndToastIt } from "@/utils/extractErrorAndToastIt";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PriceRuleTypeValue } from "@/types/ourApiSepecifc/PriceRule";
import { DateTimePicker } from "@/components/globals/DateTimePicker";
import { priceRulesRequests } from "@/requests/ourApi/priceRulesRequests";
import { PaginatedResponse } from "@/types/global/PaginatedResponse";
import { Product } from "@/types/ourApiSepecifc/Product";
import { productsRequests } from "@/requests/ourApi/productsRequests";
import MultipleSelector, {
  MultipleSelectorOption,
} from "@/components/globals/MultipleSelector";
import { AxiosResponse } from "axios";
import { ProductVariant } from "@/types/ourApiSepecifc/ProductVariant";
import { vendorsRequests } from "@/requests/ourApi/vendorsRequests";
import { Vendor } from "@/types/ourApiSepecifc/Vendor";

const priceRulesTypes: PriceRuleTypeValue[] = ["discount", "fixed_price"];

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  productVariant?: ProductVariant;
};

export default function CreatePriceRuleModal({
  isOpen,
  setIsOpen,
  productVariant,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [vendorsResponse, setVendorsResponse] =
    useState<PaginatedResponse<Vendor> | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [isGettingProducts, setIsGettingProducts] = useState(false);
  const [productsOptions, setProductsOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<
    MultipleSelectorOption[]
  >([]);
  // const [isGettingShops, setIsGettingShops] = useState(false);
  // const [shopsOptions, setShopsOptions] = useState<MultipleSelectorOption[]>(
  //   []
  // );
  // const [selectedShops, setSelectedShops] = useState<MultipleSelectorOption[]>(
  //   []
  // );
  const [name, setName] = useState("");
  const [type, setType] = useState<PriceRuleTypeValue>("discount");
  const [value, setValue] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  let canSubmit =
    name &&
    type &&
    value != "" &&
    minQuantity != "" &&
    maxQuantity != "" &&
    selectedProducts.length > 0;
  if (authEntity?.role == "admin" || authEntity?.role == "superadmin") {
    canSubmit = canSubmit && selectedVendorId != null;
  }

  const isProductsSelectionDisabled =
    (authEntity?.role == "admin" || authEntity?.role == "superadmin") &&
    !selectedVendorId;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await priceRulesRequests.create({
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

  const getProductsOfVendor = useCallback(async (vendorId: number) => {
    setIsGettingProducts(true);
    try {
      const response: AxiosResponse<PaginatedResponse<Product>> =
        await productsRequests.getAllProductsOfVendor({
          privateAxios,
          queryParams: { limit: "1000" },
          vendorId,
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
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function getVendors() {
      try {
        const response: AxiosResponse<PaginatedResponse<Vendor>> =
          await vendorsRequests.getAll({
            privateAxios,
            queryParams: { limit: "1000" },
          });
        setVendorsResponse(response.data);
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      }
    }
    if (authEntity?.vendor && productVariant == undefined) {
      getProductsOfVendor(authEntity.vendor.id);
    }
    if (authEntity?.role == "admin" || authEntity?.role == "superadmin") {
      getVendors();
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // async function getShopsOfVendor(vendorId: number) {
    //   try {
    //     setIsGettingShops(true);
    //     const response: AxiosResponse<PaginatedResponse<Shop>> =
    //       await shopsRequests.getShopsByVendorId({
    //         privateAxios,
    //         vendorId,
    //         queryParams: { limit: "1000" },
    //       });
    //     const options: MultipleSelectorOption[] = response.data.data.map(
    //       (shop) => ({
    //         label: shop.name,
    //         value: shop.id.toString(),
    //       })
    //     );
    //     setShopsOptions(options);
    //   } catch (error) {
    //     extractErrorAndToastIt({ error, dictionary });
    //   } finally {
    //     setIsGettingShops(false);
    //   }
    // }
    if (selectedVendorId) {
      getProductsOfVendor(selectedVendorId);
      // getShopsOfVendor(selectedVendorId);
    }
    // eslint-disable-next-line
  }, [selectedVendorId]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="min-w-[50%] hide-x-button"
        dir={websiteDirection}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            <p>
              Create Price Rule{" "}
              {productVariant ? (
                <span>
                  For variant with sku{" "}
                  <span className="text-main-color">
                    &apos;{productVariant.sku}&apos;
                  </span>
                </span>
              ) : (
                ""
              )}
            </p>
            {productVariant ? (
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {productVariant.attributeValues.map((attributeValue) => (
                  <span
                    key={attributeValue.id}
                    className="flex gap-2 text-lg bg-green-600 text-white py-2 px-6 rounded-lg"
                  >
                    <span>{attributeValue?.attribute?.name}:</span>{" "}
                    <span>{attributeValue.value}</span>
                  </span>
                ))}
              </div>
            ) : (
              ""
            )}
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data: any = {
                    name,
                    type,
                    value: +value,
                    minQuantity: +minQuantity,
                  };
                  if (maxQuantity) data.maxQuantity = +maxQuantity;
                  if (startDate) data.startDate = startDate?.toISOString();
                  if (endDate) data.endDate = endDate?.toISOString();
                  if (selectedProducts.length > 0) {
                    data.productIds = selectedProducts.map(
                      (option) => +option.value
                    );
                  }
                  if (productVariant) {
                    data.variantIds = [productVariant.id];
                  }
                  if (selectedVendorId) {
                    data.onBehalfOfVendorId = selectedVendorId;
                  }
                  // if (selectedShops.length > 0) {
                  //   data.shopIds = selectedShops.map((option) => +option.value);
                  // }
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
                  <Label htmlFor="type">Type</Label>
                  <Select
                    onValueChange={(newValue) => {
                      setType(newValue as PriceRuleTypeValue);
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type</SelectLabel>
                        {priceRulesTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    type="number"
                    id="value"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="min-quantity">Min Quantity</Label>
                  <Input
                    type="number"
                    id="min-quantity"
                    placeholder="5"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="max-quantity">Max Quantity</Label>
                  <Input
                    type="number"
                    id="max-quantity"
                    placeholder="100"
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(e.target.value)}
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

                {authEntity?.role == "admin" ||
                authEntity?.role == "superadmin" ? (
                  <>
                    <div className="grid w-full  items-center gap-1.5 mb-4">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Select
                        onValueChange={(newValue) => {
                          if (+newValue == selectedVendorId) return;
                          setSelectedVendorId(+newValue);
                          setProductsOptions([]);
                          setSelectedProducts([]);
                          // setShopsOptions([]);
                          // setSelectedShops([]);
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select A Vendor</SelectLabel>
                            {vendorsResponse?.data.map((vendor) => (
                              <SelectItem
                                key={vendor.id}
                                value={vendor.id.toString()}
                              >
                                {vendor?.user?.username}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* <div
                      className={
                        selectedVendorId ? "" : "pointer-events-none opacity-50"
                      }
                    >
                      <div className={`grid w-full  items-center gap-1.5 mb-4`}>
                        <Label htmlFor="shops">Shops</Label>

                        <MultipleSelector
                          value={selectedShops}
                          disabled={!selectedVendorId}
                          loadingIndicator={isGettingShops}
                          options={shopsOptions}
                          onChange={(selectedOptions) => {
                            setSelectedShops(selectedOptions);
                          }}
                          placeholder="Select Shops"
                        />
                      </div>
                    </div> */}
                  </>
                ) : (
                  ""
                )}

                {productVariant == undefined ? (
                  <div
                    className={`grid w-full  items-center gap-1.5 mb-4 ${
                      isProductsSelectionDisabled
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    <Label htmlFor="products">Products</Label>
                    <MultipleSelector
                      value={selectedProducts}
                      disabled={isProductsSelectionDisabled}
                      loadingIndicator={isGettingProducts}
                      options={productsOptions}
                      onChange={(selectedOptions) => {
                        setSelectedProducts(selectedOptions);
                      }}
                      placeholder="Select products"
                    />
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
  );
}
