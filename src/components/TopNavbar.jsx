import React from 'react';
import { Bell, Calendar, Shield, ChevronDown, Check, AlertCircle } from 'lucide-react';

export default function TopNavbar({ 
  currentRole, 
  setCurrentRole, 
  academicYear, 
  setAcademicYear, 
  notifications,
  onOpenNotifications 
}) {
  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <div className="page-breadcrumb">
          <span>ระบบศูนย์จุฬาฯ-ชนบท</span>
          <span>/</span>
          <span className="current">
            {currentRole === 'STUDENT' && 'พอร์ทัลนิสิตผู้รับทุน'}
            {currentRole === 'FACULTY' && 'ระบบพิจารณาและอนุมัติทุน (อาจารย์)'}
            {currentRole === 'OFFICER' && 'ระบบบริหารจัดการหลังบ้าน (เจ้าหน้าที่)'}
          </span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Cut-off alert pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          color: '#B45309',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          <Calendar size={14} />
          <span>รอบที่ 1 ตัดรอบ: 15 ต.ค. 2567</span>
        </div>

        {/* Academic Year select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select 
            value={academicYear} 
            onChange={(e) => setAcademicYear(Number(e.target.value))}
            className="form-control"
            style={{ padding: '5px 10px', fontSize: '13px', width: 'auto', borderRadius: '20px' }}
          >
            <option value={2567}>ปีการศึกษา 2567</option>
            <option value={2566}>ปีการศึกษา 2566</option>
            <option value={2565}>ปีการศึกษา 2565 (ประวัติเก่า)</option>
          </select>
        </div>

        {/* Quick Role Switcher for seamless test interaction */}
        <div className="role-switcher-bar">
          <button 
            type="button"
            className={`role-pill-btn ${currentRole === 'STUDENT' ? 'active' : ''}`}
            onClick={() => setCurrentRole('STUDENT')}
          >
            นิสิต
          </button>
          <button 
            type="button"
            className={`role-pill-btn ${currentRole === 'FACULTY' ? 'active' : ''}`}
            onClick={() => setCurrentRole('FACULTY')}
          >
            อาจารย์
          </button>
          <button 
            type="button"
            className={`role-pill-btn ${currentRole === 'OFFICER' ? 'active' : ''}`}
            onClick={() => setCurrentRole('OFFICER')}
          >
            เจ้าหน้าที่
          </button>
        </div>

        {/* Notification Bell */}
        <button 
          type="button"
          onClick={onOpenNotifications}
          style={{
            background: 'none',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            color: '#64748B'
          }}
          title="การแจ้งเตือน"
        >
          <Bell size={20} />
          {notifications && notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              background: '#E01A59',
              borderRadius: '50%'
            }} />
          )}
        </button>
      </div>
    </header>
  );
}
