/** Shared Lucide outline style for every UI icon. */
export const ICON_STROKE = 1.75;
export const ICON_SM = 16;
export const ICON_MD = 18;
export const ICON_LG = 20;

export function iconProps(size = ICON_MD) {
    return {
        size,
        strokeWidth: ICON_STROKE,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };
}
