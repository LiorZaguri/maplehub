import { Calculator } from 'lucide-react';

export const FragmentCalculatorHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Fragment Calculator
        </h1>
      </div>
      <p className="text-muted-foreground max-w-2xl">
        Calculate fragment progress for your characters. Track your fragment collection and progress towards your goals.
      </p>
    </div>
  );
};
