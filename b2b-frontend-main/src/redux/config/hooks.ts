import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDisaptch, RootState } from "./store";

export const useAppDispatch = () => useDispatch<AppDisaptch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
