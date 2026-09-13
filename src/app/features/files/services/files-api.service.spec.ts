import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ApiService } from '../../../core/services/api.service';
import { FilesApiService } from './files-api.service';
import { FileUploadResultDto } from '../models/files.models';

describe('FilesApiService', () => {
  let service: FilesApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', [
      'get',
      'postFormData',
      'delete',
      'getBlobResponse'
    ]);

    TestBed.configureTestingModule({
      providers: [FilesApiService, { provide: ApiService, useValue: api }]
    });

    service = TestBed.inject(FilesApiService);
  });

  it('lists files with query params', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));

    service.list({ isActive: true, skip: 0, take: 50 }).subscribe((rows) => {
      expect(rows).toEqual([]);
    });

    expect(api.get).toHaveBeenCalledWith('/files', {
      params: { isActive: true, skip: 0, take: 50 }
    });
  });

  it('uploads with FormData key file', () => {
    const uploaded: FileUploadResultDto = {
      fileId: 9,
      originalFileName: 'a.pdf',
      contentType: 'application/pdf',
      fileSizeBytes: 12,
      createdDate: '2026-01-01T00:00:00Z'
    };
    api.postFormData.and.returnValue(
      of({
        success: true,
        message: 'ok',
        data: uploaded,
        errors: []
      } satisfies ApiResponse<FileUploadResultDto>)
    );

    const file = new File(['%PDF'], 'a.pdf', { type: 'application/pdf' });
    service.upload(file).subscribe((result) => {
      expect(result.fileId).toBe(9);
    });

    expect(api.postFormData).toHaveBeenCalled();
    const formData = api.postFormData.calls.mostRecent().args[1] as FormData;
    expect(formData.get('file')).toBeTruthy();
  });

  it('deletes by id', () => {
    api.delete.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.delete(3).subscribe();
    expect(api.delete).toHaveBeenCalledWith('/files/3');
  });
});
