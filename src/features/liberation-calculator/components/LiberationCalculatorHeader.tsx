import { Calculator } from 'lucide-react';

export const LiberationCalculatorHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Liberation Calculator
        </h1>
      </div>
      <p className="text-muted-foreground max-w-2xl">
        Calculate how long it will take to complete your MapleStory liberation quest.
        Configure your weekly boss clears and track your progress towards liberation.
      </p>
    </div>
  );
};
