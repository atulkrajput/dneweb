import React, { useState } from 'react';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { Upload, X, Image, AlertCircle, Video, Youtube } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import InsightRichTextEditor from '@/Components/InsightRichTextEditor';

export default function InsightForm({ insight, teamMembers }) {
  const isEditing = !!insight;
  const [featuredPreview, setFeaturedPreview] = useState(insight?.featured_image || null);
  const [otherPreviews, setOtherPreviews] = useState(insight?.other_images || []);
  const [videoPreview, setVideoPreview] = useState(insight?.video_file || null);

  const { props } = usePage();
  const pageErrors = props.errors || {};

  const { data, setData, processing, errors: formErrors } = useForm({
    title: insight?.title || '',
    slug: insight?.slug || '',
    small_description: insight?.small_description || '',
    detail_description: insight?.detail_description || '',
    tags: insight?.tags || [],
    featured_image: insight?.featured_image || '',
    featured_image_file: null,
    other_images: insight?.other_images || [],
    other_image_files: [],
    video_file: insight?.video_file || '',
    video_file_upload: null,
    youtube_link: insight?.youtube_link || '',
    meta_title: insight?.meta_title || '',
    meta_description: insight?.meta_description || '',
    meta_keywords: insight?.meta_keywords || '',
    is_published: insight?.is_published ?? false,
    published_at: insight?.published_at ? insight.published_at.split('T')[0] : '',
    sort_order: insight?.sort_order || 0,
    author_id: insight?.author_id || '',
  });

  const errors = { ...formErrors, ...pageErrors };
  const hasErrors = Object.keys(errors).length > 0;

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setData('title', title);
    if (!isEditing || !insight?.slug) {
      setData('slug', generateSlug(title));
    }
  };

  // Featured image handlers
  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('featured_image_file', file);
      setData('featured_image', '');
      setFeaturedPreview(URL.createObjectURL(file));
    }
  };

  const removeFeaturedImage = () => {
    setData('featured_image_file', null);
    setData('featured_image', '');
    setFeaturedPreview(null);
  };

  // Other images handlers
  const handleOtherImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setData('other_image_files', [...data.other_image_files, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setOtherPreviews([...otherPreviews, ...newPreviews]);
    }
  };

  const removeOtherImage = (index) => {
    const existingCount = data.other_images.length;
    if (index < existingCount) {
      const updated = data.other_images.filter((_, i) => i !== index);
      setData('other_images', updated);
      setOtherPreviews(otherPreviews.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingCount;
      const updatedFiles = data.other_image_files.filter((_, i) => i !== fileIndex);
      setData('other_image_files', updatedFiles);
      setOtherPreviews(otherPreviews.filter((_, i) => i !== index));
    }
  };

  // Video file handler
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Video file must be less than 10MB');
        return;
      }
      setData('video_file_upload', file);
      setData('video_file', '');
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeVideo = () => {
    setData('video_file_upload', null);
    setData('video_file', '');
    setVideoPreview(null);
  };

  // Tags handlers
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !data.tags.includes(tag)) {
      setData('tags', [...data.tags, tag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (index) => {
    setData('tags', data.tags.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('small_description', data.small_description || '');
    formData.append('detail_description', data.detail_description || '');
    formData.append('featured_image', data.featured_image || '');
    formData.append('video_file', data.video_file || '');
    formData.append('youtube_link', data.youtube_link || '');
    formData.append('meta_title', data.meta_title || '');
    formData.append('meta_description', data.meta_description || '');
    formData.append('meta_keywords', data.meta_keywords || '');
    formData.append('is_published', data.is_published ? '1' : '0');
    formData.append('published_at', data.published_at || '');
    formData.append('sort_order', data.sort_order);
    formData.append('author_id', data.author_id || '');

    // Tags
    data.tags.forEach((tag, i) => {
      formData.append(`tags[${i}]`, tag);
    });

    // Existing other images
    data.other_images.forEach((img, i) => {
      formData.append(`other_images[${i}]`, img);
    });

    // File uploads
    if (data.featured_image_file) {
      formData.append('featured_image_file', data.featured_image_file);
    }

    data.other_image_files.forEach((file, i) => {
      formData.append(`other_image_files[${i}]`, file);
    });

    if (data.video_file_upload) {
      formData.append('video_file_upload', data.video_file_upload);
    }

    if (isEditing) {
      formData.append('_method', 'PUT');
      router.post(`/admin/insights/${insight.id}`, formData, {
        forceFormData: true,
        preserveScroll: true,
      });
    } else {
      router.post('/admin/insights', formData, {
        forceFormData: true,
        preserveScroll: true,
      });
    }
  };

  return (
    <AdminLayout title={isEditing ? `Edit: ${insight.title}` : 'New Insight'}>
      <Head title={isEditing ? `Edit ${insight.title}` : 'New Insight'} />

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

        {/* Error Summary */}
        {hasErrors && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="text-sm text-destructive/90">
                      <span className="font-medium">{field.replace(/_/g, ' ').replace(/\./g, ' ')}:</span> {message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
            <input type="text" value={data.title} onChange={handleTitleChange} className={`form-input ${errors.title ? 'border-destructive' : ''}`} placeholder="Enter insight title" />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Slug *</label>
            <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className={`form-input ${errors.slug ? 'border-destructive' : ''}`} placeholder="insight-url-slug" />
            {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Short Description</label>
            <textarea value={data.small_description} onChange={(e) => setData('small_description', e.target.value)} className={`form-input resize-y ${errors.small_description ? 'border-destructive' : ''}`} rows={3} placeholder="Brief description shown in listings (max 500 chars)" maxLength={500} />
            <p className="text-xs text-muted-foreground mt-1">{data.small_description.length}/500 characters</p>
            {errors.small_description && <p className="text-sm text-destructive mt-1">{errors.small_description}</p>}
          </div>

          {/* Author / Writer */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Written By</label>
            <select value={data.author_id} onChange={(e) => setData('author_id', e.target.value)} className="form-input">
              <option value="">Select Author</option>
              {(teamMembers || []).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}{member.position ? ` — ${member.position}` : ''}
                </option>
              ))}
            </select>
            {errors.author_id && <p className="text-sm text-destructive mt-1">{errors.author_id}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(index)} className="hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="form-input flex-1"
                placeholder="Type tag and press Enter or comma"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort Order</label>
              <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Publish Date</label>
              <input type="date" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} className="form-input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                <span className="text-sm text-foreground">Published</span>
              </label>
            </div>
          </div>
        </div>

        {/* Detail Description (Rich Text) */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Detail Description</h3>
          <p className="text-sm text-muted-foreground">Use the toolbar to add formatting, links, images, and symbols. You can insert images directly or upload them.</p>
          <InsightRichTextEditor
            content={data.detail_description}
            onChange={(html) => setData('detail_description', html)}
          />
          {errors.detail_description && <p className="text-sm text-destructive mt-1">{errors.detail_description}</p>}
        </div>

        {/* Featured Image */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Featured Image</h3>

          {featuredPreview && (
            <div className="relative inline-block">
              <img src={featuredPreview} alt="Featured preview" className="max-w-md h-48 object-cover rounded-xl border border-border" />
              <button type="button" onClick={removeFeaturedImage} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {!featuredPreview && (
            <div className="w-full max-w-md h-48 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
              <div className="text-center">
                <Image className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No featured image</p>
              </div>
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
            <Upload className="h-4 w-4" />
            Upload Featured Image
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFeaturedImageChange} className="hidden" />
          </label>
          <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP. Max 5MB.</p>
          {errors.featured_image_file && <p className="text-sm text-destructive mt-1">{errors.featured_image_file}</p>}
        </div>

        {/* Other Images (Gallery) */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Additional Images</h3>
          <p className="text-sm text-muted-foreground">Upload multiple images for this insight article.</p>

          {otherPreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {otherPreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <img src={src} alt={`Image ${index + 1}`} className="w-full h-28 object-cover rounded-lg border border-border" />
                  <button type="button" onClick={() => removeOtherImage(index)} className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
            <Image className="h-4 w-4" />
            Add Images
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleOtherImagesUpload} className="hidden" />
          </label>
          <p className="text-xs text-muted-foreground">Accepts JPG, PNG, WebP. Max 5MB each.</p>
        </div>

        {/* Video */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">Video (Optional)</h3>

          {/* Video File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">Upload Video File</label>

            {videoPreview && (
              <div className="relative inline-block">
                <video src={videoPreview} className="max-w-md h-48 rounded-xl border border-border" controls />
                <button type="button" onClick={removeVideo} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {!videoPreview && (
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors w-fit">
                <Video className="h-4 w-4" />
                Upload Video (MP4)
                <input type="file" accept="video/mp4" onChange={handleVideoChange} className="hidden" />
              </label>
            )}
            <p className="text-xs text-muted-foreground">Accepts MP4 only. Max 10MB.</p>
            {errors.video_file_upload && <p className="text-sm text-destructive mt-1">{errors.video_file_upload}</p>}
            {errors.video_file && <p className="text-sm text-destructive mt-1">{errors.video_file}</p>}
          </div>

          {/* YouTube Link */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <span className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-500" /> YouTube Link</span>
            </label>
            <input type="text" value={data.youtube_link} onChange={(e) => setData('youtube_link', e.target.value)} className="form-input" placeholder="https://www.youtube.com/watch?v=..." />
            {errors.youtube_link && <p className="text-sm text-destructive mt-1">{errors.youtube_link}</p>}
          </div>
        </div>

        {/* SEO / Meta */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-foreground">SEO & Meta Information</h3>
          <p className="text-sm text-muted-foreground">Leave blank to auto-generate from title and description.</p>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Title</label>
            <input type="text" value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} className="form-input" placeholder="Auto-generated if left blank" />
            {errors.meta_title && <p className="text-sm text-destructive mt-1">{errors.meta_title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Description</label>
            <textarea value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} className="form-input resize-y" rows={3} placeholder="Auto-generated if left blank" maxLength={500} />
            {errors.meta_description && <p className="text-sm text-destructive mt-1">{errors.meta_description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Meta Keywords</label>
            <input type="text" value={data.meta_keywords} onChange={(e) => setData('meta_keywords', e.target.value)} className="form-input" placeholder="Auto-generated from tags if left blank" />
            {errors.meta_keywords && <p className="text-sm text-destructive mt-1">{errors.meta_keywords}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={processing} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {processing ? 'Saving...' : (isEditing ? 'Update Insight' : 'Create Insight')}
          </button>
          <Link href="/admin/insights" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}
