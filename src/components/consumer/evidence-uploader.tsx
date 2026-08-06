'use client';

// ============================================================
// KOI Recall Platform — Evidence Uploader v2.0
// Blade 2: Chain-of-custody evidence collection
// ============================================================

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, Image, File, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EvidenceType } from '@/types';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface EvidenceUploaderProps {
  evidenceTypes: EvidenceType[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EVIDENCE_LABELS: Record<string, string> = {
  proof_of_purchase: 'Proof of Purchase',
  product_photo: 'Product Photo',
  serial_number: 'Serial Number Photo',
  damage_photo: 'Damage Photo',
  other: 'Supporting Document',
};

export function EvidenceUploader({ evidenceTypes }: EvidenceUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-card overflow-hidden blade-accent-verification">
      <div className="px-6 py-5 border-b bg-blade-verification-light/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blade-verification">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Evidence Upload</h3>
            <p className="text-xs text-text-secondary">
              Required: {evidenceTypes.map(t => EVIDENCE_LABELS[t] || t).join(' · ')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Drop zone */}
        <div
          className={cn(
            'relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-250',
            isDragOver
              ? 'border-blade-verification bg-blade-verification-light scale-[0.99]'
              : 'border-border hover:border-blade-verification-medium bg-surface-secondary/30'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); addFiles(e.dataTransfer.files); }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-colors duration-250',
              isDragOver ? 'bg-blade-verification border-blade-verification text-white' : 'bg-surface-elevated border-border text-text-tertiary'
            )}>
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Drop files here or browse</p>
              <p className="text-xs text-text-tertiary mt-1">JPG, PNG, PDF, HEIC — up to 10MB each</p>
            </div>
            <label className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" className="pointer-events-none font-medium">Browse Files</Button>
              <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.heic,.heif,.pdf" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-blade-resolution-light/50 border border-blade-resolution-medium/20">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated border">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                  <p className="text-xs text-text-tertiary">{formatFileSize(file.size)}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-blade-resolution shrink-0" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-text-tertiary hover:text-destructive" onClick={() => removeFile(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-4">
            <ShieldCheck className="h-5 w-5 mx-auto text-text-tertiary mb-2" />
            <p className="text-xs text-text-tertiary">No files uploaded yet. All evidence is encrypted in transit and at rest.</p>
          </div>
        )}
      </div>
    </div>
  );
}
