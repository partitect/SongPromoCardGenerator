
import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label htmlFor={label} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <input
        type="text"
        id={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
  );
};

export default TextInput;
