<template>
  <div class="knowledge-base-editor">
    <form @submit.prevent="submitArticle" class="editor-form">
      <div class="form-group">
        <label for="article-title">Title *</label>
        <input 
          type="text" 
          id="article-title" 
          v-model="article.title" 
          placeholder="Article title"
          class="form-input"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="article-category">Category *</label>
        <select id="article-category" v-model="article.category" class="form-select">
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Tags</label>
        <div class="tags-input">
          <div class="tags-container">
            <div v-for="(tag, index) in article.tags" :key="index" class="tag">
              {{ tag }}
              <button type="button" class="tag-remove" @click="removeTag(index)">&times;</button>
            </div>
          </div>
          <div class="tag-add-container">
            <input 
              type="text" 
              v-model="newTag" 
              placeholder="Add tag"
              class="tag-input"
              @keydown.enter.prevent="addTag"
            />
            <button type="button" class="tag-add-btn" @click="addTag">+</button>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="article-content">Content *</label>
        <div class="editor-toolbar">
          <button type="button" @click="formatText('bold')" class="toolbar-btn" title="Bold">B</button>
          <button type="button" @click="formatText('italic')" class="toolbar-btn" title="Italic">I</button>
          <button type="button" @click="formatText('heading')" class="toolbar-btn" title="Heading">H</button>
          <button type="button" @click="formatText('list')" class="toolbar-btn" title="List">•</button>
          <button type="button" @click="formatText('link')" class="toolbar-btn" title="Link">🔗</button>
          <button type="button" @click="formatText('code')" class="toolbar-btn" title="Code">&lt;/&gt;</button>
        </div>
        <textarea 
          id="article-content" 
          v-model="article.content" 
          placeholder="Write the article content here..."
          class="form-textarea"
          rows="15"
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <div class="checkbox-item">
          <input type="checkbox" id="article-published" v-model="article.isPublished" />
          <label for="article-published">Publish article immediately</label>
        </div>
      </div>
      
      <div class="preview-section">
        <div class="preview-header">
          <h3>Preview</h3>
          <button type="button" class="preview-toggle" @click="togglePreview">
            {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          </button>
        </div>
        
        <div v-if="showPreview" class="article-preview">
          <h2 class="preview-title">{{ article.title || 'Article Title' }}</h2>
          <div class="preview-meta">
            <div class="preview-category">{{ article.category }}</div>
            <div class="preview-tags">
              <span v-for="(tag, index) in article.tags" :key="index" class="preview-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="preview-content" v-html="renderedContent"></div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn secondary" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn primary" :disabled="!isFormValid || isSubmitting">
          <span v-if="isSubmitting">
            <span class="spinner"></span> Saving...
          </span>
          <span v-else>{{ editMode ? 'Update Article' : 'Create Article' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted } from 'vue';
import { KnowledgeBaseArticle, TicketCategory } from '@/types/helpdesk';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Define props
interface EditorProps {
  article?: KnowledgeBaseArticle;
  editMode?: boolean;
}

const props = withDefaults(defineProps<EditorProps>(), {
  article: undefined,
  editMode: false
});

// Define emits
const emit = defineEmits(['submit', 'cancel']);

// State
const isSubmitting = ref(false);
const showPreview = ref(true);
const newTag = ref('');
const article = ref({
  title: props.article?.title || '',
  category: props.article?.category || 'Technical Support' as TicketCategory,
  tags: props.article?.tags || [],
  content: props.article?.content || '',
  isPublished: props.article?.isPublished || false
});

// Available categories
const categories: TicketCategory[] = [
  'Account',
  'Billing',
  'Technical Support',
  'Feature Request',
  'Bug Report',
  'Project',
  'Parts',
  'Inventory',
  'Other'
];

// Computed
const isFormValid = computed(() => {
  return article.value.title.trim() !== '' && 
         article.value.content.trim() !== '';
});

// Convert markdown to HTML for preview
const renderedContent = computed(() => {
  if (!article.value.content) return '';
  const htmlContent = marked(article.value.content);
  return DOMPurify.sanitize(htmlContent);
});

// Methods
const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !article.value.tags.includes(tag)) {
    article.value.tags.push(tag);
    newTag.value = '';
  }
};

