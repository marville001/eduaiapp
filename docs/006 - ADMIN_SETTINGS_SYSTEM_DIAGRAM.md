# Admin Settings System Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Admin Settings UI]
        TABS[Settings Tabs]
        AIUI[AI Models Tab]
        GENUI[General Settings Tab]
        SECUI[Security Tab]
        UPUI[Upload Settings Tab]
    end

    subgraph "API Layer"
        CTRL[Settings Controller]
        AICTRL[AI Models Endpoints]
        GENCTRL[General Settings Endpoints]
    end

    subgraph "Service Layer"
        AISVC[AI Model Service]
        SETSVC[Settings Service]
        ENCSVC[Encryption Service]
        AUDSVC[Audit Service]
    end

    subgraph "Repository Layer"
        AIREPO[AI Model Repository]
        SETREPO[Settings Repository]
        AUDREPO[Audit Repository]
    end

    subgraph "Database Layer"
        AIDB[(AI Models Table)]
        SETDB[(System Settings Table)]
        AUDDB[(Audit Logs Table)]
    end

    subgraph "Security Layer"
        PERM[Permission System]
        ENC[API Key Encryption]
        AUDIT[Audit Logging]
    end

    UI --> TABS
    TABS --> AIUI
    TABS --> GENUI
    TABS --> SECUI
    TABS --> UPUI

    AIUI --> AICTRL
    GENUI --> GENCTRL
    SECUI --> GENCTRL
    UPUI --> GENCTRL

    CTRL --> AICTRL
    CTRL --> GENCTRL

    AICTRL --> AISVC
    GENCTRL --> SETSVC

    AISVC --> AIREPO
    AISVC --> ENCSVC
    AISVC --> AUDSVC
    SETSVC --> SETREPO
    SETSVC --> AUDSVC

    AIREPO --> AIDB
    SETREPO --> SETDB
    AUDSVC --> AUDREPO
    AUDREPO --> AUDDB

    AISVC --> PERM
    SETSVC --> PERM
    ENCSVC --> ENC
    AUDSVC --> AUDIT
```

## AI Model Configuration Flow

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant UI as Settings UI
    participant API as Settings API
    participant Service as AI Model Service
    participant Repo as AI Model Repository
    participant Enc as Encryption Service
    participant DB as Database
    participant Audit as Audit Service

    Admin->>UI: Configure AI Model
    UI->>API: POST /settings/ai-models
    API->>API: Check Permissions
    API->>Service: createModel(data)
    Service->>Enc: encrypt(apiKey)
    Enc-->>Service: encryptedKey
    Service->>Repo: createWithEncryptedKey(data)
    Repo->>DB: INSERT ai_model_configurations
    DB-->>Repo: model created
    Repo-->>Service: AiModelConfiguration
    Service->>Audit: logModelCreation()
    Audit->>DB: INSERT audit_logs
    Service-->>API: created model
    API-->>UI: success response
    UI-->>Admin: Model configured successfully
```

## Permission-Based Access Control

```mermaid
graph LR
    subgraph "Permission Levels"
        READ[SETTINGS:READ]
        UPDATE[SETTINGS:UPDATE]
        AI_CREATE[AI_MODELS:CREATE]
        AI_UPDATE[AI_MODELS:UPDATE]
        AI_SENSITIVE[AI_MODELS:VIEW_SENSITIVE]
        AI_DELETE[AI_MODELS:DELETE]
    end

    subgraph "User Roles"
        SUPER[Super Admin]
        ADMIN[Admin]
        MANAGER[Manager]
    end

    subgraph "UI Components"
        VIEW_SETTINGS[View Settings]
        EDIT_SETTINGS[Edit Settings]
        VIEW_MODELS[View AI Models]
        CREATE_MODEL[Create AI Model]
        EDIT_MODEL[Edit AI Model]
        VIEW_KEYS[View API Keys]
        DELETE_MODEL[Delete AI Model]
    end

    SUPER --> READ
    SUPER --> UPDATE
    SUPER --> AI_CREATE
    SUPER --> AI_UPDATE
    SUPER --> AI_SENSITIVE
    SUPER --> AI_DELETE

    ADMIN --> READ
    ADMIN --> UPDATE
    ADMIN --> AI_CREATE
    ADMIN --> AI_UPDATE

    MANAGER --> READ

    READ --> VIEW_SETTINGS
    READ --> VIEW_MODELS
    UPDATE --> EDIT_SETTINGS
    AI_CREATE --> CREATE_MODEL
    AI_UPDATE --> EDIT_MODEL
    AI_SENSITIVE --> VIEW_KEYS
    AI_DELETE --> DELETE_MODEL
```

