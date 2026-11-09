import React, { useState } from 'react';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  Send, 
  Calendar, 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Eye, 
  CheckCheck,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Globe,
  Award,
  ChevronRight,
  X,
  MessageSquare,
  Download,
  Image,
  Tag,
  Check,
  RotateCcw,
  FileCheck,
  Lock,
  BookOpen,
  Home,
  Building,
  Receipt,
  Power,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { 
  DAILY_TASKS_OFFICER, 
  SCHOLARSHIP_TYPES, 
  ACADEMIC_CALENDAR_EVENTS,
  createStudentDocuments,
  DISBURSEMENT_STAGES,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

export default function OfficerDashboard({ 
  students, 
  activeTab, 
  setActiveTab, 
  onVerifyDocumentScore, 
  onBulkSubmitToFaculty, 
  onUpdateStudent,
  academicYear 
}) {
  // If activeTab from props doesn't start with 'officer-', normalize or fallback
  const currentTab = (activeTab && activeTab.startsWith('officer-')) 
    ? activeTab 
    : 'officer-daily';

  const setTab = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
  };

  // Dual-view verification modal state
  const [selectedStudentForDualView, setSelectedStudentForDualView] = useState(null);
  const [awardedScoreInput, setAwardedScoreInput] = useState(10);
  const [physicalPaperChecked, setPhysicalPaperChecked] = useState(true);
  const [officerReviewNotes, setOfficerReviewNotes] = useState('เอกสารภาพสแกนตรงกับหนังสือรับรองกระดาษจริงของคณะ');

  // All uploaded documents review & approval modal state
  const [selectedStudentForDocApproval, setSelectedStudentForDocApproval] = useState(null);
  const [docApprovalPreviewModal, setDocApprovalPreviewModal] = useState(null);
  const [counselorReplyDraft, setCounselorReplyDraft] = useState('');

  // Student Profile & Academic Records modal for Officer (สอดคล้องกับของอาจารย์)
  const [selectedStudentForProfileModal, setSelectedStudentForProfileModal] = useState(null);
  const [officerProfileModalTab, setOfficerProfileModalTab] = useState('academic'); // academic | scholarship | activities | contact | counseling

  // Audit Logs State (Database Tracking System ตาม PDPA)
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogFilterRole, setAuditLogFilterRole] = useState('ALL');

  // Academic & Scholarship History Helpers for Student Profile Modal
  const getAcademicHistory = (student) => {
    const isDismissed = student?.student_status === 'พ้นสภาพ';
    if (isDismissed) {
      return [
        { term: '1/2566', gpa: 2.38, gpax: 2.38, creditsTerm: 17, creditsTotal: 17, status: 'ปกติ' },
        { term: '2/2566', gpa: 1.84, gpax: 2.11, creditsTerm: 18, creditsTotal: 35, status: 'วิทยาทัณฑ์ (Probation)' },
        { term: '1/2567', gpa: 1.63, gpax: 1.87, creditsTerm: 17, creditsTotal: 52, status: 'วิทยาทัณฑ์ขั้นสูง' },
        { term: '2/2567', gpa: 1.72, gpax: 1.82, creditsTerm: 18, creditsTotal: 70, status: 'พ้นสภาพ (GPAX ต่ำกว่าเกณฑ์)' },
      ];
    }
    const currentGpax = Number(student?.gpax || 3.45);
    return [
      { term: '1/2566', gpa: currentGpax - 0.12, gpax: currentGpax - 0.12, creditsTerm: 19, creditsTotal: 19, status: 'ปกติ' },
      { term: '2/2566', gpa: currentGpax + 0.08, gpax: currentGpax - 0.02, creditsTerm: 18, creditsTotal: 37, status: 'ปกติ' },
      { term: '1/2567', gpa: currentGpax + 0.04, gpax: currentGpax, creditsTerm: 20, creditsTotal: 57, status: 'ปกติ (รับทุนต่อเนื่อง)' },
    ];
  };

  const getScholarshipHistory = (student) => {
    return [
      { term: '1/2566', type: 'เงินรายเดือน', amount: 5000, date: '25 ส.ค. 2566', status: 'โอนสำเร็จ', ref: 'SCB-TX-990182' },
      { term: '1/2566', type: 'ค่าอุปกรณ์และเครื่องแต่งกาย', amount: 6000, date: '10 ก.ย. 2566', status: 'โอนสำเร็จ', ref: 'SCB-TX-990344' },
      { term: '2/2566', type: 'เงินรายเดือน', amount: 5000, date: '25 ม.ค. 2567', status: 'โอนสำเร็จ', ref: 'SCB-TX-104921' },
      { term: '1/2567', type: 'เงินรายเดือน', amount: 5000, date: student?.estimatedPayoutDate ? `คาดการณ์: ${student.estimatedPayoutDate}` : 'อยู่ระหว่างดำเนินการ', status: student?.scholarshipStatus === 'SENT_TO_FINANCE' ? 'ส่งการคลังแล้ว' : 'รอการอนุมัติ', ref: 'SCB-PENDING-2567' },
    ];
  };

  const handleOpenDocApprovalModal = (student) => {
    // Ensure student has documents initialized
    const docs = student.documents && student.documents.length > 0
      ? student.documents
      : createStudentDocuments(student.student_id, student.scholarshipStatus === 'APPROVED' || student.scholarshipStatus === 'SENT_TO_FINANCE');
    
    const enrichedStudent = {
      ...student,
      documents: docs
    };
    setSelectedStudentForDocApproval(enrichedStudent);
    setCounselorReplyDraft(student.confidential_letter_reply || '');
  };

  const handleUpdateSingleDoc = (docId, newStatus, newPaperVerified, noteText) => {
    if (!selectedStudentForDocApproval) return;
    
    const docs = (selectedStudentForDocApproval.documents || []).map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: newStatus !== undefined ? newStatus : doc.status,
          paperVerified: newPaperVerified !== undefined ? newPaperVerified : doc.paperVerified,
          officerNote: noteText !== undefined ? noteText : doc.officerNote
        };
      }
      return doc;
    });

    const allApproved = docs.every(d => !d.required || d.status === 'APPROVED');
    const updated = {
      ...selectedStudentForDocApproval,
      documents: docs,
      paperStatus: allApproved ? 'ส่งแล้ว' : selectedStudentForDocApproval.paperStatus
    };

    setSelectedStudentForDocApproval(updated);
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
  };

  const handleBulkApproveAllStudentDocs = () => {
    if (!selectedStudentForDocApproval) return;

    const docs = (selectedStudentForDocApproval.documents || []).map(doc => ({
      ...doc,
      status: 'APPROVED',
      paperVerified: true,
      officerNote: doc.officerNote || 'เจ้าหน้าที่ตรวจสอบเอกสารและเทียบหลักฐานฉบับจริงถูกต้อง'
    }));

    const updated = {
      ...selectedStudentForDocApproval,
      documents: docs,
      paperStatus: 'ส่งแล้ว'
    };

    setSelectedStudentForDocApproval(updated);
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    alert(`อนุมัติเอกสารหลักฐานทั้งหมดของนิสิต ${selectedStudentForDocApproval.first_name} เรียบร้อยแล้ว!`);
  };

  const handleSaveCounselorReply = () => {
    if (!selectedStudentForDocApproval || !counselorReplyDraft) return;

    const updated = {
      ...selectedStudentForDocApproval,
      confidential_letter_reply: counselorReplyDraft,
      confidential_letter_status: 'REPLIED'
    };

    setSelectedStudentForDocApproval(updated);
    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    alert('บันทึกและส่งข้อความคำแนะนำตอบกลับถึงนิสิตเรียบร้อยแล้ว!');
  };

  const handleUpdateReimbursementStatus = (reimbId, newStatus, newNote = null) => {
    if (!selectedStudentForDocApproval) return;
    const currentReimbs = selectedStudentForDocApproval.reimbursements || [];
    const updatedReimbs = currentReimbs.map(r => {
      if (r.id === reimbId) {
        return {
          ...r,
          status: newStatus,
          status_label: newStatus === 'SENT_TO_FINANCE' ? 'ส่งการคลังแล้ว โอนเงินเข้าบัญชี' :
                        newStatus === 'APPROVED' ? 'ผ่านการอนุมัติเบิกจ่ายแล้ว' :
                        newStatus === 'UNDER_CONSIDERATION' ? 'อยู่ระหว่างพิจารณาเอกสารใบเสร็จ' : 'รับเอกสารแล้ว',
          officer_note: newNote !== null ? newNote : r.officer_note
        };
      }
      return r;
    });

    const updatedStudent = {
      ...selectedStudentForDocApproval,
      reimbursements: updatedReimbs
    };

    setSelectedStudentForDocApproval(updatedStudent);
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  // ==========================================
  // 1. SCHEMES STATE & EDIT MODAL
  // ==========================================
  const [schemes, setSchemes] = useState(
    SCHOLARSHIP_TYPES.map(s => ({
      ...s,
      status: 'เปิดรับคำขอ'
    }))
  );
  const [editingScheme, setEditingScheme] = useState(null);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [newSchemeForm, setNewSchemeForm] = useState({
    year: academicYear || 2567,
    term: 1,
    category: 'เงินรายเดือน',
    name: '',
    amount: 5000,
    minScore: 40,
    minGpax: 2.00,
    totalQuota: 50,
    budgetAllocated: 1500000,
    status: 'เปิดรับคำขอ'
  });

  const handleOpenEditScheme = (scheme) => {
    setEditingScheme({ ...scheme });
  };

  const handleSaveSchemeEdit = (e) => {
    e.preventDefault();
    if (!editingScheme) return;
    setSchemes(prev => prev.map(s => s.id === editingScheme.id ? editingScheme : s));
    setEditingScheme(null);
    alert(`บันทึกการแก้ไขข้อมูลทุน "${editingScheme.name}" เรียบร้อยแล้ว`);
  };

  const handleCreateScheme = (e) => {
    e.preventDefault();
    const created = {
      id: `SCH-${newSchemeForm.year}-${schemes.length + 1}`,
      ...newSchemeForm
    };
    setSchemes([...schemes, created]);
    setShowAddSchemeModal(false);
    alert(`เพิ่มประเภททุนการศึกษาประจำปี ${newSchemeForm.year} เรียบร้อยแล้ว (ไม่ทับประวัติปีก่อนหน้า)`);
  };

  // ==========================================
  // 2. SCHOLARSHIP CUT-OFF ON/OFF SWITCH (สวิตช์เปิด-ปิดรับสมัครทุน)
  // ==========================================
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [cutoffToggleLog, setCutoffToggleLog] = useState({
    lastToggledAt: '15 ต.ค. 2567 23:59 น.',
    toggledBy: 'จุฬารัตน์ รุ่งเรือง (เจ้าหน้าที่ศูนย์ฯ)',
    announcementNote: 'เปิดรับสมัครคำขอรับทุนการศึกษาและส่งหลักฐานกิจกรรมสะสมแต้ม รอบที่ 1/2567'
  });

  const handleToggleApplicationStatus = () => {
    const nextStatus = !isApplicationOpen;
    setIsApplicationOpen(nextStatus);
    const nowStr = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    setCutoffToggleLog({
      lastToggledAt: nowStr,
      toggledBy: 'จุฬารัตน์ รุ่งเรือง (เจ้าหน้าที่ศูนย์ฯ)',
      announcementNote: nextStatus 
        ? 'เปิดรับสมัครคำขอรับทุนการศึกษาและส่งเอกสารตามปกติ' 
        : 'ปิดรับสมัครคำขอรับทุนการศึกษาชั่วคราว (Cut-off ปิดระบบรับเอกสาร)'
    });
    alert(nextStatus 
      ? '🟢 เปิดรับสมัครทุนการศึกษาแล้ว! นิสิตและผู้สมัครใหม่สามารถส่งคำขอและอัปโหลดเอกสารได้ตามปกติ' 
      : '🔴 ปิดรับสมัครทุนการศึกษา (Cut-off) เรียบร้อยแล้ว! ระบบระงับการยื่นคำขอใหม่ชั่วคราวเพื่อเข้าสู่ขั้นตอนคัดกรอง'
    );
  };

  // ==========================================
  // 3. TARGETED NOTIFICATIONS (LINE OA / EMAIL)
  // ==========================================
  const [targetType, setTargetType] = useState('ALL'); // ALL | CUSTOM
  const [customFilters, setCustomFilters] = useState({
    years: ['ปี 2'],
    cohorts: ['รุ่น 41 (2566)'],
    faculties: ['คณะวิทยาศาสตร์'],
    scholarshipTypes: ['เงินรายเดือน'],
    studentStatuses: ['กำลังเรียน'],
    pendingDocsOnly: false,
    belowScoreOnly: false
  });
  const [notificationChannel, setNotificationChannel] = useState('ALL');
  const [notificationTitle, setNotificationTitle] = useState('แจ้งเตือนวันตัดรอบส่งเอกสารและบันทึกคะแนนสะสม (Cut-off)');
  const [notificationMessage, setNotificationMessage] = useState('กรุณาส่งมอบเอกสารชั่วโมงกิจกรรมและสำเนาสมุดบัญชีก่อนเวลา 23:59 น.');
  const [broadcastLog, setBroadcastLog] = useState([
    {
      id: 1,
      target: 'Custom Group: ปี 2 (รุ่น 41) คณะวิทยาศาสตร์',
      channel: 'LINE_OA & Email',
      title: 'แจ้งเตือนส่งเอกสารฉบับจริงรอบที่ 1',
      date: '14 ต.ค. 2567 09:00 น.',
      recipients: 34
    }
  ]);

  const handleToggleFilter = (category, value) => {
    setCustomFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    const recipientEstimate = targetType === 'ALL' ? 125 : Math.max(12, customFilters.years.length * 15 + customFilters.faculties.length * 8);
    const targetLabel = targetType === 'ALL' 
      ? 'ทุกคนในโครงการ (125 คน)' 
      : `Custom Group (${customFilters.years.join(', ')} | ${customFilters.faculties.join(', ')})`;

    const newLog = {
      id: Date.now(),
      target: targetLabel,
      channel: notificationChannel,
      title: notificationTitle,
      date: new Date().toLocaleString('th-TH'),
      recipients: recipientEstimate
    };
    setBroadcastLog([newLog, ...broadcastLog]);
    alert(`ส่งข้อความแจ้งเตือนผ่านช่องทาง ${notificationChannel} ไปยัง ${targetLabel} สำเร็จ! (${recipientEstimate} รายชื่อ)`);
  };

  // ==========================================
  // 4. PROFILE VERIFICATION & LINE OA RFI MODAL
  // ==========================================
  const [pendingProfileChanges, setPendingProfileChanges] = useState([
    {
      id: 'CR-101',
      studentCode: '66700012',
      studentName: 'น.ส. กัญญาภัค ศรีสุข',
      faculty: 'วิทยาศาสตร์',
      field: 'เลขที่บัญชีธนาคาร (SCB)',
      oldVal: '026-2-88912-3',
      newVal: '026-2-99944-1',
      requestedAt: '15 ต.ค. 2567 11:20 น.',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop',
      status: 'PENDING'
    },
    {
      id: 'CR-102',
      studentCode: '66700027',
      studentName: 'นาย อดุลภัทร พลอยดี',
      faculty: 'วิศวกรรมศาสตร์',
      field: 'เบอร์ติดต่อฉุกเฉินและที่อยู่ปัจจุบัน',
      oldVal: '081-333-2211',
      newVal: '089-777-6655',
      requestedAt: '14 ต.ค. 2567 16:45 น.',
      proofUrl: '',
      status: 'PENDING'
    }
  ]);

  const [lineOARFIModalStudent, setLineOARFIModalStudent] = useState(null);
  const [rfiOptions, setRfiOptions] = useState({
    blurryBankBook: true,
    missingSignature: false,
    missingOfficialStamp: false,
    invalidAmount: false,
    customNote: 'ภาพถ่ายหน้าสมุดบัญชีธนาคารไม่ชัดเจน ไม่สามารถอ่านเลขบัญชี 10 หลักได้ กรุณาถ่ายภาพหน้าสมุดบัญชี SCB ใหม่อีกครั้ง',
    deadlineDate: '2026-10-18'
  });

  const handleApproveProfileChange = (id) => {
    setPendingProfileChanges(prev => prev.filter(c => c.id !== id));
    alert('รับรอง (Verify) การแก้ไขข้อมูลส่วนตัวเรียบร้อย ข้อมูลใหม่ถูกบันทึกและระบบได้แจ้งผลไปยังนิสิตแล้ว');
  };

  const handleSendLineOARFI = (e) => {
    e.preventDefault();
    if (!lineOARFIModalStudent) return;
    
    // Update status in pending list
    setPendingProfileChanges(prev => prev.map(c => c.id === lineOARFIModalStudent.id ? {
      ...c,
      status: 'RFI_SENT'
    } : c));

    alert(`ส่งข้อความแจ้งเตือนขอเอกสารเพิ่มเติมไปยัง Line OA ของนิสิต "${lineOARFIModalStudent.studentName}" เรียบร้อยแล้ว!\n(กำหนดส่งภายใน: ${rfiOptions.deadlineDate})`);
    setLineOARFIModalStudent(null);
  };

  // ==========================================
  // 5. LANDING CMS STATE & MODALS
  // ==========================================
  const [cmsSubTab, setCmsSubTab] = useState('activities'); // activities | news | downloads | banner

  // Activities CMS
  const [cmsActivities, setCmsActivities] = useState([
    {
      id: 'ACT-CAMP',
      title: 'โครงการค่ายอาสาพัฒนาชนบท สร้างศาลาและลานเรียนรู้ชุมชน',
      category: 'ค่ายอาสาพัฒนา',
      date: '20-25 กันยายน 2567',
      location: 'อ.ปัว จ.น่าน',
      image: './assets/camp.jpg',
      points: '+24 ชั่วโมง (15 แต้ม)',
      description: 'นิสิตทุนโครงการจุฬาฯ-ชนบท ร่วมแรงสร้างศาลาอเนกประสงค์ ปรับปรุงสนามเด็กเล่น และจัดกิจกรรมเสริมทักษะทางวิชาการให้แก่น้องๆ ในพื้นที่ห่างไกล'
    },
    {
      id: 'ACT-FLOOD',
      title: 'ภารกิจจิตอาสาบรรเทาอุทกภัย ส่งมอบถุงยังชีพและฟื้นฟูชุมชนน้ำท่วม',
      category: 'บรรเทาสาธารณภัย',
      date: '1-5 ตุลาคม 2567',
      location: 'จ.อุบลราชธานี และ จ.พระนครศรีอยุธยา',
      image: './assets/flood.jpg',
      points: '+16 ชั่วโมง (12 แต้ม)',
      description: 'ทีมนิสิตทุนลงพื้นที่ร่วมกับศูนย์จุฬาฯ-ชนบท แพ็คและลำเลียงถุงยังชีพ น้ำดื่ม และเวชภัณฑ์ทางเรือ เพื่อช่วยเหลือผู้ประสบภัยน้ำท่วมอย่างทันท่วงที'
    },
    {
      id: 'ACT-WORKSHOP',
      title: 'ปฐมนิเทศนิสิตใหม่ & มหกรรมนวัตกรรมโครงงานพัฒนาชุมชนบ้านเกิด',
      category: 'วิชาการและปฐมนิเทศ',
      date: '10 ตุลาคม 2567',
      location: 'อาคารเฉลิมราชกุมารี 60 พรรษา (จามจุรี 10)',
      image: './assets/pr_workshop.jpg',
      points: '+8 ชั่วโมง (10 แต้ม)',
      description: 'การนำเสนอโครงงานนวัตกรรมเพื่อแก้ไขปัญหาในท้องถิ่น พร้อมการแนะแนวการสะสมคะแนนกิจกรรมเพื่อพิจารณาอนุมัติทุน'
    }
  ]);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: '',
    category: 'ค่ายอาสาพัฒนา',
    date: '2026-10-20',
    location: '',
    image: './assets/camp.jpg',
    points: '+16 ชั่วโมง (12 แต้ม)',
    description: ''
  });

  // PR News CMS
  const [cmsNews, setCmsNews] = useState([
    {
      id: 1,
      title: 'ประกาศกำหนดการตัดรอบส่งเอกสารและบันทึกคะแนนกิจกรรม รอบที่ 1/2567',
      date: '12 ต.ค. 2567',
      tag: 'ประกาศสำคัญ',
      isHot: true,
      summary: 'นิสิตต้องส่งมอบเอกสารบันทึกชั่วโมงกิจกรรมและหลักฐานฉบับกระดาษจริงต่อเจ้าหน้าที่ภายในวันที่ 15 ต.ค. 2567 เวลา 23:59 น.'
    },
    {
      id: 2,
      title: 'เปิดรับข้อเสนอโครงงานนวัตกรรมจิตอาสาเพื่อชุมชน ประจำปีการศึกษา 2567',
      date: '8 ต.ค. 2567',
      tag: 'กิจกรรมทุน',
      isHot: false,
      summary: 'สนับสนุนงบประมาณดำเนินโครงการสูงสุด 20,000 บาทต่อกลุ่ม พร้อมบันทึกชั่วโมงกิจกรรมจิตอาสาพิเศษ'
    }
  ]);
  const [editingNews, setEditingNews] = useState(null);
  const [showAddNewsModal, setShowAddNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: '',
    tag: 'ประกาศสำคัญ',
    date: '15 ต.ค. 2567',
    isHot: true,
    summary: ''
  });

  // Downloads CMS
  const [cmsDownloads, setCmsDownloads] = useState([
    {
      id: 'DOC-FORM-01',
      title: 'แบบคำขอรับทุนการศึกษา (Application Form)',
      filename: 'Form_Scholarship_Application_2567.pdf',
      filesize: '340 KB',
      description: 'แบบฟอร์มข้อมูลทั่วไปและคำชี้แจงความจำเป็นทางการเงิน',
      version: 'ปรับปรุง 2567'
    },
    {
      id: 'DOC-FORM-02',
      title: 'หนังสือรับรองรายได้ครอบครัวและผู้นำชุมชน',
      filename: 'Family_Income_Certification_Form.pdf',
      filesize: '280 KB',
      description: 'สำหรับให้ผู้ใหญ่บ้าน กำนัน หรือข้าราชการระดับชำนาญการขึ้นไปลงนามรับรอง',
      version: 'แบบมาตรฐาน'
    },
    {
      id: 'DOC-FORM-03',
      title: 'สมุดบันทึกชั่วโมงกิจกรรมและจิตอาสาสะสม',
      filename: 'Activity_Log_Book_ChulaRural.pdf',
      filesize: '520 KB',
      description: 'แบบบันทึกการเข้าร่วมกิจกรรม 40 แต้ม พร้อมช่องลงนามหัวหน้าโครงการ',
      version: 'เกณฑ์ 40 คะแนน'
    }
  ]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    filename: 'Announcement_2567.pdf',
    filesize: '320 KB',
    description: '',
    version: 'ปรับปรุง 2567'
  });

  // Submit Score from Dual View Modal (เจ้าหน้าที่เป็นผู้กำหนดคะแนนกิจกรรม)
  const handleCertifyScore = () => {
    if (!selectedStudentForDualView) return;
    const addedScore = Number(awardedScoreInput);
    onVerifyDocumentScore(selectedStudentForDualView.student_id, addedScore, physicalPaperChecked);
    
    // Add Audit Log entry
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      performed_by: 'จุฬารัตน์ รุ่งเรือง (เจ้าหน้าที่)',
      user_role: 'OFFICER',
      citizen_id: selectedStudentForDualView.citizen_id,
      student_id: selectedStudentForDualView.student_id || 'รอจัดสรรรหัสนิสิต',
      action_type: 'ASSIGN_ACTIVITY_SCORE',
      field_name: 'accumulatedScore',
      field_label: 'คะแนนกิจกรรมสะสม (เจ้าหน้าที่กำหนด)',
      old_value: `${selectedStudentForDualView.accumulatedScore} แต้ม`,
      new_value: `${selectedStudentForDualView.accumulatedScore + addedScore} แต้ม (+${addedScore} แต้ม)`,
      ip_address: '161.200.5.110',
      status: 'AUTO_LOGGED',
      verified_by: 'จุฬารัตน์ รุ่งเรือง (เจ้าหน้าที่)',
      verified_at: new Date().toLocaleString('sv-SE').replace('T', ' '),
      note: officerReviewNotes || 'เจ้าหน้าที่กำหนดคะแนนกิจกรรมสะสมและตรวจรับรองกระดาษจริง'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setSelectedStudentForDualView(null);
    alert(`บันทึกการกำหนดคะแนนกิจกรรม (+${addedScore} แต้ม) และรับรองเอกสารกระดาษจริงเรียบร้อยแล้ว!\n(ระบบได้บันทึกประวัติการเปลี่ยนแปลงลง Audit Log แล้ว)`);
  };

  return (
    <div className="content-body">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <span>ระบบบริหารจัดการหลังบ้าน (เจ้าหน้าที่ศูนย์จุฬาฯ-ชนบท)</span>
          </div>
          <div className="page-subtitle">
            คัดกรองเอกสาร • บันทึกคะแนนกิจกรรม • ตัดรอบ Cut-off • ส่งต่อผู้อนุมัติ • จัดการ Content หน้าแรก (CMS)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            className="btn btn-bulk-approve btn-sm"
            onClick={onBulkSubmitToFaculty}
          >
            <Send size={14} /> ปุ่มส่งต่อผู้อนุมัติ (Bulk Submit to Approver)
          </button>
        </div>
      </div>

      {/* Synchronized Navigation Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'officer-daily', label: 'งานที่ต้องทำวันนี้', icon: Clock, badge: DAILY_TASKS_OFFICER.length },
          { id: 'officer-screening', label: 'คัดกรองเอกสาร & Dual-View', icon: FileText },
          { id: 'officer-cutoff', label: 'เปิด-ปิดรับสมัคร (Cut-off)', icon: Power },
          { id: 'officer-notifications', label: 'ส่งแจ้งเตือน Email', icon: Bell },
          { id: 'officer-profile-verify', label: 'ตรวจสอบการแก้ Profile', icon: ShieldCheck, badge: pendingProfileChanges.length },
          { id: 'officer-cms', label: 'จัดการหน้าแรก (CMS)', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id || (tab.id === 'officer-cutoff' && currentTab === 'officer-calendar');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid #E01A59' : '3px solid transparent',
                color: isActive ? '#E01A59' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && <span className="nav-badge" style={{ background: '#E01A59', color: 'white' }}>{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: งานที่ต้องทำในวันนี้ (Daily To-Do) */}
      {/* ========================================================================= */}
      {currentTab === 'officer-daily' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="#E01A59" />
                <span>งานที่ต้องทำในวันนี้ (Daily Tasks)</span>
              </div>
              <span className="badge badge-received">อัปเดตแบบอัตโนมัติ</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {DAILY_TASKS_OFFICER.map(task => (
                <div key={task.id} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: task.urgent ? '#FEF2F2' : '#FFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: task.urgent ? '#991B1B' : '#1E293B' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      หมวดหมู่งาน: {task.category} • ปริมาณ: <strong>{task.count} รายการ</strong>
                    </div>
                  </div>
                  <div>
                    {task.category === 'เอกสาร' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setTab('officer-screening')}>
                        ดำเนินการ ➔
                      </button>
                    )}
                    {task.category === 'Profile Verify' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setTab('officer-profile-verify')}>
                        Verify ➔
                      </button>
                    )}
                    {task.category === 'ส่งต่อ' && (
                      <button type="button" className="btn btn-bulk-approve btn-sm" onClick={onBulkSubmitToFaculty}>
                        ส่งต่อ ➔
                      </button>
                    )}
                    {task.category === 'Email' && (
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setTab('officer-notifications')}>
                        ส่งประกาศ Email ➔
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={18} color="#E01A59" />
                <span>สถานะรอบการพิจารณาปัจจุบัน (รอบที่ 1/2567)</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>กำหนดวันตัดรอบเอกสาร (Cut-off):</span>
                <strong style={{ color: '#EF4444' }}>15 ตุลาคม 2567 (23:59 น.)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>กำหนดส่งต่อคณะกรรมการอาจารย์:</span>
                <strong>22 ตุลาคม 2567</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>กำหนดส่งยอดเบิกจ่ายการคลัง:</span>
                <strong>25 ตุลาคม 2567</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>คาดการณ์เงินโอนเข้าบัญชีนิสิต:</span>
                <strong style={{ color: '#10B981' }}>30 ตุลาคม 2567</strong>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%' }}
                onClick={() => setTab('officer-cutoff')}
              >
                ⚙️ สลับสถานะเปิด-ปิดรับสมัคร (Cut-off Switch)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ตารางคัดกรองเอกสาร & Dual-View */}
      {/* ========================================================================= */}
      {currentTab === 'officer-screening' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileText size={18} color="#E01A59" />
                <span>ตารางคัดกรองเอกสาร เรียงลำดับตามวันที่ส่ง (Screening Queue)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                คลิก "ตรวจภาพสแกน & บันทึกคะแนน" เพื่อเปิดหน้าต่าง Dual-View เทียบกับกระดาษจริง
              </div>
            </div>

            <button 
              type="button"
              className="btn btn-bulk-approve btn-sm"
              onClick={onBulkSubmitToFaculty}
            >
              <Send size={14} /> ปุ่มส่งต่อผู้อนุมัติ (Bulk Submit)
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>วันที่ส่งคำขอ</th>
                  <th>รหัสนิสิต</th>
                  <th>ชื่อ - นามสกุล (ชื่อเล่น)</th>
                  <th>คณะ / ชั้นปี</th>
                  <th>ผลการเรียน & ลงทะเบียน</th>
                  <th>ที่อยู่ปัจจุบัน</th>
                  <th>เอกสารหลักฐาน</th>
                  <th>กระดาษจริง</th>
                  <th>การตรวจสอบ & อนุมัติเอกสาร</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const studentDocs = s.documents || [];
                  const approvedCount = studentDocs.filter(d => d.status === 'APPROVED').length;
                  const rejectedCount = studentDocs.filter(d => d.status === 'REJECTED').length;
                  const totalCount = studentDocs.length || 9;

                  return (
                    <tr key={s.citizen_id}>
                      <td style={{ fontSize: '12px' }}>15 ต.ค. 2567</td>
                      <td style={{ fontWeight: 700 }}>
                        {s.student_id ? (
                          <span>{s.student_id}</span>
                        ) : (
                          <div>
                            <span style={{ color: '#D97706', fontSize: '11px', fontWeight: 700 }}>รอจัดสรร</span>
                            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 'normal' }}>ปชช: {s.citizen_id}</div>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>
                          {s.title} {s.first_name} {s.last_name}
                        </div>
                        {s.nickname && (
                          <div style={{ fontSize: '11px', color: '#BE185D' }}>
                            (ชื่อเล่น: {s.nickname})
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{s.faculty_name}</div>
                        <span className="badge badge-received" style={{ fontSize: '10px' }}>ปี {s.year_level || 2}</span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <div>GPAX: <strong style={{ color: '#059669' }}>{Number(s.gpax || 0).toFixed(2)}</strong></div>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>{s.registered_courses_count || 6} วิชา ({s.registered_credits_count || 19} หน่วยกิต)</div>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {s.accommodation_type === 'หอนอก' ? (
                          <span className="badge badge-review" style={{ fontSize: '11px' }}>🏠 หอนอก</span>
                        ) : (
                          <span className="badge badge-chula" style={{ fontSize: '11px' }}>🏢 หอใน ({s.dorm_room_bed || 'จำปา/404/D'})</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 700, color: approvedCount === totalCount ? '#10B981' : '#F59E0B' }}>
                            {approvedCount} / {totalCount} ผ่าน
                          </span>
                          {rejectedCount > 0 && (
                            <span style={{ fontSize: '10px', color: '#DC2626', display: 'block', fontWeight: 600 }}>
                              ⚠️ แก้ {rejectedCount} ชิ้น
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${s.paperStatus === 'ส่งแล้ว' ? 'badge-approved' : 'badge-review'}`}>
                          {s.paperStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenDocApprovalModal(s)}
                            style={{ fontWeight: 600 }}
                          >
                            <ShieldCheck size={14} /> ตรวจเอกสาร
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedStudentForDualView(s)}
                          >
                            <Eye size={12} /> สแกนกิจกรรม (Dual-View)
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            style={{ background: '#FFF1F5', color: '#9F0837', borderColor: '#FCE7F0' }}
                            onClick={() => setSelectedStudentForProfileModal(s)}
                          >
                            <Users size={12} /> ดูประวัตินิสิตฉบับเต็ม
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: เปิด-ปิดรับสมัครทุนการศึกษา (CUT-OFF ON/OFF SWITCH) */}
      {/* ========================================================================= */}
      {(currentTab === 'officer-cutoff' || currentTab === 'officer-calendar') && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Power size={20} color="#E01A59" />
                <span>ควบคุมสถานะเปิด-ปิดรับสมัครทุนการศึกษา (Cut-off Application Toggle)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                สวิตช์สำหรับเจ้าหน้าที่ในการเปิดรับสมัคร หรือปิดรับสมัครคำขอรับทุนการศึกษา (ตัดรอบส่งเอกสารและกิจกรรม)
              </div>
            </div>
            <span className={`badge ${isApplicationOpen ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
              {isApplicationOpen ? '🟢 กำลังเปิดรับสมัคร' : '🔴 ปิดรับสมัครแล้ว (Cut-off)'}
            </span>
          </div>

          <div style={{
            padding: '28px',
            background: isApplicationOpen ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isApplicationOpen ? '#BBF7D0' : '#FECDD3'}`,
            borderRadius: '16px',
            margin: '18px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: isApplicationOpen ? '#166534' : '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                สถานะระบบการรับสมัครปัจจุบัน
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: isApplicationOpen ? '#14532D' : '#7F1D1D', marginTop: '4px' }}>
                {isApplicationOpen ? 'เปิดรับสมัครคำขอรับทุนการศึกษา (Application Open)' : 'ปิดรับสมัครคำขอรับทุนการศึกษา (Application Closed / Cut-off)'}
              </h3>
              <p style={{ fontSize: '13px', color: isApplicationOpen ? '#15803D' : '#B91C1C', marginTop: '8px', lineHeight: 1.6 }}>
                {isApplicationOpen 
                  ? 'นิสิตและผู้สมัครใหม่ทุกคนสามารถยื่นแบบคำขอ อัปโหลดเอกสาร 7 แบบ และส่งบันทึกกิจกรรมสะสมแต้มได้ตามปกติ'
                  : 'ระบบได้ปิดรับคำขอใหม่และระงับการอัปโหลดเอกสารชั่วคราว เจ้าหน้าที่กำลังอยู่ระหว่างคัดกรองและประเมินผล'}
              </p>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#475569', background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', width: 'fit-content', flexWrap: 'wrap' }}>
                <div>⏱️ สลับสถานะล่าสุด: <strong>{cutoffToggleLog.lastToggledAt}</strong></div>
                <div>👤 ดำเนินการโดย: <strong>{cutoffToggleLog.toggledBy}</strong></div>
              </div>
            </div>

            {/* Big Interactive ON / OFF Slide Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#FFFFFF', padding: '20px 24px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                สวิตช์เปิด-ปิดรับสมัคร (ON / OFF)
              </div>
              <button
                type="button"
                onClick={handleToggleApplicationStatus}
                style={{
                  width: '140px',
                  height: '58px',
                  borderRadius: '35px',
                  background: isApplicationOpen ? '#10B981' : '#EF4444',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '5px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  transition: 'background-color 0.25s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {/* Thumb */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                  transform: isApplicationOpen ? 'translateX(82px)' : 'translateX(0px)',
                  transition: 'transform 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px',
                  color: isApplicationOpen ? '#059669' : '#DC2626'
                }}>
                  {isApplicationOpen ? 'ON' : 'OFF'}
                </div>
                
                {/* Text inside track */}
                <span style={{
                  position: 'absolute',
                  left: isApplicationOpen ? '18px' : 'auto',
                  right: isApplicationOpen ? 'auto' : '18px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  {isApplicationOpen ? 'เปิด' : 'ปิด'}
                </span>
              </button>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                คลิกเพื่อ {isApplicationOpen ? 'ปิดรับสมัคร (Cut-off)' : 'เปิดรับสมัคร'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ส่งเตือน EMAIL (ตัดแยก Custom Group ออกมาตามสั่ง) */}
      {/* ========================================================================= */}
      {currentTab === 'officer-notifications' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Bell size={18} color="#E01A59" />
                <span>ศูนย์ส่งแจ้งเตือนผ่าน Email (Granular Group Targeting)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                เลือกกลุ่มเป้าหมายผู้รับประกาศอย่างละเอียด (แยกการกำหนดชั้นปี รุ่น คณะ ใน Custom Group)
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            <form onSubmit={handleSendNotification}>
              {/* Target Type Selector */}
              <div className="form-group">
                <label className="form-label">เลือกกลุ่มเป้าหมายผู้รับประกาศ</label>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="radio" 
                      name="targetType" 
                      value="ALL" 
                      checked={targetType === 'ALL'} 
                      onChange={() => setTargetType('ALL')}
                    />
                    <span>📢 ทุกคนในโครงการ (นิสิตทุกคน 125 ราย)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#E01A59' }}>
                    <input 
                      type="radio" 
                      name="targetType" 
                      value="CUSTOM" 
                      checked={targetType === 'CUSTOM'} 
                      onChange={() => setTargetType('CUSTOM')}
                    />
                    <span>🎯 กำหนดกลุ่มเป้าหมายเอง (Custom Group)</span>
                  </label>
                </div>
              </div>

              {/* Custom Group Granular Selectors Box */}
              {targetType === 'CUSTOM' && (
                <div style={{ background: '#FFF5F8', border: '1px solid #FCE7F0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#9F0837', marginBottom: '12px' }}>
                    กำหนดเงื่อนไขกลุ่มเป้าหมายเฉพาะ (Custom Group Filters):
                  </div>

                  {/* 1. ชั้นปี */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>ชั้นปี:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['ปี 1', 'ปี 2', 'ปี 3', 'ปี 4', 'เกินปี 4'].map(yr => (
                        <label key={yr} style={{ fontSize: '12px', background: '#FFF', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="checkbox" 
                            checked={customFilters.years.includes(yr)} 
                            onChange={() => handleToggleFilter('years', yr)} 
                          />
                          <span>{yr}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 2. รุ่นที่รับเข้า */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>รุ่น / ปีที่รับเข้า:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['รุ่น 41 (2566)', 'รุ่น 40 (2565)', 'รุ่น 39 (2564)', 'รุ่น 42 (2567)'].map(ch => (
                        <label key={ch} style={{ fontSize: '12px', background: '#FFF', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="checkbox" 
                            checked={customFilters.cohorts.includes(ch)} 
                            onChange={() => handleToggleFilter('cohorts', ch)} 
                          />
                          <span>{ch}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3. คณะ */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>คณะ:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['คณะวิทยาศาสตร์', 'คณะวิศวกรรมศาสตร์', 'คณะอักษรศาสตร์', 'คณะครุศาสตร์', 'คณะพาณิชยศาสตร์และการบัญชี', 'คณะรัฐศาสตร์'].map(fac => (
                        <label key={fac} style={{ fontSize: '12px', background: '#FFF', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="checkbox" 
                            checked={customFilters.faculties.includes(fac)} 
                            onChange={() => handleToggleFilter('faculties', fac)} 
                          />
                          <span>{fac}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 4. ประเภททุน & เงื่อนไขพิเศษ */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>ประเภททุน:</div>
                      <select 
                        className="form-control"
                        style={{ fontSize: '12px', padding: '6px' }}
                        value={customFilters.scholarshipTypes[0] || 'ทุกประเภททุน'}
                        onChange={(e) => setCustomFilters({ ...customFilters, scholarshipTypes: [e.target.value] })}
                      >
                        <option value="ทุกประเภททุน">ทุกประเภททุน</option>
                        <option value="เงินรายเดือน">ทุนค่าใช้จ่ายรายเดือน</option>
                        <option value="ค่าอุปกรณ์และเครื่องแต่งกาย">ทุนค่าอุปกรณ์และเครื่องแต่งกาย</option>
                        <option value="ค่าลงทะเบียนการศึกษา">ทุนค่าธรรมเนียมการศึกษา</option>
                        <option value="ค่าที่พัก">ทุนค่าที่พัก</option>
                      </select>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>เงื่อนไขคัดกรอง:</div>
                      <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginTop: '6px' }}>
                        <input 
                          type="checkbox" 
                          checked={customFilters.pendingDocsOnly}
                          onChange={(e) => setCustomFilters({ ...customFilters, pendingDocsOnly: e.target.checked })}
                        />
                        <span>เฉพาะผู้ที่ยังส่งเอกสารไม่ครบ</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#E01A59', fontWeight: 600 }}>
                    🎯 จำนวนนิสิตในกลุ่มเป้าหมาย Custom Group นี้: ~34 รายชื่อ
                  </div>
                </div>
              )}

              {/* Notification Channel */}
              <div className="form-group">
                <label className="form-label">ช่องทางการแจ้งเตือน</label>
                <select 
                  className="form-control"
                  value={notificationChannel}
                  onChange={(e) => setNotificationChannel(e.target.value)}
                >
                  <option value="EMAIL">Email ทางการ (@chula.ac.th หรืออีเมลผู้สมัคร)</option>
                  <option value="IN_APP">In-App Notification ในระบบ</option>
                  <option value="ALL">ส่งทั้ง Email และ In-App Notification</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">หัวข้อประกาศ / แจ้งเตือน</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">เนื้อหาข้อความ</label>
                <textarea 
                  rows={3} 
                  className="form-control"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={15} /> ส่งข้อความแจ้งเตือนทันที
              </button>
            </form>

            {/* Broadcast History */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>ประวัติการส่งประกาศล่าสุด:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {broadcastLog.map(item => (
                  <div key={item.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-chula" style={{ fontSize: '11px' }}>{item.channel}</span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{item.date}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '6px' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      กลุ่มเป้าหมาย: <strong>{item.target}</strong> ({item.recipients} รายชื่อ)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ตรวจคำร้องแก้ PROFILE (พร้อมฟอร์มขอข้อมูลเพิ่มส่ง Email) */}
      {/* ========================================================================= */}
      {currentTab === 'officer-profile-verify' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ShieldCheck size={18} color="#E01A59" />
                <span>คิวตรวจสอบคำร้องแก้ไขข้อมูลส่วนตัว / บัญชีธนาคาร (Profile Verification Queue)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                หากข้อมูลไม่ชัดเจน กด "ขอข้อมูลเพิ่ม" เพื่อเปิดฟอร์มและส่งแจ้งเตือนตรงไปยัง Email ของนิสิต
              </div>
            </div>
            <span className="badge badge-review">รอตรวจสอบ {pendingProfileChanges.length} รายการ</span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>รหัสนิสิต</th>
                  <th>ชื่อนิสิต</th>
                  <th>คณะ</th>
                  <th>ฟิลด์ข้อมูลที่ขอแก้ไข</th>
                  <th>ข้อมูลเดิม</th>
                  <th>ข้อมูลใหม่ที่ขอเปลี่ยน</th>
                  <th>วันเวลาที่ส่ง</th>
                  <th>หลักฐานแนบ</th>
                  <th>การอนุมัติ</th>
                </tr>
              </thead>
              <tbody>
                {pendingProfileChanges.map(change => (
                  <tr key={change.id}>
                    <td style={{ fontWeight: 700 }}>{change.studentCode}</td>
                    <td style={{ fontWeight: 600 }}>{change.studentName}</td>
                    <td>{change.faculty}</td>
                    <td style={{ color: '#E01A59', fontWeight: 600 }}>{change.field}</td>
                    <td style={{ color: '#EF4444' }}>{change.oldVal}</td>
                    <td style={{ color: '#10B981', fontWeight: 700 }}>{change.newVal}</td>
                    <td style={{ fontSize: '12px' }}>{change.requestedAt}</td>
                    <td>
                      {change.proofUrl ? (
                        <a href={change.proofUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'underline' }}>
                          ดูภาพสมุดบัญชี
                        </a>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>ไม่มีไฟล์</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          type="button" 
                          className="btn btn-success btn-sm"
                          onClick={() => handleApproveProfileChange(change.id)}
                        >
                          รับรอง (Verify)
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setLineOARFIModalStudent(change)}
                          style={{ borderColor: '#E01A59', color: '#E01A59' }}
                        >
                          <MessageSquare size={13} /> ขอข้อมูลเพิ่ม (Email)
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: หลังบ้านจัดการ CONTENT หน้าแรก (CMS แบบสมบูรณ์ครบครัน) */}
      {/* ========================================================================= */}
      {currentTab === 'officer-cms' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Globe size={18} color="#E01A59" />
                <span>หลังบ้านจัดการ Content หน้าแรกสาธารณะ (Landing Page CMS)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                จัดการข่าวกิจกรรมนิสิต (ค่าย/น้ำท่วม), ข่าวประชาสัมพันธ์, และเอกสารเผยแพร่ที่แสดงหน้าแรก
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={() => alert('บันทึกการแก้ไข CMS ทั้งหมดและอัปเดตหน้าแรกสาธารณะเรียบร้อยแล้ว!')}
            >
              เผยแพร่หน้าแรกทันที
            </button>
          </div>

          {/* CMS Sub Navigation */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '16px' }}>
            <button
              type="button"
              className={`btn btn-sm ${cmsSubTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCmsSubTab('activities')}
            >
              <Image size={14} /> ข่าวกิจกรรมนิสิต ({cmsActivities.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${cmsSubTab === 'news' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCmsSubTab('news')}
            >
              <Bell size={14} /> ข่าวประชาสัมพันธ์ ({cmsNews.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${cmsSubTab === 'downloads' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCmsSubTab('downloads')}
            >
              <Download size={14} /> เอกสารเผยแพร่ ({cmsDownloads.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${cmsSubTab === 'banner' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCmsSubTab('banner')}
            >
              <Tag size={14} /> แบนเนอร์ & ประกาศตัววิ่ง
            </button>
          </div>

          {/* CMS SUB-SECTION 1: ACTIVITIES */}
          {cmsSubTab === 'activities' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>รายการภาพกิจกรรมนิสิตที่แสดงในหน้าแรก</span>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddActivityModal(true)}
                >
                  <Plus size={14} /> เพิ่มข่าวกิจกรรมใหม่
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cmsActivities.map(act => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={act.image} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>{act.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          หมวด: <span className="badge badge-chula" style={{ fontSize: '10px' }}>{act.category}</span> • วันที่: {act.date} • {act.points}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingActivity({ ...act })}
                      >
                        <Edit size={12} /> แก้ไข
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`ต้องการลบกิจกรรม "${act.title}" ใช่หรือไม่?`)) {
                            setCmsActivities(cmsActivities.filter(a => a.id !== act.id));
                          }
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CMS SUB-SECTION 2: NEWS */}
          {cmsSubTab === 'news' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>รายการข่าวประชาสัมพันธ์ที่แสดงในหน้าแรก</span>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setNewsForm({
                      title: '',
                      tag: 'ประกาศสำคัญ',
                      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
                      isHot: true,
                      summary: ''
                    });
                    setShowAddNewsModal(true);
                  }}
                >
                  <Plus size={14} /> เพิ่มข่าวประชาสัมพันธ์
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cmsNews.map(n => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${n.isHot ? 'badge-rejected' : 'badge-received'}`}>{n.tag}</span>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>{n.title}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                        วันที่ประกาศ: {n.date} • {n.summary}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingNews({ ...n })}
                      >
                        <Edit size={12} /> แก้ไข
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`ต้องการลบข่าวนี้ใช่หรือไม่?`)) {
                            setCmsNews(cmsNews.filter(item => item.id !== n.id));
                          }
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CMS SUB-SECTION 3: DOWNLOADS / PUBLISHED DOCUMENTS */}
          {cmsSubTab === 'downloads' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>จัดการไฟล์เอกสารเผยแพร่สำหรับนิสิตและบุคคลทั่วไป</span>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddDocModal(true)}
                >
                  <Plus size={14} /> เพิ่มเอกสารเผยแพร่
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cmsDownloads.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={20} color="#E01A59" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{d.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          ไฟล์: {d.filename} ({d.filesize}) • {d.version}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm" 
                        onClick={() => {
                          if (confirm(`ต้องการลบเอกสารเผยแพร่ "${d.title}" ใช่หรือไม่?`)) {
                            setCmsDownloads(cmsDownloads.filter(item => item.id !== d.id));
                          }
                        }}
                      >
                        <Trash2 size={12} /> ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CMS SUB-SECTION 4: BANNER & ANNOUNCEMENTS */}
          {cmsSubTab === 'banner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">แถบประกาศตัววิ่ง / ข่าวด่วนบนหัวเว็บ</label>
                <input 
                  type="text" 
                  className="form-control" 
                  defaultValue="🔔 ประกาศเปิดรับสมัครและบันทึกคะแนนกิจกรรม ภาคเรียนที่ 1/2567 ตัดรอบส่งเอกสารวันที่ 15 ต.ค. 2567" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">คำชี้แจงคุณสมบัติผู้ขอทุน (แสดงที่หน้าแรก)</label>
                <textarea 
                  rows={4} 
                  className="form-control"
                  defaultValue="1. เป็นนิสิตโครงการจุฬาฯ-ชนบท ทุกคณะ ทุกชั้นปี
2. มีคะแนนจิตอาสาและกิจกรรมสะสมไม่น้อยกว่าเกณฑ์ที่กำหนด (40 คะแนน)
3. มีผลการเรียนเฉลี่ยสะสม (GPAX) ตามเกณฑ์ของแต่ละประเภททุน
4. จัดส่งเอกสารสำคัญครบถ้วนทั้ง 7 ฉบับ"
                />
              </div>

              <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => alert('บันทึกข้อความแบนเนอร์เรียบร้อยแล้ว')}>
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT SCHEME (GPAX, Quota, Budget, Status) */}
      {/* ========================================================================= */}
      {editingScheme && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#E01A59" />
                <span>แก้ไขรายละเอียดและเกณฑ์ทุนการศึกษา</span>
              </div>
              <button type="button" onClick={() => setEditingScheme(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSchemeEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อประเภททุน</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={editingScheme.name}
                    onChange={(e) => setEditingScheme({ ...editingScheme, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่ทุน</label>
                    <select 
                      className="form-control"
                      value={editingScheme.category}
                      onChange={(e) => setEditingScheme({ ...editingScheme, category: e.target.value })}
                    >
                      <option value="เงินรายเดือน">เงินรายเดือน</option>
                      <option value="ค่าอุปกรณ์และเครื่องแต่งกาย">ค่าอุปกรณ์และเครื่องแต่งกาย</option>
                      <option value="ค่าลงทะเบียนการศึกษา">ค่าลงทะเบียนการศึกษา</option>
                      <option value="ค่าที่พัก">ค่าที่พัก</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">จำนวนเงินต่อคน (บาท)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editingScheme.amount}
                      onChange={(e) => setEditingScheme({ ...editingScheme, amount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">เกณฑ์ GPAX ขั้นต่ำ</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="1.50" 
                      max="4.00" 
                      className="form-control"
                      value={editingScheme.minGpax}
                      onChange={(e) => setEditingScheme({ ...editingScheme, minGpax: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เกณฑ์คะแนนกิจกรรมขั้นต่ำ (แต้ม)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editingScheme.minScore}
                      onChange={(e) => setEditingScheme({ ...editingScheme, minScore: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">โควตาจำนวนคน (คน)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editingScheme.totalQuota}
                      onChange={(e) => setEditingScheme({ ...editingScheme, totalQuota: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">งบประมาณจัดสรรรวม (บาท)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={editingScheme.budgetAllocated}
                      onChange={(e) => setEditingScheme({ ...editingScheme, budgetAllocated: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">สถานะทุน</label>
                  <select 
                    className="form-control"
                    value={editingScheme.status}
                    onChange={(e) => setEditingScheme({ ...editingScheme, status: e.target.value })}
                  >
                    <option value="เปิดรับคำขอ">เปิดรับคำขอ (Active)</option>
                    <option value="ปิดรับชั่วคราว">ปิดรับชั่วคราว (Paused)</option>
                    <option value="สิ้นสุดรอบพิจารณา">สิ้นสุดรอบพิจารณา (Closed)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingScheme(null)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT CALENDAR ROUND WITH DATE PICKER */}
      {/* ========================================================================= */}
      {editingRound && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#E01A59" />
                <span>แก้ไขกำหนดเวลา & วันตัดรอบ (Cut-off Date Selector)</span>
              </div>
              <button type="button" onClick={() => setEditingRound(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRoundEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อรอบ / รายการกิจกรรม</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={editingRound.title}
                    onChange={(e) => setEditingRound({ ...editingRound, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">วันที่เริ่มต้น</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={editingRound.startDate}
                      onChange={(e) => setEditingRound({ ...editingRound, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">วันตัดรอบ / วันสิ้นสุด (Cut-off Date)</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      required
                      value={editingRound.cutOffDate}
                      onChange={(e) => setEditingRound({ ...editingRound, cutOffDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">เวลาตัดรอบระบบ (Time)</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    value={editingRound.cutOffTime}
                    onChange={(e) => setEditingRound({ ...editingRound, cutOffTime: e.target.value })}
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    เมื่อถึงเวลานี้ ระบบจะปิดรับการอัปโหลดเอกสารของนิสิตโดยอัตโนมัติ
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={editingRound.isCutoff}
                      onChange={(e) => setEditingRound({ ...editingRound, isCutoff: e.target.checked })}
                    />
                    <span style={{ fontWeight: 600, color: '#991B1B' }}>กำหนดให้เป็นวันตัดรอบรับเอกสาร (Cut-off Round)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRound(null)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกกำหนดเวลา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EMAIL REQUEST FOR INFORMATION (RFI) FORM */}
      {/* ========================================================================= */}
      {lineOARFIModalStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <MessageSquare color="#E01A59" size={20} />
                <span>ขอข้อมูลและเอกสารเพิ่มเติมผ่าน Email (Request For Information)</span>
              </div>
              <button type="button" onClick={() => setLineOARFIModalStudent(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSendLineOARFI}>
              <div className="modal-body">
                <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '14px', fontSize: '13px' }}>
                  <div>นิสิตผู้รับแจ้งเตือน: <strong>{lineOARFIModalStudent.studentName} ({lineOARFIModalStudent.studentCode})</strong></div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    คณะ{lineOARFIModalStudent.faculty} • รายการที่ขอแก้ไข: <span style={{ color: '#E01A59', fontWeight: 600 }}>{lineOARFIModalStudent.field}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">เลือกประเด็นที่ต้องการให้นิสิตส่งข้อมูลเพิ่ม</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={rfiOptions.blurryBankBook}
                        onChange={(e) => setRfiOptions({ ...rfiOptions, blurryBankBook: e.target.checked })}
                      />
                      <span>ภาพถ่ายหน้าสมุดบัญชีธนาคารไม่ชัดเจน / มองไม่เห็นเลขบัญชี 10 หลัก</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={rfiOptions.missingSignature}
                        onChange={(e) => setRfiOptions({ ...rfiOptions, missingSignature: e.target.checked })}
                      />
                      <span>เอกสารหนังสือรับรองรายได้ไม่มีลายมือชื่อผู้นำชุมชน/เจ้าหน้าที่รัฐรับรอง</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={rfiOptions.missingOfficialStamp}
                        onChange={(e) => setRfiOptions({ ...rfiOptions, missingOfficialStamp: e.target.checked })}
                      />
                      <span>ขาดเอกสารฉบับกระดาษจริง หรือยังไม่มีตราประทับโครงการค่าย</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">กำหนดเวลาส่งเอกสารเพิ่มเติม (Deadline)</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={rfiOptions.deadlineDate}
                    onChange={(e) => setRfiOptions({ ...rfiOptions, deadlineDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ข้อความที่จะแจ้งเตือนตรงเข้า Email ของนิสิต</label>
                  <textarea 
                    rows={3} 
                    className="form-control"
                    value={rfiOptions.customNote}
                    onChange={(e) => setRfiOptions({ ...rfiOptions, customNote: e.target.value })}
                  />
                  <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                    ✓ ข้อความนี้จะถูกส่งเป็น Notification Mail ไปยังอีเมลของนิสิตทันทีเมื่อกดยืนยัน
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setLineOARFIModalStudent(null)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={15} /> ส่งแจ้งเตือนผ่าน Email ทันที
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD CMS ACTIVITY MODAL */}
      {/* ========================================================================= */}
      {showAddActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px' }}>เพิ่มข่าวกิจกรรมนิสิต (หน้าแรก)</div>
              <button type="button" onClick={() => setShowAddActivityModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const newAct = {
                id: `ACT-${Date.now()}`,
                ...activityForm
              };
              setCmsActivities([newAct, ...cmsActivities]);
              setShowAddActivityModal(false);
              alert('เพิ่มข่าวกิจกรรมใหม่สู่หน้าแรกเรียบร้อยแล้ว!');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อกิจกรรม</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="เช่น โครงการสอนน้องชนบทเสริมทักษะดิจิทัล"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่กิจกรรม</label>
                    <select 
                      className="form-control"
                      value={activityForm.category}
                      onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                    >
                      <option value="ค่ายอาสาพัฒนา">ค่ายอาสาพัฒนา</option>
                      <option value="บรรเทาสาธารณภัย">บรรเทาสาธารณภัย</option>
                      <option value="วิชาการและปฐมนิเทศ">วิชาการและปฐมนิเทศ</option>
                      <option value="งานศูนย์จุฬาฯ-ชนบท">งานศูนย์จุฬาฯ-ชนบท</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ชั่วโมง / แต้มที่ได้รับ</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="เช่น +16 ชั่วโมง (12 แต้ม)"
                      value={activityForm.points}
                      onChange={(e) => setActivityForm({ ...activityForm, points: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">วันที่จัดกิจกรรม</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="เช่น 15-18 ตุลาคม 2567"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">สถานที่จัดกิจกรรม</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="เช่น อ.แม่แจ่ม จ.เชียงใหม่"
                      value={activityForm.location}
                      onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">เลือกภาพกิจกรรม</label>
                  <select 
                    className="form-control"
                    value={activityForm.image}
                    onChange={(e) => setActivityForm({ ...activityForm, image: e.target.value })}
                  >
                    <option value="./assets/camp.jpg">ภาพค่ายอาสาพัฒนาชนบท (ศาลาและลานเรียนรู้)</option>
                    <option value="./assets/flood.jpg">ภาพจิตอาสาช่วยเหลือผู้ประสบภัยน้ำท่วม</option>
                    <option value="./assets/pr_workshop.jpg">ภาพปฐมนิเทศและนวัตกรรมชุมชน</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">รายละเอียดกิจกรรม</label>
                  <textarea 
                    rows={3} 
                    className="form-control"
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddActivityModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกกิจกรรม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4B: EDIT CMS ACTIVITY MODAL */}
      {/* ========================================================================= */}
      {editingActivity && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#E01A59" />
                <span>แก้ไขข่าวกิจกรรมนิสิต (หน้าแรก)</span>
              </div>
              <button type="button" onClick={() => setEditingActivity(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCmsActivities(cmsActivities.map(a => a.id === editingActivity.id ? editingActivity : a));
              setEditingActivity(null);
              alert('บันทึกการแก้ไขข่าวกิจกรรมเรียบร้อยแล้ว!');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อกิจกรรม</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editingActivity.title}
                    onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่กิจกรรม</label>
                    <select 
                      className="form-control"
                      value={editingActivity.category}
                      onChange={(e) => setEditingActivity({ ...editingActivity, category: e.target.value })}
                    >
                      <option value="ค่ายอาสาพัฒนา">ค่ายอาสาพัฒนา</option>
                      <option value="บรรเทาสาธารณภัย">บรรเทาสาธารณภัย</option>
                      <option value="วิชาการและปฐมนิเทศ">วิชาการและปฐมนิเทศ</option>
                      <option value="งานศูนย์จุฬาฯ-ชนบท">งานศูนย์จุฬาฯ-ชนบท</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">ชั่วโมง / แต้มที่ได้รับ</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingActivity.points}
                      onChange={(e) => setEditingActivity({ ...editingActivity, points: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">วันที่จัดกิจกรรม</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingActivity.date}
                      onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">สถานที่จัดกิจกรรม</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingActivity.location}
                      onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">เลือกภาพกิจกรรม</label>
                  <select 
                    className="form-control"
                    value={editingActivity.image}
                    onChange={(e) => setEditingActivity({ ...editingActivity, image: e.target.value })}
                  >
                    <option value="./assets/camp.jpg">ภาพค่ายอาสาพัฒนาชนบท (ศาลาและลานเรียนรู้)</option>
                    <option value="./assets/flood.jpg">ภาพจิตอาสาช่วยเหลือผู้ประสบภัยน้ำท่วม</option>
                    <option value="./assets/pr_workshop.jpg">ภาพปฐมนิเทศและนวัตกรรมชุมชน</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">รายละเอียดกิจกรรม</label>
                  <textarea 
                    rows={3} 
                    className="form-control"
                    value={editingActivity.description || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingActivity(null)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4C: ADD CMS PR NEWS MODAL */}
      {/* ========================================================================= */}
      {showAddNewsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#E01A59" />
                <span>เพิ่มข่าวประชาสัมพันธ์ใหม่ (หน้าแรก)</span>
              </div>
              <button type="button" onClick={() => setShowAddNewsModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const newNewsItem = {
                id: Date.now(),
                ...newsForm
              };
              setCmsNews([newNewsItem, ...cmsNews]);
              setShowAddNewsModal(false);
              alert('เพิ่มข่าวประชาสัมพันธ์ใหม่เรียบร้อยแล้ว!');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">หัวข้อข่าวประชาสัมพันธ์</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="เช่น ประกาศรายชื่อผู้มีสิทธิ์เข้ารับการสัมภาษณ์ทุนการศึกษา"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่ / ป้ายกำกับ</label>
                    <select 
                      className="form-control"
                      value={newsForm.tag}
                      onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                    >
                      <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                      <option value="กิจกรรมทุน">กิจกรรมทุน</option>
                      <option value="กำหนดการ">กำหนดการ</option>
                      <option value="ผลการพิจารณา">ผลการพิจารณา</option>
                      <option value="ข่าวด่วน">ข่าวด่วน</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">วันที่ประกาศ</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newsForm.date}
                      onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">รายละเอียดสรุปย่อ</label>
                  <textarea 
                    rows={3} 
                    className="form-control"
                    required
                    placeholder="ระบุเนื้อหาข่าวประชาสัมพันธ์ หรือข้อมูลสำคัญให้นิสิตทราบ"
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={newsForm.isHot}
                      onChange={(e) => setNewsForm({ ...newsForm, isHot: e.target.checked })}
                    />
                    <span style={{ fontWeight: 600, color: '#E01A59' }}>🔥 ตั้งเป็นข่าวด่วน / ข่าวเด่น (แสดงป้าย Hot)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddNewsModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  เพิ่มข่าวประชาสัมพันธ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4D: EDIT CMS PR NEWS MODAL */}
      {/* ========================================================================= */}
      {editingNews && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={18} color="#E01A59" />
                <span>แก้ไขข่าวประชาสัมพันธ์</span>
              </div>
              <button type="button" onClick={() => setEditingNews(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCmsNews(cmsNews.map(n => n.id === editingNews.id ? editingNews : n));
              setEditingNews(null);
              alert('บันทึกการแก้ไขข่าวประชาสัมพันธ์เรียบร้อยแล้ว!');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">หัวข้อข่าวประชาสัมพันธ์</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={editingNews.title}
                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่ / ป้ายกำกับ</label>
                    <select 
                      className="form-control"
                      value={editingNews.tag}
                      onChange={(e) => setEditingNews({ ...editingNews, tag: e.target.value })}
                    >
                      <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                      <option value="กิจกรรมทุน">กิจกรรมทุน</option>
                      <option value="กำหนดการ">กำหนดการ</option>
                      <option value="ผลการพิจารณา">ผลการพิจารณา</option>
                      <option value="ข่าวด่วน">ข่าวด่วน</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">วันที่ประกาศ</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingNews.date}
                      onChange={(e) => setEditingNews({ ...editingNews, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">รายละเอียดสรุปย่อ</label>
                  <textarea 
                    rows={3} 
                    className="form-control"
                    required
                    value={editingNews.summary}
                    onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={editingNews.isHot}
                      onChange={(e) => setEditingNews({ ...editingNews, isHot: e.target.checked })}
                    />
                    <span style={{ fontWeight: 600, color: '#E01A59' }}>🔥 ตั้งเป็นข่าวด่วน / ข่าวเด่น (แสดงป้าย Hot)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingNews(null)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4E: ADD PUBLISHED DOCUMENT MODAL */}
      {/* ========================================================================= */}
      {showAddDocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#E01A59" />
                <span>เพิ่มเอกสารเผยแพร่ใหม่</span>
              </div>
              <button type="button" onClick={() => setShowAddDocModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const newDoc = {
                id: `DOC-${Date.now()}`,
                ...docForm
              };
              setCmsDownloads([newDoc, ...cmsDownloads]);
              setShowAddDocModal(false);
              setDocForm({
                title: '',
                filename: 'Document_2567.pdf',
                filesize: '320 KB',
                description: '',
                version: 'ปรับปรุง 2567'
              });
              alert('เพิ่มเอกสารเผยแพร่ใหม่เรียบร้อยแล้ว!');
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อเอกสารเผยแพร่</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="เช่น ประกาศหลักเกณฑ์การสมัครรับทุนการศึกษา ประจำปี 2567"
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">ชื่อไฟล์ (Filename)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={docForm.filename}
                      onChange={(e) => setDocForm({ ...docForm, filename: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ขนาดไฟล์</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={docForm.filesize}
                      onChange={(e) => setDocForm({ ...docForm, filesize: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">เวอร์ชัน / รุ่นเอกสาร</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={docForm.version}
                    onChange={(e) => setDocForm({ ...docForm, version: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">คำอธิบายเอกสาร</label>
                  <textarea 
                    rows={2} 
                    className="form-control" 
                    value={docForm.description}
                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDocModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกและเผยแพร่เอกสาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DUAL-VIEW VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {selectedStudentForDualView && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '960px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Eye color="#E01A59" size={20} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>
                    Dual-View ตรวจสอบภาพสแกนเทียบกับกระดาษจริง & บันทึกคะแนนเข้าระบบ
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    นิสิต: {selectedStudentForDualView.title} {selectedStudentForDualView.first_name} {selectedStudentForDualView.last_name} ({selectedStudentForDualView.student_id})
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedStudentForDualView(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="dual-view-container">
                {/* Left Panel */}
                <div className="dual-panel">
                  <div className="dual-panel-header">
                    <FileText size={16} color="#E01A59" />
                    <span>1. ภาพสแกนหลักฐานกิจกรรม / เอกสารดิจิทัล</span>
                  </div>
                  <div className="dual-scanned-preview">
                    <div>
                      <img 
                        src="./assets/camp.jpg" 
                        alt="Scanned doc" 
                        style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', marginTop: '8px' }}>
                        ใบรับรองการเข้าร่วมค่ายอาสาพัฒนาชนบท จ.น่าน (24 ชั่วโมง)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        ไฟล์: volunteer_camp_nan_signed.pdf (ขนาด 2.4 MB)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="dual-panel" style={{ background: '#FFF' }}>
                  <div className="dual-panel-header">
                    <CheckCheck size={16} color="#10B981" />
                    <span>2. ตรวจสอบเทียบเอกสารกระดาษจริง & บันทึกคะแนน</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                        <input 
                          type="checkbox" 
                          checked={physicalPaperChecked} 
                          onChange={(e) => setPhysicalPaperChecked(e.target.checked)} 
                        />
                        <span>✓ ได้รับและตรวจสอบเอกสารฉบับกระดาษจริงเรียบร้อยแล้ว</span>
                      </label>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', marginLeft: '24px' }}>
                        มีลายเซ็นรับรองจากหัวหน้าโครงการค่าย และตราประทับถูกต้อง
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">จำนวนคะแนนกิจกรรมที่จะบันทึกให้ (Activity Points)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        min="1" 
                        max="30"
                        value={awardedScoreInput}
                        onChange={(e) => setAwardedScoreInput(e.target.value)}
                        style={{ fontWeight: 700, fontSize: '16px', color: '#E01A59' }}
                      />
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                        คะแนนสะสมปัจจุบัน: <strong>{selectedStudentForDualView.accumulatedScore}</strong> ➔ หลังอนุมัติจะเป็น: <strong>{selectedStudentForDualView.accumulatedScore + Number(awardedScoreInput)} แต้ม</strong>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">บันทึกข้อความจากเจ้าหน้าที่ (Officer Notes)</label>
                      <textarea 
                        rows={2} 
                        className="form-control"
                        value={officerReviewNotes}
                        onChange={(e) => setOfficerReviewNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedStudentForDualView(null)}>
                ยกเลิก
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleCertifyScore}
              >
                <CheckCircle size={16} /> กดรับรองเพื่อเพิ่มคะแนนเข้าระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ADD SCHEME MODAL */}
      {/* ========================================================================= */}
      {showAddSchemeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px' }}>เพิ่มประเภททุนการศึกษา (กำหนดปีการศึกษาโดยไม่ทับปีเก่า)</div>
              <button type="button" onClick={() => setShowAddSchemeModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateScheme}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">ปีการศึกษา</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSchemeForm.year} 
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, year: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ภาคเรียน</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSchemeForm.term} 
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, term: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">หมวดหมู่ทุน</label>
                  <select 
                    className="form-control"
                    value={newSchemeForm.category}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, category: e.target.value })}
                  >
                    <option value="เงินรายเดือน">เงินรายเดือน</option>
                    <option value="ค่าอุปกรณ์และเครื่องแต่งกาย">ค่าอุปกรณ์และเครื่องแต่งกาย</option>
                    <option value="ค่าลงทะเบียนการศึกษา">ค่าลงทะเบียนการศึกษา</option>
                    <option value="ค่าที่พัก">ค่าที่พัก</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">ชื่อประเภททุน</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    placeholder="เช่น ทุนค่าครองชีพรายเดือน นิสิตโครงการชนบท"
                    value={newSchemeForm.name}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">จำนวนเงินต่อคน (บาท)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSchemeForm.amount}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เกณฑ์คะแนนขั้นต่ำ (แต้ม)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSchemeForm.minScore}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, minScore: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">เกณฑ์ GPAX ขั้นต่ำ</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control" 
                      value={newSchemeForm.minGpax}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, minGpax: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">โควตาจำนวนคน (คน)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSchemeForm.totalQuota}
                      onChange={(e) => setNewSchemeForm({ ...newSchemeForm, totalQuota: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">งบประมาณจัดสรรรวม (บาท)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newSchemeForm.budgetAllocated}
                    onChange={(e) => setNewSchemeForm({ ...newSchemeForm, budgetAllocated: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSchemeModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  บันทึกประเภททุน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: ALL UPLOADED DOCUMENTS INSPECTION & APPROVAL (ทุกชิ้นที่มีให้ upload) */}
      {/* ========================================================================= */}
      {selectedStudentForDocApproval && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1080px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF1F2 100%)', borderBottom: '1px solid #FECDD3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#E01A59', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '17px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>ศูนย์ตรวจและอนุมัติเอกสารหลักฐานนิสิต (ทุกชิ้น)</span>
                    <span className="badge badge-chula" style={{ fontSize: '11px' }}>เจ้าหน้าที่ศูนย์จุฬาฯ-ชนบท</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    ตรวจสอบความถูกต้อง เทียบเอกสารกระดาษจริง และอนุมัติ/ส่งกลับแก้ไขเอกสารสำคัญทุกรายการ
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStudentForDocApproval(null)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Student Summary Banner */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img 
                    src={selectedStudentForDocApproval.avatar || './assets/camp.jpg'} 
                    alt={selectedStudentForDocApproval.first_name} 
                    style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #E01A59', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        {selectedStudentForDocApproval.title} {selectedStudentForDocApproval.first_name} {selectedStudentForDocApproval.last_name}
                      </span>
                      {selectedStudentForDocApproval.nickname && (
                        <span className="badge badge-received" style={{ fontSize: '11px' }}>
                          ชื่อเล่น: {selectedStudentForDocApproval.nickname}
                        </span>
                      )}
                      <span className="badge badge-chula" style={{ fontSize: '11px' }}>
                        ปี {selectedStudentForDocApproval.year_level || 2}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                        ({selectedStudentForDocApproval.student_id})
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                      คณะ{selectedStudentForDocApproval.faculty_name} • สาขา{selectedStudentForDocApproval.major_name} • GPAX: <strong style={{ color: '#059669' }}>{Number(selectedStudentForDocApproval.gpax || 0).toFixed(2)}</strong> • ลงทะเบียน: <strong>{selectedStudentForDocApproval.registered_courses_count || 6} วิชา ({selectedStudentForDocApproval.registered_credits_count || 19} หน่วยกิต)</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                      {selectedStudentForDocApproval.accommodation_type === 'หอนอก' ? (
                        <span>🏠 <strong>หอนอก:</strong> {selectedStudentForDocApproval.external_dorm_type || 'ห้องเช่า'} ({selectedStudentForDocApproval.external_dorm_address || '-'}) • ค่าใช้จ่าย: {selectedStudentForDocApproval.external_dorm_expenses || '-'}</span>
                      ) : (
                        <span>🏢 <strong>หอใน:</strong> {selectedStudentForDocApproval.dormitory || 'หอพักนิสิต'} (ตึก/ห้อง/เตียง: <strong style={{ color: '#E01A59' }}>{selectedStudentForDocApproval.dorm_room_bed || 'จำปา/404/D'}</strong>)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bulk Approve All Documents button */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                    สถานะเอกสาร: <strong style={{ color: '#059669' }}>{(selectedStudentForDocApproval.documents || []).filter(d => d.status === 'APPROVED').length}</strong> จาก {(selectedStudentForDocApproval.documents || []).length} ฉบับ
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm"
                    onClick={handleBulkApproveAllStudentDocs}
                    style={{ fontWeight: 700 }}
                  >
                    <CheckCheck size={15} /> อนุมัติเอกสารทั้งหมดในคลิกเดียว (Bulk Approve All)
                  </button>
                </div>
              </div>

              {/* Document List Cards */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#E01A59" />
                    <span>รายการเอกสารหลักฐานทั้งหมด ({(selectedStudentForDocApproval.documents || []).length} ชิ้น)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    คลิกเพื่อดูภาพตัวอย่าง ตรวจเทียบกระดาษจริง และกดอนุมัติหรือส่งกลับแก้ไข
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selectedStudentForDocApproval.documents || []).map((doc, idx) => {
                    const isApproved = doc.status === 'APPROVED';
                    const isRejected = doc.status === 'REJECTED';
                    const isPending = !isApproved && !isRejected;

                    return (
                      <div 
                        key={doc.id || idx}
                        style={{
                          background: isApproved ? '#F0FDF4' : isRejected ? '#FEF2F2' : '#FFFFFF',
                          border: `1px solid ${isApproved ? '#BBF7D0' : isRejected ? '#FECDD3' : '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                                {doc.name}
                              </span>
                              <span className="badge badge-received" style={{ fontSize: '10px' }}>
                                {doc.category || 'เอกสารสำคัญ'}
                              </span>
                              {doc.required && (
                                <span style={{ fontSize: '10px', color: '#E01A59', fontWeight: 700 }}>* บังคับ</span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                              {doc.description}
                            </div>
                            <div style={{ fontSize: '11px', color: '#2563EB', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }} onClick={() => setDocApprovalPreviewModal(doc)}>
                                📄 {doc.fileName}
                              </span>
                              <span style={{ color: '#94A3B8' }}>•</span>
                              <span style={{ color: '#64748B' }}>ขนาด: {doc.fileSize || '1.5 MB'}</span>
                              <span style={{ color: '#94A3B8' }}>•</span>
                              <span style={{ color: '#64748B' }}>ส่งเมื่อ: {doc.submittedDate}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isApproved && (
                              <span className="badge badge-approved" style={{ fontSize: '11px', padding: '4px 10px' }}>
                                ✓ ผ่านการอนุมัติแล้ว
                              </span>
                            )}
                            {isRejected && (
                              <span className="badge" style={{ fontSize: '11px', padding: '4px 10px', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                                ⚠️ ส่งกลับแก้ไข
                              </span>
                            )}
                            {isPending && (
                              <span className="badge badge-review" style={{ fontSize: '11px', padding: '4px 10px' }}>
                                ⏳ รอเจ้าหน้าที่ตรวจ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Verification & Controls Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                          {/* Physical paper toggle */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                            <input 
                              type="checkbox" 
                              checked={doc.paperVerified || false}
                              onChange={(e) => handleUpdateSingleDoc(doc.id, undefined, e.target.checked, undefined)}
                            />
                            <span>{doc.paperVerified ? '✓ ตรวจสอบเอกสารกระดาษจริงแล้ว' : 'ยังไม่ได้รับ/ยังไม่ได้ตรวจกระดาษจริง'}</span>
                          </label>

                          {/* Officer note input */}
                          <div style={{ flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder="บันทึกจากเจ้าหน้าที่ / เหตุผลการตรวจ..."
                              value={doc.officerNote || ''}
                              onChange={(e) => handleUpdateSingleDoc(doc.id, undefined, undefined, e.target.value)}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            />
                          </div>

                          {/* Individual action buttons */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDocApprovalPreviewModal(doc)}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              <Eye size={12} /> ดูภาพ
                            </button>

                            <button 
                              type="button" 
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateSingleDoc(doc.id, 'APPROVED', true, doc.officerNote || 'ตรวจสอบความถูกต้องครบถ้วน')}
                              style={{ fontSize: '11px', padding: '4px 10px' }}
                            >
                              <Check size={12} /> อนุมัติ
                            </button>

                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const reason = prompt('ระบุเหตุผลในการส่งกลับแก้ไข:', doc.officerNote || 'ขอให้แนบเอกสารฉบับใหม่ที่ชัดเจนและมีตราประทับครบถ้วน');
                                if (reason !== null) {
                                  handleUpdateSingleDoc(doc.id, 'REJECTED', false, reason);
                                }
                              }}
                              style={{ fontSize: '11px', padding: '4px 8px', color: '#DC2626', borderColor: '#FCA5A5' }}
                            >
                              <AlertCircle size={12} /> ส่งกลับแก้
                            </button>

                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleUpdateSingleDoc(doc.id, 'PENDING', false, 'รอตรวจสอบ')}
                              style={{ fontSize: '11px', padding: '4px 8px', color: '#64748B' }}
                            >
                              <RotateCcw size={12} /> รอตรวจ
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Section: ตรวจสอบและอนุมัติเอกสารเบิกจ่าย (Reimbursements) */}
              {selectedStudentForDocApproval.reimbursements && selectedStudentForDocApproval.reimbursements.length > 0 && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 18px', marginTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>
                      <Receipt size={18} color="#E01A59" />
                      <span>รายการคำร้องขอเบิกจ่ายเอกสาร (ค่ารักษาพยาบาล, ค่าเรียนฤดูร้อน, ค่าอุปกรณ์ ฯลฯ)</span>
                    </div>
                    <span className="badge badge-received" style={{ fontSize: '11px' }}>
                      {selectedStudentForDocApproval.reimbursements.length} รายการ
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedStudentForDocApproval.reimbursements.map(reimb => (
                      <div 
                        key={reimb.id}
                        style={{ 
                          background: '#FFFFFF', 
                          border: '1px solid #E2E8F0', 
                          borderRadius: '8px', 
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="badge badge-chula" style={{ fontSize: '10px' }}>
                                {reimb.category_label}
                              </span>
                              <strong style={{ fontSize: '13px', color: '#0F172A' }}>{reimb.title}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                              เลขที่คำร้อง: {reimb.id} | หน่วยงาน: {reimb.institution || '-'} | เลขที่ใบเสร็จ: {reimb.receipt_no} (วันที่: {reimb.receipt_date})
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
                              ยอดเบิก: ฿{reimb.amount_requested?.toLocaleString()} บาท
                            </div>
                            <span className={`badge ${reimb.status === 'SENT_TO_FINANCE' ? 'badge-finance' : reimb.status === 'APPROVED' ? 'badge-approved' : 'badge-review'}`} style={{ fontSize: '10px' }}>
                              {reimb.status_label || reimb.status}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '8px' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDocApprovalPreviewModal({
                              name: reimb.title,
                              fileName: reimb.receipt_file_name,
                              url: reimb.receipt_file_url || './assets/camp.jpg',
                              description: `ใบเสร็จรับเงิน/หลักฐานคำร้องขอเบิกจ่าย ${reimb.id}`
                            })}
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            <Eye size={12} /> ดูใบเสร็จ
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => handleUpdateReimbursementStatus(reimb.id, 'APPROVED', 'ผ่านการอนุมัติเบิกจ่ายแล้ว')}
                              style={{ 
                                background: reimb.status === 'APPROVED' ? '#10B981' : '#F1F5F9', 
                                color: reimb.status === 'APPROVED' ? '#FFF' : '#334155',
                                fontSize: '11px',
                                padding: '3px 8px'
                              }}
                            >
                              <Check size={12} /> อนุมัติเบิกจ่าย
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => handleUpdateReimbursementStatus(reimb.id, 'SENT_TO_FINANCE', 'ส่งเรื่องฝ่ายการคลังเรียบร้อย เตรียมโอนเงิน')}
                              style={{ 
                                background: reimb.status === 'SENT_TO_FINANCE' ? '#4F46E5' : '#F1F5F9', 
                                color: reimb.status === 'SENT_TO_FINANCE' ? '#FFF' : '#334155',
                                fontSize: '11px',
                                padding: '3px 8px'
                              }}
                            >
                              <FileCheck size={12} /> ส่งการคลัง
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => handleUpdateReimbursementStatus(reimb.id, 'DOCUMENTS_RECEIVED', 'รอตรวจสอบ')}
                              style={{ fontSize: '11px', padding: '3px 8px', color: '#64748B' }}
                            >
                              <RotateCcw size={12} /> รอตรวจ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Section: จดหมายลับถึงศูนย์ฯ (ส่วนที่ 7 จาก 7) */}
              <div style={{ background: '#FFFDFE', border: '2px solid #FCE7F3', borderRadius: '12px', padding: '16px 18px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '14px', color: '#831843' }}>
                    <Lock size={18} color="#E01A59" />
                    <span>ส่วนที่ 7 จาก 7: จดหมายลับถึงศูนย์ฯ (Confidential Letter to Center)</span>
                  </div>
                  <span className="badge badge-chula" style={{ fontSize: '10px' }}>
                    {selectedStudentForDocApproval.confidential_letter_reply ? '✓ ตอบกลับคำปรึกษาแล้ว' : '⏳ รอการตอบกลับ'}
                  </span>
                </div>

                <div style={{ background: '#FFF1F2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #FECDD3', marginBottom: '12px', fontSize: '12px', color: '#475569' }}>
                  <strong>ข้อความจากนิสิต (อยู่ตรงนี้นะคะ):</strong>
                  <div style={{ fontSize: '13px', color: '#0F172A', marginTop: '6px', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{selectedStudentForDocApproval.confidential_letter || 'นิสิตไม่ได้ระบุข้อความกังวลใจ'}"
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#9D174D' }}>
                    คำแนะนำและการดูแลจากพี่เจ้าหน้าที่ / อาจารย์ศูนย์จุฬาฯ-ชนบท (Counselor Reply)
                  </label>
                  <textarea 
                    rows={3}
                    className="form-control"
                    placeholder="พิมพ์ข้อความตอบกลับ ให้คำปรึกษา หรือนัดแนะนิสิตเพื่อพูดคุยช่วยเหลือ..."
                    value={counselorReplyDraft}
                    onChange={(e) => setCounselorReplyDraft(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveCounselorReply}
                  >
                    <MessageSquare size={14} /> บันทึกและส่งข้อความตอบกลับถึงนิสิต
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                การปรับสถานะเอกสารจะซิงค์ไปยังหน้านิสิตทันทีตามเวลาจริง (Real-Time Synchronized)
              </div>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setSelectedStudentForDocApproval(null)}
              >
                เสร็จสิ้น & ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: DOCUMENT PREVIEW MODAL IN OFFICER DASHBOARD */}
      {docApprovalPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <Eye color="#E01A59" size={20} />
                <span>ตัวอย่างเอกสาร: {docApprovalPreviewModal.name}</span>
              </div>
              <button type="button" onClick={() => setDocApprovalPreviewModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <img 
                  src={docApprovalPreviewModal.fileUrl || './assets/camp.jpg'} 
                  alt={docApprovalPreviewModal.name}
                  style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
                  📄 {docApprovalPreviewModal.fileName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {docApprovalPreviewModal.description}
                </div>
              </div>

              {docApprovalPreviewModal.officerNote && (
                <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
                  💬 <strong>บันทึกจากเจ้าหน้าที่:</strong> {docApprovalPreviewModal.officerNote}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDocApprovalPreviewModal(null)}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: STUDENT PROFILE & ACADEMIC RECORDS (OFFICER FULL VIEW) */}
      {selectedStudentForProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#E01A59" />
                <span>ประวัตินิสิตและผลการเรียนฉบับเต็ม (Student Profile & Academic Records)</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStudentForProfileModal(null)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <img 
                  src={selectedStudentForProfileModal.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop'} 
                  alt="" 
                  style={{ width: '68px', height: '68px', borderRadius: '50%', border: '3px solid #E01A59', objectFit: 'cover' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedStudentForProfileModal.title} {selectedStudentForProfileModal.first_name} {selectedStudentForProfileModal.last_name}
                    </h3>
                    <span className={`badge ${selectedStudentForProfileModal.student_status === 'พ้นสภาพ' ? 'badge-rejected' : 'badge-approved'}`}>
                      {selectedStudentForProfileModal.student_status || 'กำลังเรียน'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    รหัสนิสิต: {selectedStudentForProfileModal.student_id ? <strong>{selectedStudentForProfileModal.student_id}</strong> : <span style={{ color: '#D97706', fontWeight: 700 }}>(ยังไม่มีรหัสนิสิต / รอจัดสรร)</span>} • เลขบัตร ปชช.: <strong>{selectedStudentForProfileModal.citizen_id}</strong> • คณะ <strong>{selectedStudentForProfileModal.faculty_name}</strong> ({selectedStudentForProfileModal.province})
                  </div>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                  { id: 'academic', label: 'ผลการเรียนรายภาค', icon: BookOpen },
                  { id: 'scholarship', label: 'ประวัติรับเงินทุน', icon: DollarSign },
                  { id: 'activities', label: 'ชั่วโมงจิตอาสา', icon: CheckCircle },
                  { id: 'contact', label: 'ข้อมูลการติดต่อ/ที่อยู่', icon: Phone },
                  { id: 'counseling', label: 'จดหมายปรึกษาใจ', icon: MessageSquare }
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = officerProfileModalTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setOfficerProfileModalTab(t.id)}
                      style={{ fontSize: '12px' }}
                    >
                      <Icon size={14} /> {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Academic */}
              {officerProfileModalTab === 'academic' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      ประวัติผลการเรียน (Academic Performance by Semester)
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      GPAX เฉลี่ยสะสม: <strong style={{ color: selectedStudentForProfileModal.gpax < 2.0 ? '#EF4444' : '#059669', fontSize: '14px' }}>{Number(selectedStudentForProfileModal.gpax || 3.45).toFixed(2)}</strong>
                    </span>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ภาคการศึกษา</th>
                          <th>GPA ประจำภาค</th>
                          <th>GPAX สะสม</th>
                          <th>หน่วยกิตภาค</th>
                          <th>หน่วยกิตสะสม</th>
                          <th>สถานะผลการเรียน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAcademicHistory(selectedStudentForProfileModal).map(sem => (
                          <tr key={sem.term}>
                            <td style={{ fontWeight: 600 }}>{sem.term}</td>
                            <td>{Number(sem.gpa || 0).toFixed(2)}</td>
                            <td style={{ fontWeight: 700, color: Number(sem.gpax || 0) < 2.0 ? '#EF4444' : '#0F172A' }}>
                              {Number(sem.gpax || 0).toFixed(2)}
                            </td>
                            <td>{sem.creditsTerm}</td>
                            <td>{sem.creditsTotal}</td>
                            <td>
                              <span className={`badge ${sem.status.includes('ปกติ') ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '10px' }}>
                                {sem.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Scholarship */}
              {officerProfileModalTab === 'scholarship' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      ประวัติการเบิกจ่ายและรับเงินทุนการศึกษา
                    </span>
                    <span className="badge badge-received">รวมเบิกจ่ายแล้ว 4 รายการ</span>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ภาคเรียน</th>
                          <th>ประเภททุน</th>
                          <th>จำนวนเงิน</th>
                          <th>วันที่โอน</th>
                          <th>สถานะการโอนเงิน</th>
                          <th>เลขอ้างอิง</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getScholarshipHistory(selectedStudentForProfileModal).map((p, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{p.term}</td>
                            <td>{p.type}</td>
                            <td style={{ fontWeight: 700, color: '#059669' }}>฿{p.amount.toLocaleString()}</td>
                            <td style={{ fontSize: '12px' }}>{p.date}</td>
                            <td>
                              <span className={`badge ${p.status === 'โอนสำเร็จ' ? 'badge-approved' : 'badge-review'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '11px', color: '#64748B' }}><code>{p.ref}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
                    💳 <strong>บัญชีรับเงินโอน:</strong> {selectedStudentForProfileModal.bank_name || 'ธนาคารไทยพาณิชย์'} เลขที่ {selectedStudentForProfileModal.bank_account_number || '026-2-88912-3'}
                  </div>
                </div>
              )}

              {/* Tab 3: Activities */}
              {officerProfileModalTab === 'activities' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      บันทึกกิจกรรมจิตอาสาและการสะสมแต้ม
                    </span>
                    <span className="badge badge-approved">
                      สะสม {selectedStudentForProfileModal.accumulatedScore || 0} / 40 แต้ม
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { title: 'โครงการค่ายอาสาพัฒนาชนบท จ.น่าน', hours: '24 ชม.', score: 15, date: '20-25 ก.ย. 2567' },
                      { title: 'ภารกิจจิตอาสาบรรเทาอุทกภัย จ.อุบลราชธานี', hours: '16 ชม.', score: 12, date: '1-5 ต.ค. 2567' },
                      { title: 'ปฐมนิเทศ & สัมมนาโครงการพัฒนาชุมชน', hours: '8 ชม.', score: 10, date: '10 ต.ค. 2567' }
                    ].map((act, idx) => (
                      <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{act.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>📅 {act.date} • {act.hours}</div>
                        </div>
                        <span className="badge badge-received" style={{ fontWeight: 700, color: '#E01A59' }}>
                          +{act.score} แต้ม
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Contact */}
              {officerProfileModalTab === 'contact' && (
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Email ติดต่อ / มหาวิทยาลัย:</span>
                    <strong>{selectedStudentForProfileModal.email || `${selectedStudentForProfileModal.student_id}@chula.ac.th`}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>เบอร์โทรศัพท์นิสิต:</span>
                    <strong>{selectedStudentForProfileModal.phone_number || '081-234-5678'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>เบอร์ติดต่อฉุกเฉิน (ผู้ปกครอง):</span>
                    <strong>{selectedStudentForProfileModal.emergency_phone || '089-876-5432'} ({selectedStudentForProfileModal.emergency_relation || 'บิดา'})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>ที่อยู่ภูมิลำเนา:</span>
                    <strong>{selectedStudentForProfileModal.address_line || '-'} {selectedStudentForProfileModal.district} {selectedStudentForProfileModal.province}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>หอพักนักศึกษา:</span>
                    <strong>{selectedStudentForProfileModal.dormitory || 'หอพักนิสิตจุฬาฯ'} ({selectedStudentForProfileModal.dorm_room_bed || 'จำปา/404/D'})</strong>
                  </div>
                </div>
              )}

              {/* Tab 5: Counseling */}
              {officerProfileModalTab === 'counseling' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#FFF5F8', border: '1px solid #FCE7F0', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#9F0837', marginBottom: '6px' }}>
                      ✉️ ข้อความกังวลใจ / คำปรึกษาจากนิสิต:
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{selectedStudentForProfileModal.confidential_letter || 'นิสิตไม่ได้ระบุข้อความกังวลใจ'}"
                    </div>
                  </div>

                  {selectedStudentForProfileModal.confidential_letter_reply && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                        ✓ ข้อความตอบกลับจากศูนย์ฯ / อาจารย์:
                      </div>
                      <div style={{ fontSize: '13px', color: '#14532D', lineHeight: 1.6 }}>
                        "{selectedStudentForProfileModal.confidential_letter_reply}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setSelectedStudentForProfileModal(null)}
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
