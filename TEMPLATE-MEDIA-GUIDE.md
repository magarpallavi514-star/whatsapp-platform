# Template Deletion & Media Support Guide

## 🗑️ Template Deletion

### What Changed:
- **Before**: Only draft templates could be deleted
- **Now**: Any template can be deleted (draft, pending, approved, rejected)

### How It Works:
1. All templates now show a delete button (trash icon) in the Actions column
2. Clicking delete shows a confirmation dialog
3. Deletion is a soft delete (sets `deleted: true` in database)
4. Deleted templates don't appear in the list but remain in database for audit

### Use Cases:
- Remove outdated templates
- Clean up rejected templates
- Delete approved templates no longer needed
- Remove pending templates that won't be used

### Safety:
- Requires confirmation before deletion
- Soft delete preserves data
- Can be restored manually if needed

---

## 📸 Media Template Support

### Overview:
WhatsApp templates now support media attachments in the header (images, videos, documents).

### Supported Media Types:
1. **IMAGE** - Photos, graphics (JPEG, PNG)
2. **VIDEO** - Video files (MP4, etc.)
3. **DOCUMENT** - PDFs, Word docs, spreadsheets

### Creating Media Templates:

#### Step 1: Enable Media
- Check the **"Include Media (Header)"** checkbox in the create modal

#### Step 2: Configure Media
- **Media Type**: Select IMAGE, VIDEO, or DOCUMENT
- **Media URL**: Provide a sample media URL for Meta approval
- **Header Text**: (Optional for VIDEO/DOCUMENT) Add a caption/title

#### Step 3: Add Content
- Write your message body (supports variables like {{1}}, {{2}})
- Add optional footer text (max 60 characters)

#### Step 4: Submit
- Template is created as DRAFT
- Must be synced to Meta for approval

### Template Structure with Media:

```json
{
  "name": "order_confirmation_with_image",
  "language": "en",
  "category": "UTILITY",
  "components": [
    {
      "type": "HEADER",
      "format": "IMAGE",
      "example": {
        "header_handle": ["https://example.com/order-image.jpg"]
      }
    },
    {
      "type": "BODY",
      "text": "Hello {{1}}, your order {{2}} has been confirmed!",
      "example": {
        "body_text": [["John", "ORD12345"]]
      }
    },
    {
      "type": "FOOTER",
      "text": "Thank you for shopping with us"
    }
  ]
}
```

### Media URL Guidelines:

**For Meta Approval:**
- Use publicly accessible URLs (HTTPS only)
- Sample URLs can be any valid media file
- Meta will validate format and accessibility

**For Sending Messages:**
- When sending, you'll provide actual media URL or file
- Can use different media for each message
- Supports S3 URLs, CDN links, etc.

### Form Features:

1. **Media Toggle**
   - Checkbox to enable/disable media
   - Shows/hides media configuration section

2. **Media Type Selector**
   - Dropdown with IMAGE/VIDEO/DOCUMENT options
   - Changes available fields dynamically

3. **Media URL Input**
   - Required when media is enabled
   - Sample URL for Meta approval
   - Can be any valid HTTPS URL

4. **Header Text** (VIDEO/DOCUMENT only)
   - Optional caption for videos
   - Optional filename for documents
   - Not available for images

5. **Footer Text**
   - Optional small text at bottom
   - Maximum 60 characters
   - Good for disclaimers, unsubscribe text

### Example Use Cases:

**E-commerce Order Confirmation:**
```
Header: Product image
Body: "Hi {{1}}, Order {{2}} confirmed! Ships {{3}}."
Footer: "Track at www.store.com"
```

**Restaurant Menu Special:**
```
Header: Food photo
Body: "Today's special: {{1}} for just {{2}}!"
Footer: "Valid until midnight"
```

**Document Delivery:**
```
Header: PDF invoice (DOCUMENT type)
Header Text: "Invoice_{{1}}.pdf"
Body: "Your invoice {{1}} for {{2}} is ready!"
Footer: "Questions? Reply to this message"
```

**Video Tutorial:**
```
Header: Tutorial video (VIDEO type)
Body: "Learn how to use {{1}} in just 2 minutes!"
Footer: "Need help? Contact support"
```

### Backend Processing:

The backend automatically:
1. Builds proper WhatsApp component structure
2. Extracts variables from body content ({{1}}, {{2}}, etc.)
3. Adds HEADER component if media enabled
4. Adds BODY component with content
5. Adds FOOTER component if footer text provided
6. Validates component structure

### Template View Modal:

When viewing a template with media:
- Shows all components (HEADER, BODY, FOOTER)
- Displays component types with badges
- Shows media format (IMAGE/VIDEO/DOCUMENT)
- Provides clickable sample media URL
- Displays component text content

### Important Notes:

1. **Draft Templates**: Created templates start as DRAFT
2. **Meta Approval**: Templates must be approved by Meta before use
3. **Media Validation**: Meta validates media URLs during approval
4. **Variable Limits**: WhatsApp supports up to 5 variables per template
5. **Footer Limit**: Maximum 60 characters for footer text
6. **Media Size**: Follow WhatsApp's media size limits (varies by type)

### Submission to Meta:

Templates created in the platform are DRAFT only. To submit to Meta:
1. Create template with all components
2. Use WhatsApp Business Manager to submit
3. Or sync from WhatsApp Manager after approval
4. Use "Sync from WhatsApp" button to pull approved templates

### Benefits:

✅ Rich media messages for better engagement
✅ Professional branded communications
✅ Product images in order confirmations
✅ PDF invoices and receipts
✅ Tutorial videos and guides
✅ Consistent formatting across all messages
✅ Footer for disclaimers and opt-out info
