export type DetectedField = {
  name?: string;
  label?: string;
  fieldType?: string;
  required?: boolean;
  placeholder?: string;
  tag: string;
  selectorHint?: string;
  /** For <select> / radio groups */
  options?: DetectedFieldOption[];
  /** Weak v0: names of fields that may depend on this one */
  controlsFieldNames?: string[];
  pattern?: string;
minLength?: number;
maxLength?: number;
min?: string;
max?: string;
};
  
  export type DetectedForm = {
    name?: string;
    fields: DetectedField[];
    /** true when wrapped in <form> */
    isNativeForm: boolean;
  };

  export type DetectedFieldOption = {
    value: string;
    label: string;
    disabled?: boolean;
  };
  
  