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
import { Promotion } from "@/types/ourApiSepecifc/Promotion";

type Props = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  promotion: Promotion;
};

export default function EditPromotionOfBogoSameModal({
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
  const [productsOptions, setProductsOptions] = useState<
    MultipleSelectorOption[]
  >([]);
  const [selectedProducts, setSelectedProducts] = useState<
    MultipleSelectorOption[]
  >(
    promotion.bogoRule.applicableProducts?.map((product) => ({
      label: product.name,
      value: product.id.toString(),
    })) || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    name != "" &&
    description != "" &&
    buyQuantity != "" &&
    getQuantity != "" &&
    maxRedemptionPerOrder != "" &&
    selectedProducts.length > 0;

  const handleSubmit = useCallback(async (data: object) => {
    setIsLoading(true);
    try {
      const response = await promotionsRequests.editPromotion({
        privateAxios,
        data,
        promotionId: promotion.id,
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
      if (isOpen) {
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
            Edit Promotion of Bogo Same
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
                      discountPercent: 100,
                      maxRedemptionsPerOrder: +maxRedemptionPerOrder,
                      applicableProductIds: selectedProducts.map(
                        (product) => +product.value
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
                  <MultipleSelector
                    value={selectedProducts}
                    loadingIndicator={isGettingProducts}
                    options={productsOptions}
                    onChange={(selectedOptions) => {
                      setSelectedProducts(selectedOptions);
                    }}
                    placeholder="Select products"
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