## Data Security Architecture

```mermaid
graph TB
    subgraph "Input Layer"
        FORM[Settings Form]
        APIKEY[API Key Input]
    end

    subgraph "Validation Layer"
        VALID[Input Validation]
        SANITIZE[Data Sanitization]
    end

    subgraph "Security Layer"
        ENCRYPT[AES-256-GCM Encryption]
        HASH[Key Hashing]
        SALT[Salt Generation]
    end

    subgraph "Storage Layer"
        ENCDB[(Encrypted Storage)]
        KEYSTORE[(Key Management)]
    end

    subgraph "Access Layer"
        DECRYPT[Decryption Service]
        PERM_CHECK[Permission Check]
        AUDIT_LOG[Audit Logging]
    end

    FORM --> VALID
    APIKEY --> VALID
    VALID --> SANITIZE
    SANITIZE --> ENCRYPT
    ENCRYPT --> HASH
    HASH --> SALT
    SALT --> ENCDB
    ENCRYPT --> KEYSTORE

    PERM_CHECK --> DECRYPT
    DECRYPT --> ENCDB
    DECRYPT --> KEYSTORE
    DECRYPT --> AUDIT_LOG
```

## Settings UI Component Hierarchy

```mermaid
graph TB
    subgraph "Main Settings Page"
        MAIN[/admin/settings/page.tsx]
    end

    subgraph "Tab Components"
        TABS[SettingsTabs.tsx]
        AI_TAB[AiModelsTab.tsx]
        GEN_TAB[GeneralSettingsTab.tsx]
        SEC_TAB[SecuritySettingsTab.tsx]
        UP_TAB[UploadSettingsTab.tsx]
    end

    subgraph "AI Models Components"
        AI_LIST[AiModelsList.tsx]
        AI_CARD[AiModelCard.tsx]
        AI_FORM[AiModelForm.tsx]
        API_INPUT[ApiKeyInput.tsx]
        TEST_CONN[TestConnection.tsx]
    end

    subgraph "General Settings Components"
        BRAND_FORM[BrandingForm.tsx]
        CONTACT_FORM[ContactForm.tsx]
        SOCIAL_FORM[SocialMediaForm.tsx]
    end

    subgraph "Security Components"
        PERM_FORM[PermissionsForm.tsx]
        AUDIT_VIEW[AuditLogViewer.tsx]
    end

    subgraph "Upload Components"
        FILE_FORM[FileSettingsForm.tsx]
        LIMIT_FORM[UploadLimitsForm.tsx]
    end

    MAIN --> TABS
    TABS --> AI_TAB
    TABS --> GEN_TAB
    TABS --> SEC_TAB
    TABS --> UP_TAB

    AI_TAB --> AI_LIST
    AI_LIST --> AI_CARD
    AI_TAB --> AI_FORM
    AI_FORM --> API_INPUT
    AI_CARD --> TEST_CONN

    GEN_TAB --> BRAND_FORM
    GEN_TAB --> CONTACT_FORM
    GEN_TAB --> SOCIAL_FORM

    SEC_TAB --> PERM_FORM
    SEC_TAB --> AUDIT_VIEW

    UP_TAB --> FILE_FORM
    UP_TAB --> LIMIT_FORM
```

## Database Schema Relationships

