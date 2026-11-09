-- ============================================================================
-- SCHOLARSHIP MANAGEMENT & ACTIVITY SCORE ACCUMULATION SYSTEM
-- ระบบจัดการเอกสารและการสะสมคะแนนกิจกรรมเพื่ออนุมัติทุนการศึกษา
-- Database: PostgreSQL 14+
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'FACULTY', 'OFFICER', 'ADMIN');
CREATE TYPE student_status_enum AS ENUM ('STUDYING', 'GRADUATED', 'SUSPENDED', 'DISMISSED');
CREATE TYPE scholarship_status_enum AS ENUM (
    'DOCUMENTS_RECEIVED',      -- รับเอกสารแล้ว
    'UNDER_CONSIDERATION',     -- อยู่ระหว่างพิจารณา
    'APPROVED',                -- ผ่านการอนุมัติ
    'SENT_TO_FINANCE',         -- ส่งการคลังแล้ว คาดการณ์เวลาที่ได้รับเงิน
    'REJECTED'                 -- ไม่อนุมัติ / ไม่ผ่านเกณฑ์
);
CREATE TYPE scholarship_category_enum AS ENUM (
    'MONTHLY_ALLOWANCE',       -- เงินรายเดือน
    'EQUIPMENT_UNIFORM',       -- ค่าอุปกรณ์และเครื่องแต่งกาย
    'TUITION_FEE',             -- ค่าลงทะเบียนการศึกษา
    'ACCOMMODATION'            -- ค่าที่พัก
);
CREATE TYPE document_type_enum AS ENUM (
    'APPLICATION_FORM',        -- 1. แบบคำขอรับทุนการศึกษา
    'ID_CARD_HOUSE_REG',       -- 2. สำเนาบัตรประชาชน/สำเนาทะเบียนบ้าน
    'TRANSCRIPT_REPORT',       -- 3. ใบรายงานผลการศึกษา (GPAX)
    'BANK_BOOK_COPY',          -- 4. ไฟล์สำเนาหน้าสมุดบัญชีที่ใช้ผูกกับรหัสนิสิต
    'FAMILY_INCOME_CERT',      -- 5. หนังสือรับรองรายได้ครอบครัว
    'ACTIVITY_LOG_HOURS',      -- 6. บันทึกการปฏิบัติงาน/ชั่วโมงกิจกรรม
    'HOME_SURVEY_PHOTOS'       -- 7. แบบรายงานสภาพความเป็นอยู่/รูปถ่ายบ้าน
);
CREATE TYPE doc_verification_status_enum AS ENUM (
    'PENDING',                 -- รอตรวจสอบ
    'VERIFIED',                -- ตรวจสอบผ่านแล้ว
    'REQUEST_MORE_DOCS',       -- ขอเอกสารเพิ่มเติม (RFI)
    'REJECTED'                 -- เอกสารไม่ถูกต้อง/ปฏิเสธ
);
CREATE TYPE activity_category_enum AS ENUM (
    'VOLUNTEER',               -- จิตอาสา/บำเพ็ญประโยชน์
    'ACADEMIC',                -- วิชาการ/ทักษะ
    'CULTURAL',                -- ศิลปวัฒนธรรม/ประเพณี
    'RURAL_CENTER'             -- งานศูนย์จุฬาฯ-ชนบท/ส่วนกลาง
);
CREATE TYPE notification_channel_enum AS ENUM ('LINE_OA', 'EMAIL', 'IN_APP', 'ALL');
CREATE TYPE notification_target_enum AS ENUM (
    'ALL',                     -- ทุกคน
    'YEAR_LEVEL',              -- ชั้นปี
    'COHORT',                  -- รุ่น / ปีที่รับเข้า
    'FACULTY',                 -- คณะ
    'SCHOLARSHIP_TYPE',        -- ประเภททุน
    'STUDENT_STATUS',          -- สถานะนิสิต (เช่น พ้นสภาพ, กำลังเรียน)
    'ACTIVITY_APPLICANTS',     -- ผู้สมัครกิจกรรม
    'CUSTOM_GROUP'             -- กลุ่มที่ตั้งค่าได้เองโดยเจ้าหน้าที่
);

-- ============================================================================
-- 3. CORE USERS & AUTH
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'STUDENT',
    title VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    line_user_id VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. STUDENTS MASTER TABLE (Supports exact 39 Excel Columns + Academic Details)
