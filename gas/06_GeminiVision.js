/**
 * MODULE 06: GEMINI VISION OCR ADAPTER (TẦNG 2 AI FALLBACK)
 * Hệ thống Quản Lý Kho Thành An
 * 
 * Nguyên tắc:
 * 1. API Key lưu trữ bảo mật tại PropertiesService.getScriptProperties().
 * 2. Model cấu hình linh hoạt (mặc định: gemini-3.8-flash với fallback gemini-3.5-flash-lite).
 * 3. Tự động bóc tách JSON, chống lỗi markdown code block.
 * 4. Tự động thử lại khi máy chủ AI bị nghẽn (Spikes in demand / HTTP 503).
 */

const GEMINI_SYSTEM_INSTRUCTION = `Bạn là chuyên gia OCR tem nhãn thiết bị kho vận chuyên nghiệp.
Nhiệm vụ: Đọc ảnh tem thiết bị / vỏ hộp và bóc tách CHÍNH XÁC Manufacturer Serial Number (Số Serial của thiết bị).

CÁC QUY TẮC BẮT BUỘC:
1. Nhận diện số Serial đi kèm các từ khóa: "Serial No", "Serial Number", "S/N", "SN", "(1P) Serial No", "Service Tag", "ST".
2. TUYỆT ĐỐI KHÔNG nhầm lẫn với:
   - Product Number / Part No (ví dụ: F6W14A, 4731C054CA, 2Z610A, W1470A...)
   - Model Name (ví dụ: LaserJet Pro MFP, Canon LBP...)
   - Mã vạch bán lẻ UPC / EAN (chuỗi 12-13 chữ số)
   - Địa chỉ MAC hoặc Regulatory / Postel ID.
3. Chỉ trả về duy nhất định dạng JSON thuần túy (không dùng markdown code blocks) theo cấu trúc:
{
  "serials": [
    {
      "serial": "CHUỖI_SERIAL_VIẾT_HOA",
      "confidence": 0.98,
      "detectedFrom": "Serial No. trên tem",
      "model": "Tên Model nếu thấy rõ"
    }
  ]
}`;

/**
 * Gọi Gemini Vision OCR để bóc tách Serial từ ảnh Base64
 * @param {string} base64Image - Chuỗi ảnh Base64 (có thể chứa hoặc không chứa data:image/...)
 * @param {string} mimeType - image/jpeg hoặc image/png
 * @returns {object} { success: boolean, serials: Array, model: string, duration: number, error?: string }
 */
