export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Extracts only the property keys from type `T` whose values match type `V`.
 * It automatically handles optional properties and ignores `null`/`undefined`.
 *
 * @template T - The base object/interface to extract keys from.
 * @template V - The target data type to filter by (e.g., string, boolean, string[]).
 *
 * @example
 * interface User { id: number; name: string; email?: string; }
 * type StringKeys = KeysOfType<User, string>; // Result: 'name' | 'email'
 */
type KeysOfType<T, V> = {
  // Remove optional modifiers so indexing this mapped type does not add undefined to the key union.
  [K in keyof T]-?: NonNullable<T[K]> extends V ? K & string : never;
}[keyof T];

/**
 * A strongly-typed configuration object used to dynamically render UI filters.
 * The `key` property is strictly constrained to match the properties of the data model `T`
 * that are compatible with the chosen filter `kind`.
 *
 * @template T - The data model interface that these filters will manipulate.
 *
 * @example
 * interface Asset { name: string; tags: string[]; active: boolean; }
 *
 * const config: FilterDefinition<Asset> = {
 *   key: 'name', // Only string-valued keys are valid for a text filter.
 *   label: 'Asset Name',
 *   kind: 'text',
 * };
 */
export type FilterDefinition<T extends object> =
  | { key: KeysOfType<T, string>; label: string; kind: 'text' }
  | { key: KeysOfType<T, string[]>; label: string; kind: 'multi-select'; options: readonly FilterOption[] }
  | { key: KeysOfType<T, boolean>; label: string; kind: 'boolean'; trueLabel?: string; falseLabel?: string };
