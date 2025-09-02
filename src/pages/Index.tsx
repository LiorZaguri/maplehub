import Navigation from '@/components/Navigation';
import Roster from './Roster';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6 md:p-8">
          <Roster />
        </main>
      </div>
    </div>
  );
};

export default Index;
