import {
  formatFileSize,
  normalizeFileExtension,
  parseContentDispositionFileName,
  sanitizeDownloadFileName,
  validateClientFile
} from './file-display.util';
import { FILE_ALLOWED_EXTENSIONS, FILE_MAX_SIZE_BYTES } from '../models/files.models';

describe('file-display.util', () => {
  it('formats file sizes with binary units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(null)).toBe('—');
  });

  it('parses Content-Disposition filenames safely', () => {
    expect(parseContentDispositionFileName('attachment; filename="report.pdf"')).toBe('report.pdf');
    expect(parseContentDispositionFileName("attachment; filename*=UTF-8''invoice%20a.pdf")).toBe(
      'invoice a.pdf'
    );
    expect(parseContentDispositionFileName('attachment; filename="../etc/passwd"')).toBeNull();
  });

  it('sanitizes unsafe download names', () => {
    expect(sanitizeDownloadFileName('ok.docx')).toBe('ok.docx');
    expect(sanitizeDownloadFileName('a/b.pdf')).toBe('ab.pdf');
    expect(sanitizeDownloadFileName('..')).toBeNull();
  });

  it('validates client files', () => {
    const pdf = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateClientFile(pdf, FILE_ALLOWED_EXTENSIONS, FILE_MAX_SIZE_BYTES)).toBeNull();

    const exe = new File(['x'], 'bad.exe', { type: 'application/octet-stream' });
    expect(validateClientFile(exe, FILE_ALLOWED_EXTENSIONS, FILE_MAX_SIZE_BYTES)).toContain(
      'not allowed'
    );

    const empty = new File([], 'empty.pdf', { type: 'application/pdf' });
    expect(validateClientFile(empty, FILE_ALLOWED_EXTENSIONS, FILE_MAX_SIZE_BYTES)).toContain(
      'empty'
    );
  });

  it('normalizes extensions', () => {
    expect(normalizeFileExtension('A.PDF')).toBe('.pdf');
    expect(normalizeFileExtension('none')).toBe('');
  });
});
