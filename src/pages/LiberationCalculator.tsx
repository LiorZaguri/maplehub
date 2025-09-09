import Layout from '@/components/Layout';
import { LiberationCalculator } from '@/features/liberation-calculator/components/LiberationCalculator';

const LiberationCalculatorPage = () => {
  return (
    <Layout>
      <div className="space-y-6 pb-6">
        <LiberationCalculator />
      </div>
    </Layout>
  );
};

export default LiberationCalculatorPage;
