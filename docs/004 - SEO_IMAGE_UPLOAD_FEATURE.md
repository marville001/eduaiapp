# SEO Image Upload Feature

## Overview
Added comprehensive image upload functionality for both Featured Images and SEO Images in blogs and pages. Users can now either upload images directly or provide URLs.

## Components Created

### 1. ImageUpload Component (`/components/forms/image-upload.tsx`)
**Purpose**: Reusable image upload component with dual functionality

**Features**:
- **Dual Input Modes**: Upload files or provide URLs
- **Drag & Drop**: Intuitive file dropping interface
- **Image Preview**: Shows uploaded/URL images with aspect ratio
- **File Validation**: Size and type checking (5MB max by default)
- **Progress Indication**: Loading states during upload
- **Error Handling**: User-friendly error messages
- **Remove Functionality**: Easy image removal with X button

**Props**:
```typescript
interface ImageUploadProps {
  value?: string;           // Current image URL
  onChange: (value: string) => void; // Callback when image changes
  label: string;           // Display label
  description?: string;    // Help text
  placeholder?: string;    // URL input placeholder
  accept?: string;         // File type filter
  maxSize?: number;       // Max file size in MB
}
```

### 2. Upload API Route (`/app/api/storage/upload/route.ts`)
**Purpose**: Proxy endpoint to forward uploads to backend

**Features**:
- Forwards multipart form data to backend API
- Handles authentication and errors
- Returns S3 URLs for uploaded files

## Implementation

### Blog Form Updates
- **Featured Image**: Now supports upload + URL input
- **SEO Image**: Enhanced with upload functionality
- **Form Integration**: Seamless integration with react-hook-form

### Page Form Updates  
- **Featured Image**: Same upload capabilities as blog form
- **SEO Image**: Consistent UX across all forms

## User Experience

### Upload Mode
1. **Drag & Drop**: Users can drag images directly onto the upload area
2. **Click to Browse**: Traditional file picker interface
3. **Progress Feedback**: Loading spinner during upload
4. **Image Preview**: Immediate preview with remove option

### URL Mode
1. **URL Input**: Traditional text input for image URLs
2. **Preview**: Shows preview of URL-based images
3. **Error Handling**: Validates URL accessibility

### Switching Modes
- **Toggle Buttons**: Easy switching between Upload and URL modes
- **State Preservation**: Maintains current image when switching modes

## Backend Integration

### Storage System
- **S3 Integration**: Files uploaded to AWS S3
- **Authentication**: Requires JWT token for uploads
- **File Organization**: Uploads stored in organized folder structure
- **Metadata**: Preserves original filenames and upload timestamps

### API Endpoints
- `POST /api/storage/upload` - Upload files to S3
- `GET /api/storage/file/:key` - Stream files from S3
- `GET /api/storage/signed-url/:key` - Get signed URLs

## Security Features

### File Validation
- **Type Checking**: Only allows image files (image/*)
- **Size Limits**: Configurable max file size (5MB default)
- **Extension Validation**: Validates file extensions

### Upload Security
- **Authentication Required**: JWT token required for uploads
- **Server-side Validation**: Backend validates all uploads
- **Encryption**: Server-side encryption enabled (AES256)

## SEO Benefits

### Optimized Images
- **Automatic Optimization**: S3 serves optimized images
- **CDN Integration**: Fast global image delivery
- **Proper Dimensions**: UI guidance for optimal image sizes
- **Social Media Ready**: Specially optimized SEO images (1200x630px)

### Metadata
- **Alt Text**: Proper alt text for all images
- **Structured Data**: Images included in JSON-LD schemas
- **Open Graph**: Featured and SEO images used for social sharing

## Usage Examples

### Basic Usage
```tsx
<ImageUpload
  value={imageUrl}
  onChange={setImageUrl}
  label="Featured Image"
  description="Main image for your content"
/>
```

### Advanced Usage
```tsx
<ImageUpload
  value={seoImage}
  onChange={setSeoImage}
  label="SEO Image"
  description="Image for social media sharing (1200x630px recommended)"
  placeholder="https://example.com/seo-image.jpg"
  maxSize={10}
  accept="image/jpeg,image/png,image/webp"
/>
```

## File Structure
```
components/forms/
├── image-upload.tsx          # Main upload component

app/api/storage/
├── upload/route.ts          # Upload proxy endpoint

admin/blog/components/
├── blog-form.tsx            # Updated with ImageUpload

admin/pages/components/
├── page-form.tsx            # Updated with ImageUpload
```

## Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL for upload proxy
- `AWS_S3_BUCKET` - S3 bucket for file storage
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

### Customization
- **File Size Limits**: Configurable per component
- **File Types**: Customizable accept patterns
- **Upload Folders**: Backend organizes by folder structure
- **Image Processing**: Can add image optimization pipeline

## Benefits

### User Experience
- **Intuitive Interface**: Familiar drag-and-drop functionality
- **Flexible Input**: Choose between upload or URL
- **Immediate Feedback**: Instant previews and progress indicators
- **Error Prevention**: Validation prevents invalid uploads

### Developer Experience
- **Reusable Component**: Single component for all image needs
- **Type Safety**: Full TypeScript support
- **Form Integration**: Seamless react-hook-form integration
- **Easy Customization**: Flexible props for different use cases

### SEO & Performance
- **Optimized Delivery**: S3 CDN integration
- **Proper Metadata**: SEO-friendly image handling
- **Social Sharing**: Optimized images for social platforms
- **Fast Loading**: Efficient image serving and caching