const removeTag = (index: number) => {
  article.value.tags.splice(index, 1);
};

const formatText = (type: string) => {
  const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = article.value.content;
  const selectedText = text.substring(start, end);
  
  let formattedText = '';
  let newCursorPos = 0;
  
  switch (type) {
    case 'bold':
      formattedText = `**${selectedText}**`;
      newCursorPos = start + 2;
      break;
    case 'italic':
      formattedText = `*${selectedText}*`;
      newCursorPos = start + 1;
      break;
    case 'heading':
      formattedText = `\n## ${selectedText}\n`;
      newCursorPos = start + 4;
      break;
    case 'list':
      // Split selected text into lines and add bullet points
      formattedText = selectedText
        .split('\n')
        .map(line => `- ${line}`)
        .join('\n');
      newCursorPos = start + 2;
      break;
    case 'link':
      formattedText = `[${selectedText}](url)`;
      newCursorPos = start + selectedText.length + 3;
      break;
    case 'code':
      if (selectedText.includes('\n')) {
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        newCursorPos = start + 4;
      } else {
        formattedText = `\`${selectedText}\``;
        newCursorPos = start + 1;
      }
      break;
  }
  
  article.value.content = 
    text.substring(0, start) + 
    formattedText + 
    text.substring(end);
  
  // Set cursor position after formatting
  setTimeout(() => {
    textarea.focus();
    if (selectedText) {
      textarea.setSelectionRange(
        start, 
        start + formattedText.length
      );
    } else {
      textarea.setSelectionRange(
        newCursorPos, 
        newCursorPos
      );
    }
  }, 0);
};

const submitArticle = () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    const articleData = {
      title: article.value.title,
      category: article.value.category,
      tags: article.value.tags,
      content: article.value.content,
      isPublished: article.value.isPublished
    };
    
    emit('submit', articleData);
  } catch (error) {
    console.error('Error submitting article:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // If editing an existing article, populate the form
  if (props.article) {
    article.value = {
      title: props.article.title,
      category: props.article.category,
      tags: [...props.article.tags],
      content: props.article.content,
      isPublished: props.article.isPublished
    };
  }
});
</script>

<style scoped>
.knowledge-base-editor {
  width: 100%;
}

.editor-form {
  width: 100%;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
  font-family: monospace;
  line-height: 1.6;
}

.form-select {
  appearance: none;
  background: white url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

/* Tags input */
.tags-input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  min-height: 45px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
}

.tag-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  margin: 0;
}

.tag-remove:hover {
  color: #ef4444;
}

.tag-add-container {
  display: flex;
}

.tag-input {
  flex: 1;
  border: none;
  padding: 12px;
  outline: none;
}

.tag-add-btn {
  background-color: #f3f4f6;
  border: none;
  border-left: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  font-size: 16px;
  padding: 0 16px;
}

.tag-add-btn:hover {
  background-color: #e5e7eb;
}

/* Editor toolbar */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #f3f4f6;
  border-radius: 6px;
}

.toolbar-btn {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: #1f2937;
  cursor: pointer;
  font-size: 16px;
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* Checkbox */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* Preview section */
.preview-section {
  margin-bottom: 24px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f3f4f6;
  border-bottom: 1px solid #d1d5db;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
}

.preview-toggle {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.preview-toggle:hover {
  text-decoration: underline;
}

.article-preview {
  padding: 24px;
  background-color: white;
}

.preview-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 24px;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.preview-category {
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  background-color: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.preview-content {
  line-height: 1.8;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.preview-content p {
  margin-bottom: 1.25em;
}

.preview-content ul,
.preview-content ol {
  margin-bottom: 1.25em;
  padding-left: 1.5em;
}

.preview-content li {
  margin-bottom: 0.5em;
}

.preview-content blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  color: #6b7280;
}

.preview-content code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.preview-content pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1.25em;
}

.preview-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

/* Action buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #f3f4f6;
  color: #1f2937;
}

.btn.secondary:hover {
  background-color: #e5e7eb;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>