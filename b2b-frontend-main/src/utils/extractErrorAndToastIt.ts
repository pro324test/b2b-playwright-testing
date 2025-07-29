import { toastErrorStylesObject } from "@/constants/toastStylesObjectConstants";
import { Dictionary } from "@/types/global/Dictionary";
import toast, { ToastOptions } from "react-hot-toast";

export function extractErrorAndToastIt({
  error,
  dictionary,
  toastOptions,
}: {
  error: any;
  dictionary: Dictionary;
  toastOptions?: ToastOptions;
}) {
  let errorMessage = dictionary.somethingWentWrong;
  if (error?.response?.data?.message) {
    if (typeof error?.response?.data?.message == "string") {
      errorMessage = error?.response?.data?.message;
    } else if (Array.isArray(error?.response?.data?.message)) {
      // loop over all the messages and join them with a new line
      errorMessage = error?.response?.data?.message.join("\n");
    }
  }
  toast(errorMessage, toastOptions || { style: toastErrorStylesObject });
}
