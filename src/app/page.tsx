import { WasteClassifier } from '@/components/waste-classifier';

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <WasteClassifier />
    </main>
  );
}
