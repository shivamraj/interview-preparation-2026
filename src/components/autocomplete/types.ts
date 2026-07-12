import type { JSX } from "react/jsx-runtime"

export interface AutoCompleteProps<T> {
    options?: T[],
    fetchSuggestions?: (params: { query: string, signal?: AbortSignal }) => Promise<T[]>,
    placeholder?: string,
    onSelect?: (value: T) => void,
    renderOption?: (option: T) => JSX.Element
    getOptionLabel: (option: T) => string
}