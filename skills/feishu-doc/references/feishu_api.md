# Feishu API Reference

## Authentication

Get tenant access token:

```bash
TOKEN=$(curl -s -X POST 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal' \
  -H 'Content-Type: application/json' \
  -d '{"app_id":"YOUR_APP_ID","app_secret":"YOUR_APP_SECRET"}' | jq -r '.tenant_access_token')
```

**App ID**: stored in `openclaw.json` under `channels.feishu.appId`
**App Secret**: stored in `openclaw.json` under `channels.feishu.appSecret`

---

## Image Messaging

### Process: Send Image to User

1. **Upload image** → get `image_key`
2. **Send message** with `msg_type: "image"` and `content: {"image_key": "..."}`

### Step 1: Upload Image

```bash
curl -s -X POST 'https://open.feishu.cn/open-apis/im/v1/images' \
  -H "Authorization: Bearer $TOKEN" \
  -F 'image_type=message' \
  -F 'image=@/path/to/image.png' | jq .
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "image_key": "img_v3_02vi_xxxxx"
  }
}
```

### Step 2: Send Image Message

```bash
curl -s -X POST 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "receive_id": "USER_OPEN_ID",
    "msg_type": "image",
    "content": "{\"image_key\":\"img_v3_02vi_xxxxx\"}"
  }' | jq .
```

### Supported Formats

- ✅ PNG, JPG, GIF, BMP
- ❌ **SVG NOT supported** — must convert to PNG first

**Convert SVG to PNG:**
```bash
rsvg-convert input.svg -o output.png
```

---

## Document Editing (Docx API)

### ⚠️ Critical Rules

**NEVER use `write` action for partial edits**

- `write` **replaces the entire document** — breaks formatting, order, and structure
- Use `update_block` for targeted edits

### Correct Workflow for Document Edits

1. **Read current state**: `action: read` or `action: list_blocks`
2. **Identify block IDs**: Get the specific block_id for the section you want to edit
3. **Update specific blocks**: `action: update_block` with block_id and new content
4. **Preserve order**: Never change document structure unless explicitly intended

### Example: Update a Single Block

```bash
# Get blocks to find the block_id
curl -s -X GET "https://open.feishu.cn/open-apis/docx/v1/documents/{doc_token}/blocks" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.items[] | {block_id, text}'

# Update specific block
curl -s -X PATCH "https://open.feishu.cn/open-apis/docx/v1/documents/{doc_token}/blocks/{block_id}" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "update_text_elements": {
      "elements": [
        {
          "text_run": {
            "content": "New text content"
          }
        }
      ]
    }
  }'
```

### Using feishu_doc Tool

**Read document:**
```
action: read
doc_token: YOUR_DOC_TOKEN
```

**List blocks:**
```
action: list_blocks
doc_token: YOUR_DOC_TOKEN
```

**Update block:**
```
action: update_block
doc_token: YOUR_DOC_TOKEN
block_id: doxcnXXXXX
content: "New text content"
```

**Upload image to doc:**
```
action: upload_image
doc_token: YOUR_DOC_TOKEN
file_path: /path/to/image.png
```

---

## Comment API

### Read Comments (Drive API)

```bash
curl -s -X GET "https://open.feishu.cn/open-apis/drive/v1/files/{file_token}/comments?file_type=docx&page_size=50" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response includes:**
- `comment_id` — Comment ID
- `user_id` — Commenter's user ID
- `quote` — Highlighted text (for inline comments)
- `reply_list.replies[].content.elements[].text_run.text` — Comment text
- `is_solved` — Whether comment is resolved

### Reply to Comment (Add New Reply)

```bash
curl -s -X POST "https://open.feishu.cn/open-apis/drive/v1/files/{file_token}/comments/{comment_id}/replies?file_type=docx" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "content": {
      "elements": [
        {
          "type": "text_run",
          "text_run": {
            "text": "Reply text here"
          }
        }
      ]
    }
  }'
```

### Update Existing Reply (Own Reply Only)

```bash
curl -s -X PUT "https://open.feishu.cn/open-apis/drive/v1/files/{file_token}/comments/{comment_id}/replies/{reply_id}?file_type=docx" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "content": {
      "elements": [
        {
          "type": "text_run",
          "text_run": {
            "text": "Edited reply text"
          }
        }
      ]
    }
  }'
```

**Important:**
- `POST /replies` = add a new reply to someone else's comment (typical workflow)
- `PUT /replies/{reply_id}` = edit an existing reply, usually only allowed for replies created by the same app/account

### Mark Comment as Solved

```bash
curl -s -X PATCH "https://open.feishu.cn/open-apis/drive/v1/files/{file_token}/comments/{comment_id}?file_type=docx" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"is_solved": true}'
```

**Required scope:** `docs:document.comment:update`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file_type` | string | Yes | Document type: `docx`, `sheet`, `file`, `slides` |
| `page_size` | int | No | Max 100, default 50 |
| `page_token` | string | No | Pagination token for next page |
| `is_whole` | boolean | No | Filter by whole-doc vs inline comments |
| `is_solved` | boolean | No | Filter by solved status |

---

## Read Document Blocks (Docx API)

### Get All Blocks

```bash
curl -s -X GET "https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks?page_size=500" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Find Block Containing Specific Text

```bash
curl -s -X GET "https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks?page_size=500" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data.items[] | select(.text?.elements[]?.text_run?.content | contains("search text")?) | .block_id'
```

### Get Block's Children

```bash
curl -s -X GET "https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/children" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Block Types

| Type ID | Block Type |
|---------|------------|
| `1` | Page block |
| `2` | Text block |
| `3-11` | Heading 1-9 |
| `12` | Bullet list |
| `13` | Ordered list |
| `14` | Code block |
| `15` | Quote |
| `17` | Todo |
| `31` | Table |
| `32` | Table cell |
