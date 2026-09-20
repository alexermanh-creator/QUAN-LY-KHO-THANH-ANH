// =========================================================================
// THÀNH AN ERP v4.0 - MODULE 05: HỒ SƠ THIẾT BỊ SERIAL 360° (05_Serial360.gs)
// Nghiệp vụ: Tra cứu toàn diện vòng đời Serial: Nguồn gốc, Xuất bán, Timeline, Bảo hành
// =========================================================================

function getSerial360Profile(serialNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tbSheet = ss.getSheetByName("SERIAL_MASTER") || ss.getSheetByName("V4_SERIAL_MASTER") || ss.getSheetByName("DATA_THIET_BI");
  if (!tbSheet || tbSheet.getLastRow() <= 1) return { found: false };

  const cleanSN = String(serialNumber || '').trim().toUpperCase();
  if (!cleanSN) return { found: false };

  // 1. Tìm vị trí dòng chỉ bằng cách quét cột Serial (Cột 1) - Tiết kiệm RAM 95%
  let targetRowIndex = -1;
  const lastRow = tbSheet.getLastRow();
  const serialCol = tbSheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < serialCol.length; i++) {
    if (String(serialCol[i][0] || '').trim().toUpperCase() === cleanSN) {
      targetRowIndex = i + 2; // Số thứ tự dòng thực tế trên Sheet
      break;
    }
  }

  if (targetRowIndex === -1) return { found: false };

  // 2. Chỉ đọc đúng 1 dòng duy nhất của Serial được tìm thấy (Tốc độ tức thì)
  const row = tbSheet.getRange(targetRowIndex, 1, 1, 17).getValues()[0];

  const today = new Date();
  today.setHours(0,0,0,0);

  let ngayNhapDate = null;
  let ngayNhapStr = "--/--/----";
  if (row[7] instanceof Date && !isNaN(row[7].getTime())) {
    ngayNhapDate = row[7];
    ngayNhapStr = Utilities.formatDate(row[7], "GMT+7", "dd/MM/yyyy");
  } else if (row[7]) {
    ngayNhapStr = String(row[7]).trim();
    if (ngayNhapStr.includes('-')) {
      const p = ngayNhapStr.split('-');
      ngayNhapDate = new Date(p[0], p[1] - 1, p[2]);
    } else if (ngayNhapStr.includes('/')) {
      const p = ngayNhapStr.split('/');
      ngayNhapDate = new Date(p[2], p[1] - 1, p[0]);
    }
  }

  let daysInSystem = 0;
  if (ngayNhapDate && !isNaN(ngayNhapDate.getTime())) {
    daysInSystem = Math.max(0, Math.floor((today - ngayNhapDate) / (1000 * 60 * 60 * 24)));
  }

  let ngayXuatStr = "--/--/----";
  if (row[10] instanceof Date) ngayXuatStr = Utilities.formatDate(row[10], "GMT+7", "dd/MM/yyyy");
  else if (row[10]) ngayXuatStr = String(row[10]).trim();

  let expStr = "--/--/----";
  let expDate = null;
  if (row[15] instanceof Date && !isNaN(row[15].getTime())) {
    expDate = row[15];
    expStr = Utilities.formatDate(row[15], "GMT+7", "dd/MM/yyyy");
  } else if (row[15]) {
    expStr = String(row[15]).trim();
    if (expStr.includes('/')) {
      const p = expStr.split('/');
      expDate = new Date(p[2], p[1] - 1, p[0]);
    }
  }

  let warrantyDiffDays = -999;
  let warrantyStatusColor = "GRAY";
  let warrantyStatusText = "Chưa kích hoạt";

  if (expDate && !isNaN(expDate.getTime())) {
    expDate.setHours(0,0,0,0);
    warrantyDiffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    if (warrantyDiffDays > 30) {
      warrantyStatusColor = "GREEN";
      warrantyStatusText = `🟢 Còn hạn (${warrantyDiffDays} ngày)`;
    } else if (warrantyDiffDays >= 0) {
      warrantyStatusColor = "YELLOW";
      warrantyStatusText = `🟡 Sắp hết hạn (còn ${warrantyDiffDays} ngày)`;
    } else {
      warrantyStatusColor = "RED";
      warrantyStatusText = `🔴 Hết hạn (quá hạn ${Math.abs(warrantyDiffDays)} ngày)`;
    }
  }

  const rawStatus = String(row[9] || '').trim();
  const isSold = (rawStatus === "Đã xuất" || rawStatus === "SOLD");
  const isVoid = (rawStatus === "VOID" || rawStatus === "CANCELLED");

  // XÂY DỰNG TIMELINE SỰ KIỆN
  const timelineEvents = [
    {
      title: "Nhập kho ban đầu",
      date: ngayNhapStr,
      description: `Phiếu nhập: ${row[8] || 'Chưa gán'} • Nhà cung cấp: ${row[6] || 'Chưa gán'} • Kho: ${row[5] || 'Kho VP'}`,
      type: "import"
    }
  ];

  if (isSold) {
    timelineEvents.push({
      title: "Xuất bán & Kích hoạt bảo hành",
      date: ngayXuatStr,
      description: `Phiếu xuất: ${row[11] || 'Chưa gán'} • Khách hàng: ${row[12] || 'Chưa gán'} (${row[13] || 'N/A'})`,
      type: "export"
    });
  }

  if (isVoid) {
    timelineEvents.push({
      title: "Hủy thiết bị khỏi kho (VOID)",
      date: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy"),
      description: `Thiết bị đã được hủy/void an toàn, bảo tồn lịch sử. Ghi chú: ${row[16] || 'N/A'}`,
      type: "void"
    });
  }

  timelineEvents.push({
    title: "Hiện trạng thiết bị",
    date: Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy"),
    description: isVoid ? `Đã hủy/void khỏi kho • Không còn hiệu lực giao dịch` : (isSold ? `Khách hàng đang sử dụng • Bảo hành đến ${expStr}` : `Đang lưu kho tại ${row[5] || 'Kho VP'} (Lưu kho: ${daysInSystem} ngày)`),
    type: isVoid ? "void" : (isSold ? "customer" : "stock")
  });

  return {
    found: true,
    serial: cleanSN,
    model: String(row[1] || '').trim(),
    productName: String(row[2] || '').trim(),
    category: String(row[3] || '').trim(),
    condition: String(row[4] || 'Mới 100%').trim(),
    warehouse: String(row[5] || 'Kho VP').trim(),
    currentStatus: rawStatus,
    isSold: isSold,
    isVoid: isVoid,
    daysInSystem: daysInSystem,
    importInfo: {
      receiptId: String(row[8] || 'Chưa gán').trim(),
      date: ngayNhapStr,
      supplier: String(row[6] || 'Chưa gán').trim()
    },
    exportInfo: isSold ? {
      receiptId: String(row[11] || '').trim(),
      date: ngayXuatStr,
      customerName: String(row[12] || '').trim(),
      customerPhone: String(row[13] || '').trim(),
      warrantyMonths: row[14] || 12
    } : null,
    warranty: {
      expirationDate: expStr,
      diffDays: warrantyDiffDays,
      statusColor: warrantyStatusColor,
      statusText: warrantyStatusText
    },
    timeline: timelineEvents,
    notes: String(row[16] || '').trim()
  };
}
