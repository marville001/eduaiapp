#!/bin/bash

# Subject Management - Database Migration Guide
# Run this after updating the backend code

echo "🗄️  Subject Management - Database Setup"
echo "======================================="

echo ""
echo "📋 Pre-Migration Checklist:"
echo "- ✅ Updated Subject entity with new SEO fields"
echo "- ✅ Updated CreateSubjectDto with new fields"
echo "- ✅ Updated UpdateSubjectDto (inherits from CreateSubjectDto)"
echo "- ✅ Updated SubjectService with slug validation"
echo "- ✅ Created migration file: 1730000000000-AddSEOFieldsToSubjects.ts"

echo ""
echo "🔧 To apply the database changes:"
echo "1. Navigate to the API directory:"
echo "   cd api/"

echo ""
echo "2. Generate the migration (if not already created):"
echo "   npm run migration:generate AddSEOFieldsToSubjects"

echo ""
echo "3. Run the migration:"
echo "   npm run migration:run"

echo ""
echo "4. Verify the migration:"
echo "   npm run migration:show"

echo ""
echo "📊 New Database Schema:"
echo "The subjects table will include these new columns:"
echo "- ai_prompt (TEXT) - Custom AI tutoring prompt"
echo "- seo_title (VARCHAR 255) - SEO page title"
echo "- seo_description (TEXT) - Meta description"
echo "- seo_tags (TEXT) - Comma-separated tags"
echo "- seo_image (VARCHAR 500) - SEO image URL"

echo ""
echo "🧪 Testing the Updates:"
echo "1. Start the API server: npm run start:dev"
echo "2. Start the UI server: npm run dev"
echo "3. Navigate to: http://localhost:3000/admin/subjects"
echo "4. Test creating a subject with custom slug"
echo "5. Test the detailed view: http://localhost:3000/admin/subjects/[id]"
echo "6. Test AI prompt configuration"
echo "7. Test SEO settings with tags and metadata"

echo ""
echo "🐛 Common Issues & Solutions:"
echo ""
echo "If migration fails:"
echo "- Check database connection in .env"
echo "- Ensure no pending migrations: npm run migration:show"
echo "- Check for conflicting schema changes"

echo ""
echo "If API endpoints return errors:"
echo "- Verify DTO validation decorators are imported"
echo "- Check that new fields are optional in DTOs"
echo "- Test with Postman/API test page first"

echo ""
echo "If UI components have TypeScript errors:"
echo "- Ensure Subject interface includes new fields"
echo "- Check that API types match backend DTOs"
echo "- Verify all imports are correct"

echo ""
echo "✅ Success Criteria:"
echo "- ✅ Can create subjects with custom slugs"
echo "- ✅ Slug auto-generation works when field is empty"
echo "- ✅ Detailed subject view loads without errors"
echo "- ✅ AI prompt templates load and can be applied"
echo "- ✅ SEO settings save and display correctly"
echo "- ✅ Tags can be added/removed dynamically"
echo "- ✅ Search preview updates in real-time"

echo ""
echo "🚀 Ready to test the enhanced Subject Management system!"