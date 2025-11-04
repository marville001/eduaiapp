# Subject Management System

## Overview
This subject management system provides a comprehensive interface for managing subjects in the AI Education Platform. It includes full CRUD operations with TanStack Query integration for efficient data management, manual slug control, AI prompt configuration, and SEO metadata management.

## Features

### 1. Subject List (`/admin/subjects`)
- View all subjects with pagination and search
- Real-time statistics (Total, Active, Inactive subjects)
- Quick actions (Quick Edit, View Details, Delete, Toggle Status)
- Responsive grid layout with detailed information
- Direct links to detailed subject view

### 2. Add Subject (`/admin/subjects/new`)
- Clean form interface for creating new subjects
- **Manual slug control with auto-generation option**
- Form validation with Zod schema
- Success/error handling with toast notifications
- Real-time slug preview and regeneration

### 3. Subject Details View (`/admin/subjects/[id]`)
- **Comprehensive subject editing interface**
- **Tabbed navigation for different aspects**
- **Real-time edit/view mode switching**
- **Visual status indicators and quick stats**

#### 3.1 Subject Details Tab
- Edit basic subject information (name, slug, description)
- Active/inactive status toggle
- Auto-slug generation with manual override
- Unsaved changes tracking

#### 3.2 AI Prompt Tab
- **Configure custom AI tutoring prompts**
- **Pre-built prompt templates for quick setup**
- **Character count and prompt preview**
- **Copy/paste functionality**
- Template categories: General Tutor, Problem Solver, Concept Builder

#### 3.3 SEO Settings Tab
- **Complete SEO metadata management**
- **SEO title and description optimization**
- **Tag management with add/remove functionality**
- **SEO image URL configuration**
- **Live search result preview**
- **Auto-generate SEO defaults button**

### 4. AI Prompts Management (`/admin/subjects/prompts`)
- Global view of all AI prompts across subjects
- Visual prompt cards with subject association
- Search and filter functionality
- Status management (Active/Inactive)

### 5. API Test Page (`/admin/subjects/test`)
- Test API connectivity
- Debug API responses
- Create/Delete subjects directly
- View raw API data

## Technical Implementation

### API Integration
- **TanStack Query**: For efficient data fetching and caching
- **Axios**: HTTP client with interceptors for authentication
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Optimistic Updates**: Immediate UI updates with server synchronization

### Components Structure
```
/admin/subjects/
├── page.tsx                 # Main subjects list
├── layout.tsx              # Navigation tabs
├── new/
│   └── page.tsx            # Add new subject form
├── prompts/
│   └── page.tsx            # AI prompts management
├── test/
│   └── page.tsx            # API testing interface
└── components/
    ├── subject-form.tsx    # Reusable subject form
    └── delete-confirm-dialog.tsx  # Delete confirmation
```

### Key Features

#### Data Management
- **Real-time Updates**: Changes reflect immediately across all views
- **Caching**: TanStack Query handles intelligent caching
- **Optimistic Updates**: UI updates before server confirmation
- **Error Recovery**: Automatic retry and rollback on failures

#### User Experience
- **Responsive Design**: Works on all device sizes
- **Loading States**: Skeleton loaders and loading indicators
- **Toast Notifications**: Success/error feedback
- **Confirmation Dialogs**: Prevent accidental deletions

#### Form Handling
- **React Hook Form**: Efficient form state management
- **Zod Validation**: Type-safe form validation
- **Error Display**: Field-level error messages
- **Auto-save**: Form data persistence

## API Endpoints Used

```typescript
// Get all subjects
GET /subjects

// Get subject by ID  
GET /subjects/:id

// Create subject
POST /subjects
{
  "name": string,
  "slug": string?,              // Manual slug or auto-generated
  "description": string?,
  "aiPrompt": string?,          // Custom AI tutoring prompt
  "seoTitle": string?,          // SEO page title
  "seoDescription": string?,    // SEO meta description
  "seoTags": string[]?,         // SEO keywords/tags
  "seoImage": string?           // SEO image URL
}

// Update subject
PATCH /subjects/:id
{
  "name": string?,
  "slug": string?,
  "description": string?,
  "isActive": boolean?,
  "aiPrompt": string?,
  "seoTitle": string?,
  "seoDescription": string?,
  "seoTags": string[]?,
  "seoImage": string?
}

// Delete subject
DELETE /subjects/:id
```

## Usage Instructions

