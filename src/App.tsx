import "./App.css";
import { AutoComplete } from "./components/autocomplete/Autocomplete";

type Products = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export default function App() {

  const fetchSuggestions = async ({ query, signal }: { query: string, signal?: AbortSignal }): Promise<Products[]> => {
    const response = await fetch(`https://dummyjson.com/products/search?q=${query}`, {
      signal: signal
    });
    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }
    const data = await response.json();
    console.log("Fetched suggestions:", data.products);
    return data.products;

  }

  return <AutoComplete fetchSuggestions={fetchSuggestions} getOptionLabel={(option) => option.title} />;
}
