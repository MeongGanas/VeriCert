const FormInput = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    placeholder?: string;
}) => (
    <div className="group">
        <label className="block text-xs sm:text-base font-mono text-gray-500 mb-1 group-focus-within:text-primary transition-colors" htmlFor={label}>
            {label}
        </label>
        <input
            id={label}
            name={label}
            type={type}
            required
            value={value}
            onChange={onChange}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700"
            placeholder={placeholder}
        />
    </div>
);

export default FormInput;