const messages: Record<string,string> = {
  'Admin access required.':'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'Choose an image to upload.':'Vui lòng chọn ảnh để tải lên.',
  'Use a JPG, PNG, WebP or AVIF image.':'Vui lòng chọn ảnh JPG, PNG, WebP hoặc AVIF.',
  'Images must be smaller than 4 MB.':'Mỗi ảnh phải nhỏ hơn 4 MB.',
  'Could not upload the image.':'Không thể tải ảnh lên. Vui lòng thử lại.',
  'Could not remove the image.':'Không thể xóa ảnh. Vui lòng thử lại.',
  'Invalid media key.':'Mã hình ảnh không hợp lệ.',
  'Invalid property id.':'Mã bất động sản không hợp lệ.',
  'Property not found.':'Không tìm thấy bất động sản.',
  'This URL slug is already in use.':'Đường dẫn tin đăng đã được sử dụng.',
  'Could not update the property.':'Không thể cập nhật bất động sản.',
  'Could not delete the property.':'Không thể xóa bất động sản.',
  'Could not load inventory.':'Không thể tải danh sách bất động sản.',
  'Could not create the property.':'Không thể tạo bất động sản.',
  'Invalid property data.':'Dữ liệu bất động sản không hợp lệ.',
  'Add at least one image before publishing.':'Thêm ít nhất một ảnh trước khi đăng tin.',
};
export function adminError(message: string, language: 'en' | 'vi') {
  if (language === 'en') return message;
  if (messages[message]) return messages[message];
  if (/ is required\.$/.test(message)) return 'Vui lòng điền đầy đủ các trường bắt buộc.';
  if (/ is too long\.$/.test(message)) return 'Nội dung quá dài. Vui lòng rút gọn.';
  if (/ is invalid\.$/.test(message)) return 'Một giá trị không hợp lệ. Vui lòng kiểm tra thông tin đã nhập.';
  // Locally translated validation messages already contain Vietnamese diacritics.
  if (/[^\x00-\x7F]/.test(message) && !/Could not|Failed to/.test(message)) return message;
  return 'Không thể hoàn tất thao tác. Vui lòng kiểm tra kết nối và thử lại.';
}