-- ============================================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Legacy Excel Headers (1-39)
    seq_no INT,                                     -- 1. ลำดับที่
    cohort_seq_no INT,                              -- 2. ลำดับในรุ่น
    faculty_seq_no INT,                             -- 3. ลำดับคณะ
    cohort_no VARCHAR(50),                          -- 4. รุ่นที่ (เช่น 2566, รุ่น 41)
    citizen_id VARCHAR(20) UNIQUE NOT NULL,         -- 5. รหัสประจำตัวประชาชน
    student_id VARCHAR(20) UNIQUE NOT NULL,         -- 6. รหัสนิสิต
    title VARCHAR(50),                              -- 7. คำนำหน้า
    first_name VARCHAR(100) NOT NULL,               -- 8. ชื่อ
    last_name VARCHAR(100) NOT NULL,                -- 9. นามสกุล
    first_name_en VARCHAR(100),                     -- 10. ชื่อภาษาอังกฤษ
    last_name_en VARCHAR(100),                      -- 11. นามสกุลภาษาอังกฤษ
    faculty_name VARCHAR(150) NOT NULL,             -- 12. คณะ
    major_name VARCHAR(150) NOT NULL,               -- 13. สาขาวิชา
    high_school_name VARCHAR(200),                  -- 14. โรงเรียนที่จบ
    school_district VARCHAR(100),                   -- 15. อำเภอ รร ที่จบ
    school_province VARCHAR(100),                   -- 16. จังหวัด รร ที่จบ
    father_name VARCHAR(150),                       -- 17. ชื่อบิดานิสิต
    mother_name VARCHAR(150),                       -- 18. ชื่อมารดานิสิต
    family_status VARCHAR(100),                     -- 19. สถานภาพครอบครัว
    guardian_name VARCHAR(150),                     -- 20. ผู้ปกครอง
    guardian_occupation VARCHAR(150),               -- 21. อาชีพผู้ปกครอง
    father_occupation VARCHAR(150),                 -- 22. อาชีพบิดา
    mother_occupation VARCHAR(150),                 -- 23. อาชีพมารดา
    monthly_income NUMERIC(12,2),                   -- 24. รายได้ต่อเดือนบิดา/มารดา/ผู้ปกครอง
    address_line TEXT,                              -- 25. บ้านเลขที่/หมู่บ้าน/ซอย/ถนน (นิสิต)
    subdistrict VARCHAR(100),                       -- 26. ตำบล
    district VARCHAR(100),                          -- 27. อำเภอ
    province VARCHAR(100),                          -- 28. จังหวัด
    postal_code VARCHAR(10),                        -- 29. รหัสไปรษณีย์
    phone_number VARCHAR(50),                       -- 30. เบอร์โทรศัพท์นิสิต
    emergency_phone VARCHAR(50),                    -- 31. เบอร์ติดต่อฉุกเฉิน
    emergency_relation VARCHAR(100),                -- 32. เบอร์ฉุกเฉินเกี่ยวข้องเป็น
    bank_account_name VARCHAR(200),                 -- 33. ชื่อบัญชีธนาคารนิสิต
    bank_account_number VARCHAR(50),                -- 34. เลขที่บัญชีธนาคาร
    bank_name VARCHAR(100),                         -- 35. ชื่อธนาคาร
    bank_branch VARCHAR(100),                       -- 36. ชื่อสาขา
    bank_branch_code VARCHAR(50),                   -- 37. รหัสสาขา
    bank_book_file_url TEXT,                        -- 38. ไฟล์สำเนาหน้าสมุดบัญชีที่ใช้ผูกกับรหัสนิสิต
    remarks TEXT,                                   -- 39. หมายเหตุ
    
    -- Academic & Center Info
    year_level INT DEFAULT 1,                       -- ชั้นปี (1, 2, 3, 4, ฯลฯ)
    current_academic_year INT DEFAULT 2567,         -- ปีการศึกษาปัจจุบัน
    current_term INT DEFAULT 1,                     -- เทอมปัจจุบัน
    dormitory_name VARCHAR(100),                    -- หอพัก
    gpax NUMERIC(3,2) DEFAULT 0.00,                 -- GPAX สะสม
    student_status student_status_enum DEFAULT 'STUDYING', -- สถานะนิสิต
    dismissed_date DATE,                            -- วันที่พ้นสภาพ (ถ้ามี)
    dismissed_reason TEXT,                          -- เหตุผลที่พ้นสภาพ
    latitude NUMERIC(10,7),                         -- พิกัดบ้าน (สำหรับเยี่ยมบ้าน)
    longitude NUMERIC(10,7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_cohort ON students(cohort_no);
CREATE INDEX idx_students_faculty ON students(faculty_name);
CREATE INDEX idx_students_status ON students(student_status);
CREATE INDEX idx_students_province ON students(province);

-- ============================================================================
-- 5. PROFILE CHANGE AUDIT & VERIFICATION (เจ้าหน้าที่ Verify ทุกการแก้ไข)
-- ============================================================================
CREATE TABLE profile_change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label_th VARCHAR(150),
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    proof_attachment_url TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',          -- PENDING, APPROVED, REJECTED
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_by_officer_id UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    officer_comment TEXT
);

