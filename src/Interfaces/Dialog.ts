import { Dispatch, SetStateAction } from "react";

export interface DialogProps {
    title: string,
    context: string,
    actions: Action[],
}

export interface Action {
    text: string,
    pressHandler: (setDialogProps: Dispatch<SetStateAction<DialogProps | null>>) => void,
}
