import AiChatForm from '@/components/forms/ai-chat-form';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <main className='py-8'>
      <Suspense fallback={<div>Loading...</div>}>
        <AiChatForm />
      </Suspense>
    </main>
  );
}
