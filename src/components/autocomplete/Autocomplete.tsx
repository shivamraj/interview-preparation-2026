import { useDebounce } from "../../hooks/useDebounce";
import type { AutoCompleteProps } from "./types";
import { useEffect, useRef, useState } from "react";
import "./style.css";

export const AutoComplete = <T,>(props: AutoCompleteProps<T>) => {

    const { options, fetchSuggestions, placeholder, onSelect, renderOption, getOptionLabel } = props;
    const [inputValue, setInputValue] = useState("");
    const debouncedInputValue = useDebounce(inputValue, 300);
    const [suggestions, setSuggestions] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

    useEffect(() => {
        if (!fetchSuggestions) return;
        if (!debouncedInputValue.trim()) return;
        if (!isOpen) return;
        const abortController = new AbortController();

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchSuggestions({ query: debouncedInputValue, signal: abortController.signal });
                setSuggestions(response);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();

        return () => abortController.abort();

    }, [debouncedInputValue]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            debugger;
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])


    useEffect(() => {

        if (highlightedIndex === -1) return;
        optionRefs.current[highlightedIndex]?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [highlightedIndex])
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.trim() === "") {
            setSuggestions([]);
            setIsOpen(false);
            setHighlightedIndex(-1);

        } else {
            setIsOpen(true)
        }
        setInputValue(e.target.value);

    }

    const selectOption = (selctedOption: T) => {
        onSelect && onSelect(selctedOption);
        setInputValue(getOptionLabel(selctedOption));
        setSuggestions([]);
        setIsOpen(false);
        setHighlightedIndex(-1);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (highlightedIndex === -1 && !isOpen) {
                    setHighlightedIndex(0);
                    setIsOpen(true);
                    return;
                }
                setHighlightedIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
                break;

            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prevIndex) => prevIndex === -1 ? - 1 : prevIndex - 1);
                break;

            case "Enter":
                e.preventDefault();
                if (!isOpen) return;
                if (highlightedIndex === -1) return;

                if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                    const selctedOption = suggestions[highlightedIndex];
                    selectOption(selctedOption);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            default:
                break;

        }
    }

    console.log("highlightedIndex", highlightedIndex,)

    return (
        <div ref={ref} className="autocomplete-container">
            <input className="autocomplete-input" type="text" placeholder={placeholder} value={inputValue} onChange={onChange} onKeyDown={handleKeyDown} />

            {error && <div>Error: {error.message}</div>}
            {isOpen && suggestions.length > 0 && (
                <div className="container" style={{ position: "relative", maxWidth: "300px" }}>

                    <ul className="suggestions-list">
                        {suggestions.map((option, index) => (
                            <li ref={(element) => { optionRefs.current[index] = element; }} key={index} className={highlightedIndex === index ? "suggestion-item highlighted" : "suggestion-item"} onClick={() => selectOption(option)}>
                                {renderOption ? renderOption(option) : getOptionLabel ? getOptionLabel(option) : String(option)}
                            </li>
                        ))}
                    </ul>

                    {isLoading && <div className="loading">Loading...</div>}

                </div>
            )}


        </div>
    )
}