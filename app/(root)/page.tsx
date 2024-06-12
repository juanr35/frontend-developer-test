'use client'

import { useState, ChangeEvent } from "react";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/heading";
import { useDebouncedCallback } from 'use-debounce';
import * as math from 'mathjs';
import './styles.css';

interface DataProps {  
  name: string;
  category: string;
  value: string;
  id: string;
}

const OPERATORS = '+-*/()^'

const App = () => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<DataProps[]>([])
  const [tags, setTags] = useState<DataProps[]>([]);
  const [isKeyReleased, setIsKeyReleased] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.length > 0 && OPERATORS.includes(value)){
      setTags(prevState => [
        ...prevState, 
        { 
          name: value,
          category: "operator",
          value,
          id: "0"
        }
      ]);
      setInput('');
    }
    else setInput(value);
  };

  const handleSearch = useDebouncedCallback(async (search) => {    
    const res = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete', {
      method: "GET"      
    });    
    const data = await res.json();

    const filteredSuggestions = data
      .filter((item: DataProps) => item.name.toLowerCase().includes(search.toLowerCase()))      
    
    setSuggestions(filteredSuggestions);    
  }, 400);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    
    /*    
    const trimmedInput = input.trim();
    if (key === 'Enter' && trimmedInput.length && !tags.includes(trimmedInput)) {
      e.preventDefault();
      setTags(prevState => [...prevState, trimmedInput]);
      setInput('');
    }
    */
  
    if (key === "Backspace" && !input.length && tags.length && isKeyReleased) {
      const tagsCopy = [...tags];
      const poppedTag = tagsCopy.pop();
      e.preventDefault();
      setTags(tagsCopy);
      setInput(poppedTag?.name ?? '');
    }
  
    setIsKeyReleased(false);
  };
  
  const onKeyUp = () => {
    setIsKeyReleased(true);
  }

  const deleteTag = (index: number) => {
    setTags(prevState => prevState.filter((tag, i) => i !== index))
  }
  
  const handleSuggestionSelect = (suggestion: DataProps) => {    
    setSuggestions([])
    setTags(prevState => [...prevState, suggestion]);
    setInput('');
  }

  let result  
  try {
    result = math.evaluate(tags.map((tag) => tag.value).join(''));    
  } catch (error) {
    result = 'NaN'  
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 md:pt-6">      
      <div className="flex items-center justify-between">
        <Heading title="Frontend Developer Text" description="By Juan Romay" />
      </div>
      <Separator />
      <div className="container overflow-y-auto">
        {tags.map((tag, index) => (
          <div key={index} className="tag">
            {tag.name}
            <button onClick={() => deleteTag(index)}>
              <p className="text-black">x</p>
            </button>
          </div>
        ))}
        <div>
          <input
            className="outline-white"
            value={input}            
            placeholder="name..."
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onChange={(e) => {
              onChange(e);
              handleSearch(e.target.value);
            }}            
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <ul className="py-1 text-sm">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {input.length > 0 && suggestions.length === 0 && (
            <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="py-1 text-sm">                
                <p
                  className="px-4 py-2"
                >
                  No results found
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
      <h3 className="text-xl font-bold tracking-tight">Formula</h3>
        {tags.length > 0 && (
          <p className="text-md text-muted-foreground">
            {tags.map((tag) => tag.value).join('')} = {result}
          </p>
        )}
      </div>
    </div>    
  )
}

export default App