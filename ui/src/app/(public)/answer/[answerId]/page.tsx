import { Metadata } from 'next';
import AnswerPageClient from './AnswerPageClient';

interface AnswerPageProps {
	params: Promise<{
		answerId: string;
	}>;
}

export async function generateMetadata({ params }: AnswerPageProps): Promise<Metadata> {
	const { answerId } = await params;
	return {
		title: `Answer AI Education Platform`,
		description: 'View your AI-generated answer and continue the conversation',
	};
}

export default async function AnswerPage({ params }: AnswerPageProps) {
	const { answerId } = await params;
	return <AnswerPageClient answerId={answerId} />;
}