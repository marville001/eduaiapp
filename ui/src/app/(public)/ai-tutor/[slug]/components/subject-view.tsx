import AiChatForm from "@/components/forms/ai-chat-form";
import { Subject } from '@/lib/api/subject.api';

interface SubjectViewProps {
  subject: Subject
}

export default async function SubjectView({ subject }: SubjectViewProps) {
  return (
    <main>

      {/* AI Chat Section */}
      <section className="py-20 bg-linear-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get {subject.name} Help Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Submit your {subject.name.toLowerCase()} questions and get instant,
              accurate solutions with step-by-step explanations.
            </p>
          </div>

          <AiChatForm />
        </div>
      </section>

      {/* Related Subjects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Related Subjects
            </h2>
            <p className="text-gray-600">
              Explore other subjects that complement your {subject.name.toLowerCase()} studies
            </p>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subject.relatedSubjects.map((relatedSlug) => {
              const relatedSubject = subjects[relatedSlug as keyof typeof subjects];
              if (!relatedSubject) return null;

              const RelatedIcon = relatedSubject.icon;

              return (
                <Card key={relatedSlug} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  <CardContent className={`p-6 ${relatedSubject.bgColor}`}>
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-linear-to-r ${relatedSubject.color} rounded-xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <RelatedIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {relatedSubject.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {relatedSubject.description.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div> */}
        </div>
      </section>
    </main>
  );
}