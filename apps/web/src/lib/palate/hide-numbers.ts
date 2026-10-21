import { useStore } from "./store";

/** The Hide Numbers setting: show portions only, never calories or macros. */
export const useHideNumbers = () => !!useStore().profile?.wellbeing?.hideNumbers;
