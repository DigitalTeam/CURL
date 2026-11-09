import React, { useState, useEffect } from 'react';
import {
  User,
  Award,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  ShieldCheck,
  Edit3,
  Save,
  X,
  ExternalLink,
  Calendar,
  Building,
  Phone,
  CreditCard,
  History,
  FileCheck,
  Home,
  Check,
  MapPin,
  Users as UsersIcon,
  GraduationCap,
  MessageSquare,
  Eye,
  BookOpen,
  Lock,
  Mail,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  HeartPulse,
  SunMedium,
  PackageOpen,
  Plus
} from 'lucide-react';
import {
  SCHOLARSHIP_STAGES,
  STANDARD_DOCUMENTS_LIST,
  MOCK_ACTIVITIES,
  DISBURSEMENT_CATEGORIES,
  DISBURSEMENT_STAGES
} from '../data/mockData';

export default function StudentDashboard({
  student,
  activeTab,
  setActiveTab,
  onUpdateStudent,
  onSendOfficerAlert
}) {
  // Normalize current tab from props or fallback to 'student-dashboard'
  const currentTab = (activeTab && activeTab.startsWith('student-'))
    ? activeTab
    : 'student-dashboard';

  const setTab = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...student });
  const [pdpaProfileConsent, setPdpaProfileConsent] = useState(true);
  const [documentsList, setDocumentsList] = useState(student?.documents || STANDARD_DOCUMENTS_LIST);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [selectedDocForUpload, setSelectedDocForUpload] = useState(null);
  const [docUploadPdpaConsent, setDocUploadPdpaConsent] = useState(true);
  const [previewDocModal, setPreviewDocModal] = useState(null);

  // Reimbursement States
  const [reimbursementsList, setReimbursementsList] = useState(student?.reimbursements || []);
  const [selectedDisbursementCategory, setSelectedDisbursementCategory] = useState('ALL');
  const [selectedReimbursementId, setSelectedReimbursementId] = useState(
    (student?.reimbursements && student.reimbursements[0]?.id) || null
  );
  const [showNewReimbursementModal, setShowNewReimbursementModal] = useState(false);
  const [newReimbursementForm, setNewReimbursementForm] = useState({
    category: 'MEDICAL',
    title: '',
    institution: '',
    receipt_no: '',
    receipt_date: new Date().toISOString().split('T')[0],
    amount_requested: '',
    receipt_file_name: 'receipt_upload.pdf',
    pdpaConsent: true,
    notes: ''
  });

  // Sync state if student prop changes (e.g., officer approval)
  useEffect(() => {
    if (student) {
      if (!isEditingProfile) {
        setEditFormData({ ...student });
      }
      if (student.documents) {
        setDocumentsList(student.documents);
      }
      if (student.reimbursements) {
        setReimbursementsList(student.reimbursements);
        if (!selectedReimbursementId && student.reimbursements.length > 0) {
          setSelectedReimbursementId(student.reimbursements[0].id);
        }
      }
    }
  }, [student, isEditingProfile]);

  const [changeRequests, setChangeRequests] = useState([
    {
      id: 'CR-001',
      field: 'เบอร์ติดต่อฉุกเฉิน',
      oldValue: '081-999-0000',
      newValue: '089-876-5432',
      requestedAt: '2026-10-10 14:30',
      status: 'VERIFIED',
      officerNote: 'ยืนยันข้อมูลเรียบร้อย'
    }
  ]);

  // New Activity Submission Form State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActivityForm, setNewActivityForm] = useState({
    title: '',
    category: 'จิตอาสา',
    date: '2026-10-15',
    hours: 4,
    hasPhysicalPaper: true,
    pdpaConsent: true,
    reflection: ''
  });

  // Calculate score progress percentage
  const scorePercent = Math.min(100, Math.round((student.accumulatedScore / student.requiredScore) * 100));

  const handleSaveProfileChanges = () => {
    if (!pdpaProfileConsent) {
      alert('กรุณาทำเครื่องหมายยินยอมตามข้อตกลง PDPA ก่อนบันทึกการแก้ไขข้อมูล');
      return;
    }

    // If student changed bank account or phone, create a change request for officer verification
    const newRequest = {
      id: `CR-${Date.now().toString().slice(-3)}`,
      field: 'แก้ไขข้อมูลส่วนตัว / บัญชีธนาคาร',
      oldValue: student.bank_account_number,
      newValue: editFormData.bank_account_number,
      requestedAt: new Date().toLocaleString('th-TH'),
      status: 'PENDING',
      officerNote: 'รอเจ้าหน้าที่ศูนย์ฯ ตรวจสอบความถูกต้อง'
    };

    setChangeRequests([newRequest, ...changeRequests]);
    setIsEditingProfile(false);
    onUpdateStudent(editFormData);
    onSendOfficerAlert(`นิสิต ${student.first_name} ${student.last_name} (${student.student_id}) ได้อัปเดตข้อมูลส่วนตัว/บัญชีธนาคาร กรุณา Verify`);
    alert('บันทึกคำขอแก้ไขข้อมูลส่วนตัวสำเร็จ! ระบบได้ส่งแจ้งเตือนไปยังเจ้าหน้าที่เพื่อ Verify และบันทึกประวัติการแก้ไขภายใต้ความยินยอม PDPA แล้ว');
  };

  const handleAddNewReimbursement = (e) => {
    e.preventDefault();
    if (!newReimbursementForm.title || !newReimbursementForm.amount_requested) {
      alert('กรุณากรอกรายการและจำนวนเงินที่ขอเบิก');
      return;
    }
    if (!newReimbursementForm.pdpaConsent) {
      alert('กรุณายินยอมตามข้อตกลง PDPA ก่อนยื่นคำร้องเบิกจ่าย');
      return;
    }

    const categoryObj = DISBURSEMENT_CATEGORIES.find(c => c.id === newReimbursementForm.category) || { label: 'ค่าใช้จ่ายจำเป็น' };
    const newReq = {
      id: `REIMB-${student.student_id}-${Date.now().toString().slice(-4)}`,
      category: newReimbursementForm.category,
      category_label: categoryObj.label,
      title: newReimbursementForm.title,
      institution: newReimbursementForm.institution || 'จุฬาลงกรณ์มหาวิทยาลัย',
      receipt_no: newReimbursementForm.receipt_no || `REC-${Date.now().toString().slice(-6)}`,
      receipt_date: newReimbursementForm.receipt_date,
      amount_requested: Number(newReimbursementForm.amount_requested),
      amount_approved: Number(newReimbursementForm.amount_requested),
      status: 'DOCUMENTS_RECEIVED',
      status_label: 'รับเอกสารแล้ว รอเจ้าหน้าที่ตรวจสิทธิ์',
      estimatedPayoutDate: 'ภายใน 15 วันทำการหลังอนุมัติ',
      submitted_date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      officer_note: 'ระบบบันทึกเอกสารคำร้องแล้ว รอเจ้าหน้าที่ตรวจสอบใบเสร็จฉบับจริง',
      receipt_file_url: './assets/camp.jpg',
      receipt_file_name: newReimbursementForm.receipt_file_name || 'receipt_document.pdf'
    };

    const updatedList = [newReq, ...reimbursementsList];
    setReimbursementsList(updatedList);
    setSelectedReimbursementId(newReq.id);
    onUpdateStudent({
      ...student,
      reimbursements: updatedList
    });
    setShowNewReimbursementModal(false);
    onSendOfficerAlert(`นิสิต ${student.first_name} ได้ยื่นเอกสารขอเบิกจ่าย "${newReq.title}" ยอดเงิน ฿${newReq.amount_requested.toLocaleString()} รอตรวจสอบ`);
    alert(`ยื่นเอกสารขอเบิกจ่าย "${newReq.title}" สำเร็จ! ระบบได้ส่งเรื่องให้เจ้าหน้าที่ตรวจสอบใบเสร็จแล้ว`);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivityForm.title) return;
    if (!newActivityForm.pdpaConsent) {
      alert('กรุณายินยอมให้ประมวลผลข้อมูลกิจกรรมตามเกณฑ์ PDPA');
      return;
    }

    // award estimated score
    const pointsToAdd = Number(newActivityForm.hours) >= 8 ? 10 : 5;
    const updatedScore = student.accumulatedScore + pointsToAdd;

    onUpdateStudent({
      ...student,
      accumulatedScore: updatedScore
    });

    setShowActivityModal(false);
    onSendOfficerAlert(`นิสิต ${student.first_name} ได้ยื่นบันทึกกิจกรรม "${newActivityForm.title}" (${newActivityForm.hours} ชม.) รอตรวจสอบกระดาษจริง`);
    alert(`ส่งคำขอกิจกรรมเรียบร้อย! เจ้าหน้าที่ได้รับข้อมูลและรอตรวจสอบเอกสารฉบับจริง`);
  };

  const handleUploadDocumentSubmit = (e) => {
    e.preventDefault();
    if (!docUploadPdpaConsent) {
      alert('กรุณายินยอมตามข้อตกลง PDPA ก่อนอัปโหลดเอกสาร');
      return;
    }
    if (!selectedDocForUpload) return;

    setDocumentsList(prev => prev.map(d => {
      if (d.id === selectedDocForUpload.id) {
        return {
          ...d,
          fileName: `${selectedDocForUpload.id}_uploaded_${Date.now().toString().slice(-4)}.pdf`,
          submittedDate: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
          paperVerified: false
        };
      }
      return d;
    }));

    setShowUploadDocModal(false);
    setSelectedDocForUpload(null);
    onSendOfficerAlert(`นิสิต ${student.first_name} ได้อัปโหลดไฟล์ใหม่สำหรับ "${selectedDocForUpload.name}"`);
    alert('อัปโหลดเอกสารสำคัญสำเร็จ! ระบบบันทึกไฟล์และแจ้งเจ้าหน้าที่เพื่อรอตรวจทานฉบับจริงแล้ว');
  };

  return (
    <div className="content-body">
      {/* Student Welcome Header Card */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F8 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <img
              src={student.avatar}
              alt={student.first_name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #E01A59', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {student.title} {student.first_name} {student.last_name}
                </h2>
                <span className="badge badge-received">ปี {student.year_level}</span>
                <span className="badge badge-approved" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> นิสิตทุนจุฬาฯ-ชนบท
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                รหัสนิสิต: <strong>{student.student_id}</strong> • คณะ{student.faculty_name} สาขา{student.major_name} • เกรดสะสม (GPAX): <strong style={{ color: '#0F172A' }}>{Number(student.gpax || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setTab('student-activities');
                setShowActivityModal(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <CheckCircle size={15} /> + ส่งคำขอกิจกรรมสะสมแต้ม
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('student-profile');
                setIsEditingProfile(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Edit3 size={15} /> แก้ไขข้อมูลส่วนตัว
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Connected with Sidebar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'student-dashboard', label: 'หน้าหลักนิสิต (Overview)', icon: Home },
          { id: 'student-profile', label: 'ข้อมูลส่วนตัว', icon: User },
          { id: 'student-scholarship', label: 'สถานะทุน 4 ขั้นตอน', icon: Award },
          { id: 'student-documents', label: 'เอกสารสำคัญ', icon: FileText, badge: '7' },
          { id: 'student-activities', label: 'สะสมคะแนนกิจกรรม', icon: CheckCircle },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid #E01A59' : '3px solid transparent',
                color: isActive ? '#E01A59' : '#64748B',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '-2px'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="badge badge-received" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & DASHBOARD SUMMARY */}
      {/* ========================================================================= */}
      {currentTab === 'student-dashboard' && (
        <div>
          {/* ========================================================================= */}
          {/* STATUS: DISBURSEMENT & REIMBURSEMENT DOCUMENTS (สถานะพิจารณาเอกสารเบิกจ่าย) */}
          {/* ========================================================================= */}
          <div className="card" style={{ marginBottom: '24px', border: '1px solid #FBCFE8', background: '#FFFFFF' }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Receipt size={20} color="#E01A59" />
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                    สถานะพิจารณาเอกสารเบิกจ่าย (Disbursement & Reimbursement Tracking)
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                  ติดตามขั้นตอนการพิจารณาเอกสารใบเสร็จเบิกจ่าย: ค่ารักษาพยาบาล, ค่าเรียนฤดูร้อน (Summer), ค่าอุปกรณ์การศึกษาและอื่นๆ
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewReimbursementModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #E01A59 0%, #C2185B 100%)', boxShadow: '0 2px 6px rgba(224,26,89,0.3)' }}
                >
                  <Plus size={15} />
                  <span>ยื่นคำร้องขอเบิกจ่ายใหม่</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', padding: '14px 0 10px 0', overflowX: 'auto', borderBottom: '1px solid #F8FAFC' }}>
              {DISBURSEMENT_CATEGORIES.map(cat => {
                const isSelected = selectedDisbursementCategory === cat.id;
                const count = cat.id === 'ALL'
                  ? reimbursementsList.length
                  : reimbursementsList.filter(r => r.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedDisbursementCategory(cat.id);
                      const matching = cat.id === 'ALL'
                        ? reimbursementsList
                        : reimbursementsList.filter(r => r.category === cat.id);
                      if (matching.length > 0) {
                        setSelectedReimbursementId(matching[0].id);
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #E01A59' : '1px solid #E2E8F0',
                      background: isSelected ? '#FFF1F5' : '#FFFFFF',
                      color: isSelected ? '#E01A59' : '#475569',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat.label}</span>
                    <span style={{
                      background: isSelected ? '#E01A59' : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Disbursement Request Pipeline & Details */}
            {(() => {
              const filteredRequests = selectedDisbursementCategory === 'ALL'
                ? reimbursementsList
                : reimbursementsList.filter(r => r.category === selectedDisbursementCategory);

              const activeReq = filteredRequests.find(r => r.id === selectedReimbursementId) || filteredRequests[0];

              if (!activeReq) {
                return (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8' }}>
                    <Receipt size={36} color="#CBD5E1" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>ยังไม่มีรายการเอกสารเบิกจ่ายในหมวดหมู่นี้</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>กดปุ่ม "ยื่นคำร้องขอเบิกจ่ายใหม่" ด้านบนเพื่อแนบใบเสร็จ</div>
                  </div>
                );
              }

              return (
                <div style={{ marginTop: '14px' }}>
                  {/* Top info badge of current active request */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#FDF2F8',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #FCE7F3',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '11px', background: '#E01A59', color: '#fff' }}>
                          {activeReq.category_label}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#0F172A' }}>{activeReq.title}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        เลขที่คำร้อง: <strong>{activeReq.id}</strong> | เลขที่ใบเสร็จ: <strong>{activeReq.receipt_no}</strong> | ยื่นเมื่อ: {activeReq.submitted_date}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                        ฿{activeReq.amount_requested?.toLocaleString()} บาท
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        🗓️ ประมาณการโอนเงินเข้า SCB: {activeReq.estimatedPayoutDate}
                      </div>
                    </div>
                  </div>

                  {/* 4-Stage Disbursement Pipeline */}
                  <div className="scholarship-pipeline-bar" style={{ margin: '14px 0 10px 0' }}>
                    <div className="pipeline-connector">
                      <div
                        className="pipeline-connector-fill"
                        style={{
                          width: activeReq.status === 'SENT_TO_FINANCE' ? '100%' :
                            activeReq.status === 'APPROVED' ? '66%' :
                              activeReq.status === 'UNDER_CONSIDERATION' ? '33%' : '5%'
                        }}
                      />
                    </div>

                    {DISBURSEMENT_STAGES.map((stage, idx) => {
                      const isCurrent = stage.id === activeReq.status;
                      const isDone = (
                        (activeReq.status === 'SENT_TO_FINANCE' && idx <= 3) ||
                        (activeReq.status === 'APPROVED' && idx <= 2) ||
                        (activeReq.status === 'UNDER_CONSIDERATION' && idx <= 1) ||
                        (activeReq.status === 'DOCUMENTS_RECEIVED' && idx === 0)
                      );
                      return (
                        <div key={stage.id} className={`pipeline-step ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}>
                          <div className="pipeline-step-node">
                            {isDone ? <FileCheck size={18} /> : stage.step}
                          </div>
                          <div className="pipeline-step-title">{stage.label}</div>
                          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px', lineHeight: 1.2 }}>
                            {stage.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Officer feedback note for this request */}
                  {activeReq.officer_note && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#92400E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div>
                        💬 <strong>บันทึกจากเจ้าหน้าที่ตรวจเอกสารเบิกจ่าย:</strong> {activeReq.officer_note}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreviewDocModal({
                          name: activeReq.title,
                          fileName: activeReq.receipt_file_name,
                          url: activeReq.receipt_file_url,
                          description: `เอกสารใบเสร็จรับเงิน/หลักฐานคำร้อง ${activeReq.id}`,
                          note: activeReq.officer_note
                        })}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        <Eye size={12} />
                        <span>ดูใบเสร็จ</span>
                      </button>
                    </div>
                  )}

                  {/* List / Switcher of other requests */}
                  {filteredRequests.length > 1 && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                        รายการคำร้องขอเบิกจ่ายในหมวดหมู่นี้ ({filteredRequests.length} รายการ):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                        {filteredRequests.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedReimbursementId(item.id)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: item.id === activeReq.id ? '2px solid #E01A59' : '1px solid #E2E8F0',
                              background: item.id === activeReq.id ? '#FFFDFE' : '#F8FAFC',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ minWidth: 0, paddingRight: '8px' }}>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748B' }}>
                                {item.category_label} • ยื่น {item.submitted_date}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>
                                ฿{item.amount_requested?.toLocaleString()}
                              </div>
                              <span className={`badge ${item.status === 'SENT_TO_FINANCE' ? 'badge-finance' : item.status === 'APPROVED' ? 'badge-approved' : 'badge-review'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                                {DISBURSEMENT_STAGES.find(s => s.id === item.status)?.label || item.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Score Accumulation Progress Bar Widget */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  คะแนนกิจกรรมสะสมเพื่อพิจารณาทุน (Activity Score Progress)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  เกณฑ์ขั้นต่ำของทุนประเภทนี้คือ <strong>{student.requiredScore} คะแนน</strong> (ท่านสะสมแล้ว <strong>{student.accumulatedScore} คะแนน</strong>)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: student.accumulatedScore >= student.requiredScore ? '#10B981' : '#E01A59' }}>
                  {student.accumulatedScore}
                </span>
                <span style={{ fontSize: '14px', color: '#64748B' }}> / {student.requiredScore} คะแนน</span>
                <div style={{ fontSize: '11px', color: student.accumulatedScore >= student.requiredScore ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
                  {student.accumulatedScore >= student.requiredScore ? '✓ ผ่านเกณฑ์คะแนนขั้นต่ำแล้ว' : '⚠️ ยังไม่ครบเกณฑ์'}
                </div>
              </div>
            </div>

            {/* Custom Progress Bar with Threshold Pin */}
            <div className="score-progress-container" style={{ height: '22px' }}>
              <div
                className="score-progress-bar"
                style={{ width: `${Math.min(100, (student.accumulatedScore / 60) * 100)}%` }}
              >
                {student.accumulatedScore} แต้ม
              </div>
              <div className="score-threshold-pin" style={{ left: `${(student.requiredScore / 60) * 100}%` }} />
            </div>
          </div>

          {/* Quick Overview Grid: Activities & Bank Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Activity List Card */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <CheckCircle size={18} color="#E01A59" />
                  <span>กิจกรรมล่าสุด ({MOCK_ACTIVITIES.length} กิจกรรม)</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTab('student-activities')}
                >
                  ดูทั้งหมด →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_ACTIVITIES.slice(0, 2).map(act => (
                  <div key={act.id} style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#FFF',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center'
                  }}>
                    <img
                      src={act.proofUrl}
                      alt={act.title}
                      style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#1E293B' }}>{act.title}</div>
                        <span className="badge badge-approved" style={{ fontSize: '11px' }}>+{act.points} แต้ม</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        หมวด: {act.category} • เวลา: {act.hours} ชม. • วันที่: {act.date}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '11px' }}>
                        <span style={{ color: '#059669', fontWeight: 600 }}>สถานะ: {act.status}</span>
                        <span style={{ color: '#64748B' }}>
                          กระดาษจริง: <strong style={{ color: act.paperStatus === 'ส่งแล้ว' ? '#10B981' : '#F59E0B' }}>{act.paperStatus}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Bank & Payout Info */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <CreditCard size={18} color="#E01A59" />
                  <span>บัญชีธนาคารสำหรับรับเงินโอนทุน</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTab('student-scholarship')}
                >
                  ประวัติเงินโอน →
                </button>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  background: '#4E2A84',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px'
                }}>SCB</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{student.bank_account_name}</div>
                  <div style={{ fontSize: '15px', color: '#4E2A84', fontWeight: 700, letterSpacing: '0.04em' }}>{student.bank_account_number}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{student.bank_name} • {student.bank_branch} (รหัส: {student.bank_branch_code})</div>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  ไฟล์สำเนาหน้าสมุดบัญชีที่ผูกรหัสนิสิต:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={student.bank_book_file_url}
                    alt="Bank book copy"
                    style={{ width: '80px', height: '50px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #CBD5E1' }}
                  />
                  <div>
                    <span className="badge badge-approved">✓ เจ้าหน้าที่รับรองแล้ว</span>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>scb_account_verified.jpg</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px', background: '#FFFBEB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#B45309' }}>
                🔔 <strong>แจ้งเตือน:</strong> หากมีการแก้ไขเลขที่บัญชี จะต้องส่งหลักฐานให้เจ้าหน้าที่ศูนย์ฯ Verify ก่อนจึงจะมีผลในการโอนเงิน
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ข้อมูลส่วนตัว (REDESIGNED & BEAUTIFIED WITHOUT CRUDE 39 FIELD TEXT) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 2: ข้อมูลส่วนตัว และแบบฟอร์มรายงานตัวนิสิต (STUDENT PROFILE & SURVEY) */}
      {/* ========================================================================= */}
      {currentTab === 'student-profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Action Bar */}
          <div className="card" style={{ padding: '18px 22px', background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F8 100%)', border: '1px solid #FCE7F3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-chula" style={{ fontSize: '11px' }}>ศูนย์จุฬาฯ-ชนบท CU-RURAL</span>
                  <span className="badge badge-approved" style={{ fontSize: '11px' }}>ภาคต้น ปีการศึกษา 2569</span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 2px 0' }}>
                  <User color="#E01A59" size={22} />
                  <span>ฟอร์มรายงานตัวและข้อมูลส่วนตัวนิสิต (Student Profile & Registration)</span>
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  ข้อมูลการลงทะเบียนเรียน ผลการศึกษา ที่อยู่ปัจจุบัน และจดหมายลับถึงศูนย์ฯ • บันทึกภายใต้ข้อตกลงคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </div>
              </div>

              <div>
                {isEditingProfile ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(false)}>
                      <X size={14} /> ยกเลิก
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveProfileChanges}>
                      <Save size={14} /> บันทึก & ส่งข้อมูลรายงานตัว
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsEditingProfile(true)}>
                    <Edit3 size={14} /> แก้ไขข้อมูล / รายงานตัว
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: ข้อมูลการลงทะเบียนเรียนและข้อมูลทั่วไป (จากฟอร์มรายงานตัว) */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div className="card-title">
                  <GraduationCap size={18} color="#E01A59" />
                  <span>1. ข้อมูลการลงทะเบียนเรียนและข้อมูลทั่วไป (General & Student Details)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  ข้อมูลประจำตัวนิสิตโครงการจุฬาฯ-ชนบท ประจำภาคต้น
                </div>
              </div>
              <span className="badge badge-received">รุ่นที่ {student.cohort_no}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">คำนำหน้า *</label>
                <select
                  className="form-control"
                  value={isEditingProfile ? editFormData.title : student.title}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                >
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="น.ส.">น.ส.</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อ - สกุล (ภาษาไทย) *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ชื่อ"
                    value={isEditingProfile ? editFormData.first_name : student.first_name}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="นามสกุล"
                    value={isEditingProfile ? editFormData.last_name : student.last_name}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  />
                </div>
              </div>

              {/* FIELD พิเศษจาก GOOGLE FORM: ชื่อเล่น (ขอเอาชื่อตาม Timoid) */}
              <div className="form-group" style={{ background: '#FFF5F8', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FCE7F3' }}>
                <label className="form-label" style={{ color: '#BE185D', fontWeight: 700 }}>
                  ชื่อเล่น *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="เช่น น้ำหวาน, ดุล, มีน"
                  value={isEditingProfile ? editFormData.nickname || '' : student.nickname || 'น้ำหวาน'}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, nickname: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFF' : '#FFF5F8', fontWeight: 600 }}
                />
                <div style={{ fontSize: '11px', color: '#9D174D', marginTop: '4px', lineHeight: 1.3 }}>
                  💡 <em>ขอเป็นชื่อเล่นจริงๆของตนไม่ใช่ชื่อตั้งเพื่อเล่นแอปออนไลน์</em>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">รหัสนิสิต *</label>
                <input type="text" className="form-control" value={student.student_id} disabled style={{ background: '#F8FAFC', fontWeight: 700, color: '#0F172A' }} />
              </div>

              {/* FIELD ชั้นปี: 1 ถึง 8 */}
              <div className="form-group">
                <label className="form-label">ชั้นปี *</label>
                <select
                  className="form-control"
                  value={isEditingProfile ? editFormData.year_level : student.year_level}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, year_level: Number(e.target.value) })}
                  style={{ fontWeight: 600 }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(yr => (
                    <option key={yr} value={yr}>ชั้นปีที่ {yr}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์นิสิต *</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.phone_number : student.phone_number}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input
                  type="email"
                  className="form-control"
                  value={isEditingProfile ? editFormData.email || `${student.first_name_en?.toLowerCase() || 'student'}@student.chula.ac.th` : student.email || `${student.first_name_en?.toLowerCase() || 'student'}@student.chula.ac.th`}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">คณะ *</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.faculty_name : student.faculty_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, faculty_name: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">สาขาวิชา *</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.major_name : student.major_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, major_name: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">เลขประจำตัวประชาชน (13 หลัก) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.citizen_id : student.citizen_id}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, citizen_id: e.target.value })}
                  placeholder="เช่น 1-3499-00123-45-1"
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC', fontWeight: 600 }}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">โรงเรียนที่สำเร็จการศึกษา (ชื่อโรงเรียน / อำเภอ / จังหวัด) *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ชื่อโรงเรียนที่จบ"
                    value={isEditingProfile ? editFormData.high_school_name : student.high_school_name}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, high_school_name: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="อำเภอที่ตั้งโรงเรียน"
                    value={isEditingProfile ? editFormData.school_district : student.school_district}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, school_district: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="จังหวัดที่ตั้งโรงเรียน"
                    value={isEditingProfile ? editFormData.school_province : student.school_province}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, school_province: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลผู้ปกครองและการติดต่อฉุกเฉิน (จากฟอร์มรายงานตัว) */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div className="card-title">
                  <UsersIcon size={18} color="#E01A59" />
                  <span>2. ข้อมูลผู้ปกครองและการติดต่อฉุกเฉิน (Guardian & Emergency Contact)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  เบอร์โทรติดต่อกรณีฉุกเฉินหรือคนใกล้ชิดที่ติดต่อได้จริง
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* FIELD เบอร์โทรติดต่อผู้ปกครอง */}
              <div className="form-group" style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <label className="form-label" style={{ color: '#92400E', fontWeight: 700 }}>
                  เบอร์โทรติดต่อผู้ปกครอง *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="เช่น 089-876-5432"
                  value={isEditingProfile ? editFormData.emergency_phone : student.emergency_phone}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, emergency_phone: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFF' : '#FFFBEB', fontWeight: 600 }}
                />
                <div style={{ fontSize: '11px', color: '#B45309', marginTop: '4px', lineHeight: 1.3 }}>
                  ⚠️ <em>ขอเบอร์โทรติดต่อผู้ปกครองกรณีฉุกเฉิน หรือเบอร์คนใกล้ชิดที่ติดต่อได้จริง</em>
                </div>
              </div>

              {/* FIELD ผู้ปกครองเกี่ยวข้องเป็น */}
              <div className="form-group">
                <label className="form-label">ผู้ปกครองเกี่ยวข้องเป็น *</label>
                <select
                  className="form-control"
                  value={isEditingProfile ? editFormData.emergency_relation : student.emergency_relation}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, emergency_relation: e.target.value })}
                  style={{ fontWeight: 600 }}
                >
                  <option value="บิดา">บิดา</option>
                  <option value="มารดา">มารดา</option>
                  <option value="ผู้ปกครองตามกฎหมาย">ผู้ปกครองตามกฎหมาย</option>
                  <option value="ลุง/ป้า/น้า/อา">ลุง/ป้า/น้า/อา</option>
                  <option value="ปู่/ย่า/ตา/ยาย">ปู่/ย่า/ตา/ยาย</option>
                  <option value="พี่ชาย/พี่สาว">พี่ชาย/พี่สาว</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อ-นามสกุล ผู้ปกครอง</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.guardian_name : student.guardian_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, guardian_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">อาชีพผู้ปกครอง</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.guardian_occupation : student.guardian_occupation}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, guardian_occupation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อ-สกุล บิดา</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.father_name : student.father_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, father_name: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">อาชีพบิดา</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.father_occupation : student.father_occupation}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, father_occupation: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อ-สกุล มารดา</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.mother_name : student.mother_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, mother_name: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">อาชีพมารดา</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.mother_occupation : student.mother_occupation}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, mother_occupation: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">สถานภาพครอบครัว</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.family_status : student.family_status}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, family_status: e.target.value })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">รายได้รวมครอบครัวต่อเดือน (บาท)</label>
                <input
                  type="number"
                  className="form-control"
                  value={isEditingProfile ? editFormData.monthly_income : student.monthly_income}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, monthly_income: Number(e.target.value) })}
                  style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC', fontWeight: 600, color: '#059669' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: ผลการเรียนและผลการลงทะเบียนเรียน (ตามภาพที่ 2 และ 5) */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div className="card-title">
                  <BookOpen size={18} color="#E01A59" />
                  <span>3. ผลการเรียนและผลการลงทะเบียนเรียน (Registration & Academic Performance)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  รายงานวิชาที่ลงทะเบียนเรียน รายงานผลการลงทะเบียน CR54 และใบรายงานผลการศึกษา CR60
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* FIELD จำนวนวิชาที่ลงทะเบียน ภาคต้น 2569 */}
              <div className="form-group">
                <label className="form-label">จำนวนวิชาที่ลงทะเบียน ภาคต้น 2569 *</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="12"
                  value={isEditingProfile ? editFormData.registered_courses_count || 6 : student.registered_courses_count || 6}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, registered_courses_count: Number(e.target.value) })}
                  style={{ fontWeight: 700, fontSize: '15px' }}
                />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  จำนวนวิชาที่ลงทะเบียนเรียน ในภาคต้น ปีการศึกษา 2569
                </div>
              </div>

              {/* FIELD จำนวนหน่วยกิตที่ลงทะเบียน ภาคต้น */}
              <div className="form-group">
                <label className="form-label">จำนวนหน่วยกิตที่ลงทะเบียน ภาคต้น *</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="25"
                  value={isEditingProfile ? editFormData.registered_credits_count || 19 : student.registered_credits_count || 19}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, registered_credits_count: Number(e.target.value) })}
                  style={{ fontWeight: 700, fontSize: '15px', color: '#E01A59' }}
                />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  จำนวนหน่วยกิตรวมในภาคเรียนนี้ (เกณฑ์ 15 - 22 หน่วยกิต)
                </div>
              </div>

              {/* FIELD GPAX */}
              <div className="form-group">
                <label className="form-label">GPAX (เกรดเฉลี่ยสะสม) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={isEditingProfile ? editFormData.gpax : student.gpax}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, gpax: Number(e.target.value) })}
                  style={{ fontWeight: 700, fontSize: '16px', color: '#059669' }}
                />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  เกรดเฉลี่ยสะสมล่าสุดตามใบรายงานผลการศึกษา
                </div>
              </div>
            </div>

            {/* Document Upload / Preview Cards for CR54 & CR60 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {/* CR54 CARD */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileSpreadsheet size={16} color="#E01A59" />
                      <span>แนบรายงานผลการลงทะเบียนเรียน CR54 *</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      เอกสารพิมพ์จากระบบสำนักทะเบียน (Office of Registrar)
                    </div>
                  </div>
                  <span className="badge badge-approved" style={{ fontSize: '10px' }}>✓ ผ่านการตรวจแล้ว</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                    📄 {student.cr54_filename || 'cr54_registration_term1.pdf'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewDocModal({
                        name: 'รายงานผลการลงทะเบียนเรียน (CR54)',
                        fileName: student.cr54_filename || 'cr54_registration_term1.pdf',
                        url: './assets/camp.jpg',
                        description: `จำนวน ${student.registered_courses_count || 6} วิชา, รวม ${student.registered_credits_count || 19} หน่วยกิต`
                      })}
                    >
                      <Eye size={12} /> ดูไฟล์
                    </button>
                    {isEditingProfile && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const docObj = documentsList.find(d => d.id === 'DOC-CR54') || {
                            id: 'DOC-CR54',
                            name: 'แบบรายงานผลการลงทะเบียนเรียน (CR54)',
                            description: 'รายงานผลการลงทะเบียนเรียน CR54'
                          };
                          setSelectedDocForUpload(docObj);
                          setShowUploadDocModal(true);
                        }}
                      >
                        <Upload size={12} /> อัปโหลดใหม่
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CR60 / TRANSCRIPT CARD */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCheck size={16} color="#E01A59" />
                      <span>แนบเกรด (CR60 / Transcript) *</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      ใบรายงานผลการศึกษาแสดงผลคะแนนและเกรดเฉลี่ยสะสม GPAX
                    </div>
                  </div>
                  <span className="badge badge-approved" style={{ fontSize: '10px' }}>✓ ผ่านการตรวจแล้ว</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                    📄 {student.cr60_filename || 'cr60_transcript_latest.pdf'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewDocModal({
                        name: 'ใบรายงานผลการศึกษาและแนบเกรด (CR60)',
                        fileName: student.cr60_filename || 'cr60_transcript_latest.pdf',
                        url: './assets/camp.jpg',
                        description: `เกรดเฉลี่ยสะสม GPAX: ${Number(student.gpax || 0).toFixed(2)}`
                      })}
                    >
                      <Eye size={12} /> ดูไฟล์
                    </button>
                    {isEditingProfile && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const docObj = documentsList.find(d => d.id === 'DOC-CR60') || {
                            id: 'DOC-CR60',
                            name: 'ใบรายงานผลการศึกษาและแนบเกรด (CR60 / Transcript)',
                            description: 'ใบรายงานผลการศึกษา CR60'
                          };
                          setSelectedDocForUpload(docObj);
                          setShowUploadDocModal(true);
                        }}
                      >
                        <Upload size={12} /> อัปโหลดใหม่
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4, 5, 6: ที่อยู่และการพักอาศัย (ตามภาพที่ 3, 4, และ 5) */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div className="card-title">
                  <Home size={18} color="#E01A59" />
                  <span>4. ที่อยู่และการพักอาศัยปัจจุบัน (Current Accommodation)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  ส่วนที่ 4 จาก 7: ระบุว่าพักอาศัยที่หอในมหาวิทยาลัย หรือหอนอก
                </div>
              </div>
            </div>

            {/* RADIO SELECTION: หอใน VS หอนอก */}
            <div style={{ background: '#FFF5F8', padding: '14px 18px', borderRadius: '10px', border: '1px solid #FCE7F3', marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#9D174D', marginBottom: '10px' }}>
                ที่อยู่ปัจจุบัน *
              </label>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isEditingProfile ? 'pointer' : 'default', fontWeight: 600, fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="accommodation_type"
                    value="หอใน"
                    checked={(isEditingProfile ? editFormData.accommodation_type : student.accommodation_type) !== 'หอนอก'}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, accommodation_type: 'หอใน' })}
                  />
                  <span>🏢 หอใน (หอพักนิสิตจุฬาฯ)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isEditingProfile ? 'pointer' : 'default', fontWeight: 600, fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="accommodation_type"
                    value="หอนอก"
                    checked={(isEditingProfile ? editFormData.accommodation_type : student.accommodation_type) === 'หอนอก'}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, accommodation_type: 'หอนอก' })}
                  />
                  <span>🏠 หอนอก (พักภายนอกมหาวิทยาลัย)</span>
                </label>
              </div>
            </div>

            {/* CONDITIONAL SUBSECTION: ส่วนที่ 5 จาก 7 พักที่หอใน */}
            {((isEditingProfile ? editFormData.accommodation_type : student.accommodation_type) !== 'หอนอก') && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>
                  <Building size={16} color="#E01A59" />
                  <span>ส่วนที่ 5 จาก 7: พักที่หอใน</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
                  โปรดระบุ ตึก/ห้อง/เตียง เช่น อยู่ตึก จำปา ห้อง 404 เตียง D ให้กรอกเป็น <strong>จำปา/404/D</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: '#E01A59' }}>
                      ตึก/ห้อง/เตียง *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น จำปา/404/D หรือ พุดตาน/302/B"
                      value={isEditingProfile ? editFormData.dorm_room_bed || '' : student.dorm_room_bed || 'จำปา/404/D'}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, dorm_room_bed: e.target.value })}
                      style={{ fontWeight: 700, fontSize: '15px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ชื่อหอพักนิสิต</label>
                    <input
                      type="text"
                      className="form-control"
                      value={isEditingProfile ? editFormData.dormitory || 'หอพักพุดตาน' : student.dormitory || 'หอพักพุดตาน'}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, dormitory: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL SUBSECTION: ส่วนที่ 6 จาก 7 พักหอนอก */}
            {((isEditingProfile ? editFormData.accommodation_type : student.accommodation_type) === 'หอนอก') && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>
                  <Home size={16} color="#E01A59" />
                  <span>ส่วนที่ 6 จาก 7: พักหอนอก</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                  โปรดระบุที่อยู่ และอื่นๆ รายละเอียดค่าใช้จ่ายและประเภทที่อยู่
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">ที่อยู่หอนอก *</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      placeholder="ระบุชื่อหอพัก ซอย ถนน แขวง/ตำบล เขต/อำเภอ"
                      value={isEditingProfile ? editFormData.external_dorm_address || '' : student.external_dorm_address || 'หอพักสุขสบาย ซอยจุฬา 42 ถ.พญาไท แขวงวังใหม่ เขตปทุมวัน กทม. 10330'}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, external_dorm_address: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">อาศัยอยู่กับ *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น อยู่คนเดียว, รูมเมทเพื่อนคณะวิศวะ 1 คน"
                      value={isEditingProfile ? editFormData.external_dorm_roommate || '' : student.external_dorm_roommate || 'อยู่กับเพื่อนร่วมรุ่น คณะวิศวกรรมศาสตร์ 1 คน'}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, external_dorm_roommate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">ประเภทที่อยู่ *</label>
                    <select
                      className="form-control"
                      value={isEditingProfile ? editFormData.external_dorm_type || 'ห้องเช่ารายเดือน' : student.external_dorm_type || 'ห้องเช่ารายเดือน'}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, external_dorm_type: e.target.value })}
                    >
                      <option value="ห้องเช่ารายเดือน">ห้องเช่ารายเดือน</option>
                      <option value="บ้านญาติ">บ้านญาติ</option>
                      <option value="อพาร์ทเม้นต์">อพาร์ทเม้นต์</option>
                      <option value="คอนโดมิเนียม">คอนโดมิเนียม</option>
                      <option value="บ้านเพื่อน">บ้านเพื่อน</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">ค่าใช้จ่ายต่อเดือน *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น ค่าเช่า 5,000 บาท/เดือน (หารคนละครึ่งเหลือ 2,500), ค่าน้ำ 100 บาท, ค่าไฟ 450 บาท"
                      value={isEditingProfile ? editFormData.external_dorm_expenses || '' : student.external_dorm_expenses || 'ค่าเช่าห้อง 5,000 บาท/เดือน (หารคนละครึ่งเหลือ 2,500), ค่าน้ำ 100 บาท, ค่าไฟ 450 บาท'}
                      disabled={!isEditingProfile}
                      onChange={(e) => setEditFormData({ ...editFormData, external_dorm_expenses: e.target.value })}
                    />
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      💡 <em>ถ้ามีค่าใช้จ่ายที่เกี่ยวข้อง ค่าเช่า ค่าน้ำ ค่าไฟ ให้นิสิตระบุมาด้วย แยกเป็นข้อๆ ได้เลยนะคะ</em>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ที่อยู่ตามทะเบียนบ้าน */}
            <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                ที่อยู่ภูมิลำเนาตามทะเบียนบ้านเดิม:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">ที่อยู่ (บ้านเลขที่/หมู่/ซอย/ถนน)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={isEditingProfile ? editFormData.address_line : student.address_line}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, address_line: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ตำบล / แขวง</label>
                  <input
                    type="text"
                    className="form-control"
                    value={isEditingProfile ? editFormData.subdistrict : student.subdistrict}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, subdistrict: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">อำเภอ / เขต</label>
                  <input
                    type="text"
                    className="form-control"
                    value={isEditingProfile ? editFormData.district : student.district}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">จังหวัด</label>
                  <input
                    type="text"
                    className="form-control"
                    value={isEditingProfile ? editFormData.province : student.province}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, province: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    className="form-control"
                    value={isEditingProfile ? editFormData.postal_code : student.postal_code}
                    disabled={!isEditingProfile}
                    onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                    style={{ background: isEditingProfile ? '#FFFFFF' : '#F8FAFC' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: จดหมายลับถึงศูนย์ฯ (ตามภาพที่ 1 เป๊ะ) */}
          <div className="card" style={{ border: '2px solid #FCE7F3', background: '#FFFDFE' }}>
            <div className="card-header" style={{ borderBottom: '1px solid #FCE7F3', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="#E01A59" />
                  <span style={{ color: '#831843', fontWeight: 800 }}>ส่วนที่ 7 จาก 7: จดหมายลับถึงศูนย์ฯ</span>
                </div>
                <div style={{ fontSize: '11px', color: '#BE185D', marginTop: '2px' }}>
                  🔒 ข้อมูลความลับเฉพาะบุคคล • มีเพียงอาจารย์ที่ปรึกษาและเจ้าหน้าที่ศูนย์ฯ เท่านั้นที่สามารถอ่านได้
                </div>
              </div>
              <span className="badge badge-chula" style={{ fontSize: '10px' }}>
                {student.confidential_letter_reply ? '💬 ศูนย์ฯ ได้ตอบกลับแล้ว' : '⏳ รอการตอบกลับ'}
              </span>
            </div>

            <div style={{ background: '#FFF1F2', padding: '14px 16px', borderRadius: '10px', border: '1px solid #FECDD3', marginBottom: '14px', fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
              <strong>คำชี้แจงจากศูนย์จุฬาฯ-ชนบท:</strong><br />
              หากนิสิตมีความกังวลใจ ไม่ว่าจะเป็นเรื่องผลการเรียน การปรับตัว การใช้ชีวิต หรือมีเรื่องราวใดที่อยากแจ้งให้ทางศูนย์ฯ รับทราบเป็นพิเศษ (หรือต้องการคำปรึกษา) สามารถระบุในช่องนี้ได้เลยครับ ทางศูนย์ฯ ยินดีรับฟังทุกเรื่องราวเพื่อนำไปเป็นข้อมูลในการดูแลนิสิตต่อไป
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#9D174D' }}>
                อยู่ตรงนี้นะคะ (ข้อความคำตอบแบบยาว) *
              </label>
              <textarea
                rows={4}
                className="form-control"
                placeholder="ระบุข้อความ เรื่องราวความกังวลใจ หรือสิ่งที่ต้องการปรึกษากับอาจารย์และพี่เจ้าหน้าที่ศูนย์ฯ ได้ที่นี่เลยค่ะ..."
                value={isEditingProfile ? editFormData.confidential_letter || '' : student.confidential_letter || ''}
                disabled={!isEditingProfile}
                onChange={(e) => setEditFormData({ ...editFormData, confidential_letter: e.target.value })}
                style={{ fontSize: '13px', lineHeight: 1.6, background: isEditingProfile ? '#FFF' : '#FDF2F8' }}
              />
            </div>

            {/* กล่องแสดงการตอบกลับของอาจารย์/เจ้าหน้าที่ที่ปรึกษา */}
            {student.confidential_letter_reply && (
              <div style={{ marginTop: '16px', background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid #86EFAC', borderRadius: '10px', padding: '14px 18px', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={16} color="#16A34A" />
                    <span>คำแนะนำและการดูแลจากพี่เจ้าหน้าที่ / อาจารย์ศูนย์จุฬาฯ-ชนบท:</span>
                  </div>
                  <span className="badge badge-approved" style={{ fontSize: '10px' }}>Counselor Note</span>
                </div>
                <div style={{ fontSize: '13px', color: '#14532D', lineHeight: 1.6 }}>
                  "{student.confidential_letter_reply}"
                </div>
              </div>
            )}
          </div>

          {/* Section 8: บัญชีธนาคารสำหรับรับเงินโอนทุนการศึกษา */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div className="card-title">
                <CreditCard size={18} color="#E01A59" />
                <span>บัญชีธนาคารสำหรับรับเงินโอนทุนการศึกษา (Disbursement Bank Account)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">ชื่อบัญชีธนาคาร</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.bank_account_name : student.bank_account_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, bank_account_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">เลขที่บัญชีธนาคาร</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.bank_account_number : student.bank_account_number}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, bank_account_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ธนาคาร</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.bank_name : student.bank_name}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, bank_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อสาขา</label>
                <input
                  type="text"
                  className="form-control"
                  value={isEditingProfile ? editFormData.bank_branch : student.bank_branch}
                  disabled={!isEditingProfile}
                  onChange={(e) => setEditFormData({ ...editFormData, bank_branch: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">สำเนาหน้าสมุดบัญชีธนาคาร (ที่ผูกรหัสนิสิต)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={student.bank_book_file_url}
                    alt="Bank book copy"
                    style={{ width: '90px', height: '56px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                    onClick={() => setPreviewDocModal({
                      name: 'สำเนาหน้าสมุดบัญชีธนาคาร SCB',
                      fileName: 'scb_account_verified.jpg',
                      url: student.bank_book_file_url,
                      description: `เลขที่บัญชี: ${student.bank_account_number} (${student.bank_account_name})`
                    })}
                  />
                  <div>
                    <span className="badge badge-approved">✓ ผ่านการ Verify จากเจ้าหน้าที่แล้ว</span>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>scb_account_verified.jpg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INTEGRATED PDPA CONSENT SECTION (INCLUDED INSIDE PROFILE WORKFLOW) */}
          {isEditingProfile && (
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '12px',
              padding: '18px 20px',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E01A59', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                <ShieldCheck size={20} />
                <span>หนังสือให้ความยินยอมประมวลผลข้อมูลส่วนบุคคล (Integrated PDPA Consent)</span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                ข้าพเจ้ายินยอมให้ศูนย์จุฬาฯ-ชนบท จุฬาลงกรณ์มหาวิทยาลัย เก็บรวบรวม ใช้ และประมวลผลข้อมูลส่วนบุคคล ข้อมูลครอบครัว รายได้ ที่อยู่ปัจจุบัน และบัญชีธนาคารข้างต้น เพื่อวัตถุประสงค์ในการตรวจสอบคุณสมบัติ การพิจารณาอนุมัติทุนการศึกษา และการเบิกจ่ายเงินทุนผ่านฝ่ายการคลัง ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#1E293B' }}>
                <input
                  type="checkbox"
                  checked={pdpaProfileConsent}
                  onChange={(e) => setPdpaProfileConsent(e.target.checked)}
                />
                <span>ข้าพเจ้าได้ตรวจสอบความถูกต้องและให้ความยินยอมตามข้อตกลง PDPA ในการบันทึกการแก้ไขข้อมูล</span>
              </label>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(false)}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!pdpaProfileConsent}
                  onClick={handleSaveProfileChanges}
                >
                  <Save size={14} /> บันทึก & ส่งข้อมูลรายงานตัว (พร้อมแนบความยินยอม PDPA)
                </button>
              </div>
            </div>
          )}

          {/* Audit Log Table of Changes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <History size={18} color="#E01A59" />
                <span>ประวัติการขอแก้ไขข้อมูลส่วนตัว & สถานะการ Verify (Audit Log)</span>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>รหัสคำขอ</th>
                    <th>รายการที่มีการแก้ไข</th>
                    <th>ข้อมูลเดิม</th>
                    <th>ข้อมูลใหม่</th>
                    <th>วันเวลาที่ส่งคำขอ</th>
                    <th>สถานะ Verify</th>
                    <th>บันทึกจากเจ้าหน้าที่</th>
                  </tr>
                </thead>
                <tbody>
                  {changeRequests.map(cr => (
                    <tr key={cr.id}>
                      <td style={{ fontWeight: 600 }}>{cr.id}</td>
                      <td>{cr.field}</td>
                      <td style={{ color: '#EF4444' }}>{cr.oldValue}</td>
                      <td style={{ color: '#10B981', fontWeight: 600 }}>{cr.newValue}</td>
                      <td style={{ fontSize: '12px' }}>{cr.requestedAt}</td>
                      <td>
                        <span className={`badge ${cr.status === 'VERIFIED' ? 'badge-approved' : 'badge-review'}`}>
                          {cr.status === 'VERIFIED' ? '✓ ผ่านการ Verify แล้ว' : 'รอเจ้าหน้าที่ Verify'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>{cr.officerNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: สถานะทุน 4 ขั้นตอน (SCHOLARSHIP STAGES PIPELINE) */}
      {/* ========================================================================= */}
      {currentTab === 'student-scholarship' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Award size={18} color="#E01A59" />
                  <span>ขั้นตอนการพิจารณาและอนุมัติทุนการศึกษา (4-Stage Pipeline)</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  ติดตามสถานะอย่างโปร่งใสจากศูนย์จุฬาฯ-ชนบท สู่คณะกรรมการอาจารย์ และฝ่ายการคลัง
                </div>
              </div>
              <span className="badge badge-finance">
                สถานะปัจจุบัน: {SCHOLARSHIP_STAGES.find(s => s.id === student.scholarshipStatus)?.label}
              </span>
            </div>

            {/* Pipeline Step visual */}
            <div className="scholarship-pipeline-bar" style={{ margin: '24px 0 16px 0' }}>
              <div className="pipeline-connector">
                <div
                  className="pipeline-connector-fill"
                  style={{
                    width: student.scholarshipStatus === 'SENT_TO_FINANCE' ? '100%' :
                      student.scholarshipStatus === 'APPROVED' ? '66%' :
                        student.scholarshipStatus === 'UNDER_CONSIDERATION' ? '33%' : '5%'
                  }}
                />
              </div>

              {SCHOLARSHIP_STAGES.map((stage, idx) => {
                const isCurrent = stage.id === student.scholarshipStatus;
                const isDone = (
                  (student.scholarshipStatus === 'SENT_TO_FINANCE' && idx <= 3) ||
                  (student.scholarshipStatus === 'APPROVED' && idx <= 2) ||
                  (student.scholarshipStatus === 'UNDER_CONSIDERATION' && idx <= 1) ||
                  (student.scholarshipStatus === 'DOCUMENTS_RECEIVED' && idx === 0)
                );
                return (
                  <div key={stage.id} className={`pipeline-step ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}>
                    <div className="pipeline-step-node">
                      {isDone ? <Check size={18} /> : stage.step}
                    </div>
                    <div className="pipeline-step-title">{stage.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Stage details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '20px' }}>
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }}>
                  ขั้นตอนที่ 1: รับเอกสารแล้ว
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  เจ้าหน้าที่ตรวจสอบเอกสารสำคัญ 7 ฉบับ และภาพสแกนหลักฐานกิจกรรมเรียบร้อย
                </div>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }}>
                  ขั้นตอนที่ 2: อยู่ระหว่างพิจารณา
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  คะแนนกิจกรรมสะสมผ่านเกณฑ์ 40 แต้ม และส่งรายงานผลการเรียนให้คณะกรรมการ
                </div>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A', marginBottom: '4px' }}>
                  ขั้นตอนที่ 3: ผ่านการอนุมัติแล้ว
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  อาจารย์และคณะกรรมการลงนามอนุมัติทุนการศึกษาประจำภาคการศึกษาเรียบร้อย
                </div>
              </div>

              <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#1D4ED8', marginBottom: '4px' }}>
                  ขั้นตอนที่ 4: ส่งการคลังแล้ว
                </div>
                <div style={{ fontSize: '12px', color: '#2563EB' }}>
                  ส่งเอกสารเบิกจ่ายไปยังฝ่ายการคลัง มหาวิทยาลัย • <strong>คาดการณ์โอนเงิน: {student.estimatedPayoutDate}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: เอกสารสำคัญ (RENAMED FROM เอกสารสำคัญ 7 แบบ) */}
      {/* ========================================================================= */}
      {currentTab === 'student-documents' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileText size={18} color="#E01A59" />
                <span>เอกสารสำคัญ (Required Documents)</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                รายการเอกสารหลักฐานสำคัญประกอบการขอรับทุนการศึกษา • ส่งมอบทั้งไฟล์ดิจิทัลและฉบับจริง
              </div>
            </div>
            <span className="badge badge-approved">
              สถานะ: ส่งครบแล้ว ({documentsList.length} รายการ)
            </span>
          </div>

          {/* Integrated PDPA Notice inside Documents */}
          <div style={{
            background: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#475569'
          }}>
            <ShieldCheck size={18} color="#059669" />
            <span>
              <strong>การคุ้มครองข้อมูลส่วนบุคคล (PDPA):</strong> เอกสารสำคัญทุกฉบับได้รับการจัดเก็บอย่างปลอดภัย และใช้เพื่อวัตถุประสงค์ในการตรวจสอบคุณสมบัติรับทุนการศึกษาของศูนย์จุฬาฯ-ชนบทเท่านั้น
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ประเภทเอกสาร</th>
                  <th>คำอธิบาย</th>
                  <th>ไฟล์แนบดิจิทัล</th>
                  <th>วันที่อัปโหลด</th>
                  <th>กระดาษจริง</th>
                  <th>สถานะการตรวจสอบ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {documentsList.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{doc.name}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>หมวดหมู่: {doc.category || 'เอกสารสำคัญ'}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B', maxWidth: '240px' }}>
                      {doc.description}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({
                          name: doc.name,
                          fileName: doc.fileName,
                          url: doc.fileUrl || './assets/camp.jpg',
                          description: doc.description,
                          note: doc.officerNote,
                          status: doc.status
                        })}
                        style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '12px', color: '#2563EB', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        📄 {doc.fileName}
                      </button>
                    </td>
                    <td style={{ fontSize: '12px' }}>{doc.submittedDate}</td>
                    <td>
                      <span className={`badge ${doc.paperVerified ? 'badge-approved' : 'badge-review'}`}>
                        {doc.paperVerified ? '✓ ส่งฉบับจริงแล้ว' : 'รอส่งกระดาษ'}
                      </span>
                    </td>
                    <td>
                      {doc.status === 'APPROVED' && (
                        <div>
                          <span className="badge badge-approved">✓ ผ่านการอนุมัติแล้ว</span>
                          {doc.officerNote && (
                            <div style={{ fontSize: '11px', color: '#059669', marginTop: '3px', lineHeight: 1.3 }}>
                              💬 {doc.officerNote}
                            </div>
                          )}
                        </div>
                      )}
                      {doc.status === 'REJECTED' && (
                        <div>
                          <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                            ⚠️ ส่งกลับแก้ไข
                          </span>
                          {doc.officerNote && (
                            <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px', fontWeight: 600, lineHeight: 1.3 }}>
                              เหตุผล: {doc.officerNote}
                            </div>
                          )}
                        </div>
                      )}
                      {(!doc.status || doc.status === 'PENDING') && (
                        <div>
                          <span className="badge badge-review">⏳ รอเจ้าหน้าที่ตรวจสอบ</span>
                          {doc.officerNote && (
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', lineHeight: 1.3 }}>
                              {doc.officerNote}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPreviewDocModal({
                            name: doc.name,
                            fileName: doc.fileName,
                            url: doc.fileUrl || './assets/camp.jpg',
                            description: doc.description,
                            note: doc.officerNote,
                            status: doc.status
                          })}
                        >
                          <Eye size={12} /> ดูไฟล์
                        </button>
                        <button
                          type="button"
                          className={`btn ${doc.status === 'REJECTED' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => {
                            setSelectedDocForUpload(doc);
                            setShowUploadDocModal(true);
                          }}
                        >
                          <Upload size={12} /> {doc.status === 'REJECTED' ? 'อัปโหลดแก้ใหม่' : 'อัปโหลดใหม่'}
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
      {/* TAB 5: สะสมคะแนนกิจกรรม */}
      {/* ========================================================================= */}
      {currentTab === 'student-activities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Score Accumulation Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  เกณฑ์คะแนนกิจกรรมเพื่อพิจารณาอนุมัติทุน (40 คะแนน)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  สะสมแล้ว <strong>{student.accumulatedScore} คะแนน</strong> จากเกณฑ์ขั้นต่ำ <strong>{student.requiredScore} คะแนน</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowActivityModal(true)}
              >
                + ส่งคำขอกิจกรรมสะสมแต้ม
              </button>
            </div>

            <div className="score-progress-container" style={{ height: '22px' }}>
              <div
                className="score-progress-bar"
                style={{ width: `${Math.min(100, (student.accumulatedScore / 60) * 100)}%` }}
              >
                {student.accumulatedScore} แต้ม
              </div>
              <div className="score-threshold-pin" style={{ left: `${(student.requiredScore / 60) * 100}%` }} />
            </div>
          </div>

          {/* Activities List */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <CheckCircle size={18} color="#E01A59" />
                <span>บันทึกประวัติการเข้าร่วมกิจกรรมจิตอาสาและกิจกรรมศูนย์ฯ ({MOCK_ACTIVITIES.length} กิจกรรม)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_ACTIVITIES.map(act => (
                <div key={act.id} style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#FFF',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'
                }}>
                  <img
                    src={act.proofUrl}
                    alt={act.title}
                    style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1E293B' }}>{act.title}</div>
                      <span className="badge badge-approved" style={{ fontSize: '12px' }}>+{act.points} แต้ม</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      หมวด: <strong>{act.category}</strong> • จำนวนเวลา: <strong>{act.hours} ชั่วโมง</strong> • วันที่จัด: {act.date}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11px' }}>
                      <span style={{ color: '#059669', fontWeight: 600 }}>สถานะ: {act.status}</span>
                      <span style={{ color: '#64748B' }}>
                        เอกสารกระดาษ: <strong style={{ color: act.paperStatus === 'ส่งแล้ว' ? '#10B981' : '#F59E0B' }}>{act.paperStatus}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT NEW ACTIVITY WITH INTEGRATED PDPA CONSENT */}
      {/* ========================================================================= */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <CheckCircle color="#E01A59" size={20} />
                <span>แบบฟอร์มส่งคำขอบันทึกชั่วโมงกิจกรรมสะสม</span>
              </div>
              <button type="button" onClick={() => setShowActivityModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddActivity}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">ชื่อกิจกรรม</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="เช่น โครงการพี่สอนน้องโรงเรียนชนบท หรือ ค่ายอาสาช่วยเหลือชุมชน"
                    value={newActivityForm.title}
                    onChange={(e) => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">หมวดหมู่กิจกรรม</label>
                    <select
                      className="form-control"
                      value={newActivityForm.category}
                      onChange={(e) => setNewActivityForm({ ...newActivityForm, category: e.target.value })}
                    >
                      <option value="จิตอาสา">จิตอาสา/บำเพ็ญประโยชน์</option>
                      <option value="วิชาการ">วิชาการ/ทักษะชีวิต</option>
                      <option value="ศิลปวัฒนธรรม">ศิลปวัฒนธรรม</option>
                      <option value="ศูนย์จุฬาฯ-ชนบท">งานกิจกรรมศูนย์จุฬาฯ-ชนบท</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">จำนวนชั่วโมงที่เข้าร่วม</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="40"
                      value={newActivityForm.hours}
                      onChange={(e) => setNewActivityForm({ ...newActivityForm, hours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">แนบภาพสแกนใบประกาศ / ภาพถ่ายหลักฐานการเข้าร่วม</label>
                  <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '16px', textAlign: 'center', background: '#F8FAFC' }}>
                    <Upload size={24} color="#94A3B8" style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>รองรับไฟล์ JPG, PNG, PDF ขนาดไม่เกิน 10MB</div>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={newActivityForm.hasPhysicalPaper}
                      onChange={(e) => setNewActivityForm({ ...newActivityForm, hasPhysicalPaper: e.target.checked })}
                    />
                    <span>ข้าพเจ้าได้ส่งมอบหรือจะนำส่งเอกสารฉบับกระดาษจริงให้เจ้าหน้าที่ตรวจสอบด้วย</span>
                  </label>
                </div>

                {/* Integrated PDPA Notice in Activity Modal */}
                <div style={{ background: '#FFF1F2', padding: '12px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}>
                    <input
                      type="checkbox"
                      required
                      checked={newActivityForm.pdpaConsent}
                      onChange={(e) => setNewActivityForm({ ...newActivityForm, pdpaConsent: e.target.checked })}
                      style={{ marginTop: '2px' }}
                    />
                    <span>ข้าพเจ้ายินยอมให้ศูนย์จุฬาฯ-ชนบท ประมวลผลภาพถ่ายและหลักฐานการเข้าร่วมกิจกรรมเพื่อการพิจารณาทุนการศึกษาตามเกณฑ์ PDPA</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowActivityModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  ส่งคำขอกิจกรรมเข้าระบบ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD DOCUMENT WITH INTEGRATED PDPA CONSENT */}
      {/* ========================================================================= */}
      {showUploadDocModal && selectedDocForUpload && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <Upload color="#E01A59" size={20} />
                <span>อัปโหลดเอกสารสำคัญ: {selectedDocForUpload.name}</span>
              </div>
              <button type="button" onClick={() => setShowUploadDocModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUploadDocumentSubmit}>
              <div className="modal-body">
                <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                  {selectedDocForUpload.description}
                </div>

                <div className="form-group">
                  <label className="form-label">เลือกไฟล์เอกสารฉบับใหม่ (PDF / JPG / PNG)</label>
                  <div style={{ border: '2px dashed #E01A59', borderRadius: '8px', padding: '24px', textAlign: 'center', background: '#FFF5F8' }}>
                    <Upload size={28} color="#E01A59" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>คลิกเพื่อเลือกไฟล์เอกสารใหม่</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>ขนาดไฟล์ไม่เกิน 15 MB (รับรองสำเนาถูกต้อง)</div>
                  </div>
                </div>

                {/* Integrated PDPA Notice in Document Upload */}
                <div style={{ background: '#FFF1F2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}>
                    <input
                      type="checkbox"
                      required
                      checked={docUploadPdpaConsent}
                      onChange={(e) => setDocUploadPdpaConsent(e.target.checked)}
                      style={{ marginTop: '2px' }}
                    />
                    <span>ข้าพเจ้ายินยอมให้จัดเก็บและประมวลผลเอกสารหลักฐานสำคัญนี้เพื่อการพิจารณาทุนการศึกษาตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadDocModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={!docUploadPdpaConsent}>
                  ยืนยันการอัปโหลดไฟล์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: DOCUMENT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewDocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <Eye color="#E01A59" size={20} />
                <span>ตัวอย่างเอกสาร: {previewDocModal.name}</span>
              </div>
              <button type="button" onClick={() => setPreviewDocModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <img
                  src={previewDocModal.url || './assets/camp.jpg'}
                  alt={previewDocModal.name}
                  style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '10px' }}>
                  📄 {previewDocModal.fileName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {previewDocModal.description}
                </div>
              </div>

              {previewDocModal.note && (
                <div style={{ background: '#FFFBEB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
                  💬 <strong>บันทึกจากเจ้าหน้าที่:</strong> {previewDocModal.note}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewDocModal(null)}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT NEW REIMBURSEMENT REQUEST */}
      {/* ========================================================================= */}
      {showNewReimbursementModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <Receipt color="#E01A59" size={20} />
                <span>ยื่นคำร้องขอเบิกจ่ายเอกสาร (New Reimbursement Request)</span>
              </div>
              <button type="button" onClick={() => setShowNewReimbursementModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddNewReimbursement}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ background: '#FFF5F8', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #FCE7F3', fontSize: '12px', color: '#9D174D', lineHeight: 1.5 }}>
                  ℹ️ <strong>ระเบียบการเบิกจ่ายทุนจุฬาฯ-ชนบท:</strong> นิสิตสามารถยื่นใบเสร็จรับเงินฉบับจริงเพื่อขอเบิกจ่ายค่ารักษาพยาบาล ค่าลงทะเบียนเรียนภาคฤดูร้อน หรือค่าอุปกรณ์การศึกษาจำเป็นตามสิทธิ์ทุนได้ โดยระบบจะส่งเรื่องให้เจ้าหน้าที่ตรวจสอบและส่งการคลังเพื่อโอนเงินเข้าบัญชี SCB ของนิสิต
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">หมวดหมู่การเบิกจ่าย *</label>
                  <select
                    className="form-control"
                    value={newReimbursementForm.category}
                    onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, category: e.target.value })}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="MEDICAL">🩺 เบิกค่ารักษาพยาบาล (รพ.รัฐ / รพ.จุฬาฯ / ค่ายา)</option>
                    <option value="SUMMER_TUITION">☀️ ค่าเรียนฤดูร้อน (Summer Session / ค่าหน่วยกิต)</option>
                    <option value="OTHER_EXPENSES">📦 ค่าอื่นๆ (อุปกรณ์การเรียน / ชุดปฏิบัติการ / ค่าจำเป็น)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label">ชื่อรายการ / รายละเอียดค่าใช้จ่าย *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น ค่าตรวจรักษาผู้ป่วยนอกและค่ายา รพ.จุฬาลงกรณ์ หรือ ค่าลงทะเบียนวิชา 2302101 ภาคฤดูร้อน"
                    required
                    value={newReimbursementForm.title}
                    onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">สถานพยาบาล / หน่วยงานที่ออกใบเสร็จ</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย"
                      value={newReimbursementForm.institution}
                      onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, institution: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เลขที่ใบเสร็จรับเงิน / รหัสอ้างอิง</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น RC-2026-09882"
                      value={newReimbursementForm.receipt_no}
                      onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, receipt_no: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">วันที่ในใบเสร็จรับเงิน *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={newReimbursementForm.receipt_date}
                      onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, receipt_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">จำนวนเงินที่ขอเบิก (บาท) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="เช่น 2450"
                      required
                      min="1"
                      value={newReimbursementForm.amount_requested}
                      onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, amount_requested: e.target.value })}
                      style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}
                    />
                  </div>
                </div>

                {/* File Attachment */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">แนบไฟล์ใบเสร็จรับเงิน / ใบรับรองแพทย์ / หลักฐาน (PDF หรือ JPG) *</label>
                  <div style={{ border: '2px dashed #CBD5E1', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#F8FAFC' }}>
                    <Upload size={24} color="#64748B" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                      {newReimbursementForm.receipt_file_name || 'คลิกเพื่อเลือกไฟล์เอกสารใบเสร็จ'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 10MB
                    </div>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      id="reimb-file-input"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewReimbursementForm({
                            ...newReimbursementForm,
                            receipt_file_name: e.target.files[0].name
                          });
                        }
                      }}
                    />
                    <label htmlFor="reimb-file-input" className="btn btn-secondary btn-sm" style={{ marginTop: '8px', cursor: 'pointer', display: 'inline-block' }}>
                      เลือกไฟล์จากอุปกรณ์
                    </label>
                  </div>
                </div>

                {/* SCB Payout Account Confirmation */}
                <div style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} color="#4F46E5" />
                  <div>
                    โอนเงินเบิกจ่ายเข้าบัญชี: <strong>{student.bank_name || 'ธนาคารไทยพาณิชย์'} {student.bank_account_number}</strong> ({student.bank_account_name})
                  </div>
                </div>

                {/* PDPA Consent Checkbox */}
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#334155' }}>
                    <input
                      type="checkbox"
                      required
                      checked={newReimbursementForm.pdpaConsent}
                      onChange={(e) => setNewReimbursementForm({ ...newReimbursementForm, pdpaConsent: e.target.checked })}
                      style={{ marginTop: '2px' }}
                    />
                    <span>ข้าพเจ้าขอรับรองว่าข้อมูลและเอกสารใบเสร็จดังกล่าวเป็นความจริง และยินยอมให้ประมวลผลข้อมูลเพื่อการเบิกจ่ายทุนการศึกษาตามระเบียบ PDPA</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #F1F5F9' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewReimbursementModal(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newReimbursementForm.pdpaConsent}>
                  ยืนยันการส่งคำร้องเบิกจ่าย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