CREATE TABLE profile_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,                   -- UPDATE, VERIFY, IMPORT
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. PDPA & CONSENT RECORDS (ต้องมี Consent ก่อนเซฟข้อมูลอ่อนไหว/บัญชี)
-- ============================================================================
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    consent_code VARCHAR(100) NOT NULL,            -- PDPA_GENERAL, BANK_ACCOUNT, SENSITIVE_FAMILY
    policy_version VARCHAR(20) NOT NULL,
    has_consented BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. SCHOLARSHIP MASTER BY ACADEMIC YEAR (ไม่ทับปีเก่า)
-- ============================================================================
CREATE TABLE scholarship_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year INT NOT NULL,                     -- ปีการศึกษา เช่น 2567
    term INT NOT NULL,                             -- ภาคการศึกษา 1 หรือ 2
    category scholarship_category_enum NOT NULL,   -- รายเดือน, อุปกรณ์, ค่าเทอม, ค่าหอ
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount_per_person NUMERIC(12,2) NOT NULL,
    min_activity_score INT DEFAULT 40,             -- เกณฑ์คะแนนกิจกรรมขั้นต่ำ
    min_gpax NUMERIC(3,2) DEFAULT 2.00,
    total_quota INT DEFAULT 100,
    allocated_budget NUMERIC(14,2) NOT NULL,
    spent_budget NUMERIC(14,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(academic_year, term, category, name)
);

