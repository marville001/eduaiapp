import type { Metadata } from 'next';
import TeacherRegistrationForm from '@/components/forms/TeacherRegistrationForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Teacher Registration | MasomoDash - Sell Educational Materials',
  description: 'Join MasomoDash as a verified teacher and start selling your educational materials. Upload papers, exams, and teaching resources to earn income while helping students succeed.',
  keywords: 'teacher registration, sell educational materials, teaching resources, academic papers, exam papers, teacher verification, educational marketplace Kenya',
  openGraph: {
    title: 'Teacher Registration | MasomoDash',
    description: 'Become a verified teacher on MasomoDash and monetize your educational expertise. Sell papers, exams, and resources to students across Kenya.',
    type: 'website',
    siteName: 'MasomoDash',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teacher Registration | MasomoDash',
    description: 'Join as a verified teacher and start selling educational materials on Kenya\'s leading academic marketplace.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/register/teacher',
  },
};

export default function TeacherRegistrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join as a Verified Teacher
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your expertise and earn income by selling educational materials 
            to students across Kenya. Complete our verification process to get started.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
              {' '}or{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                register as a student
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <TeacherRegistrationForm />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-green-600 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Income</h3>
            <p className="text-gray-600 text-sm">
              Monetize your educational expertise by selling papers, exams, and teaching resources.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-blue-600 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Status</h3>
            <p className="text-gray-600 text-sm">
              Get a verified badge that builds trust with students and increases your sales.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-purple-600 mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Students</h3>
            <p className="text-gray-600 text-sm">
              Impact education by providing quality materials that help students succeed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}