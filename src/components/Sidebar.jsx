import React from 'react';
import { 
  Home, 
  User, 
  FileText, 
  Award, 
  Calendar, 
  Bell, 
  CheckCircle, 
  Settings, 
  LogOut, 
  Users, 
  Upload, 
  BarChart2, 
  Clock, 
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function Sidebar({ currentRole, setCurrentRole, activeTab, setActiveTab, unreadCount }) {
  const getNavItems = () => {
    if (currentRole === 'STUDENT') {
      return [
        { id: 'student-dashboard', label: 'หน้าหลักนิสิต', icon: Home },
        { id: 'student-profile', label: 'ข้อมูลส่วนตัว', icon: User },
        { id: 'student-scholarship', label: 'สถานะทุน 4 ขั้นตอน', icon: Award },
        { id: 'student-documents', label: 'เอกสารสำคัญ', icon: FileText, badge: '7' },
        { id: 'student-activities', label: 'สะสมคะแนนกิจกรรม', icon: CheckCircle },
      ];
    } else if (currentRole === 'FACULTY') {
      return [
        { id: 'faculty-executive', label: 'Executive Dashboard', icon: BarChart2 },
        { id: 'faculty-approval', label: 'พิจารณาอนุมัติทุน', icon: CheckCircle, badge: '28' },
        { id: 'faculty-dismissed', label: 'รายชื่อพ้นสภาพ (6 คน)', icon: Users, badge: '6' },
        { id: 'faculty-budget', label: 'งบประมาณและการคลัง', icon: Award },
      ];
    } else {
      // OFFICER
      return [
        { id: 'officer-daily', label: 'งานที่ต้องทำวันนี้', icon: Clock, badge: '14' },
        { id: 'officer-screening', label: 'คัดกรองเอกสาร & คะแนน', icon: FileText, badge: 'ใหม่' },
        { id: 'officer-calendar', label: 'ปฏิทิน & ตัดรอบ Cut-off', icon: Calendar },
        { id: 'officer-notifications', label: 'ส่งแจ้งเตือน Email', icon: Bell },
        { id: 'officer-profile-verify', label: 'ตรวจสอบการแก้ Profile', icon: User, badge: '2' },
        { id: 'officer-audit-logs', label: 'ประวัติแก้ไข (Audit Logs)', icon: ShieldCheck },
        { id: 'officer-cms', label: 'จัดการหน้าแรก (CMS)', icon: Globe },
      ];
    }
  };

  const roleLabel = {
    STUDENT: 'นิสิตทุนการศึกษา',
    FACULTY: 'อาจารย์ (ผู้อนุมัติทุน)',
    OFFICER: 'เจ้าหน้าที่ศูนย์ฯ'
  };

  const roleName = {
    STUDENT: 'น.ส. กัญญาภัค ศรีสุข',
    FACULTY: 'ศ.ดร. นภดล สุวรรณเวช',
    OFFICER: 'นางสาวจุฬารัตน์ รุ่งเรือง'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">จุฬา</div>
        <div>
          <div className="sidebar-title">ศูนย์จุฬาฯ-ชนบท</div>
          <div className="sidebar-subtitle">ระบบจัดการเอกสาร & ทุนการศึกษา</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)', padding: '6px 12px' }}>
          เมนูการใช้งาน
        </div>

        {getNavItems().map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div 
              key={item.id} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          );
        })}

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)', margin: '14px 10px' }} />

        <div 
          className="nav-item" 
          onClick={() => setActiveTab('public-landing')}
          style={{ background: 'rgba(0,0,0,0.15)' }}
        >
          <Globe size={18} />
          <span>ดูหน้าแรกสาธารณะ</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-mini-profile">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" 
            alt="User avatar" 
            className="user-avatar" 
          />
          <div className="user-info">
            <div className="user-name">{roleName[currentRole]}</div>
            <div className="user-role-badge">{roleLabel[currentRole]}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
