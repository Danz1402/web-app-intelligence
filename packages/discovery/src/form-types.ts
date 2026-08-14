export type DetectedField = {
    name?: string;
    label?: string;
    fieldType?: string;
    required?: boolean;
    placeholder?: string;
    tag: string;
    /** link back to element detection later if useful */
    selectorHint?: string;
  };
  
  export type DetectedForm = {
    name?: string;
    fields: DetectedField[];
    /** true when wrapped in <form> */
    isNativeForm: boolean;
  };