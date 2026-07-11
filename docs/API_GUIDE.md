# API Guide

This guide provides an overview of the Payment API, which is the primary interface for interacting with the Global Micro-Remittance Bridge.

## 🚦 API Overview

The Payment API is a RESTful service built with NestJS. It uses JWT for authentication and follows standard HTTP status codes.

**Base URL:** `https://api.global-remittance-bridge.example.com` (Production)

## 🔑 Authentication

All protected endpoints require a valid JSON Web Token (JWT) in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token>
```

## 🗺️ Endpoint Summary

### 1. Merchant Management

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/merchants` | `POST` | Onboard a new merchant. |
| `/merchants/{id}` | `GET` | Retrieve merchant profile details. |
| `/merchants/{id}/kyc` | `POST` | Submit KYC documentation. |

### 2. Payments

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/payments` | `POST` | Create a new payment request. |
| `/payments/{id}` | `GET` | Retrieve transaction status and details. |
| `/payments/{id}/cancel` | `POST` | Cancel a pending payment. |

### 3. Treasury & Settlements

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/treasury/balance` | `GET` | Check current bridge treasury balance. |
| `/settlements` | `GET` | List pending and completed settlements. |

## 📦 Request/Response Formats

All requests and responses use JSON.

### Example: Create Payment

**Request:** `POST /payments`

```json
{
  "amount": 150.00,
  "currency": "USD",
  "recipient_address": "SD...XYZ",
  "memo": "INV-12345"
}
```

**Response:** `201 Created`

```json
{
  "id": "pay_abc123",
  "status": "PENDING",
  "created_at": "2026-07-11T10:00:00Z",
  "transaction_hash": null
}
```

## ⚠️ Error Handling

The API uses standard HTTP error codes:

- `200/201`: Success
- `400`: Bad Request (Invalid parameters)
- `401`: Unauthorized (Invalid or missing JWT)
- `403`: Forbidden (Insufficient permissions)
- `404`: Not Found (Resource does not exist)
- `500`: Internal Server Error
