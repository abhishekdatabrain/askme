const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    name: "AskMe.Live Complete API Collection (Mobile & Web)",
    description: "Complete API collection for Ask-Me.Live mobile app developers (Viewer App & Creator App), Web clients, and Third-party integrations.\n\nIncludes detailed parameter tables showing **Required** and **Optional** fields, validation rules, token auto-saving scripts, and example responses.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "base_url", value: "http://localhost:5000", type: "string" },
    { key: "viewer_token", value: "", type: "string" },
    { key: "creator_token", value: "", type: "string" },
    { key: "admin_token", value: "", type: "string" }
  ],
  item: [
    // ==========================================
    // 01. VIEWER APP - AUTHENTICATION
    // ==========================================
    {
      name: "01. Viewer App - Auth & Account",
      item: [
        {
          name: "Viewer WhatsApp OTP - Send",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                phone: "9876543210",
                type: "login"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/whatsapp-otp/send",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "whatsapp-otp", "send"]
            },
            description: "### 📌 Viewer WhatsApp OTP Send\nSends a 6-digit verification code to the viewer's WhatsApp number via Fonada WABA service.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `phone` | String | **Required** | 10-digit Indian mobile number (e.g. `9876543210`) or with `91` prefix. |\n| `type` | String | **Optional** | Auth intent: `login` (default) or `register`. |\n\n#### Notes:\n- Cooldown: 30 seconds before another OTP can be requested.\n- Rate limit: 5 requests per 15 minutes.\n- In non-production environments, response includes `debugOtp` for mock/local testing."
          }
        },
        {
          name: "Viewer WhatsApp OTP - Verify & Login",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.token) {",
                  "    pm.environment.set('viewer_token', jsonData.token);",
                  "    pm.collectionVariables.set('viewer_token', jsonData.token);",
                  "    console.log('Saved viewer_token:', jsonData.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                phone: "9876543210",
                otp: "123456",
                type: "login"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/whatsapp-otp/verify",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "whatsapp-otp", "verify"]
            },
            description: "### 📌 Viewer WhatsApp OTP Verify\nVerifies the 6-digit WhatsApp OTP code and issues a JWT Bearer token.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `phone` | String | **Required** | 10-digit mobile number that received the OTP. |\n| `otp` | String | **Required** | 6-digit numeric OTP code. |\n| `type` | String | **Optional** | `login` (returns JWT + user profile) or `register` (returns verified: true). |\n\n#### Auto Postman Action:\n- Upon 200 OK, the test script automatically saves `token` into `{{viewer_token}}` variable."
          }
        },
        {
          name: "Viewer Register (Email & Password)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.data && jsonData.data.token) {",
                  "    pm.environment.set('viewer_token', jsonData.data.token);",
                  "    pm.collectionVariables.set('viewer_token', jsonData.data.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Rohit Sharma",
                email: "rohit.viewer@example.com",
                password: "SecurePassword@123",
                mobile: "9876543210"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/register",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "register"]
            },
            description: "### 📌 Viewer Registration\nRegisters a new viewer account with name, email, password, and mobile number.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `fullName` / `name` | String | **Required** | Full display name (min 2 chars). |\n| `email` | String | **Required** | Unique email address. |\n| `password` | String | **Required** | Strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char). |\n| `mobile` / `phone` | String | **Optional** | 10-digit contact mobile number. |"
          }
        },
        {
          name: "Viewer Login (Email & Password)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.data && jsonData.data.token) {",
                  "    pm.environment.set('viewer_token', jsonData.data.token);",
                  "    pm.collectionVariables.set('viewer_token', jsonData.data.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "rohit.viewer@example.com",
                password: "SecurePassword@123"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/login",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "login"]
            },
            description: "### 📌 Viewer Login\nAuthenticates existing viewer using email and password.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `email` | String | **Required** | Registered email address. |\n| `password` | String | **Required** | Account password. |"
          }
        },
        {
          name: "Viewer Google OAuth Login",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.data && jsonData.data.token) {",
                  "    pm.environment.set('viewer_token', jsonData.data.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                credential: "GOOGLE_ID_TOKEN_OR_ACCESS_TOKEN",
                email: "user@gmail.com",
                name: "Rohit Sharma"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/google-auth",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "google-auth"]
            },
            description: "### 📌 Viewer Google OAuth Login / Register\nAllows 1-Tap Google Sign-in on mobile apps using Google Identity Services token or access token.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `credential` | String | **Required** | Google ID Token (JWT) or OAuth2 Access Token. |\n| `email` | String | **Optional** | Fallback email if already decoded on client. |\n| `name` | String | **Optional** | User's full name from Google Profile. |"
          }
        },
        {
          name: "Viewer Truecaller 1-Tap Auth",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                payload: "TRUECALLER_SDK_PAYLOAD",
                signature: "TRUECALLER_SIGNATURE"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/truecaller-auth",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "truecaller-auth"]
            },
            description: "### 📌 Viewer Truecaller 1-Tap Auth\nAuthenticates Android/iOS viewers via the Truecaller Mobile SDK.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `payload` | String | **Required** | Encrypted profile payload returned by Truecaller SDK. |\n| `signature` | String | **Required** | RSA digital signature provided by Truecaller. |"
          }
        },
        {
          name: "Viewer Email OTP - Send",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "rohit.viewer@example.com"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/email-otp/send",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "email-otp", "send"]
            },
            description: "### 📌 Send Email OTP\nDispatches a 6-digit verification code to the viewer's email address.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `email` | String | **Required** | Valid email address. |"
          }
        },
        {
          name: "Viewer Email OTP - Verify",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "rohit.viewer@example.com",
                otp: "123456"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/email-otp/verify",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "email-otp", "verify"]
            },
            description: "### 📌 Verify Email OTP\nConfirms the 6-digit email OTP.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `email` | String | **Required** | Target email address. |\n| `otp` | String | **Required** | 6-digit code received via email. |"
          }
        },
        {
          name: "Get Viewer Profile",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/viewers/profile",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "profile"]
            },
            description: "### 📌 Get Current Viewer Profile\nRetrieves full account details for the authenticated viewer.\n\n#### Headers:\n- `Authorization`: `Bearer {{viewer_token}}` (**Required**)"
          }
        },
        {
          name: "Update Viewer Profile",
          request: {
            method: "PATCH",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Rohit Sharma Updated",
                username: "rohit_sharma",
                bio: "Tech enthusiast and live stream supporter.",
                country: "India",
                avatar: "https://ask-me.live/uploads/profiles/avatar-sample.jpg",
                socialLinks: {
                  twitter: "https://twitter.com/rohit",
                  instagram: "https://instagram.com/rohit"
                }
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/profile",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "profile"]
            },
            description: "### 📌 Update Viewer Profile\nUpdates personal information, bio, username, and social links.\n\n#### Headers:\n- `Authorization`: `Bearer {{viewer_token}}` (**Required**)\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `name` / `fullName` | String | **Optional** | Display name (2 to 100 characters). |\n| `username` | String | **Optional** | Unique handle (3 to 30 chars, alphanumeric + dots/underscores). |\n| `bio` | String | **Optional** | Short bio (max 500 characters). |\n| `country` | String | **Optional** | Country name (e.g. `India`). |\n| `avatar` | String | **Optional** | Image URL or relative path returned by `/api/upload/profile`. |\n| `socialLinks` | Object | **Optional** | Key-value pairs for `instagram`, `twitter`, `youtube`, `facebook`, `linkedin`. |\n| `mobile` + `mobileOtp` | String | **Optional** | In case updating mobile number with verified OTP. |\n| `email` + `emailOtp` | String | **Optional** | In case updating email address with verified OTP. |"
          }
        },
        {
          name: "Upload Viewer Avatar",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            body: {
              mode: "formdata",
              formdata: [
                { key: "avatar", type: "file", src: "", description: "Image file (JPEG, PNG, WebP, max 10MB)" }
              ]
            },
            url: {
              raw: "{{base_url}}/api/viewers/profile/avatar",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "profile", "avatar"]
            },
            description: "### 📌 Upload Viewer Avatar\nUploads avatar profile image via multipart/form-data.\n\n#### Headers:\n- `Authorization`: `Bearer {{viewer_token}}` (**Required**)\n\n#### Form Data Fields:\n| Key | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `avatar` | File | **Required** | Image file binary. |"
          }
        },
        {
          name: "Check Username Availability",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/viewers/check-username?username=rohit_sharma",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "check-username"],
              query: [
                { key: "username", value: "rohit_sharma", description: "Username to check availability for" }
              ]
            },
            description: "### 📌 Check Username Availability\nChecks if a given handle is available across viewers and creators.\n\n#### Query Parameters:\n| Param | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `username` | String | **Required** | Desired handle (3-30 chars). |"
          }
        },
        {
          name: "Change Viewer Password",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                oldPassword: "SecurePassword@123",
                newPassword: "NewSecurePassword@999"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/change-password",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "change-password"]
            },
            description: "### 📌 Change Viewer Password\nUpdates viewer password given the valid previous password.\n\n#### Headers:\n- `Authorization`: `Bearer {{viewer_token}}` (**Required**)\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `oldPassword` | String | **Required** | Current active password. |\n| `newPassword` | String | **Required** | New password (min 8 chars, uppercase, lowercase, number, special char). |"
          }
        },
        {
          name: "Delete Viewer Account",
          request: {
            method: "DELETE",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                password: "SecurePassword@123",
                reason: "Not using the platform anymore"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/account",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "account"]
            },
            description: "### 📌 Delete Viewer Account\nPermanently deletes or deactivates the viewer profile.\n\n#### Headers:\n- `Authorization`: `Bearer {{viewer_token}}` (**Required**)\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `password` | String | **Optional** | Required if account has password auth. |\n| `reason` | String | **Optional** | Reason for account closure. |"
          }
        }
      ]
    },

    // ==========================================
    // 02. VIEWER APP - CONTENT, EXPLORE & SOCIAL
    // ==========================================
    {
      name: "02. Viewer App - Feeds, Explore & VIP",
      item: [
        {
          name: "Get Public Live Feed & Featured Creators",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/viewers/public/live-feed?limit=20&page=1",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "public", "live-feed"],
              query: [
                { key: "category", value: "Gaming", disabled: true, description: "Filter by category name" },
                { key: "limit", value: "20", description: "Items per page" },
                { key: "page", value: "1", description: "Page number" }
              ]
            },
            description: "### 📌 Public Live Feed\nReturns currently active live donation streams, trending creators, and featured broadcasts for home screens."
          }
        },
        {
          name: "Get Dynamic Categories",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/viewers/public/categories",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "public", "categories"]
            },
            description: "### 📌 Dynamic Categories\nReturns active content categories (e.g. Gaming, Tech, Music, Education, Comedy) to display on discover pills and dropdowns."
          }
        },
        {
          name: "Get Creator Public Profile",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/viewers/public/creators/rahul_sharma",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "public", "creators", "rahul_sharma"]
            },
            description: "### 📌 Creator Public Profile\nFetches creator bio, social links, follower counts, active streams, and membership tier plans by username.\n\n#### URL Path Variables:\n| Param | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `username` | String | **Required** | Creator handle (e.g. `rahul_sharma`). |"
          }
        },
        {
          name: "Get Past Streams Archive",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/viewers/public/past-streams?limit=10&page=1",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "public", "past-streams"],
              query: [
                { key: "limit", value: "10" },
                { key: "page", value: "1" }
              ]
            },
            description: "### 📌 Past Streams Archive\nReturns previously completed live streams and recordings with pagination."
          }
        },
        {
          name: "Follow / Unfollow Creator",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                creatorId: 1
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/follow",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "follow"]
            },
            description: "### 📌 Toggle Follow Creator\nToggles following status between the authenticated viewer and target creator.\n\n#### Headers:\n- `Authorization`: `Bearer {{viewer_token}}` (**Required**)\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `creatorId` | Integer | **Required** | Unique ID of the creator to follow/unfollow. |"
          }
        },
        {
          name: "Get Following Creators List",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/viewers/following",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "following"]
            },
            description: "### 📌 Get Followed Creators\nReturns all creators currently followed by this viewer."
          }
        },
        {
          name: "Get My Questions / Asks History",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/viewers/my-questions?limit=20&page=1",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "my-questions"],
              query: [
                { key: "limit", value: "20" },
                { key: "page", value: "1" }
              ]
            },
            description: "### 📌 Viewer Questions / Super Asks History\nReturns all paid Super Asks, messages, status (Read, Not Read, Replied), and creator replies sent by this viewer."
          }
        },
        {
          name: "Get Public VIP Plans",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/viewers/vip/plans",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "vip", "plans"],
              query: [
                { key: "creatorId", value: "1", disabled: true, description: "Filter by creatorId" }
              ]
            },
            description: "### 📌 Public VIP Membership Plans\nLists active VIP tiers and channel subscription pricing."
          }
        },
        {
          name: "Subscribe to VIP Membership Plan",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                planId: 1,
                creatorId: 1,
                gatewayOrderId: "order_xyz123",
                paymentMethod: "UPI"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/vip/subscribe",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "vip", "subscribe"]
            },
            description: "### 📌 Subscribe to VIP Plan\nActivates VIP subscription badge and perks for a creator.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `planId` | Integer | **Required** | Target VIP Tier Plan ID. |\n| `creatorId` | Integer | **Required** | Creator ID. |\n| `gatewayOrderId` | String | **Optional** | Payment Gateway Order ID. |\n| `paymentMethod` | String | **Optional** | E.g. `UPI`, `Card`, `NetBanking`. |"
          }
        },
        {
          name: "Get Viewer Active VIP Memberships",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/viewers/vip/my-memberships",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "vip", "my-memberships"]
            },
            description: "### 📌 My Active VIP Memberships\nLists all creators where this viewer has an active VIP badge."
          }
        },
        {
          name: "Save Viewer FCM Push Token",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                token: "fcm_device_registration_token_here",
                deviceType: "android"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/viewers/notification-token",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "notification-token"]
            },
            description: "### 📌 Register FCM Device Push Token\nRegisters Firebase Cloud Messaging token for push alerts (when a followed creator goes live, super ask reply received, etc.).\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `token` | String | **Required** | Device FCM push token string. |\n| `deviceType` | String | **Optional** | `android` or `ios` or `web`. |"
          }
        },
        {
          name: "Get Viewer Notifications",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/viewers/notifications?limit=20&page=1",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "notifications"],
              query: [
                { key: "limit", value: "20" },
                { key: "page", value: "1" }
              ]
            },
            description: "### 📌 Get Viewer In-App Notifications\nReturns notification list for the current viewer."
          }
        },
        {
          name: "Mark Viewer Notifications as Read",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{viewer_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/viewers/notifications/mark-read",
              host: ["{{base_url}}"],
              path: ["api", "viewers", "notifications", "mark-read"]
            },
            description: "### 📌 Mark Notifications Read\nMarks all unread in-app alerts as read for the current viewer."
          }
        }
      ]
    },

    // ==========================================
    // 03. CREATOR APP - AUTH & ONBOARDING
    // ==========================================
    {
      name: "03. Creator App - Auth & KYC",
      item: [
        {
          name: "Creator WhatsApp OTP - Send",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                phone: "9876543210"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/whatsapp-otp/send",
              host: ["{{base_url}}"],
              path: ["api", "creators", "whatsapp-otp", "send"]
            },
            description: "### 📌 Creator WhatsApp OTP Send\nSends login / onboarding OTP to Creator's WhatsApp via Fonada WABA.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `phone` | String | **Required** | 10-digit Indian mobile number. |\n\n#### Demo Sandbox:\n- Phone number `9999999999` has static OTP `123456` for demo testing."
          }
        },
        {
          name: "Creator WhatsApp OTP - Verify & Login",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.token) {",
                  "    pm.environment.set('creator_token', jsonData.token);",
                  "    pm.collectionVariables.set('creator_token', jsonData.token);",
                  "    console.log('Saved creator_token:', jsonData.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                phone: "9876543210",
                otp: "123456",
                isRegister: false
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/whatsapp-otp/verify",
              host: ["{{base_url}}"],
              path: ["api", "creators", "whatsapp-otp", "verify"]
            },
            description: "### 📌 Creator WhatsApp OTP Verify\nVerifies OTP and returns Creator JWT Bearer Token.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `phone` | String | **Required** | Mobile number. |\n| `otp` | String | **Required** | 6-digit OTP. |\n| `isRegister` | Boolean | **Optional** | Set to `true` when completing first-time registration."
          }
        },
        {
          name: "Creator Register (Email & Password)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.data && jsonData.data.token) {",
                  "    pm.environment.set('creator_token', jsonData.data.token);",
                  "    pm.collectionVariables.set('creator_token', jsonData.data.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Pooja Sharma",
                username: "poojasharma_live",
                email: "pooja.creator@example.com",
                mobileNumber: "9876543210",
                password: "CreatorPassword@123",
                category: "Gaming",
                country: "India",
                bio: "Official Gaming streamer on YouTube and AskMe."
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/register",
              host: ["{{base_url}}"],
              path: ["api", "creators", "register"]
            },
            description: "### 📌 Creator Registration\nCreates a new Creator broadcaster account with automatic wallet creation.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `fullName` | String | **Required** | Full name. |\n| `username` | String | **Required** | Handle (unique). |\n| `email` | String | **Required** | Valid email. |\n| `password` | String | **Required** | Min 8 chars with uppercase, lowercase, number, special char. |\n| `mobileNumber` | String | **Optional** | 10-digit mobile number. |\n| `category` | String | **Optional** | E.g. `Gaming`, `Tech`, `Music`. |\n| `bio` | String | **Optional** | Broadcaster bio. |\n| `country` | String | **Optional** | Defaults to `India`. |"
          }
        },
        {
          name: "Creator Login (Email & Password)",
          event: [
            {
              listen: "test",
              script: {
                exec: [
                  "var jsonData = pm.response.json();",
                  "if (jsonData.data && jsonData.data.token) {",
                  "    pm.environment.set('creator_token', jsonData.data.token);",
                  "    pm.collectionVariables.set('creator_token', jsonData.data.token);",
                  "}"
                ],
                type: "text/javascript"
              }
            }
          ],
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "pooja.creator@example.com",
                password: "CreatorPassword@123"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/login",
              host: ["{{base_url}}"],
              path: ["api", "creators", "login"]
            },
            description: "### 📌 Creator Login\nAuthenticates creator with email and password."
          }
        },
        {
          name: "Creator Complete Trial Profile (Multipart with Image)",
          request: {
            method: "POST",
            header: [],
            body: {
              mode: "formdata",
              formdata: [
                { key: "fullName", value: "Rahul Sharma", type: "text" },
                { key: "email", value: "rahul.trial@example.com", type: "text" },
                { key: "phone", value: "9876543210", type: "text" },
                { key: "profile_image", type: "file", src: "", description: "Creator avatar image file" }
              ]
            },
            url: {
              raw: "{{base_url}}/api/creators/trial/complete-profile",
              host: ["{{base_url}}"],
              path: ["api", "creators", "trial", "complete-profile"]
            },
            description: "### 📌 Complete Creator Trial Profile\nActivates 7-day full access for creators verified with Demo OTP.\n\n#### Form Data Fields:\n| Key | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `fullName` | Text | **Required** | Broadcaster name (min 2 chars). |\n| `email` | Text | **Required** | Email address. |\n| `phone` | Text | **Required** | Real personal mobile number (shared demo 9999999999 not allowed). |\n| `profile_image` | File | **Optional** | Profile image binary. |"
          }
        },
        {
          name: "KYC - Verify PAN Card (Cashfree)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                panNumber: "ABCDE1234F",
                name: "Rahul Sharma"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/kyc/verify-pan",
              host: ["{{base_url}}"],
              path: ["api", "creators", "kyc", "verify-pan"]
            },
            description: "### 📌 KYC Step 1: Instant PAN Verification\nVerifies PAN number with NSDL/ITD via Cashfree Verification Suite.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `panNumber` | String | **Required** | 10-character PAN number (e.g. `ABCDE1234F`). |\n| `name` | String | **Optional** | Expected name on card for fuzzy name matching. |"
          }
        },
        {
          name: "KYC - Send Aadhaar OKYC OTP",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                aadhaarNumber: "123456789012"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/kyc/verify-aadhaar/send-otp",
              host: ["{{base_url}}"],
              path: ["api", "creators", "kyc", "verify-aadhaar", "send-otp"]
            },
            description: "### 📌 KYC Step 2: Send Aadhaar OTP\nTriggers UIDAI OTP via Cashfree Aadhaar Verification Suite.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `aadhaarNumber` | String | **Required** | 12-digit Aadhaar number. |\n\n#### Response Note:\nReturns `refId` which must be passed to the verify OTP endpoint."
          }
        },
        {
          name: "KYC - Verify Aadhaar OKYC OTP",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                refId: "cf_aadhaar_ref_12345",
                otp: "123456",
                aadhaarNumber: "123456789012",
                name: "Rahul Sharma"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/kyc/verify-aadhaar/verify-otp",
              host: ["{{base_url}}"],
              path: ["api", "creators", "kyc", "verify-aadhaar", "verify-otp"]
            },
            description: "### 📌 KYC Step 3: Verify Aadhaar OTP\nVerifies the UIDAI OTP code.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `refId` | String | **Required** | Reference ID returned from `send-otp`. |\n| `otp` | String | **Required** | 6-digit OTP code sent by UIDAI. |\n| `aadhaarNumber` | String | **Optional** | 12-digit Aadhaar number. |\n| `name` | String | **Optional** | Expected name for fuzzy matching. |"
          }
        },
        {
          name: "KYC - Match Identity (PAN vs Aadhaar)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                panName: "RAHUL SHARMA",
                aadhaarName: "Rahul Sharma",
                panDob: "1995-05-12",
                aadhaarDob: "1995-05-12"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/kyc/match-identity",
              host: ["{{base_url}}"],
              path: ["api", "creators", "kyc", "match-identity"]
            },
            description: "### 📌 KYC Step 4: Match PAN & Aadhaar Identity\nCalculates name match score and DOB validation between verified PAN and verified Aadhaar.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `panName` | String | **Required** | Name on PAN card. |\n| `aadhaarName` | String | **Required** | Name on Aadhaar. |\n| `panDob` | String | **Optional** | Date of Birth (YYYY-MM-DD). |\n| `aadhaarDob` | String | **Optional** | Date of Birth (YYYY-MM-DD). |"
          }
        },
        {
          name: "KYC - Verify Bank Account Penny Drop",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                accountNumber: "123456789012",
                ifscCode: "HDFC0001234",
                name: "Rahul Sharma",
                phone: "9876543210",
                verifiedIdentityName: "Rahul Sharma"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/kyc/verify-bank",
              host: ["{{base_url}}"],
              path: ["api", "creators/kyc/verify-bank"]
            },
            description: "### 📌 KYC Step 5: Instant Penny Drop Bank Verification\nPerforms a ₹1 penny drop through NPCI/IMPS to verify creator account holder name directly from bank records.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `accountNumber` | String | **Required** | Bank account number. |\n| `ifscCode` | String | **Required** | Valid 11-digit IFSC code. |\n| `name` | String | **Optional** | Account holder name. |\n| `phone` | String | **Optional** | Phone number. |\n| `verifiedIdentityName` | String | **Optional** | KYC Name to compare with bank registered name. |"
          }
        },
        {
          name: "KYC - Submit Final KYC Record",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                fullName: "Rahul Sharma",
                mobileNumber: "9876543210",
                category: "Gaming",
                panNumber: "ABCDE1234F",
                panHolderName: "Rahul Sharma",
                panStatus: "verified",
                documentType: "aadhaar",
                documentNumber: "123456789012",
                address: "Flat 402, Sunshine Heights",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001",
                country: "India"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/kyc",
              host: ["{{base_url}}"],
              path: ["api", "creators", "kyc"]
            },
            description: "### 📌 Submit Final KYC Application\nSaves full verified KYC dossier to creator profile in PostgreSQL."
          }
        },
        {
          name: "KYC - Get Current KYC Status",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/kyc/status",
              host: ["{{base_url}}"],
              path: ["api", "creators", "kyc", "status"]
            },
            description: "### 📌 Get Creator KYC Status\nReturns verification status: `pending`, `verified`, `rejected`, or `not_submitted`."
          }
        }
      ]
    },

    // ==========================================
    // 04. CREATOR APP - SESSIONS, OVERLAY & CHAT
    // ==========================================
    {
      name: "04. Creator App - Live Sessions, Overlay & Chat",
      item: [
        {
          name: "Create Live Stream Donation Session",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                title: "Live Sunday Q&A and Gaming Stream",
                category: "Gaming",
                durationHours: 4,
                thumbnailUrl: "https://ask-me.live/uploads/general/thumb-123.jpg",
                streamUrl: "https://youtube.com/live/sample_stream_key",
                streamingPlatform: "YouTube",
                description: "Ask your questions with Super Ask and get them answered live on stream!"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/live-sessions",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions"]
            },
            description: "### 📌 Create Live Donation Session\nCreates a new broadcast session and generates the dynamic QR code and donation payment link.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `title` | String | **Required** | Stream title. |\n| `durationHours` | Number | **Optional** | Scheduled session duration (default: 4 hours). |\n| `category` | String | **Optional** | E.g. `Gaming`, `Tech`, `Music`. |\n| `streamUrl` | String | **Optional** | YouTube / Twitch broadcast URL. |\n| `streamingPlatform` | String | **Optional** | Platform name (`YouTube`, `Twitch`, `Facebook`). |\n| `thumbnailUrl` | String | **Optional** | Cover image URL. |\n| `description` | String | **Optional** | Stream description. |"
          }
        },
        {
          name: "Get All Live Sessions for Creator",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/live-sessions?status=active",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions"],
              query: [
                { key: "status", value: "active", description: "Filter by status: active, closed, or all" },
                { key: "limit", value: "10" },
                { key: "page", value: "1" }
              ]
            },
            description: "### 📌 Get Creator Live Sessions\nLists all historical and currently active sessions with donation stats and payment URLs."
          }
        },
        {
          name: "Start Live Session By ID",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/live-sessions/1/start",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions", "1", "start"]
            },
            description: "### 📌 Start Live Stream Session\nChanges session status to `active` and fires push notifications to all followers."
          }
        },
        {
          name: "Close Live Session By ID",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/live-sessions/1/close",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions", "1", "close"]
            },
            description: "### 📌 Close Live Stream Session\nCloses the session, disables new donation payments, and archives statistics."
          }
        },
        {
          name: "Update QR Code Visibility Status",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                qrStatus: "active"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/live-sessions/1/qr-status",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions", "1", "qr-status"]
            },
            description: "### 📌 Update QR Status\nToggles QR code display on live overlay between `active` and `paused`."
          }
        },
        {
          name: "Get Session Questions / Super Asks",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/live-sessions/1/questions?filter=unread",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions", "1", "questions"],
              query: [
                { key: "filter", value: "unread", description: "Filter: all, unread, read" },
                { key: "limit", value: "50" },
                { key: "page", value: "1" }
              ]
            },
            description: "### 📌 Get Live Stream Questions (Super Asks)\nRetrieves list of paid Super Asks with viewer names, amounts, messages, and read status."
          }
        },
        {
          name: "Reply to Viewer Super Ask",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                donationId: 1,
                replyMessage: "Thanks for the question! Yes, we will definitely do a dedicated giveaway next week!"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/live-sessions/chat/reply",
              host: ["{{base_url}}"],
              path: ["api", "creators", "live-sessions", "chat", "reply"]
            },
            description: "### 📌 Reply to Super Ask\nSends creator reply to viewer message and dispatches WhatsApp notification to the viewer.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `donationId` | Integer | **Required** | Target Super Ask / Donation ID. |\n| `replyMessage` | String | **Required** | Response text. |"
          }
        },
        {
          name: "Update Donation Status (Mark Read / Pin)",
          request: {
            method: "PUT",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                status: "read",
                isPinned: true
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/donations/1/status",
              host: ["{{base_url}}"],
              path: ["api", "creators", "donations", "1", "status"]
            },
            description: "### 📌 Update Donation Status\nMarks question as `read`, `not_read`, or pinned on screen."
          }
        },
        {
          name: "Get Live Stream OBS Overlay Data (Public)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/creators/overlay/data/session-code-or-username",
              host: ["{{base_url}}"],
              path: ["api", "creators", "overlay", "data", "session-code-or-username"]
            },
            description: "### 📌 OBS Overlay Stream Data\nUsed by OBS Studio / Streamlabs browser source to render live questions, QR code, and broadcaster goal."
          }
        },
        {
          name: "Get Live Stream OBS Overlay Audio Alerts (Public)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/creators/overlay/alerts/1",
              host: ["{{base_url}}"],
              path: ["api", "creators", "overlay", "alerts", "1"]
            },
            description: "### 📌 OBS Audio Alerts\nPolls for instant incoming audio/visual popups when a donation is confirmed."
          }
        }
      ]
    },

    // ==========================================
    // 05. CREATOR APP - WALLET, BANK & PAYOUTS
    // ==========================================
    {
      name: "05. Creator App - Wallet & Bank Payouts",
      item: [
        {
          name: "Get Creator Wallet Details & Earnings",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/wallet/details",
              host: ["{{base_url}}"],
              path: ["api", "creators", "wallet", "details"]
            },
            description: "### 📌 Get Wallet Details\nReturns `available_balance`, `pending_balance`, `total_earnings`, and `withdrawn_amount` in INR."
          }
        },
        {
          name: "Get Saved Bank Account & UPI Details",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/bank-account",
              host: ["{{base_url}}"],
              path: ["api", "creators", "bank-account"]
            },
            description: "### 📌 Get Payout Account\nReturns currently registered masked Bank Account and UPI VPA."
          }
        },
        {
          name: "Save Creator Bank Account / UPI (One-time Setup)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                accountHolderName: "Rahul Sharma",
                bankName: "HDFC Bank",
                accountNumber: "123456789012",
                ifscCode: "HDFC0001234",
                upiId: "rahul@okhdfcbank",
                accountType: "savings"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/bank-account",
              host: ["{{base_url}}"],
              path: ["api", "creators", "bank-account"]
            },
            description: "### 📌 Save Payout Bank Account\nRegisters creator's payout details. Can be set once; future modifications require raising an admin support ticket.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `accountHolderName` | String | **Required** | Name matching bank records. |\n| `accountNumber` | String | **Required** (if no UPI) | Bank Account number. |\n| `ifscCode` | String | **Required** (with Account) | 11-digit IFSC code. |\n| `upiId` | String | **Optional** | Valid UPI VPA (e.g. `user@okhdfcbank`). |\n| `bankName` | String | **Optional** | E.g. `HDFC Bank`. |\n| `accountType` | String | **Optional** | `savings` or `current`. |"
          }
        },
        {
          name: "Verify Creator UPI ID",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                upiId: "rahul@upi"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/verify-upi",
              host: ["{{base_url}}"],
              path: ["api", "creators", "verify-upi"]
            },
            description: "### 📌 Verify UPI ID Format\nValidates UPI VPA structure before submitting."
          }
        },
        {
          name: "Request Wallet Withdrawal (Payout)",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                amount: 1500
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/wallet/withdraw",
              host: ["{{base_url}}"],
              path: ["api", "creators", "wallet", "withdraw"]
            },
            description: "### 📌 Request Payout Withdrawal\nRequests withdrawal of earnings to registered bank/UPI account.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `amount` | Number | **Required** | Minimum withdrawal amount is ₹500.00. |"
          }
        },
        {
          name: "Get Creator Withdrawal History",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/creators/wallet/withdrawals?limit=20&page=1",
              host: ["{{base_url}}"],
              path: ["api", "creators", "wallet", "withdrawals"],
              query: [
                { key: "limit", value: "20" },
                { key: "page", value: "1" }
              ]
            },
            description: "### 📌 Withdrawal History\nLists past withdrawal requests and payout statuses (`pending`, `completed`, `rejected`, `utr_number`)."
          }
        }
      ]
    },

    // ==========================================
    // 06. LIVE PAYMENTS (CASHFREE PG & DONATIONS)
    // ==========================================
    {
      name: "06. Viewer Payments & Cashfree PG",
      item: [
        {
          name: "Get Public Live Session Details for Payment",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/creators/pay/session/sunday-stream-abc12",
              host: ["{{base_url}}"],
              path: ["api", "creators", "pay", "session", "sunday-stream-abc12"]
            },
            description: "### 📌 Get Public Payment Session Details\nUsed on the mobile donation sheet to load stream title, creator details, active QR, and pricing rules."
          }
        },
        {
          name: "Create Cashfree PG Payment Order",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                sessionId: 1,
                creatorId: 1,
                amount: 100,
                viewerName: "Rohit Sharma",
                viewerEmail: "rohit@example.com",
                viewerPhone: "9876543210",
                message: "Great stream! What GPU are you currently running?",
                anonymous: false,
                agreedToConsent: true
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/pay/cashfree/order",
              host: ["{{base_url}}"],
              path: ["api", "creators", "pay", "cashfree", "order"]
            },
            description: "### 📌 Create Cashfree Payment Order\nInitiates Cashfree checkout and returns `payment_session_id` to initialize the Cashfree Mobile SDK (Flutter/React Native/iOS/Android).\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `amount` | Number | **Required** | Donation amount (₹40 to ₹99,999). |\n| `sessionId` / `sessionCode` | Any | **Required** | Active live session identifier. |\n| `creatorId` | Integer | **Required** | Creator ID. |\n| `viewerName` | String | **Required** | Donor name (or Anonymous Supporter). |\n| `viewerPhone` | String | **Required** | 10-digit mobile number for WhatsApp alerts. |\n| `viewerEmail` | String | **Optional** | Donor email for receipt. |\n| `message` | String | **Optional** | Super Ask message text (character limits automatically validated based on amount). |\n| `anonymous` | Boolean | **Optional** | Set to `true` to hide name on overlay. |\n| `agreedToConsent` | Boolean | **Required** | DPDP compliance acceptance flag. |"
          }
        },
        {
          name: "Verify Cashfree PG Payment Order Status",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                orderId: "cf_order_1730000000_abc"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/pay/cashfree/verify",
              host: ["{{base_url}}"],
              path: ["api", "creators", "pay", "cashfree", "verify"]
            },
            description: "### 📌 Verify Cashfree Payment Status\nCalled by mobile app right after Cashfree SDK returns payment completion.\n\n#### Request Body Fields:\n| Field | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `orderId` | String | **Required** | Cashfree orderId returned by `/pay/cashfree/order`. |"
          }
        },
        {
          name: "Process Direct Viewer Donation (Mock/Custom Gateway)",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                sessionId: 1,
                creatorId: 1,
                amount: 50,
                viewerName: "Rohit",
                viewerMobile: "9876543210",
                message: "Keep up the great work!",
                paymentMethod: "UPI",
                gateway: "Cashfree",
                gatewayPaymentId: "pay_sample_123"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/creators/pay/process",
              host: ["{{base_url}}"],
              path: ["api", "creators", "pay", "process"]
            },
            description: "### 📌 Direct Viewer Donation Process\nDirect transaction confirmation API for custom payment gateways."
          }
        }
      ]
    },

    // ==========================================
    // 07. FILE UPLOADS
    // ==========================================
    {
      name: "07. File Uploads (Multipart/Form-Data)",
      item: [
        {
          name: "Upload Profile Image",
          request: {
            method: "POST",
            header: [],
            body: {
              mode: "formdata",
              formdata: [
                { key: "profile_image", type: "file", src: "", description: "Image file (JPEG, PNG, WebP)" }
              ]
            },
            url: {
              raw: "{{base_url}}/api/upload/profile",
              host: ["{{base_url}}"],
              path: ["api", "upload", "profile"]
            },
            description: "### 📌 Upload Profile Picture\nUploads an image file to `/uploads/profiles/` and returns full and relative URLs.\n\n#### Form Data Fields:\n| Key | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `profile_image` / `file` | File | **Required** | Image file binary. |"
          }
        },
        {
          name: "Upload KYC Document",
          request: {
            method: "POST",
            header: [],
            body: {
              mode: "formdata",
              formdata: [
                { key: "document", type: "file", src: "", description: "Document file (PDF, JPEG, PNG)" }
              ]
            },
            url: {
              raw: "{{base_url}}/api/upload/document",
              host: ["{{base_url}}"],
              path: ["api", "upload", "document"]
            },
            description: "### 📌 Upload Document\nUploads KYC document file (PAN / Aadhaar / Passbook copy) to `/uploads/documents/`.\n\n#### Form Data Fields:\n| Key | Type | Requirement | Description |\n| :--- | :--- | :--- | :--- |\n| `document` / `file` | File | **Required** | Document binary. |"
          }
        },
        {
          name: "Upload Multiple Files",
          request: {
            method: "POST",
            header: [],
            body: {
              mode: "formdata",
              formdata: [
                { key: "files", type: "file", src: "", description: "Array of files (max 5)" }
              ]
            },
            url: {
              raw: "{{base_url}}/api/upload/multiple",
              host: ["{{base_url}}"],
              path: ["api", "upload", "multiple"]
            },
            description: "### 📌 Upload Multiple Files\nUploads up to 5 files simultaneously."
          }
        }
      ]
    },

    // ==========================================
    // 08. LEGAL POLICIES & DPDP COMPLIANCE
    // ==========================================
    {
      name: "08. Legal Policies & DPDP Consent",
      item: [
        {
          name: "Get All Public Legal Policies",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/public/policies",
              host: ["{{base_url}}"],
              path: ["api", "public", "policies"]
            },
            description: "### 📌 Get All 12 Legal Policies\nReturns metadata and links for all published policies (Privacy Policy, Terms, EULA, Refund Policy, Community Guidelines, etc.)."
          }
        },
        {
          name: "Get Single Legal Policy By Slug",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/public/policies/privacy-policy",
              host: ["{{base_url}}"],
              path: ["api", "public", "policies", "privacy-policy"]
            },
            description: "### 📌 Get Single Policy by Slug\nReturns rich HTML content, SEO metadata, effective date, and version for rendering in mobile WebViews."
          }
        },
        {
          name: "Record User Consent (DPDP Compliance)",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                policySlug: "privacy-policy",
                policyVersion: "1.0",
                consentType: "explicit_notice",
                purposes: ["account_management", "payment_processing"],
                identifier: "rohit@example.com",
                identifierType: "email"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/public/policies/consent",
              host: ["{{base_url}}"],
              path: ["api", "public", "policies", "consent"]
            },
            description: "### 📌 Record Consent\nRecords user agreement to policy version for Digital Personal Data Protection (DPDP) compliance."
          }
        },
        {
          name: "Check User Consent Status",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/public/policies/consent/privacy-policy?identifier=rohit@example.com",
              host: ["{{base_url}}"],
              path: ["api", "public", "policies", "consent", "privacy-policy"],
              query: [
                { key: "identifier", value: "rohit@example.com", description: "Email or phone number" }
              ]
            },
            description: "### 📌 Check Consent Status\nChecks whether this user has already consented to the latest policy version."
          }
        }
      ]
    },

    // ==========================================
    // 09. SUPPORT TICKETS & CONTACT
    // ==========================================
    {
      name: "09. Support Tickets & Contact",
      item: [
        {
          name: "Submit Contact Form",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Rohit Sharma",
                email: "rohit@example.com",
                phone: "9876543210",
                subject: "Inquiry regarding Creator Partnerships",
                message: "Hello team, I would like to know more about the commission slabs for high-volume streams."
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/contact/submit",
              host: ["{{base_url}}"],
              path: ["api", "contact", "submit"]
            },
            description: "### 📌 Submit Public Contact Message\nAllows users and prospective creators to send inquiry messages to support."
          }
        },
        {
          name: "Create Support Ticket",
          request: {
            method: "POST",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" },
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                subject: "Update Bank Account Information",
                category: "Payout",
                priority: "high",
                message: "I need to update my bank account IFSC code due to a bank merger.",
                requestedChanges: {
                  newBankName: "HDFC Bank",
                  newAccountNumber: "987654321000",
                  newIfscCode: "HDFC0004321"
                }
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{base_url}}/api/tickets/create",
              host: ["{{base_url}}"],
              path: ["api", "tickets", "create"]
            },
            description: "### 📌 Create Support Ticket\nOpens a support ticket (e.g. for Payout Changes, Technical Issues, or Dispute)."
          }
        },
        {
          name: "Get My Support Tickets",
          request: {
            method: "GET",
            header: [
              { key: "Authorization", value: "Bearer {{creator_token}}" }
            ],
            url: {
              raw: "{{base_url}}/api/tickets/my-tickets",
              host: ["{{base_url}}"],
              path: ["api", "tickets", "my-tickets"]
            },
            description: "### 📌 Get My Support Tickets\nLists all tickets submitted by this account."
          }
        }
      ]
    },

    // ==========================================
    // 10. SYSTEM HEALTH & CALCULATOR
    // ==========================================
    {
      name: "10. Platform Settings & Health",
      item: [
        {
          name: "Health Check API",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/health",
              host: ["{{base_url}}"],
              path: ["api", "health"]
            },
            description: "### 📌 Health Check\nChecks if backend server and database connections are operational."
          }
        },
        {
          name: "Public Commission Settings (Calculator)",
          request: {
            method: "GET",
            header: [],
            url: {
              raw: "{{base_url}}/api/creators/commission-settings",
              host: ["{{base_url}}"],
              path: ["api", "creators", "commission-settings"]
            },
            description: "### 📌 Dynamic Commission Slabs\nUsed by mobile apps to display platform commission vs creator net payout percentage calculator."
          }
        }
      ]
    }
  ]
};

// Also generate environment file
const environment = {
  id: "askme-local-dev-env",
  name: "AskMe.Live Environment (Local / Staging / Production)",
  values: [
    { key: "base_url", value: "http://localhost:5000", type: "default", enabled: true },
    { key: "viewer_token", value: "", type: "secret", enabled: true },
    { key: "creator_token", value: "", type: "secret", enabled: true },
    { key: "admin_token", value: "", type: "secret", enabled: true },
    { key: "demo_phone", value: "9999999999", type: "default", enabled: true },
    { key: "demo_otp", value: "123456", type: "default", enabled: true }
  ]
};

const collectionPath = path.join(__dirname, 'AskMe_API_Collection.postman_collection.json');
const environmentPath = path.join(__dirname, 'AskMe_Environment.postman_environment.json');

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf-8');
fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2), 'utf-8');

console.log("Successfully generated:");
console.log("- " + collectionPath);
console.log("- " + environmentPath);

