export type Address = {
  id: string;
  label: string | null;
  name: string | null;
  company: string | null;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_default: boolean;
};

export const ADDRESS_COLS = "id,label,name,company,phone,address,city,state,zip,is_default";