```mermaid
erDiagram
    SYSTEM_SETTINGS {
        int id PK
        string platform_name
        string support_email
        string app_logo
        string app_favicon
        string contact_phone
        string contact_address
        string social_facebook
        string social_twitter
        string social_linkedin
        string social_instagram
        int max_file_upload_size
        string[] allowed_file_types
        int default_ai_model_id FK
        boolean allow_signup
        boolean email_notifications
        boolean sms_notifications
        boolean admin_alerts
        boolean require_verification
        timestamp created_at
        timestamp updated_at
    }

    AI_MODEL_CONFIGURATIONS {
        int id PK
        uuid entity_id UK
        string provider
        string model_name
        string display_name
        string description
        string api_endpoint
        text api_key_encrypted
        boolean is_default
        boolean is_active
        int max_tokens
        decimal temperature
        decimal top_p
        decimal frequency_penalty
        decimal presence_penalty
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    AUDIT_LOGS {
        int id PK
        int performed_by FK
        string performer_name
        string action
        string target_type
        string target_id
        string details
        string ip_address
        json metadata
        timestamp created_at
    }

    USERS {
        int id PK
        string email
        string first_name
        string last_name
        string role
        timestamp created_at
        timestamp updated_at
    }

    SYSTEM_SETTINGS ||--o| AI_MODEL_CONFIGURATIONS : "default_ai_model_id"
    AUDIT_LOGS }o--|| USERS : "performed_by"
    AI_MODEL_CONFIGURATIONS ||--o{ AUDIT_LOGS : "target_id"
    SYSTEM_SETTINGS ||--o{ AUDIT_LOGS : "target_id"
```

## API Endpoint Structure

```mermaid
graph LR
    subgraph "Settings API Endpoints"
        BASE[/api/settings]
        
        subgraph "General Settings"
            GET_SET[GET /settings]
            UPDATE_SET[PATCH /settings]
        end
        
        subgraph "AI Models"
            GET_AI[GET /settings/ai-models]
            CREATE_AI[POST /settings/ai-models]
            UPDATE_AI[PATCH /settings/ai-models/:id]
            DELETE_AI[DELETE /settings/ai-models/:id]
            SET_DEFAULT[POST /settings/ai-models/:id/set-default]
            TEST_CONN[POST /settings/ai-models/:id/test-connection]
            GET_KEY[GET /settings/ai-models/:id/api-key]
        end
        
        subgraph "Security"
            GET_AUDIT[GET /settings/audit-logs]
            GET_PERMS[GET /settings/permissions]
        end
    end

    BASE --> GET_SET
    BASE --> UPDATE_SET
    BASE --> GET_AI
    BASE --> CREATE_AI
    BASE --> UPDATE_AI
    BASE --> DELETE_AI
    BASE --> SET_DEFAULT
    BASE --> TEST_CONN
    BASE --> GET_KEY
    BASE --> GET_AUDIT
    BASE --> GET_PERMS
```

## Implementation Priority Matrix

```mermaid
quadrantChart
    title Implementation Priority Matrix
    x-axis Low Complexity --> High Complexity
    y-axis Low Impact --> High Impact
    
    quadrant-1 Quick Wins
    quadrant-2 Major Projects
    quadrant-3 Fill-ins
    quadrant-4 Questionable

    Database Migration: [0.2, 0.9]
    AI Model Entity: [0.3, 0.9]
    Encryption Service: [0.6, 0.9]
    AI Model Repository: [0.4, 0.8]
    AI Model Service: [0.5, 0.8]
    Settings Controller: [0.4, 0.7]
    Permission System: [0.7, 0.8]
    Frontend Types: [0.2, 0.6]
    API Client: [0.3, 0.6]
    UI Components: [0.6, 0.7]
    Form Validation: [0.4, 0.5]
    Testing: [0.5, 0.6]
    Documentation: [0.3, 0.4]
    Audit Logging: [0.5, 0.7]
```

## Security Threat Model

```mermaid
graph TB
    subgraph "Threat Vectors"
        T1[API Key Exposure]
        T2[Unauthorized Access]
        T3[Data Tampering]
        T4[Privilege Escalation]
        T5[Audit Log Manipulation]
    end

    subgraph "Mitigation Strategies"
        M1[AES-256-GCM Encryption]
        M2[Role-Based Access Control]
        M3[Input Validation & Sanitization]
        M4[Permission Boundaries]
        M5[Immutable Audit Logs]
    end

    subgraph "Monitoring & Detection"
        MON1[Failed Access Attempts]
        MON2[Unusual API Key Access]
        MON3[Settings Change Patterns]
        MON4[Permission Escalation Attempts]
    end

    T1 --> M1
    T2 --> M2
    T3 --> M3
    T4 --> M4
    T5 --> M5

    M1 --> MON2
    M2 --> MON1
    M3 --> MON3
    M4 --> MON4
    M5 --> MON3