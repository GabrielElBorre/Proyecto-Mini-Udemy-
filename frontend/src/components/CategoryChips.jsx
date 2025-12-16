import { Button } from "@/components/ui/button";

export default function CategoryChips({ categorias, selected, onSelect }) {
  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      {categorias.map((cat, i) => {
        const isActive = selected === cat;
        return (
          <Button
            key={i}
            onClick={() => onSelect(cat)}
            variant={isActive ? "default" : "outline"}
            className={`rounded-full px-6 py-2 text-base font-medium whitespace-nowrap ${
              isActive 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "border-2 border-gray-300 hover:border-indigo-600 hover:text-indigo-600"
            }`}
          >
            {cat}
          </Button>
        );
      })}
    </div>
  );
}