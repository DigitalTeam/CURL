import React, { useState } from 'react';
import { 
  Award, 
  Calendar, 
  FileText, 
  Bell, 
  CheckCircle2, 
  Download, 
  Users, 
  Clock, 
  LogIn,
  AlertCircle,
  ExternalLink,
  HeartHandshake,
  Sparkles,
  MapPin,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { ACADEMIC_CALENDAR_EVENTS, SCHOLARSHIP_TYPES } from '../data/mockData';

export default function PublicLandingPage({ onLoginAsRole, onGoToDashboard }) {
  // Activity showcase data with the newly generated images
  const studentActivities = [
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
      description: 'การนำเสนอโครงงานนวัตกรรมเพื่อแก้ไขปัญหาในท้องถิ่น (Community Innovation Projects) พร้อมการแนะแนวการสะสมคะแนนกิจกรรมเพื่อพิจารณาอนุมัติทุน'
    }
  ];

  // News and PR announcements
  const prNewsList = [
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
    },
    {
      id: 3,
      title: 'แนวปฏิบัติการขอรับทุนการศึกษาและการตรวจสอบสถานะผ่านระบบพอร์ทัลนิสิต',
      date: '1 ต.ค. 2567',
      tag: 'แนวปฏิบัติ',
      isHot: false,
      summary: 'เพื่อความปลอดภัยของข้อมูลส่วนบุคคล (PDPA) นิสิตสามารถตรวจสอบสถานะการอนุมัติ 4 ขั้นตอนได้หลังจากเข้าสู่ระบบ'
    }
  ];

  // Official downloadable forms
  const downloadableDocuments = [
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
    },
    {
      id: 'DOC-FORM-04',
      title: 'แบบรายงานสำรวจสภาพความเป็นอยู่และที่พักอาศัย',
      filename: 'Home_Survey_Living_Condition_Form.pdf',
      filesize: '410 KB',
      description: 'แบบฟอร์มแนบภาพถ่ายบ้านและแผนที่พิกัดสำหรับการเยี่ยมบ้าน',
      version: 'ฉบับสำรวจ'
    },
    {
      id: 'DOC-FORM-05',
      title: 'คู่มือและเกณฑ์การพิจารณาอนุมัติทุนการศึกษา ศูนย์จุฬาฯ-ชนบท',
      filename: 'Chula_Rural_Scholarship_Manual_2567.pdf',
      filesize: '1.2 MB',
      description: 'ระเบียบว่าด้วยการให้ทุน วงเงิน และขั้นตอนการเบิกจ่ายกับฝ่ายการคลัง',
      version: 'e-Book PDF'
    }
  ];

  const handleDownload = (filename) => {
    alert(`ระบบกำลังจำลองการดาวน์โหลดไฟล์: ${filename}\n(ไฟล์ต้นแบบพร้อมนำไปกรอกข้อมูลเพื่อแนบในระบบ)`);
  };

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', fontFamily: "'Prompt', sans-serif" }}>
      {/* Top Main Navigation Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '16px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            background: 'linear-gradient(135deg, #E01A59 0%, #C01449 100%)',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '19px',
            boxShadow: '0 2px 8px rgba(224, 26, 89, 0.3)'
          }}>จุฬา</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '17px', color: '#0F172A', letterSpacing: '-0.01em' }}>
              ศูนย์จุฬาฯ-ชนบท จุฬาลงกรณ์มหาวิทยาลัย
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              ระบบจัดการเอกสารและการสะสมคะแนนกิจกรรมเพื่ออนุมัติทุนการศึกษา
            </div>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="#activities" style={{ fontSize: '13px', color: '#475569', fontWeight: 500, padding: '6px 8px' }}>ภาพกิจกรรม</a>
          <a href="#news" style={{ fontSize: '13px', color: '#475569', fontWeight: 500, padding: '6px 8px' }}>ข่าวประกาศ</a>
          <a href="#downloads" style={{ fontSize: '13px', color: '#475569', fontWeight: 500, padding: '6px 8px' }}>ดาวน์โหลดเอกสาร</a>
          <a href="#eligibility" style={{ fontSize: '13px', color: '#475569', fontWeight: 500, padding: '6px 8px' }}>เกณฑ์ทุน & ปฏิทิน</a>

          {/* Login Dropdown / Quick Access */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <button 
              type="button"
              onClick={() => onLoginAsRole('STUDENT')}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '20px', padding: '8px 18px', fontWeight: 600 }}
            >
              <LogIn size={15} /> เข้าสู่ระบบ (นิสิต/อาจารย์/เจ้าหน้าที่)
            </button>
          </div>
        </div>
      </header>

      {/* Clean Modern Welcome Hero (No red block) */}
      <section style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '36px 36px 32px 36px'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-chula" style={{ fontSize: '12px', padding: '4px 10px' }}>
                <Sparkles size={12} /> ยินดีต้อนรับสู่งานกิจการทุนการศึกษา
              </span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                รอบที่ 1/2567: ตัดรอบส่งเอกสาร 15 ตุลาคม 2567
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              พอร์ทัลกิจกรรมและการจัดการทุนการศึกษา ศูนย์จุฬาฯ-ชนบท
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px', maxWidth: '750px', lineHeight: 1.6 }}>
              ศูนย์รวมข่าวสารประชาสัมพันธ์ กิจกรรมบำเพ็ญประโยชน์ ค่ายอาสาพัฒนา เอกสารแบบฟอร์มคำขอทุน 
              สำหรับนิสิตโครงการชนบท ทั้งนี้เพื่อความปลอดภัยของข้อมูลส่วนบุคคล (PDPA) 
              <strong>นิสิตกรุณาเข้าสู่ระบบเพื่อตรวจสอบข้อมูลประวัติและสถานะการอนุมัติทุนส่วนบุคคล</strong>
            </p>
          </div>

          {/* Quick Login Role Pills for paired testing */}
          <div style={{
            background: '#F8FAFC',
            padding: '14px 20px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              เข้าใช้งานระบบตามบทบาท (Role Login):
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => onLoginAsRole('STUDENT')}
                className="btn btn-sm"
                style={{ background: '#E01A59', color: 'white', borderRadius: '14px', fontSize: '12px' }}
              >
                🎓 เข้าสู่ระบบนิสิต
              </button>
              <button 
                type="button" 
                onClick={() => onLoginAsRole('FACULTY')}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '14px', fontSize: '12px' }}
              >
                ⚖️ อาจารย์
              </button>
              <button 
                type="button" 
                onClick={() => onLoginAsRole('OFFICER')}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '14px', fontSize: '12px' }}
              >
                💼 เจ้าหน้าที่
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', margin: '32px auto 60px auto', padding: '0 24px' }}>

        {/* SECTION 1: Featured Student Activities Gallery (ออกค่าย, ช่วยน้ำท่วม, ปฐมนิเทศ) */}
        <section id="activities" style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartHandshake size={22} color="#E01A59" />
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  ภาพกิจกรรมนิสิตจิตอาสา & การสะสมคะแนนกิจกรรมเพื่อชุมชน
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                ภาพบรรยากาศจริงของนิสิตโครงการจุฬาฯ-ชนบท ในการลงพื้นที่บำเพ็ญประโยชน์ ออกค่ายพัฒนา และช่วยเหลือผู้ประสบภัย
              </p>
            </div>
            <span className="badge badge-chula" style={{ fontSize: '12px' }}>
              เกณฑ์สะสม 40 แต้ม
            </span>
          </div>

          {/* 3 Activity Cards with High-Res Generated Photos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '22px' }}>
            {studentActivities.map(act => (
              <div 
                key={act.id} 
                className="card" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                  <img 
                    src={act.image} 
                    alt={act.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {act.category}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: '#10B981',
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    {act.points}
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                    <Calendar size={13} />
                    <span>{act.date}</span>
                    <span>•</span>
                    <MapPin size={13} />
                    <span>{act.location}</span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', lineHeight: 1.4, marginBottom: '8px' }}>
                    {act.title}
                  </h3>

                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, flex: 1 }}>
                    {act.description}
                  </p>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                      ✓ มีการรับรองชั่วโมงเข้าระบบ
                    </span>
                    <button 
                      type="button" 
                      onClick={() => onLoginAsRole('STUDENT')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      ยื่นบันทึกกิจกรรมนี้ ➔
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Download Center (ศูนย์ดาวน์โหลดเอกสารที่ต้องเตรียมยื่น) */}
        <section id="downloads" style={{ marginBottom: '44px' }}>
          <div className="card" style={{ padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={22} color="#E01A59" />
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                    ศูนย์ดาวน์โหลดเอกสารและแบบฟอร์มที่ต้องเตรียมยื่นในระบบ
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  ดาวน์โหลดแบบฟอร์มทางการ นำไปกรอกและลงลายมือชื่อ พร้อมแนบไฟล์สแกนเข้าระบบพอร์ทัล
                </p>
              </div>

              <span className="badge badge-received">
                อัปเดตแบบฟอร์มปีการศึกษา 2567
              </span>
            </div>

            {/* Document Download List Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {downloadableDocuments.map((doc, idx) => (
                <div 
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#FAFAFA',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#FDE8EF',
                      color: '#E01A59',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        {doc.description} • <span style={{ color: '#059669', fontWeight: 500 }}>{doc.version}</span> ({doc.filesize})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => handleDownload(doc.filename)}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px', gap: '6px' }}
                    >
                      <Download size={14} /> ดาวน์โหลด PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', background: '#F1F5F9', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#0284C7" />
              <span>
                <strong>คำแนะนำ:</strong> เมื่อกรอกข้อมูลและลงนามเรียบร้อยแล้ว ให้นิสิตทำการ Login เข้าสู่ระบบเพื่อทำการอัปโหลดไฟล์ในเมนู <strong>"เอกสาร 7 แบบ"</strong>
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: 2-Columns (ข่าวประชาสัมพันธ์ & ปฏิทินรอบทุน) */}
        <section id="news" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          
          {/* News & PR */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Bell size={20} color="#E01A59" />
                <span>ข่าวสารประชาสัมพันธ์ ศูนย์จุฬาฯ-ชนบท</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {prNewsList.map(news => (
                <div key={news.id} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`badge ${news.isHot ? 'badge-rejected' : 'badge-received'}`}>
                      {news.tag}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{news.date}</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', lineHeight: 1.4 }}>
                    {news.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>
                    {news.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic & Cut-off Calendar */}
          <div id="eligibility" className="card">
            <div className="card-header">
              <div className="card-title">
                <Calendar size={20} color="#E01A59" />
                <span>ปฏิทินรอบทุน & กำหนดวันตัดรอบ (Cut-off)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ACADEMIC_CALENDAR_EVENTS.map(evt => (
                <div key={evt.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: evt.isCutoff ? '#FEF2F2' : '#F8FAFC',
                  border: evt.isCutoff ? '1px solid #FCA5A5' : '1px solid #E2E8F0'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: evt.isCutoff ? '#EF4444' : '#E2E8F0',
                    color: evt.isCutoff ? 'white' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    flexShrink: 0
                  }}>
                    {evt.id}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: evt.isCutoff ? '#991B1B' : '#1E293B' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: '12px', color: evt.isCutoff ? '#DC2626' : '#64748B', marginTop: '2px', fontWeight: 500 }}>
                      📅 {evt.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', background: '#FDF2F5', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#9F0837' }}>
              <strong>เกณฑ์การขอทุน:</strong> ต้องมีผลการเรียนสะสม GPAX ไม่ต่ำกว่าเกณฑ์ และมีคะแนนกิจกรรมจิตอาสาสะสมครบ 40 คะแนน
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '36px 24px', textAlign: 'center', fontSize: '13px' }}>
        <p style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>ศูนย์จุฬาฯ-ชนบท จุฬาลงกรณ์มหาวิทยาลัย</p>
        <p>อาคารจามจุรี 5 ชั้น 3 ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ 10330</p>
        <p style={{ marginTop: '12px', fontSize: '11px', color: '#64748B' }}>© 2026 Chula Rural Development Center. All rights reserved.</p>
      </footer>
    </div>
  );
}
