import React from 'react';
import { cn } from '../../../lib/utils';
import Button from '../../../components/ui/Button';

interface CategoryBarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = React.memo(({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      <Button
        variant={!selectedCategory ? 'primary' : 'secondary'}
        size="md"
        className={cn(
          "rounded-full whitespace-nowrap px-8 transition-all hover:scale-105 active:scale-95",
          !selectedCategory ? "shadow-lg shadow-primary/20" : "text-text-secondary"
        )}
        onClick={() => onSelectCategory(null)}
      >
        Todos
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
          size="md"
          className={cn(
            "rounded-full whitespace-nowrap px-8 transition-all hover:scale-105 active:scale-95",
            selectedCategory === cat.id ? "shadow-lg shadow-primary/20" : "text-text-secondary"
          )}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
});

CategoryBar.displayName = 'CategoryBar';

export default CategoryBar;