### Getting Started
1. Navigate to `/admin/subjects` from the admin dashboard
2. Use the navigation tabs to switch between different views
3. The system will automatically load subjects from the API

### Adding a Subject
1. Click "Add Subject" button or navigate to `/admin/subjects/new`
2. Fill in the subject name (required)
3. **Set custom slug or let it auto-generate from name**
4. Optionally add a description
5. Click "Create Subject"
6. The subject will be created and you'll be redirected to the main list

### Managing Subject Details
1. From the subjects list, click the "View Details" option in the dropdown
2. Navigate to `/admin/subjects/[id]` for comprehensive editing
3. **Toggle between Edit and View modes using the top-right button**
4. Use the three tabs to manage different aspects:
   - **Details**: Basic information, slug, description, status
   - **AI Prompt**: Custom tutoring prompts with templates
   - **SEO**: Complete SEO metadata and social sharing

### Setting Up AI Prompts
1. Go to subject details and click the "AI Prompt" tab
2. **Choose from pre-built templates or create custom prompts**
3. Templates include:
   - **General Tutor**: All-purpose tutoring approach
   - **Problem Solver**: Focus on step-by-step problem solving
   - **Concept Builder**: Emphasis on foundational understanding
4. Customize the prompt text as needed
5. Save changes - prompts are used immediately in AI responses

### Configuring SEO Settings
1. Navigate to the "SEO" tab in subject details
2. **Click "Generate SEO Defaults" for quick setup**
3. Customize SEO title (50-60 characters recommended)
4. Write compelling meta description (150-160 characters)
5. **Add relevant tags using the tag input (press Enter to add)**
6. Set SEO image URL for social media sharing
7. **Preview how the page will appear in search results**

### Managing Subjects
- **Edit**: Click the edit button in the actions dropdown
- **Delete**: Click delete and confirm in the dialog
- **Toggle Status**: Use the activate/deactivate button
- **Search**: Use the search bar to filter subjects

### API Testing
1. Go to `/admin/subjects/test`
2. Check the connection status
3. Test creating/deleting subjects
4. View raw API responses for debugging

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Authentication
The system uses JWT tokens stored in sessionStorage. The API client automatically includes the token in requests.

## Error Handling

### Network Errors
- Automatic retry for failed requests
- User-friendly error messages
- Fallback UI states

### Validation Errors
- Real-time form validation
- Server-side validation feedback
- Field-level error display

### Permission Errors
- Role-based access control
- Graceful permission denied handling
- Redirect to appropriate pages

## Database Schema Updates

The following fields have been added to the `subjects` table:

```sql
ALTER TABLE "subjects" 
ADD "ai_prompt" text,
ADD "seo_title" character varying(255),
ADD "seo_description" text,
ADD "seo_tags" text,
ADD "seo_image" character varying(500);
```

### Field Specifications
- `ai_prompt`: TEXT - Custom AI tutoring prompt for the subject
- `seo_title`: VARCHAR(255) - SEO-optimized page title
- `seo_description`: TEXT - Meta description for search engines
- `seo_tags`: TEXT - Comma-separated tags (stored as simple-array)
- `seo_image`: VARCHAR(500) - URL to SEO/social media image

## Future Enhancements

### Phase 2 Features
- [ ] Bulk operations (delete multiple subjects)
- [ ] Subject categories/grouping
- [ ] Advanced filtering options
- [ ] Export/import functionality
- [ ] Subject usage analytics
- [ ] Image upload for SEO images
- [ ] AI prompt versioning and A/B testing

### Enhanced AI Features
- [x] Custom AI prompts per subject
- [x] Prompt templates for quick setup
- [ ] Prompt performance analytics
- [ ] Dynamic prompt variables
- [ ] Multi-language prompt support

## Troubleshooting

### Common Issues

#### "Failed to load subjects"
1. Check API server is running on port 8080
2. Verify NEXT_PUBLIC_API_URL in .env
3. Check network connectivity
4. Verify authentication token

#### Form not submitting
1. Check form validation errors
2. Verify required fields are filled
3. Check browser console for errors
4. Ensure API endpoint is accessible

#### Styles not loading
1. Ensure Tailwind CSS is configured
2. Check component imports
3. Verify UI components are installed

### Debug Steps
1. Use the API Test page to verify connectivity
2. Check browser network tab for failed requests
3. Review console logs for JavaScript errors
4. Verify authentication headers in requests