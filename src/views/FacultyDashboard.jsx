import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  CheckCircle, 
  PauseCircle, 
  XCircle, 
  Award, 
  DollarSign, 
  CheckCheck, 
  FileCheck, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  PieChart,
  BarChart,
  X,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Calendar,
  CreditCard,
  Building
} from 'lucide-react';
import { INITIAL_STUDENTS } from '../data/mockData';

export default function FacultyDashboard({ 
  students, 
  activeTab, 
  setActiveTab, 
  onApproveStudent, 
  onBulkApproveAll 
}) {
  // Normalize current tab from props or fallback to 'faculty-executive'
  const currentTab = (activeTab && activeTab.startsWith('faculty-')) 
    ? activeTab 
    : 'faculty-executive';

  const setTab = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
  };

  const [filterCohort, setFilterCohort] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentModalTab, setStudentModalTab] = useState('academic'); // academic | scholarship | contact | activities

  // Executive counts matching photo 1 & photo 3
  const totalStudentsCount = 125;
  const studyingCount = 97;
  const graduatedCount = 17;
  const suspendedCount = 3;
  const dismissedCount = 6;

  // Budget calculations
  const totalAllocatedBudget = 7200000; // 7.2 Million THB
  const approvedBudget = 5470000;
  const remainingBudget = totalAllocatedBudget - approvedBudget;

  const filteredStudents = students.filter(s => {
    if (filterCohort !== 'all' && !s.cohort_no.includes(filterCohort)) return false;
    if (filterFaculty !== 'all' && s.faculty_name !== filterFaculty) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.student_id.toLowerCase().includes(q) ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.province.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingApprovalCount = filteredStudents.filter(s => s.accumulatedScore >= s.requiredScore && s.scholarshipStatus !== 'APPROVED' && s.scholarshipStatus !== 'SENT_TO_FINANCE').length;

  // Helper to generate dynamic semester academic history
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
    const currentGpax = typeof student?.gpax === 'number' ? student.gpax : Number(student?.gpax || 3.45);
    return [
      { term: '1/2566', gpa: 3.50, gpax: 3.50, creditsTerm: 18, creditsTotal: 18, status: 'ปกติ (เกียรตินิยม)' },
      { term: '2/2566', gpa: 3.40, gpax: 3.45, creditsTerm: 18, creditsTotal: 36, status: 'ปกติ (เกียรตินิยม)' },
      { term: '1/2567', gpa: 3.55, gpax: 3.48, creditsTerm: 17, creditsTotal: 53, status: 'ปกติ (เกียรตินิยม)' },
      { term: '2/2567', gpa: 3.42, gpax: currentGpax, creditsTerm: 17, creditsTotal: 70, status: 'ปกติ' },
    ];
  };

  // Helper to generate dynamic scholarship payout history
  const getScholarshipHistory = (student) => {
    return [
      { term: '1/2566', type: 'ทุนค่าใช้จ่ายรายเดือน', amount: 25000, date: '25 ก.ย. 2566', status: 'โอนสำเร็จ', ref: 'TXN-6601-9821' },
      { term: '2/2566', type: 'ทุนค่าใช้จ่ายรายเดือน', amount: 25000, date: '25 ม.ค. 2567', status: 'โอนสำเร็จ', ref: 'TXN-6602-4412' },
      { term: '1/2567', type: 'ทุนค่าอุปกรณ์การศึกษา', amount: 6000, date: '10 ส.ค. 2567', status: 'โอนสำเร็จ', ref: 'TXN-6701-1190' },
      { term: '1/2567', type: 'ทุนค่าใช้จ่ายรายเดือน (รอบล่าสุด)', amount: 25000, date: student?.estimatedPayoutDate || '25 ต.ค. 2567', status: student?.scholarshipStatus === 'SENT_TO_FINANCE' ? 'ส่งการคลังแล้ว' : 'รออนุมัติ', ref: 'รอเลขที่เบิกจ่าย' },
    ];
  };

  return (
    <div className="content-body">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <span>12. Executive Dashboard & การพิจารณาอนุมัติทุน</span>
          </div>
          <div className="page-subtitle">
            ดูภาพรวม ➔ หลักสถิติตามผล ➔ ตัดสินใจอย่างมั่นใจ (อาจารย์และคณะกรรมการพิจารณาทุน)
          </div>
        </div>

        {/* 1-Click Bulk Approval Button */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-bulk-approve"
            onClick={() => onBulkApproveAll()}
          >
            <CheckCheck size={18} /> อนุมัติทุนพร้อมกันทั้งหมดในคลิกเดียว (Bulk Approve)
          </button>
        </div>
      </div>

      {/* 5 Executive Metric Cards (Matching Photo 1) */}
      <div className="metrics-grid">
        <div 
          className="metric-card total" 
          style={{ cursor: 'pointer' }}
          onClick={() => setTab('faculty-executive')}
          title="คลิกเพื่อดูภาพรวมสถิติ"
        >
          <div className="metric-icon-box">
            <Users size={22} />
          </div>
          <div>
            <div className="metric-label">จำนวนนิสิตในโครงการทั้งหมด</div>
            <div className="metric-val">{totalStudentsCount} <span className="metric-unit">คน</span></div>
            <div className="metric-note" style={{ color: '#059669' }}>↑ เพิ่มขึ้น 8 คน จากปีก่อนหน้า</div>
          </div>
        </div>

        <div 
          className="metric-card studying"
          style={{ cursor: 'pointer' }}
          onClick={() => setTab('faculty-approval')}
          title="คลิกเพื่อดูรายชื่อนิสิตกำลังเรียน"
        >
          <div className="metric-icon-box">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="metric-label">กำลังเรียน (พิจารณาทุน)</div>
            <div className="metric-val">{studyingCount} <span className="metric-unit">คน</span></div>
            <div className="metric-note">77.6% ของนิสิตทั้งหมด ➔</div>
          </div>
        </div>

        <div className="metric-card graduated">
          <div className="metric-icon-box">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="metric-label">จบการศึกษา</div>
            <div className="metric-val">{graduatedCount} <span className="metric-unit">คน</span></div>
            <div className="metric-note">13.6% ของนิสิตทั้งหมด</div>
          </div>
        </div>

        <div className="metric-card suspended">
          <div className="metric-icon-box">
            <PauseCircle size={22} />
          </div>
          <div>
            <div className="metric-label">พักการเรียน</div>
            <div className="metric-val">{suspendedCount} <span className="metric-unit">คน</span></div>
            <div className="metric-note">2.4% ของนิสิตทั้งหมด</div>
          </div>
        </div>

        <div 
          className="metric-card dismissed" 
          style={{ cursor: 'pointer' }}
          onClick={() => setTab('faculty-dismissed')}
          title="คลิกเพื่อดูรายละเอียด 6 รายชื่อที่พ้นสภาพ"
        >
          <div className="metric-icon-box">
            <XCircle size={22} />
          </div>
          <div>
            <div className="metric-label">พ้นสภาพ (คลิกดู)</div>
            <div className="metric-val" style={{ color: '#EF4444' }}>{dismissedCount} <span className="metric-unit">คน</span></div>
            <div className="metric-note" style={{ color: '#EF4444' }}>4.8% ของนิสิตทั้งหมด ➔</div>
          </div>
        </div>
      </div>

      {/* Synchronized Navigation Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setTab('faculty-executive')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: currentTab === 'faculty-executive' ? '3px solid #E01A59' : '3px solid transparent',
            color: currentTab === 'faculty-executive' ? '#E01A59' : '#64748B',
            fontWeight: currentTab === 'faculty-executive' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          📊 Executive Dashboard & สถิติภูมิศาสตร์ (Photo 1)
        </button>

        <button
          type="button"
          onClick={() => setTab('faculty-approval')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: currentTab === 'faculty-approval' ? '3px solid #E01A59' : '3px solid transparent',
            color: currentTab === 'faculty-approval' ? '#E01A59' : '#64748B',
            fontWeight: currentTab === 'faculty-approval' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>📋 ตารางพิจารณาอนุมัติทุน (Candidates & Approval)</span>
          <span className="badge badge-chula" style={{ fontSize: '10px' }}>{pendingApprovalCount} รออนุมัติ</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('faculty-dismissed')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: currentTab === 'faculty-dismissed' ? '3px solid #EF4444' : '3px solid transparent',
            color: currentTab === 'faculty-dismissed' ? '#EF4444' : '#64748B',
            fontWeight: currentTab === 'faculty-dismissed' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <XCircle size={15} color="#EF4444" />
          <span>รายชื่อนิสิตพ้นสภาพ (6 คน - Photo 3)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('faculty-budget')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: currentTab === 'faculty-budget' ? '3px solid #E01A59' : '3px solid transparent',
            color: currentTab === 'faculty-budget' ? '#E01A59' : '#64748B',
            fontWeight: currentTab === 'faculty-budget' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          💰 งบประมาณและการคลัง
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE DASHBOARD & GEOGRAPHY (Photo 1) */}
      {/* ========================================================================= */}
      {currentTab === 'faculty-executive' && (
        <div>
          {/* Budget Overview Quick Strip */}
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #FFF 0%, #F8FAFC 100%)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>ยอดรวมงบประมาณทุนจัดสรร</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>฿{totalAllocatedBudget.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#10B981' }}>งบศูนย์จุฬาฯ-ชนบท ประจำปี 2567</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>ยอดงบประมาณที่อนุมัติแล้ว</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#E01A59' }}>฿{approvedBudget.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>คิดเป็น {Math.round((approvedBudget/totalAllocatedBudget)*100)}% ของงบประมาณ</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>จำนวนงบประมาณคงเหลือ</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>฿{remainingBudget.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#059669' }}>พร้อมรองรับการเบิกจ่ายรอบถัดไป</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => setTab('faculty-approval')}
                >
                  ไปที่ตารางพิจารณาอนุมัติ ➔
                </button>
              </div>
            </div>
          </div>

          {/* 2-Columns: Cohort/Geography & Academic Performance (Photo 1) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Left Card: Cohort / Geography Map */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <MapPin size={18} color="#E01A59" />
                  <span>Cohort / Geography (จังหวัดภูมิลำเนาผู้รับทุน)</span>
                </div>
              </div>

              <div className="thailand-map-container">
                {/* Thailand Choropleth Simulation */}
                <div style={{
                  width: '180px',
                  height: '240px',
                  background: 'linear-gradient(180deg, #FDF2F5 0%, #FCE7F0 100%)',
                  borderRadius: '12px',
                  border: '2px solid #FBCFE8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px' }}>🗺️</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9F0837', marginTop: '6px' }}>แผนที่ประเทศไทย</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>ความหนาแน่นผู้รับทุน</div>
                  <div style={{ marginTop: '12px', fontSize: '10px', textAlign: 'left', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '10px', height: '10px', background: '#9F0837', borderRadius: '2px' }} /> &gt; 10 คน
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ width: '10px', height: '10px', background: '#E01A59', borderRadius: '2px' }} /> 6 - 10 คน
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ width: '10px', height: '10px', background: '#F472B6', borderRadius: '2px' }} /> 1 - 5 คน
                    </div>
                  </div>
                </div>

                {/* Top Provinces Table */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#1E293B' }}>
                    จังหวัดที่มีนิสิตในโครงการมากที่สุด
                  </div>
                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                        <th style={{ textAlign: 'left', padding: '4px' }}>#</th>
                        <th style={{ textAlign: 'left', padding: '4px' }}>จังหวัด</th>
                        <th style={{ textAlign: 'right', padding: '4px' }}>จำนวน (คน)</th>
                        <th style={{ textAlign: 'right', padding: '4px' }}>สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { rank: 1, name: 'นครราชสีมา', count: 15, pct: '12.0%' },
                        { rank: 2, name: 'อุบลราชธานี', count: 14, pct: '11.2%' },
                        { rank: 3, name: 'ศรีสะเกษ', count: 12, pct: '9.6%' },
                        { rank: 4, name: 'ขอนแก่น', count: 9, pct: '7.2%' },
                        { rank: 5, name: 'มุกดาหาร', count: 8, pct: '6.4%' },
                        { rank: 6, name: 'เชียงราย', count: 7, pct: '5.6%' },
                        { rank: 7, name: 'เชียงใหม่', count: 6, pct: '4.8%' },
                      ].map(row => (
                        <tr key={row.rank} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '6px 4px', color: '#94A3B8' }}>{row.rank}</td>
                          <td style={{ padding: '6px 4px', fontWeight: 600 }}>{row.name}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{row.count}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', color: '#64748B' }}>{row.pct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Card: Academic Performance / GPAX (Photo 1) */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <BarChart size={18} color="#10B981" />
                  <span>Academic Performance (ช่วง GPAX เฉลี่ยสะสม)</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {[
                  { range: '< 2.00 (กลุ่มเสี่ยง)', count: 18, pct: '14.4%', color: '#EF4444' },
                  { range: '2.00 - 2.49', count: 35, pct: '28.0%', color: '#F59E0B' },
                  { range: '2.50 - 2.99', count: 48, pct: '38.4%', color: '#3B82F6' },
                  { range: '3.00 - 3.49', count: 62, pct: '49.6%', color: '#10B981' },
                  { range: '3.50 - 4.00 (เกียรตินิยม)', count: 44, pct: '35.2%', color: '#059669' },
                ].map(bar => (
                  <div key={bar.range}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600 }}>{bar.range}</span>
                      <span><strong>{bar.count} คน</strong> ({bar.pct})</span>
                    </div>
                    <div style={{ height: '14px', background: '#F1F5F9', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${(bar.count / 70) * 100}%`, height: '100%', background: bar.color, borderRadius: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: '#ECFDF5', borderRadius: '8px', fontSize: '12px', color: '#047857' }}>
                💡 สัดส่วนกิจกรรมเฉลี่ย: จิตอาสา 55% | วิชาการ 25% | ศูนย์จุฬาฯ-ชนบท 20% (คะแนนกิจกรรมผ่านเกณฑ์ 88.5%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ตารางพิจารณาอนุมัติทุน (Candidates & Approval) */}
      {/* ========================================================================= */}
      {currentTab === 'faculty-approval' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileCheck size={18} color="#E01A59" />
                <span>รายชื่อนิสิตผู้มีคุณสมบัติผ่านเกณฑ์คะแนนสะสม พร้อมพิจารณาอนุมัติ</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                อาจารย์สามารถกดอนุมัติทีละราย หรือกด "อนุมัติทุนพร้อมกันทั้งหมดในคลิกเดียว"
              </div>
            </div>

            {/* Filter Search & Bulk Approve */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, รหัส, จังหวัด..." 
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '220px', padding: '6px 10px', fontSize: '12px' }}
              />
              <button 
                type="button"
                className="btn btn-bulk-approve btn-sm"
                onClick={() => onBulkApproveAll()}
              >
                <CheckCheck size={14} /> อนุมัติทั้งหมด ({filteredStudents.length})
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>รหัสนิสิต</th>
                  <th>ชื่อ - นามสกุล</th>
                  <th>รุ่น / คณะ</th>
                  <th>จังหวัด</th>
                  <th>GPAX</th>
                  <th>คะแนนกิจกรรม (เกณฑ์ 40)</th>
                  <th>สถานะเอกสาร</th>
                  <th>สถานะการอนุมัติ</th>
                  <th>การตัดสินใจ</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const isPassed = student.accumulatedScore >= student.requiredScore && student.student_status !== 'พ้นสภาพ';
                  const isApproved = student.scholarshipStatus === 'APPROVED' || student.scholarshipStatus === 'SENT_TO_FINANCE';

                  return (
                    <tr key={student.student_id}>
                      <td style={{ fontWeight: 700 }}>
                        <span 
                          style={{ color: '#E01A59', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => setSelectedStudentForModal(student)}
                        >
                          {student.student_id}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={student.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 600 }}>{student.title} {student.first_name} {student.last_name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px' }}>{student.cohort_no} <br /><span style={{ color: '#64748B' }}>{student.faculty_name}</span></td>
                      <td>{student.province}</td>
                      <td style={{ fontWeight: 700, color: Number(student.gpax || 0) < 2.0 ? '#EF4444' : '#0F172A' }}>
                        {Number(student.gpax || 0).toFixed(2)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: isPassed ? '#10B981' : '#EF4444' }}>
                            {student.accumulatedScore}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>/ 40 แต้ม</span>
                          {isPassed ? (
                            <span className="badge badge-approved" style={{ fontSize: '10px' }}>ผ่านเกณฑ์</span>
                          ) : (
                            <span className="badge badge-rejected" style={{ fontSize: '10px' }}>ไม่ผ่าน</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${student.paperStatus === 'ส่งแล้ว' ? 'badge-approved' : 'badge-review'}`}>
                          {student.paperStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isApproved ? 'badge-finance' : 'badge-review'}`}>
                          {student.scholarshipStatus === 'SENT_TO_FINANCE' ? 'ส่งการคลังแล้ว' :
                           student.scholarshipStatus === 'APPROVED' ? 'อนุมัติแล้ว' : 
                           student.scholarshipStatus === 'UNDER_CONSIDERATION' ? 'รออนุมัติ' : 'รับเอกสารแล้ว'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={isApproved || !isPassed}
                            onClick={() => onApproveStudent(student.student_id)}
                            style={{ opacity: isApproved ? 0.6 : 1 }}
                          >
                            {isApproved ? '✓ อนุมัติแล้ว' : 'อนุมัติ'}
                          </button>
                          <button 
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedStudentForModal(student)}
                          >
                            ดูข้อมูลนิสิต
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
      {/* TAB 3: รายชื่อนิสิตพ้นสภาพ (6 คน - Photo 3) */}
      {/* ========================================================================= */}
      {currentTab === 'faculty-dismissed' && (
        <div className="card">
          <div className="card-header" style={{ borderBottom: '1px solid #FEE2E2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={18} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#991B1B' }}>พ้นสภาพ (6 คน)</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Executive Dashboard ➔ รายละเอียดสถานะ ➔ พ้นสภาพโครงการจุฬาฯ-ชนบท</div>
              </div>
            </div>
          </div>

          <div className="table-wrapper" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>รหัสนิสิต</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>รุ่น</th>
                  <th>คณะ / สาขา</th>
                  <th>ชั้นปีตอนพ้นสภาพ</th>
                  <th>วันที่พ้นสภาพ</th>
                  <th>GPAX ล่าสุด</th>
                  <th>จังหวัด</th>
                  <th>สาเหตุ / รายละเอียด</th>
                  <th>ข้อมูลนิสิต</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: '66700012-d', code: '66700012', name: 'น.ส. กัญญาภัค ศรีสุข', cohort: '2566', faculty: 'วิทยาศาสตร์ / เคมี', year: 'ปี 2', date: '15 พ.ค. 2568', gpax: 1.82, prov: 'มุกดาหาร', reason: 'ผลการเรียนไม่ถึงเกณฑ์ (GPA ต่ำกว่าเกณฑ์ติดต่อกัน)' },
                  { id: '66700027-d', code: '66700027', name: 'นาย อดุลภัทร พลอยดี', cohort: '2566', faculty: 'วิศวกรรมศาสตร์ / ไฟฟ้า', year: 'ปี 3', date: '2 ส.ค. 2568', gpax: 1.95, prov: 'ศรีสะเกษ', reason: 'ผลการเรียนไม่ถึงเกณฑ์' },
                  { id: '66700033-d', code: '66700033', name: 'น.ส. พิมพ์ชนก แสนดี', cohort: '2566', faculty: 'อักษรศาสตร์', year: 'ปี 2', date: '20 มิ.ย. 2568', gpax: 1.67, prov: 'อุบลราชธานี', reason: 'ลาออก (ส่วนตัว)' },
                  { id: '66600045-d', code: '66600045', name: 'นาย ธนวัฒน์ ใจกล้า', cohort: '2566', faculty: 'บริหารธุรกิจ', year: 'ปี 1', date: '18 ก.พ. 2568', gpax: 1.58, prov: 'นครราชสีมา', reason: 'ผลการเรียนไม่ถึงเกณฑ์' },
                  { id: '66500018-d', code: '66500018', name: 'น.ส. สุชาวดี ทองเปลว', cohort: '2565', faculty: 'วิทยาศาสตร์', year: 'ปี 3', date: '30 มิ.ย. 2568', gpax: 2.21, prov: 'ขอนแก่น', reason: 'ลาออก (ปัญหาส่วนตัว)' },
                  { id: '65400009-d', code: '65400009', name: 'นาย ณัฐวุฒิ เปี่ยมคำ', cohort: '2565', faculty: 'ครุศาสตร์ / คณิต', year: 'ปี 2', date: '5 พ.ค. 2568', gpax: 1.74, prov: 'เชียงราย', reason: 'ผลการเรียนไม่ถึงเกณฑ์' },
                ].map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: '#EF4444' }}>{item.code}</td>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.cohort}</td>
                    <td>{item.faculty}</td>
                    <td>{item.year}</td>
                    <td style={{ fontSize: '12px' }}>{item.date}</td>
                    <td style={{ fontWeight: 700, color: '#EF4444' }}>{item.gpax.toFixed(2)}</td>
                    <td>{item.prov}</td>
                    <td style={{ fontSize: '12px', color: '#991B1B' }}>{item.reason}</td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedStudentForModal({
                          student_id: item.code,
                          first_name: item.name.split(' ')[1] || item.name,
                          last_name: item.name.split(' ')[2] || '',
                          title: item.name.split(' ')[0],
                          faculty_name: item.faculty,
                          gpax: item.gpax,
                          student_status: 'พ้นสภาพ',
                          dismissed_date: item.date,
                          dismissed_reason: item.reason,
                          phone_number: '081-234-5678',
                          province: item.prov,
                          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'
                        })}
                      >
                        ดูข้อมูลนิสิต
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: งบประมาณและการคลัง */}
      {/* ========================================================================= */}
      {currentTab === 'faculty-budget' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="#E01A59" />
              <span>สรุปสถานะงบประมาณและการคลัง ทุนการศึกษาประจำปี 2567</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>งบประมาณจัดสรรทั้งหมด</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>฿{totalAllocatedBudget.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#10B981' }}>รองรับนิสิตโครงการชนบท 125 ราย</div>
            </div>

            <div style={{ background: '#FDF2F5', padding: '18px', borderRadius: '12px', border: '1px solid #FCE7F0' }}>
              <div style={{ fontSize: '12px', color: '#9F0837' }}>งบประมาณที่อนุมัติและเบิกจ่ายแล้ว</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#E01A59', margin: '4px 0' }}>฿{approvedBudget.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#E01A59' }}>คิดเป็น {((approvedBudget/totalAllocatedBudget)*100).toFixed(1)}% ของงบรวม</div>
            </div>

            <div style={{ background: '#ECFDF5', padding: '18px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '12px', color: '#065F46' }}>งบประมาณคงเหลือพร้อมจัดสรร</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: '4px 0' }}>฿{remainingBudget.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#059669' }}>ครอบคลุมค่าใช้จ่ายรอบถัดไป</div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>หมวดหมู่ทุน</th>
                  <th>วงเงินต่อคน</th>
                  <th>โควตาจัดสรร</th>
                  <th>อนุมัติแล้ว (คน)</th>
                  <th>ยอดเงินที่อนุมัติ (บาท)</th>
                  <th>ยอดคงเหลือ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, color: '#E01A59' }}>ทุนค่าใช้จ่ายรายเดือน</td>
                  <td>5,000 บาท/เดือน</td>
                  <td>100 คน</td>
                  <td>86 คน</td>
                  <td style={{ fontWeight: 700 }}>฿2,150,000</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>฿850,000</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#E01A59' }}>ทุนค่าอุปกรณ์และเครื่องแต่งกาย</td>
                  <td>6,000 บาท/คน</td>
                  <td>80 คน</td>
                  <td>60 คน</td>
                  <td style={{ fontWeight: 700 }}>฿360,000</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>฿120,000</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#E01A59' }}>ทุนค่าธรรมเนียมการศึกษา</td>
                  <td>ตามจ่ายจริง (~25,000 บ.)</td>
                  <td>120 คน</td>
                  <td>96 คน</td>
                  <td style={{ fontWeight: 700 }}>฿2,400,000</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>฿600,000</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, color: '#E01A59' }}>ทุนค่าที่พักหอพักนิสิต</td>
                  <td>8,000 บาท/เทอม</td>
                  <td>90 คน</td>
                  <td>70 คน</td>
                  <td style={{ fontWeight: 700 }}>฿560,000</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>฿160,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ข้อมูลนิสิต (ประวัติผลการเรียนแต่ละเทอม, ประวัติการรับทุน, หน่วยกิตสะสม) */}
      {/* ========================================================================= */}
      {selectedStudentForModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '780px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#E01A59" />
                <span>ข้อมูลนิสิต (Student Profile & Academic Records)</span>
              </div>
              <button type="button" onClick={() => setSelectedStudentForModal(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Header Profile Summary (Photo 3 Style) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <img 
                  src={selectedStudentForModal.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop'} 
                  alt="" 
                  style={{ width: '68px', height: '68px', borderRadius: '50%', border: '3px solid #E01A59', objectFit: 'cover' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                      {selectedStudentForModal.title} {selectedStudentForModal.first_name} {selectedStudentForModal.last_name}
                    </h3>
                    <span className={`badge ${selectedStudentForModal.student_status === 'พ้นสภาพ' ? 'badge-rejected' : 'badge-approved'}`}>
                      {selectedStudentForModal.student_status || 'กำลังเรียน'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    รหัสนิสิต: <strong>{selectedStudentForModal.student_id}</strong> • รุ่น <strong>{selectedStudentForModal.cohort_no || selectedStudentForModal.cohort || '2566'}</strong> • คณะ <strong>{selectedStudentForModal.faculty_name}</strong>
                  </div>
                  {selectedStudentForModal.student_status === 'พ้นสภาพ' && (
                    <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', background: '#FEF2F2', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      ⚠️ วันที่พ้นสภาพ: {selectedStudentForModal.dismissed_date} ({selectedStudentForModal.dismissed_reason})
                    </div>
                  )}
                </div>
              </div>

              {/* Sub Navigation Inside Student Modal */}
              <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${studentModalTab === 'academic' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStudentModalTab('academic')}
                >
                  <BookOpen size={14} /> ประวัติผลการเรียน & หน่วยกิตสะสม
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${studentModalTab === 'scholarship' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStudentModalTab('scholarship')}
                >
                  <Award size={14} /> ประวัติการรับทุน
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${studentModalTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStudentModalTab('activities')}
                >
                  <CheckCircle size={14} /> กิจกรรมจิตอาสา
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${studentModalTab === 'contact' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStudentModalTab('contact')}
                >
                  <Phone size={14} /> ข้อมูลการติดต่อ
                </button>
              </div>

              {/* TAB 1: ประวัติผลการเรียนแต่ละเทอม & หน่วยกิตสะสม (Photo 3 requirement) */}
              {studentModalTab === 'academic' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      ประวัติผลการเรียน (Academic Performance by Semester)
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      GPAX เฉลี่ยสะสม: <strong style={{ color: selectedStudentForModal.gpax < 2.0 ? '#EF4444' : '#059669', fontSize: '14px' }}>{Number(selectedStudentForModal.gpax || 3.45).toFixed(2)}</strong>
                    </span>
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          <th>ภาคการศึกษา</th>
                          <th>GPA ประจำภาค</th>
                          <th>GPAX สะสม</th>
                          <th>หน่วยกิตประจำภาค</th>
                          <th>หน่วยกิตสะสม</th>
                          <th>สถานะผลการเรียน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAcademicHistory(selectedStudentForModal).map(sem => (
                          <tr key={sem.term}>
                            <td style={{ fontWeight: 600 }}>{sem.term}</td>
                            <td>{Number(sem.gpa || 0).toFixed(2)}</td>
                            <td style={{ fontWeight: 700, color: Number(sem.gpax || 0) < 2.0 ? '#EF4444' : '#0F172A' }}>
                              {Number(sem.gpax || 0).toFixed(2)}
                            </td>
                            <td>{sem.creditsTerm} หน่วยกิต</td>
                            <td style={{ fontWeight: 700, color: '#2563EB' }}>
                              {sem.creditsTotal} หน่วยกิต
                            </td>
                            <td>
                              <span className={`badge ${sem.status.includes('พ้นสภาพ') || sem.status.includes('วิทยาทัณฑ์') ? 'badge-rejected' : 'badge-approved'}`}>
                                {sem.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '14px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                    📌 <strong>เกณฑ์สถานะวิทยาทัณฑ์:</strong> หาก GPAX ต่ำกว่า 1.75 ติดต่อกัน 2 ภาคการศึกษา หรือต่ำกว่า 1.50 ในภาคใดภาคหนึ่ง จะพ้นสภาพการเป็นนิสิตจุฬาฯ
                  </div>
                </div>
              )}

              {/* TAB 2: ประวัติการรับทุนการศึกษา (Photo 3 requirement) */}
              {studentModalTab === 'scholarship' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', marginBottom: '10px' }}>
                    ประวัติการได้รับเงินทุนการศึกษา (Payout & Disbursement History)
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr style={{ background: '#F8FAFC' }}>
                          <th>ภาคการศึกษา</th>
                          <th>ประเภททุน</th>
                          <th>จำนวนเงิน</th>
                          <th>วันที่เบิกจ่าย/โอนเงิน</th>
                          <th>สถานะการโอนเงิน</th>
                          <th>เลขอ้างอิง</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getScholarshipHistory(selectedStudentForModal).map((p, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{p.term}</td>
                            <td>{p.type}</td>
                            <td style={{ fontWeight: 700, color: '#059669' }}>฿{p.amount.toLocaleString()}</td>
                            <td style={{ fontSize: '12px' }}>{p.date}</td>
                            <td>
                              <span className={`badge ${p.status === 'โอนสำเร็จ' ? 'badge-approved' : 'badge-finance'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '11px', color: '#64748B' }}>{p.ref}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#475569', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
                    💳 <strong>บัญชีรับเงินโอน:</strong> {selectedStudentForModal.bank_name || 'ธนาคารไทยพาณิชย์'} เลขที่ {selectedStudentForModal.bank_account_number || '026-2-88912-3'}
                  </div>
                </div>
              )}

              {/* TAB 3: ประวัติกิจกรรมจิตอาสาสะสม */}
              {studentModalTab === 'activities' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      บันทึกกิจกรรมจิตอาสาและกิจกรรมศูนย์ฯ
                    </span>
                    <span className="badge badge-approved">
                      สะสม {selectedStudentForModal.accumulatedScore || 48} / 40 แต้ม (ผ่านเกณฑ์)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { name: 'ค่ายอาสาพัฒนาชนบท สร้างศาลาและลานเรียนรู้ จ.น่าน', hours: 24, pts: 15, date: '20-25 ก.ย. 2567', paper: 'ผ่านแล้ว' },
                      { name: 'ภารกิจจิตอาสาบรรเทาอุทกภัย ส่งมอบถุงยังชีพน้ำท่วม', hours: 16, pts: 12, date: '1-5 ต.ค. 2567', paper: 'ผ่านแล้ว' },
                      { name: 'ปฐมนิเทศและมหกรรมนวัตกรรมเพื่อชุมชน', hours: 8, pts: 10, date: '10 ต.ค. 2567', paper: 'ผ่านแล้ว' },
                    ].map((act, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>{act.name}</div>
                          <div style={{ color: '#64748B', marginTop: '2px' }}>วันที่: {act.date} • {act.hours} ชั่วโมง</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#E01A59' }}>+{act.pts} แต้ม</span>
                          <div style={{ color: '#059669', fontSize: '11px', marginTop: '2px' }}>✓ ตรวจกระดาษจริงแล้ว</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ข้อมูลการติดต่อ */}
              {studentModalTab === 'contact' && (
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Email มหาวิทยาลัย:</span>
                    <strong>{selectedStudentForModal.student_id}@chula.ac.th</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>เบอร์โทรศัพท์นิสิต:</span>
                    <strong>{selectedStudentForModal.phone_number || '081-234-5678'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>เบอร์ติดต่อฉุกเฉิน (ผู้ปกครอง):</span>
                    <strong>{selectedStudentForModal.emergency_phone || '089-876-5432'} ({selectedStudentForModal.emergency_relation || 'บิดา'})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>จังหวัดภูมิลำเนา:</span>
                    <strong>{selectedStudentForModal.province || 'มุกดาหาร'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>หอพักในมหาวิทยาลัย:</span>
                    <strong>{selectedStudentForModal.dormitory || 'หอพักพุดตาน (หอใน)'}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedStudentForModal(null)}>
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
