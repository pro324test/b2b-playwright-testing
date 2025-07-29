import { ImageWithCaptionType } from "../types/ImageWithCaptionType";

export interface ImageWithCaptionActionHandler {
  triggerAction: () => ImageWithCaptionType;
}