function callGeminiVisionBackend(base64Image, mimeType) {
  const startTime = new Date().getTime();
  
  if (!base64Image) {
    return { success: false, error: 'Dữ liệu ảnh trống.' };
  }

  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');
  const configuredModel = props.getProperty('GEMINI_MODEL') || 'gemini-3.8-flash';

  if (!apiKey) {
    return {
      success: false,
      error: 'Hệ thống chưa được cấu hình GEMINI_API_KEY. Vui lòng vào Cài Đặt để cấu hình.'
    };
  }

  // Làm sạch chuỗi Base64
  let cleanBase64 = String(base64Image).trim();
  let detectedMime = mimeType || 'image/jpeg';

  const dataUriMatch = cleanBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (dataUriMatch) {
    detectedMime = dataUriMatch[1];
    cleanBase64 = cleanBase64.replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, '');
  }

  // Danh sách model thử nghiệm theo thứ tự ưu tiên
  const candidateModels = [
    configuredModel,
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-latest'
  ];
  // Loại bỏ model trùng lặp
  const uniqueModels = candidateModels.filter((m, idx) => candidateModels.indexOf(m) === idx);

  let lastError = '';

  for (let m = 0; m < uniqueModels.length; m++) {
    const currentModel = uniqueModels[m];
    
    // Thử gọi tối đa 2 lần cho mỗi model nếu gặp lỗi quá tải tạm thời (Spikes in demand / 503)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: GEMINI_SYSTEM_INSTRUCTION },
                {
                  inlineData: {
                    mimeType: detectedMime,
                    data: cleanBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        };

        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(currentModel) + ':generateContent?key=' + apiKey;
        const options = {
          method: 'post',
          contentType: 'application/json',
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(url, options);
        const statusCode = response.getResponseCode();
        const responseText = response.getContentText();

        if (statusCode === 200) {
          const parsed = JSON.parse(responseText);
          const candidate = parsed.candidates && parsed.candidates[0];
          const rawText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

          if (!rawText) {
            return {
              success: false,
              error: 'AI không trích xuất được văn bản nào từ ảnh này.'
            };
          }

          // Bóc tách làm sạch JSON (loại bỏ markdown blocks nếu có)
          let cleanedJsonStr = rawText.trim();
          if (cleanedJsonStr.startsWith('```json')) {
            cleanedJsonStr = cleanedJsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
          } else if (cleanedJsonStr.startsWith('```')) {
            cleanedJsonStr = cleanedJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          const resultObj = JSON.parse(cleanedJsonStr);
          const rawSerials = resultObj.serials || [];

          // Lọc Heuristic kiểm tra độ hợp lệ của Serial
          const validSerials = [];
          for (let i = 0; i < rawSerials.length; i++) {
            const item = rawSerials[i];
            let sn = String(item.serial || '').trim().toUpperCase();
            sn = sn.replace(/^[\[\(\{\#\:\s]+/, '').replace(/[\]\)\}\.\;\,\s]+$/, '').replace(/\s+/g, '');

            if (sn.length >= 6 && sn.length <= 24 && !/^\d{12,13}$/.test(sn)) {
              validSerials.push({
                serial: sn,
                confidence: item.confidence || 0.95,
                detectedFrom: item.detectedFrom || 'Gemini Vision AI',
                model: item.model || ''
              });
            }
          }

          const duration = new Date().getTime() - startTime;
          return {
            success: true,
            serials: validSerials,
            model: currentModel,
            duration: duration
          };
        }

        // Xử lý các mã lỗi cụ thể
        const errorJson = JSON.parse(responseText || '{}');
        const errorMsg = (errorJson.error && errorJson.error.message) ? errorJson.error.message : responseText;
        lastError = errorMsg;

        // Nếu gặp lỗi High demand / 503 / 429, chờ 1.5s và thử lại
        if (statusCode === 503 || errorMsg.includes('high demand') || statusCode === 429) {
          if (attempt === 1) {
            Utilities.sleep(1500);
            continue;
          }
        }

        // Nếu model không tồn tại hoặc deprecated, chuyển sang model kế tiếp trong danh sách
        if (statusCode === 404 || errorMsg.includes('not found') || errorMsg.includes('no longer available')) {
          break; // Thoát vòng lặp attempt để sang model kế tiếp
        }

        // Nếu là lỗi Invalid API Key (400 hoặc 403), dừng ngay báo người dùng
        if (statusCode === 400 && errorMsg.includes('API key not valid')) {
          return {
            success: false,
            error: 'API Key không hợp lệ. Vui lòng kiểm tra lại Google AI Studio API Key.'
          };
        }

      } catch (err) {
        lastError = err.message;
      }
    }
  }

  const totalDuration = new Date().getTime() - startTime;
  return {
    success: false,
    error: 'Lỗi bóc tách AI: ' + lastError,
    duration: totalDuration
  };
}

/**
 * Kiểm tra kết nối với Gemini API
 * @param {string} testApiKey - API Key cần kiểm tra (nếu bỏ trống thì dùng Key đã lưu trong hệ thống)
 * @param {string} testModel - Tên Model cần kiểm tra
 * @returns {object} { success: boolean, message: string, activeModel?: string }
 */
function testGeminiConnectionBackend(testApiKey, testModel) {
  try {
    const key = (testApiKey && testApiKey.trim()) || PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    const model = (testModel && testModel.trim()) || PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || 'gemini-3.8-flash';

    if (!key) {
      return { success: false, message: 'Chưa có API Key để kiểm tra.' };
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + key;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: 'Ping test. Reply {"status":"ok"}' }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
    };

    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    const content = response.getContentText();

    if (statusCode === 200) {
      return {
        success: true,
        message: 'Kết nối thành công tới model ' + model + '!',
        activeModel: model
      };
    } else {
      const err = JSON.parse(content || '{}');
      const msg = (err.error && err.error.message) ? err.error.message : content;
      return {
        success: false,
        message: 'Google AI phản hồi lỗi (' + statusCode + '): ' + msg
      };
    }
  } catch (e) {
    return {
      success: false,
      message: 'Lỗi kiểm tra kết nối: ' + e.message
    };
  }
}

/**
 * Lưu cấu hình Gemini API Key & Model vào ScriptProperties bảo mật
 * @param {string} apiKey - Google AI Studio API Key
 * @param {string} model - Tên Model (ví dụ: gemini-3.8-flash)
 * @returns {object} { success: boolean, message: string }
 */
function saveGeminiConfigBackend(apiKey, model) {
  try {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'API Key không được để trống.' };
    }

    const cleanKey = apiKey.trim();
    const cleanModel = (model && model.trim()) || 'gemini-3.8-flash';

    // Lưu trực tiếp vào ScriptProperties bảo mật
    PropertiesService.getScriptProperties().setProperties({
      GEMINI_API_KEY: cleanKey,
      GEMINI_MODEL: cleanModel
    });

    return {
      success: true,
      message: 'Đã lưu cấu hình Gemini AI thành công! Model kích hoạt: ' + cleanModel
    };
  } catch (e) {
    return {
      success: false,
      message: 'Lỗi lưu cấu hình: ' + e.message
    };
  }
}

/**
 * Lấy trạng thái cấu hình Gemini hiện tại (Mặt nạ hóa Key để bảo mật)
 * @returns {object} { configured: boolean, model: string, maskedKey: string }
 */
function getGeminiConfigBackend() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');
  const model = props.getProperty('GEMINI_MODEL') || 'gemini-3.8-flash';

  let maskedKey = '';
  if (apiKey && apiKey.length > 8) {
    maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  }

  return {
    configured: !!apiKey,
    model: model,
    maskedKey: maskedKey
  };
}
