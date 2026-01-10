# 📋 Templates Endpoint - Fetch All

## Endpoint

```
GET /api/integrations/templates
```

---

## Headers

```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | How many templates per page |
| `offset` | number | 0 | Skip how many templates |
| `status` | string | - | Filter: `approved`, `pending`, `draft`, `rejected` |
| `category` | string | - | Filter: `MARKETING`, `UTILITY`, `AUTHENTICATION` |

---

## Examples

### 1️⃣ Fetch All Templates
```bash
curl -X GET "http://localhost:3001/api/integrations/templates" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### 2️⃣ Fetch Only Approved Templates
```bash
curl -X GET "http://localhost:3001/api/integrations/templates?status=approved" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 3️⃣ Fetch Approved Marketing Templates with Pagination
```bash
curl -X GET "http://localhost:3001/api/integrations/templates?status=approved&category=MARKETING&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4️⃣ Fetch with Limit & Offset (Page 2, 20 per page)
```bash
curl -X GET "http://localhost:3001/api/integrations/templates?limit=20&offset=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Response

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "695a1a0fbcb4b39a4abb7ac3",
        "accountId": "pixels_internal",
        "name": "welcome_template",
        "language": "en",
        "category": "UTILITY",
        "content": "Hello {{1}}, welcome to {{2}}!",
        "variables": ["1", "2"],
        "components": [],
        "status": "approved",
        "metaTemplateId": "123456789",
        "usageCount": 45,
        "lastUsedAt": "2026-01-08T20:11:46.000Z",
        "lastSyncedAt": "2026-01-08T20:11:46.000Z",
        "approvedAt": "2026-01-05T10:30:00.000Z",
        "deleted": false,
        "createdAt": "2026-01-04T12:00:00.000Z",
        "updatedAt": "2026-01-08T20:11:46.000Z"
      },
      {
        "_id": "695a1a0fbcb4b39a4abb7ac4",
        "name": "order_confirmation",
        "status": "approved",
        "variables": ["1", "2", "3"],
        "usageCount": 120
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    },
    "stats": {
      "approved": 120,
      "pending": 15,
      "rejected": 10,
      "draft": 5,
      "total": 150
    }
  }
}
```

---

## Key Fields Explained

| Field | Use |
|-------|-----|
| `_id` | Template ID (use for GET single, UPDATE, DELETE) |
| `name` | Template name (use for SEND) |
| `content` | Template text with `{{1}}`, `{{2}}` placeholders |
| `variables` | Array like `["1", "2"]` = how many input fields needed |
| `status` | Only send templates with `status: "approved"` |
| `usageCount` | How many times this template was sent |
| `lastUsedAt` | When was it last sent |
| `category` | MARKETING, UTILITY, AUTHENTICATION |

---

## What to Do Next

1. **Fetch templates** using this endpoint
2. **Show in dropdown** with template name and variable count
3. **When user clicks a template**, fetch single details: `GET /api/integrations/templates/{_id}`
4. **Create form fields** based on `variables` count
5. **Send message** with `POST /api/integrations/templates/send`

---

## Error Responses

### ❌ Invalid API Key
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### ❌ Server Error
```json
{
  "success": false,
  "message": "Failed to fetch templates",
  "error": "error details"
}
```

---

## Notes

- Only returns `deleted: false` templates
- Default shows 50 templates per page
- Use pagination if you have 100+ templates
- Filter by `status=approved` to show only sendable templates
