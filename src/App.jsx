import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import PublicLandingPage from './views/PublicLandingPage';
import StudentDashboard from './views/StudentDashboard';
import FacultyDashboard from './views/FacultyDashboard';
import OfficerDashboard from './views/OfficerDashboard';
import { INITIAL_STUDENTS, NOTIFICATION_TEMPLATES } from './data/mockData';
import { Bell, X, CheckCheck, AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', margin: '40px auto', maxWidth: '640px', background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '14px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#E01A59' }}>
            <AlertCircle size={26} />
          </div>
          <h3 style={{ color: '#E01A59', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>เกิดข้อผิดพลาดในการแสดงผล</h3>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'ระบบเกิดข้อผิดพลาดในการโหลดข้อมูลชั่วคราว'}
          </p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            <RefreshCw size={16} /> โหลดหน้านี้ใหม่อีกครั้ง
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentRole, setCurrentRole] = useState('STUDENT'); // STUDENT | FACULTY | OFFICER
  const [activeTab, setActiveTab] = useState('student-dashboard');
  const [academicYear, setAcademicYear] = useState(2567);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [notifications, setNotifications] = useState(NOTIFICATION_TEMPLATES);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Active student object (Student #1)
  const currentStudent = students[0];

  const handleUpdateStudent = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.student_id === updatedStudent.student_id ? updatedStudent : s));
  };

  const handleSendOfficerAlert = (msg) => {
    const newNotice = {
      id: `NT-${Date.now()}`,
      target: 'เจ้าหน้าที่',
      channel: 'In-App Alert',
      title: 'แจ้งเตือนระบบ: คำขอใหม่จากนิสิต',
      content: msg
    };
    setNotifications([newNotice, ...notifications]);
  };

  // Faculty approves a single student
  const handleApproveStudent = (studentId) => {
    setStudents(prev => prev.map(s => {
      if (s.student_id === studentId) {
        return {
          ...s,
          scholarshipStatus: 'APPROVED'
        };
      }
      return s;
    }));

    const alertNotice = {
      id: `NT-${Date.now()}`,
      target: 'นิสิต',
      channel: 'LINE_OA & Email',
      title: `ผลการพิจารณาทุน: รหัส ${studentId} ผ่านการอนุมัติแล้ว`,
      content: 'คณะกรรมการอาจารย์ได้ทำการอนุมัติทุนการศึกษาของท่านเรียบร้อยแล้ว เตรียมเข้าสู่ขั้นตอนส่งการคลัง'
    };
    setNotifications([alertNotice, ...notifications]);
    alert(`อาจารย์ได้อนุมัติทุนการศึกษาให้นิสิต ${studentId} เรียบร้อยแล้ว! ระบบส่งเตือนผ่าน Line OA และ Email ทันที`);
  };

  // 1-Click Bulk Approval by Faculty (อนุมัติพร้อมกันทั้งหมดในคลิกเดียว)
  const handleBulkApproveAll = () => {
    setStudents(prev => prev.map(s => {
      if (s.accumulatedScore >= s.requiredScore && s.student_status !== 'พ้นสภาพ') {
        return {
          ...s,
          scholarshipStatus: 'APPROVED'
        };
      }
      return s;
    }));

    const alertNotice = {
      id: `NT-${Date.now()}`,
      target: 'ทุกคน',
      channel: 'LINE_OA & Email',
      title: 'ประกาศผลการอนุมัติทุนการศึกษาพร้อมกันทั้งรุ่น (Bulk Approval)',
      content: 'อาจารย์ผู้อนุมัติได้ลงนามอนุมัติทุนการศึกษาให้นิสิตที่มีคะแนนกิจกรรมผ่านเกณฑ์ทั้งหมดในคลิกเดียว'
    };
    setNotifications([alertNotice, ...notifications]);
    alert('🎉 อนุมัติทุนพร้อมกันทั้งหมดในคลิกเดียว (Bulk Approve) สำเร็จ! สถานะนิสิตทุกคนที่ผ่านเกณฑ์ปรับเป็น "ผ่านการอนุมัติแล้ว"');
  };

  // Officer verifies score and physical paper
  const handleVerifyDocumentScore = (studentId, pointsToAdd, paperVerified) => {
    setStudents(prev => prev.map(s => {
      if (s.student_id === studentId) {
        return {
          ...s,
          accumulatedScore: s.accumulatedScore + pointsToAdd,
          paperStatus: paperVerified ? 'ส่งแล้ว' : 'รอตรวจสอบ',
          scholarshipStatus: (s.accumulatedScore + pointsToAdd >= s.requiredScore) ? 'UNDER_CONSIDERATION' : s.scholarshipStatus
        };
      }
      return s;
    }));
  };

  // Officer bulk submits to Faculty (รวบรวมส่งต่อผู้อนุมัติ)
  const handleBulkSubmitToFaculty = () => {
    setStudents(prev => prev.map(s => {
      if (s.accumulatedScore >= s.requiredScore && s.scholarshipStatus === 'DOCUMENTS_RECEIVED') {
        return {
          ...s,
          scholarshipStatus: 'UNDER_CONSIDERATION'
        };
      }
      return s;
    }));

    const alertNotice = {
      id: `NT-${Date.now()}`,
      target: 'อาจารย์',
      channel: 'Email & In-App',
      title: 'เจ้าหน้าที่ได้ส่งสรุปรายชื่อนิสิตผ่านเกณฑ์ให้คณะกรรมการอาจารย์พิจารณาอนุมัติแล้ว (Bulk Submit)',
      content: 'มีนิสิตผ่านเกณฑ์สะสมคะแนน 40 แต้มครบถ้วน รออาจารย์กดอนุมัติในระบบ'
    };
    setNotifications([alertNotice, ...notifications]);
    alert('ส่งต่อรายชื่อนิสิตทั้งหมดให้คณะกรรมการอาจารย์ผู้อนุมัติเรียบร้อยแล้ว (Bulk Submit to Approver)!');
  };

  // Public Landing Page view
  if (activeTab === 'public-landing') {
    return (
      <PublicLandingPage 
        onLoginAsRole={(role) => {
          setCurrentRole(role);
          if (role === 'STUDENT') setActiveTab('student-dashboard');
          else if (role === 'FACULTY') setActiveTab('faculty-executive');
          else setActiveTab('officer-daily');
        }}
        onGoToDashboard={() => {
          if (currentRole === 'STUDENT') setActiveTab('student-dashboard');
          else if (currentRole === 'FACULTY') setActiveTab('faculty-executive');
          else setActiveTab('officer-daily');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Pink Chula Sidebar */}
      <Sidebar 
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={notifications.length}
      />

      <div className="main-wrapper">
        {/* Top Navbar */}
        <TopNavbar 
          currentRole={currentRole}
          setCurrentRole={(role) => {
            setCurrentRole(role);
            if (role === 'STUDENT') setActiveTab('student-dashboard');
            else if (role === 'FACULTY') setActiveTab('faculty-executive');
            else setActiveTab('officer-daily');
          }}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          notifications={notifications}
          onOpenNotifications={() => setShowNotificationDrawer(true)}
        />

        {/* Dynamic Views by Role & Tab */}
        <main>
          <ErrorBoundary>
            {currentRole === 'STUDENT' && (
              <StudentDashboard 
                student={currentStudent}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onUpdateStudent={handleUpdateStudent}
                onSendOfficerAlert={handleSendOfficerAlert}
              />
            )}

            {currentRole === 'FACULTY' && (
              <FacultyDashboard 
                students={students}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onApproveStudent={handleApproveStudent}
                onBulkApproveAll={handleBulkApproveAll}
              />
            )}

            {currentRole === 'OFFICER' && (
              <OfficerDashboard 
                students={students}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onVerifyDocumentScore={handleVerifyDocumentScore}
                onBulkSubmitToFaculty={handleBulkSubmitToFaculty}
                onUpdateStudent={handleUpdateStudent}
                academicYear={academicYear}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Notification Center Drawer */}
      {showNotificationDrawer && (
        <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '440px',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '16px' }}>
                <Bell color="#E01A59" size={20} />
                <span>ศูนย์แจ้งเตือนระบบ (Email & Line OA)</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowNotificationDrawer(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                รายการแจ้งเตือนอัตโนมัติถึง <strong>{currentRole}</strong> และกลุ่มผู้ใช้งาน
              </div>

              {notifications.map(item => (
                <div key={item.id} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="badge badge-chula" style={{ fontSize: '11px' }}>{item.channel}</span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>กลุ่ม: {item.target}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1E293B' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowNotificationDrawer(false)}
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
