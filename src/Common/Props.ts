import { ImageSource } from "react-native-image-viewing/dist/@types";
import { DialogProps } from "../Interfaces/Dialog";
import { LaoQGError } from "./Errors";

export interface LaoQGProps {
    showImage: (imageSource: ImageSource) => void,
    showDialog: (dialogProps: DialogProps) => void,
    showError: (error: LaoQGError) => void,
}