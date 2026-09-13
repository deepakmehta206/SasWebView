export type MasterFieldType = 'text' | 'number' | 'checkbox' | 'select';

export interface MasterSelectOption {
  value: string | number;
  label: string;
}

export interface MasterFieldDef {
  key: string;
  label: string;
  type: MasterFieldType;
  required?: boolean;
  /** Shown on create and edit unless createOnly/editOnly. */
  createOnly?: boolean;
  editOnly?: boolean;
  /** For select fields loaded from another master endpoint. */
  optionsFrom?: 'countries' | 'states' | 'units-of-measure';
  /** Static options when optionsFrom is not used. */
  options?: MasterSelectOption[];
  min?: number;
  step?: number;
}

export interface MasterDefinition {
  key: string;
  title: string;
  singular: string;
  endpoint: string;
  idField: string;
  /** Optional list query params builder from filter form values. */
  listFilters?: Array<{ key: string; label: string; optionsFrom?: MasterFieldDef['optionsFrom'] }>;
  columns: Array<{ key: string; label: string }>;
  fields: MasterFieldDef[];
  /** Global masters have no tenantId column. */
  scope: 'global' | 'tenant';
}

export const MASTER_DEFINITIONS: Record<string, MasterDefinition> = {
  countries: {
    key: 'countries',
    title: 'Countries',
    singular: 'Country',
    endpoint: '/countries',
    idField: 'countryId',
    scope: 'global',
    columns: [
      { key: 'countryCode', label: 'Code' },
      { key: 'countryName', label: 'Name' },
      { key: 'currencyCode', label: 'Currency' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      { key: 'countryCode', label: 'Country code', type: 'text', required: true },
      { key: 'countryName', label: 'Country name', type: 'text', required: true },
      { key: 'currencyCode', label: 'Currency code', type: 'text' },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  },
  states: {
    key: 'states',
    title: 'States',
    singular: 'State',
    endpoint: '/states',
    idField: 'stateId',
    scope: 'global',
    listFilters: [{ key: 'countryId', label: 'Country', optionsFrom: 'countries' }],
    columns: [
      { key: 'countryId', label: 'Country ID' },
      { key: 'stateCode', label: 'Code' },
      { key: 'stateName', label: 'Name' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      {
        key: 'countryId',
        label: 'Country',
        type: 'select',
        required: true,
        optionsFrom: 'countries'
      },
      { key: 'stateCode', label: 'State code', type: 'text', required: true },
      { key: 'stateName', label: 'State name', type: 'text', required: true },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  },
  cities: {
    key: 'cities',
    title: 'Cities',
    singular: 'City',
    endpoint: '/cities',
    idField: 'cityId',
    scope: 'global',
    listFilters: [{ key: 'stateId', label: 'State', optionsFrom: 'states' }],
    columns: [
      { key: 'stateId', label: 'State ID' },
      { key: 'cityCode', label: 'Code' },
      { key: 'cityName', label: 'Name' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      {
        key: 'stateId',
        label: 'State',
        type: 'select',
        required: true,
        optionsFrom: 'states'
      },
      { key: 'cityCode', label: 'City code', type: 'text', required: true },
      { key: 'cityName', label: 'City name', type: 'text', required: true },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  },
  currencies: {
    key: 'currencies',
    title: 'Currencies',
    singular: 'Currency',
    endpoint: '/currencies',
    idField: 'currencyId',
    scope: 'global',
    columns: [
      { key: 'currencyCode', label: 'Code' },
      { key: 'currencyName', label: 'Name' },
      { key: 'symbol', label: 'Symbol' },
      { key: 'decimalPlaces', label: 'Decimals' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      { key: 'currencyCode', label: 'Currency code', type: 'text', required: true },
      { key: 'currencyName', label: 'Currency name', type: 'text', required: true },
      { key: 'symbol', label: 'Symbol', type: 'text' },
      { key: 'decimalPlaces', label: 'Decimal places', type: 'number', required: true, min: 0 },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  },
  'payment-modes': {
    key: 'payment-modes',
    title: 'Payment modes',
    singular: 'Payment mode',
    endpoint: '/payment-modes',
    idField: 'paymentModeId',
    scope: 'tenant',
    columns: [
      { key: 'paymentModeCode', label: 'Code' },
      { key: 'paymentModeName', label: 'Name' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      { key: 'paymentModeCode', label: 'Code', type: 'text', required: true },
      { key: 'paymentModeName', label: 'Name', type: 'text', required: true },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  },
  'document-types': {
    key: 'document-types',
    title: 'Document types',
    singular: 'Document type',
    endpoint: '/document-types',
    idField: 'documentTypeId',
    scope: 'tenant',
    columns: [
      { key: 'documentTypeCode', label: 'Code' },
      { key: 'documentTypeName', label: 'Name' },
      { key: 'isRequired', label: 'Required' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      { key: 'documentTypeCode', label: 'Code', type: 'text', required: true },
      { key: 'documentTypeName', label: 'Name', type: 'text', required: true },
      { key: 'isRequired', label: 'Required', type: 'checkbox' },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  },
  'units-of-measure': {
    key: 'units-of-measure',
    title: 'Units of measure',
    singular: 'Unit of measure',
    endpoint: '/units-of-measure',
    idField: 'unitOfMeasureId',
    scope: 'tenant',
    columns: [
      { key: 'uomCode', label: 'Code' },
      { key: 'uomName', label: 'Name' },
      { key: 'conversionFactor', label: 'Factor' },
      { key: 'baseUomId', label: 'Base UOM' },
      { key: 'isActive', label: 'Active' }
    ],
    fields: [
      { key: 'uomCode', label: 'Code', type: 'text', required: true },
      { key: 'uomName', label: 'Name', type: 'text', required: true },
      {
        key: 'conversionFactor',
        label: 'Conversion factor',
        type: 'number',
        required: true,
        min: 0,
        step: 0.0001
      },
      {
        key: 'baseUomId',
        label: 'Base UOM',
        type: 'select',
        optionsFrom: 'units-of-measure'
      },
      { key: 'isActive', label: 'Active', type: 'checkbox', editOnly: true }
    ]
  }
};

export function getMasterDefinition(key: string): MasterDefinition | null {
  return MASTER_DEFINITIONS[key] ?? null;
}
