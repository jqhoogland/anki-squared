export interface Field {
    font: string;
    media: string[] // unused?
    name: string;
    ord: number;
    rtl: boolean;
    size: number;
    sticky: string[] // of fields that retain the previous value
}


export interface Model {
    css: string; // Shared for all templates
    did: number; // Default deck to add cards to
    flds: Field{ }
}