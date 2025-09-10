# PDF Viewer & AI Data Extraction Dashboard

This is a full-stack monorepo application that allows users to upload and view PDFs, extract key invoice data using the Gemini AI, and perform full CRUD (Create, Read, Update, Delete) operations on the extracted data. This project was built as a take-home assignment for Flowbit Private Limited.

---

## ✨ Features

* **PDF Viewer:** Upload local PDFs (≤25 MB) with in-browser viewing, page navigation, and zoom.
* **AI Data Extraction:** Uses the Google Gemini API to extract structured data from invoices.
* **Editable Form:** All extracted data is populated into a dynamic, validated form for user correction.
* **Full CRUD Functionality:** Create, Read, Update, and Delete invoice records.
* **Search:** A dedicated page to list all saved invoices with a real-time search by vendor or invoice number.
* **Secure & Robust:** Handles file storage via Vercel Blob and data persistence in MongoDB Atlas.

---

## 🛠️ Technical Stack

* **Monorepo:** Turborepo
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
* **Backend:** Node.js, Express, TypeScript
* **Database:** MongoDB Atlas
* **AI:** Google Gemini API
* **File Storage:** Vercel Blob
* **Deployment:** Vercel

---

## ⚙️ Local Setup

### Prerequisites

* Node.js (v18+)
* npm (or your preferred package manager)
* MongoDB Atlas account
* Google Gemini API Key
* Vercel Account (for Blob storage token)

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies from the root directory:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    * In `apps/backend/`, create a `.env` file and add the following variables:
        ```
        MONGODB_URI="your_mongodb_atlas_connection_string"
        GEMINI_API_KEY="your_gemini_api_key"
        BLOB_READ_WRITE_TOKEN="your_vercel_blob_read_write_token"
        ```
    * In `apps/frontend/`, create a `.env.local` file:
        ```
        NEXT_PUBLIC_API_URL="http://localhost:5001"
        ```

4.  **Run the applications:**
    ```bash
    npm run dev
    ```
    * The frontend will be available at `http://localhost:3000`.
    * The backend will be available at `http://localhost:5001`.

---

## 📝 API Documentation

### Base URL: `/api`

#### `POST /upload`
Uploads a PDF file.
* **Content-Type:** `multipart/form-data`
* **Body:** `file` (the PDF file)
* **Success Response (201):**
    ```json
    {
      "fileId": "unique-file-name-with-timestamp.pdf",
      "fileName": "original-file-name.pdf"
    }
    ```

#### `POST /extract`
Extracts data from an uploaded PDF.
* **Body:**
    ```json
    {
      "fileId": "unique-file-name-with-timestamp.pdf"
    }
    ```
* **Success Response (200):**
    ```json
    {
      "vendor": { "name": "...", "address": "...", "taxId": "..." },
      "invoice": { "number": "...", "date": "...", "currency": "...", "subtotal": 0.00, "taxPercent": 0.00, "total": 0.00, "poNumber": "...", "poDate": "...", "lineItems": [] }
    }
    ```

#### `POST /invoices`
Saves a new invoice record.
* **Body:** `{...invoiceObject}`
* **Success Response (201):** `{...savedInvoiceObject}`

#### `GET /invoices`
Lists all saved invoices. Supports search.
* **URL:** `/invoices?q=acme`
* **Success Response (200):** `[ { ...invoiceObject1 }, ... ]`

#### `GET /invoices/:id`
Retrieves a single invoice.
* **Success Response (200):** `{ ...invoiceObject }`

#### `PUT /invoices/:id`
Updates an existing invoice.
* **Body:** `{...invoiceObject}`
* **Success Response (200):** `{ ...updatedInvoiceObject }`

#### `DELETE /invoices/:id`
Deletes an invoice.
* **Success Response (200):** `{ "message": "Invoice deleted successfully" }`
