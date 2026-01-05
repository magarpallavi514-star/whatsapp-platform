# Template Sync Feature

## Overview
The template sync feature allows you to fetch and sync all your WhatsApp message templates from Meta WhatsApp Manager directly into your platform database.

## How It Works

### Frontend (Templates Page)
- **"Sync from WhatsApp" Button**: Located next to the "Create Template" button
- **Loading State**: Shows spinning icon and "Syncing..." text while fetching
- **Success Message**: Displays count of created/updated/synced templates
- **Auto Refresh**: Automatically refreshes the template list after sync

### Backend API
- **Endpoint**: `POST /api/templates/sync`
- **Authentication**: Requires Bearer token (API Key)
- **Process**:
  1. Fetches active phone number configuration (WABA ID + Access Token)
  2. Calls WhatsApp Graph API to get all templates
  3. Extracts template details (name, category, status, content, variables)
  4. Creates new templates or updates existing ones
  5. Returns sync statistics

## What Gets Synced

✅ **Template Name** - Unique identifier
✅ **Category** - MARKETING, UTILITY, or AUTHENTICATION
✅ **Status** - approved, pending, rejected, or draft
✅ **Language** - en, en_US, hi, es, etc.
✅ **Content** - Full message text from BODY component
✅ **Variables** - Extracted from {{1}}, {{2}} patterns
✅ **Components** - Full Meta template structure
✅ **Rejected Reason** - If template was rejected by Meta

## Manual Script
You can also run the sync manually from backend:
```bash
cd backend
node sync-templates.js
```

## Requirements
- Active phone number configuration with WABA ID
- Valid WhatsApp access token
- Internet connection to Meta Graph API

## Use Cases
1. **Initial Setup**: Sync all existing templates when first setting up platform
2. **New Templates**: After creating templates in Meta WhatsApp Manager
3. **Status Updates**: When template approval status changes
4. **Regular Sync**: Periodically sync to keep database up-to-date

## Success Response
```json
{
  "success": true,
  "message": "Successfully synced 5 templates from WhatsApp Manager",
  "synced": 5,
  "created": 3,
  "updated": 2,
  "stats": {
    "approved": 5,
    "pending": 0,
    "rejected": 0,
    "draft": 0,
    "total": 5
  }
}
```

## Error Handling
- **No WABA configured**: Returns error asking to configure phone number
- **API errors**: Displays Meta API error message
- **Network errors**: Shows generic sync failure message

## Notes
- Only syncs templates from WhatsApp Manager (not local drafts)
- Updates existing templates by `metaTemplateId`
- Preserves usage statistics (usageCount, lastUsedAt)
- Does not delete templates that are no longer in WhatsApp Manager
