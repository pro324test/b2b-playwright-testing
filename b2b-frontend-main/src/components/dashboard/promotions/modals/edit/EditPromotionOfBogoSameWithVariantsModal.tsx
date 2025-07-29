"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import IphoneLoader from "@/components/loaders/IphoneLoader";
import { Promotion } from "@/types/ourApiSepecifc/Promotion";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  promotion: Promotion;
};

export default function EditPromotionOfBogoSameWithVariantsModal({
  isOpen,
  setIsOpen,
  promotion,
}: Props) {
  const dictionary = useAppSelector(
    (state) => state.dictionarySlice.dictionary
  );
  const privateAxios = usePrivateAxios({});
  const websiteDirection = useWebsiteDirection();
  const router = useRouter();
  const [name, setName] = useState(promotion.name);
  const [description, setDescription] = useState(promotion.description || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    promotion.startDate ? new Date(promotion.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    promotion.endDate ? new Date(promotion.endDate) : undefined
  );
  const [buyQuantity, setBuyQuantity] = useState(
    promotion.bogoRule.buyQuantity.toString()
  );
  const [getQuantity, setGetQuantity] = useState(
    promotion.bogoRule.getQuantity.toString()
  );
  const [maxRedemptionPerOrder, setMaxRedemptionPerOrder] = useState(
    promotion.bogoRule.maxRedemptionsPerOrder == null
      ? ""
      : promotion.bogoRule.maxRedemptionsPerOrder.toString()
  );
  const [isGettingProducts, setIsGettingProducts] = useState(false);
  const [productsResponse, setProductsResponse] =
    useState<PaginatedResponse<Product> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    promotion.bogoRule.applicableProducts?.length
      ? promotion.bogoRule.applicableProducts[0].id
      : null
  );
  const [isGettingVariants, setIsGettingVariants] = useState(false);
  const [variantsOptions, setVariantsOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [selectedVariants, setSelectedVariants] = useState<
    MultipleSelectorOption[]
  >(
    promotion.bogoRule.applicableVariants?.map((variant) => ({
      label: variant.sku,
      value: variant.id.toString(),
    })) || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const shouldRemoveAllSelectedVariants = useRef(false);

  const canSubmit =
    name != "" &&
    description != "" &&
    buyQuantity != "" &&
    getQuantity != "" &&
    maxRedemptionPerOrder != "" &&
    selectedProductId != null &&
    selectedVariants.length > 0;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await promotionsRequests.editPromotion({
        privateAxios,
        promotionId: promotion.id,
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
      async function fetchProducts() {
        setIsGettingProducts(true);
        try {
          const response: AxiosResponse<PaginatedResponse<Product>> =
            await productsRequests.getProductsByShopId({
              privateAxios,
              shopId: promotion.shopId,
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
        fetchProducts();
      }
    },
    // eslint-disable-next-line
    [isOpen]
  );

  useEffect(() => {
    async function fetchProductFullData(productId: number) {
      setIsGettingVariants(true);
      try {
        const response: AxiosResponse<Product> =
          await productsRequests.findById(productId);
        const variants: MultipleSelectorOption[] =
          response.data?.variants?.map((variant) => ({
            label: variant.sku,
            value: variant.id.toString(),
          })) || [];
        setVariantsOptions(variants);
        if (shouldRemoveAllSelectedVariants.current) {
          setSelectedVariants([]);
        }
      } catch (error) {
        extractErrorAndToastIt({ error, dictionary });
      } finally {
        setIsGettingVariants(false);
      }
    }
    if (selectedProductId) {
      fetchProductFullData(selectedProductId);
    }
    // eslint-disable-next-line
  }, [selectedProductId]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="min-w-[50%] hide-x-button"
        dir={websiteDirection}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">
            Edit Bogo Same With Variants
          </DialogTitle>
          <div>
            <div className="mt-12 mb-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLoading || !canSubmit) return;
                  const data: any = {
                    name,
                    type: "bogo_same",
                    description,
                    shopId: promotion.shopId,
                    bogoRule: {
                      buyQuantity: +buyQuantity,
                      getQuantity: +getQuantity,
                      sameProduct: true,
                      applyToAllVariants: false,
                      discountPercent: 100,
                      maxRedemptionsPerOrder: +maxRedemptionPerOrder,
                      applicableProductIds: selectedProductId
                        ? [selectedProductId]
                        : [],
                      applicableVariantIds: selectedVariants.map(
                        (variant) => +variant.value
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
                  <Label htmlFor="max-redemption-per-order">
                    Max Redemption Per Order
                  </Label>
                  <Input
                    type="number"
                    id="max-redemption-per-order"
                    placeholder="1"
                    value={maxRedemptionPerOrder}
                    onChange={(e) => setMaxRedemptionPerOrder(e.target.value)}
                  />
                </div>
                <div className="grid w-full  items-center gap-1.5 mb-4">
                  <Label htmlFor="products">Products</Label>
                  {isGettingProducts ? (
                    <IphoneLoader />
                  ) : (
                    <Select
                      value={selectedProductId?.toString()}
                      onValueChange={(newValue) => {
                        shouldRemoveAllSelectedVariants.current = true;
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
                  <Label htmlFor="variants">Variants</Label>
                  {isGettingVariants ? (
                    <IphoneLoader />
                  ) : (
                    <MultipleSelector
                      value={selectedVariants}
                      loadingIndicator={isGettingProducts}
                      disabled={
                        variantsOptions.length === 0 ||
                        selectedProductId == null
                      }
                      options={variantsOptions}
                      onChange={(selectedOptions) => {
                        setSelectedVariants(selectedOptions);
                      }}
                      placeholder="Select Variants"
                    />
                  )}
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