-- ============================================================================
-- 8. SCHOLARSHIP APPLICATIONS & 4-STAGE PIPELINE
-- ============================================================================
CREATE TABLE scholarship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    scholarship_scheme_id UUID NOT NULL REFERENCES scholarship_schemes(id),
    academic_year INT NOT NULL,
    term INT NOT NULL,
    application_no VARCHAR(100) UNIQUE NOT NULL,
    status scholarship_status_enum NOT NULL DEFAULT 'DOCUMENTS_RECEIVED',
    
    -- Accumulated Score at review time
    accumulated_activity_score INT DEFAULT 0,
    score_threshold_passed BOOLEAN DEFAULT FALSE,
    
    -- Approval by Faculty (อาจารย์)
    approved_by_faculty_id UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    faculty_decision_notes TEXT,
    
    -- Submission to Finance (ส่งการคลัง)
    finance_batch_code VARCHAR(100),
    submitted_to_finance_at TIMESTAMP WITH TIME ZONE,
    estimated_payout_date DATE,                    -- คาดการณ์เวลาที่ได้รับเงิน
    actual_disbursed_at TIMESTAMP WITH TIME ZONE,
    disbursed_amount NUMERIC(12,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apps_status ON scholarship_applications(status);
CREATE INDEX idx_apps_student ON scholarship_applications(student_id);

-- ============================================================================
-- 9. 7 STANDARD DOCUMENTS (ตรวจภาพสแกนเทียบกระดาษจริง)
-- ============================================================================
CREATE TABLE student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    application_id UUID REFERENCES scholarship_applications(id),
    academic_year INT NOT NULL,
    term INT NOT NULL,
    doc_type document_type_enum NOT NULL,
    doc_name VARCHAR(255) NOT NULL,
    scanned_file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_extension VARCHAR(20),
    
    -- Physical Paper Checklist
    physical_paper_submitted BOOLEAN DEFAULT FALSE,
    physical_paper_received_at TIMESTAMP WITH TIME ZONE,
    physical_paper_storage_box VARCHAR(100),
    
    -- Verification
    verification_status doc_verification_status_enum DEFAULT 'PENDING',
    verified_by_officer_id UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    officer_feedback TEXT,                         -- กรณีขอเอกสารเพิ่มเติม
    
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_docs_student_type ON student_documents(student_id, doc_type);

-- ============================================================================
-- 10. ACTIVITIES & SCORE ACCUMULATION
-- ============================================================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category activity_category_enum NOT NULL,
    points_reward INT NOT NULL DEFAULT 5,
    max_hours INT DEFAULT 8,
    academic_year INT NOT NULL,
    term INT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    max_participants INT,
    current_registered INT DEFAULT 0,
    created_by_officer_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_activity_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    custom_activity_name VARCHAR(255),              -- กรณีกิจกรรมภายนอก
    category activity_category_enum NOT NULL,
    activity_date DATE NOT NULL,
    hours_participated INT NOT NULL DEFAULT 3,
    proof_image_url TEXT NOT NULL,
    reflection_notes TEXT,
    
    -- Paper confirmation
    physical_cert_submitted BOOLEAN DEFAULT FALSE,
    paper_status VARCHAR(50) DEFAULT 'รอตรวจสอบ',   -- ส่งแล้ว / รอตรวจสอบ
    
    -- Score awarding by Officer
    score_awarded INT DEFAULT 0,
    status doc_verification_status_enum DEFAULT 'PENDING',
    verified_by_officer_id UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    officer_notes TEXT,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_activities ON student_activity_submissions(student_id);

-- ============================================================================
-- 11. ACADEMIC CALENDAR & CUT-OFF PERIODS
-- ============================================================================
CREATE TABLE academic_calendar_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year INT NOT NULL,
    term INT NOT NULL,
    round_name VARCHAR(200) NOT NULL,               -- เช่น "รอบที่ 1: พิจารณาทุนต้นภาคเรียน"
    submission_start_date DATE NOT NULL,
    doc_cut_off_date DATE NOT NULL,                 -- วันตัดรอบรับเอกสาร
    officer_screening_deadline DATE NOT NULL,
    faculty_approval_deadline DATE NOT NULL,
    finance_submit_deadline DATE NOT NULL,
    expected_payout_date DATE NOT NULL,             -- วันที่คาดว่าเงินจะโอนเข้าบัญชี
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. NOTIFICATIONS & TARGETED LINE OA / EMAIL
-- ============================================================================
CREATE TABLE notification_broadcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel notification_channel_enum NOT NULL DEFAULT 'ALL',
    target_type notification_target_enum NOT NULL DEFAULT 'ALL',
    target_filters JSONB,                           -- {"year_level": 2, "faculty": "วิศวกรรมศาสตร์", "cohort": "2566"}
    total_recipients INT DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broadcast_id UUID REFERENCES notification_broadcasts(id),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel notification_channel_enum NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. CMS FOR PUBLIC LANDING PAGE (หน้าแรกไม่ต้อง Login)
-- ============================================================================
CREATE TABLE landing_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_code VARCHAR(50) NOT NULL,              -- ANNOUNCEMENT, ELIGIBILITY, CALENDAR, FAQ, HERO
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content_html TEXT,
    badge_tag VARCHAR(50),
    cover_image_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    published_date DATE DEFAULT CURRENT_DATE,
    created_by_officer_id UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIEWS: EXECUTIVE & FACULTY DASHBOARD VIEW (ภาพรวมตรงตาม SRS / Mockup)
-- ============================================================================
CREATE OR REPLACE VIEW view_faculty_evaluation_summary AS
SELECT 
    s.id AS student_id,
    s.student_id AS student_code,
    s.title,
    s.first_name,
    s.last_name,
    s.cohort_no,
    s.faculty_name,
    s.major_name,
    s.year_level,
    s.gpax,
    s.student_status,
    s.province,
    COALESCE(SUM(sas.score_awarded) FILTER (WHERE sas.status = 'VERIFIED'), 0) AS total_score,
    sa.id AS application_id,
    sa.status AS application_status,
    sa.estimated_payout_date,
    sch.name AS scholarship_name,
    sch.amount_per_person,
    sch.min_activity_score,
    CASE 
        WHEN COALESCE(SUM(sas.score_awarded) FILTER (WHERE sas.status = 'VERIFIED'), 0) >= sch.min_activity_score AND s.gpax >= sch.min_gpax THEN TRUE
        ELSE FALSE
    END AS is_qualified
FROM students s
LEFT JOIN scholarship_applications sa ON sa.student_id = s.id
LEFT JOIN scholarship_schemes sch ON sch.id = sa.scholarship_scheme_id
LEFT JOIN student_activity_submissions sas ON sas.student_id = s.id
GROUP BY s.id, sa.id, sch.id;
