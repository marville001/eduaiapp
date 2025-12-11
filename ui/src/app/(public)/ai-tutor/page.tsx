import AiChatForm from '@/components/forms/ai-chat-form';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <main className='py-8'>
      <Suspense fallback={<div className='flex min-h-[60vh] items-center justify-center'>Loading...</div>}>
        <div className="flex max-w-[850px] mx-auto px-4">
          <AiChatForm />
        </div>
      </Suspense>
    </main>
  );
}
