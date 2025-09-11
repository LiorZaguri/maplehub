import Layout from '@/components/Layout';
import { FragmentCalculator } from '@/features/fragment-calculator/components/FragmentCalculator';

const FragmentCalculatorPage = () => {
  return (
    <Layout>
      <div className="space-y-6 pb-6">
        <FragmentCalculator />
      </div>
    </Layout>
  );
};

export default FragmentCalculatorPage;
