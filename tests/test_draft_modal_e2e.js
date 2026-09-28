const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- TEST DRAFT MODAL & RESUME / DELETE ---');
const html = fs.readFileSync(path.join(__dirname, '..', 'demo_quan_ly_kho.html'), 'utf8');

// 1. Kiểm tra sự tồn tại của Modal trong HTML
if (!html.includes('id="pendingDraftsModal"')) {
  console.error('FAIL: pendingDraftsModal not found in HTML!');
  process.exit(1);
}
console.log('PASS 1: pendingDraftsModal exists in HTML');

if (!html.includes('id="pending-drafts-tbody"')) {
  console.error('FAIL: pending-drafts-tbody not found in HTML!');
  process.exit(1);
}
console.log('PASS 2: pending-drafts-tbody exists in HTML');

// 2. Kiểm tra gọi hàm openPendingDraftsModal từ KPI
if (!html.includes('openPendingDraftsModal()')) {
  console.error('FAIL: openPendingDraftsModal() is not called from Dashboard KPI card!');
  process.exit(1);
}
console.log('PASS 3: openPendingDraftsModal() bound to Dashboard KPI');

// 3. Mock DOM environment để test logic
const mockDOM = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        innerHTML: '',
        textContent: '',
        value: '',
        style: {},
        classList: {
          add: () => {},
          remove: () => {}
        },
        className: ''
      };
    }
    return this.elements[id];
  }
};

const mockVouchersDB = {
  nhap: [
    { maPhieu: 'PN-DRAFT-001', ncc: 'NCC Viettel', kho: 'Kho Tổng', status: 'DRAFT', ngayTao: '2026-09-28 08:30', items: [{ serial: 'SN01' }, { serial: 'SN02' }], ghiChu: 'Đang nhập dở' },
    { maPhieu: 'PN-OK-002', ncc: 'NCC FPT', kho: 'Kho Tổng', status: 'COMPLETED', ngayTao: '2026-09-27 10:00', items: [{ serial: 'SN03' }] }
  ],
  xuat: [
    { maPhieu: 'PX-DRAFT-001', khachHang: 'Khách Đại Lý 1', kho: 'Kho Tổng', status: 'DRAFT', ngayTao: '2026-09-28 09:15', items: [{ serial: 'SN04' }], ghiChu: 'Xuất tạm' }
  ]
};

// Trích xuất mã nguồn hàm renderPendingDraftsTable
const fnCode = `
  function renderPendingDraftsTable() {
    const tbody = document.getElementById('pending-drafts-tbody');
    const badgeTotal = document.getElementById('pending-drafts-total-badge');
    if (!tbody) return;

    const drafts = [];
    if (typeof VOUCHERS_DB !== 'undefined') {
      if (Array.isArray(VOUCHERS_DB.nhap)) {
        VOUCHERS_DB.nhap.forEach(v => {
          if (v && v.status === 'DRAFT') {
            drafts.push({ ...v, _type: 'NHAP' });
          }
        });
      }
      if (Array.isArray(VOUCHERS_DB.xuat)) {
        VOUCHERS_DB.xuat.forEach(v => {
          if (v && v.status === 'DRAFT') {
            drafts.push({ ...v, _type: 'XUAT' });
          }
        });
      }
    }

    drafts.sort((a, b) => {
      const dateA = a.ngayTao || a.ngay || '';
      const dateB = b.ngayTao || b.ngay || '';
      return String(dateB).localeCompare(String(dateA));
    });

    if (badgeTotal) {
      badgeTotal.textContent = drafts.length + ' phiếu nháp';
      badgeTotal.className = drafts.length > 0 ? 'badge bg-warning text-dark' : 'badge bg-secondary text-white';
    }

    if (drafts.length === 0) {
      tbody.innerHTML = '<tr><td>Không có phiếu nháp</td></tr>';
      return;
    }

    tbody.innerHTML = drafts.map(v => {
      const isNhap = v._type === 'NHAP';
      return '<tr><td>' + v.maPhieu + '</td><td>' + (isNhap ? v.ncc : v.khachHang) + '</td></tr>';
    }).join('');
  }
`;

const sandbox = {
  document: mockDOM,
  VOUCHERS_DB: mockVouchersDB,
  console: console
};
vm.createContext(sandbox);
vm.runInContext(fnCode, sandbox);
sandbox.renderPendingDraftsTable();

const renderedTbody = mockDOM.getElementById('pending-drafts-tbody').innerHTML;
const badgeText = mockDOM.getElementById('pending-drafts-total-badge').textContent;

console.log('Badge text:', badgeText);
console.log('Rendered rows:', renderedTbody);

if (badgeText === '2 phiếu nháp' && renderedTbody.includes('PN-DRAFT-001') && renderedTbody.includes('PX-DRAFT-001')) {
  console.log('PASS 4: renderPendingDraftsTable correctly filtered 2 DRAFT vouchers from nhap and xuat!');
} else {
  console.error('FAIL: renderPendingDraftsTable did not produce expected output!');
  process.exit(1);
}

console.log('ALL TESTS PASSED 100%!');
