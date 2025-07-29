import { toastSuccessStylesObject } from "@/constants/toastStylesObjectConstants";
import { Dictionary } from "@/types/global/Dictionary";
import { AxiosResponse } from "axios";
import toast, { ToastOptions } from "react-hot-toast";

export function toastSuccessMessage({
  dictionary,
  response,
  toastOptions,
}: {
  dictionary: Dictionary;
  response: AxiosResponse;
  toastOptions?: ToastOptions;
}) {
  let successMessage = dictionary.operationSuccesseded;
  if (response.data.message) {
    successMessage = response.data.message;
  }
  toast(successMessage, toastOptions || { style: toastSuccessStylesObject });
}
