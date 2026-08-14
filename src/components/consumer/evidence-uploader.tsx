'use client';

// ============================================================
// KOI Recall Platform — Evidence Uploader v3.0
// Blade 2: Chain-of-custody evidence collection
// - Type/size validation with per-file errors
// - Image thumbnails + simulated upload progress
// - Required-evidence coverage checklist
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Image as ImageIcon,
  File,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EvidenceType } from '@/types';

// ----------------------------------------------------------------

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.heic,.heif,.pdf';
const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  evidenceType: EvidenceType;
  previewUrl?: string;
  progress: number; // 0–100
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

interface RejectedFile {
  name: string;
  reason: string;
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

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ----------------------------------------------------------------

export function EvidenceUploader({ evidenceTypes }: EvidenceUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultType: EvidenceType = evidenceTypes[0] ?? ('other' as EvidenceType);

  // Simulated upload progress — advances any file still uploading
  useEffect(() => {
    if (!files.some((f) => f.status === 'uploading')) return;
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.status !== 'uploading') return f;
          const next = Math.min(100, f.progress + 8 + Math.random() * 14);
          return { ...f, progress: next, status: next >= 100 ? 'done' : 'uploading' };
        }),
      );
    }, 140);
    return () => clearInterval(timer);
  }, [files]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const accepted: UploadedFile[] = [];
      const rejectedList: RejectedFile[] = [];

      Array.from(fileList).forEach((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
        const typeOk =
          ACCEPTED_MIME.includes(f.type) ||
          ['jpg', 'jpeg', 'png', 'heic', 'heif', 'pdf'].includes(ext);
        if (!typeOk) {
          rejectedList.push({ name: f.name, reason: 'Unsupported format — use JPG, PNG, HEIC or PDF' });
          return;
        }
        if (f.size > MAX_FILE_SIZE) {
          rejectedList.push({ name: f.name, reason: `Exceeds 10MB limit (${formatFileSize(f.size)})` });
          return;
        }
        accepted.push({
          id: makeId(),
          name: f.name,
          size: f.size,
          type: f.type,
          evidenceType: defaultType,
          previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
          progress: 0,
          status: 'uploading',
        });
      });

      if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
      setRejected(rejectedList);
    },
    [defaultType],
  );

  const removeFile = (id: string) =>
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });

  const setFileType = (id: string, evidenceType: EvidenceType) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, evidenceType } : f)));

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // Coverage: a required type is covered when ≥1 completed file is tagged with it
  const doneFiles = files.filter((f) => f.status === 'done');
  const coveredTypes = evidenceTypes.filter((t) =>
    doneFiles.some((f) => f.evidenceType === t),
  );
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const allCovered = evidenceTypes.length > 0 && coveredTypes.length === evidenceTypes.length;

  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-card overflow-hidden blade-accent-verification">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-blade-verification-light/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blade-verification">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Evidence Upload</h3>
              <p className="text-xs text-text-secondary">
                Required: {evidenceTypes.map((t) => EVIDENCE_LABELS[t] || t).join(' · ')}
              </p>
            </div>
          </div>
          {files.length > 0 && (
            <span
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                allCovered
                  ? 'bg-blade-resolution-light text-blade-resolution'
                  : 'bg-blade-verification-light text-blade-verification',
              )}
            >
              {allCovered
                ? 'All required evidence attached'
                : `${coveredTypes.length}/${evidenceTypes.length} required types covered`}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Coverage checklist */}
        {evidenceTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {evidenceTypes.map((t) => {
              const covered = coveredTypes.includes(t);
              return (
                <span
                  key={t}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-250',
                    covered
                      ? 'border-blade-resolution-medium/40 bg-blade-resolution-light/60 text-blade-resolution'
                      : 'border-border bg-surface-secondary/50 text-text-tertiary',
                  )}
                >
                  {covered ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-current opacity-40" />
                  )}
                  {EVIDENCE_LABELS[t] || t}
                </span>
              );
            })}
          </div>
        )}

        {/* Drop zone */}
        <div
          className={cn(
            'relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-250',
            isDragOver
              ? 'border-blade-verification bg-blade-verification-light scale-[0.99]'
              : 'border-border hover:border-blade-verification-medium bg-surface-secondary/30',
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl border-2 transition-colors duration-250',
                isDragOver
                  ? 'bg-blade-verification border-blade-verification text-white'
                  : 'bg-surface-elevated border-border text-text-tertiary',
              )}
            >
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {isDragOver ? 'Release to upload' : 'Drop files here or browse'}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                JPG, PNG, PDF, HEIC — up to 10MB each
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-medium btn-press cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              Browse Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        {/* Rejected files */}
        {rejected.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {rejected.length} file{rejected.length > 1 ? 's' : ''} not accepted
              </p>
              <button
                type="button"
                onClick={() => setRejected([])}
                className="text-xs font-medium text-red-600 hover:text-red-800 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            {rejected.map((r, i) => (
              <p key={i} className="text-xs text-red-600 truncate">
                <span className="font-medium">{r.name}</span> — {r.reason}
              </p>
            ))}
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2 stagger-in">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors duration-250',
                  file.status === 'done'
                    ? 'bg-blade-resolution-light/50 border-blade-resolution-medium/20'
                    : 'bg-surface-secondary/50 border-border',
                )}
              >
                {/* Thumbnail / icon */}
                {file.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated border">
                    {getFileIcon(file.type)}
                  </div>
                )}

                {/* Meta + progress */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                  {file.status === 'uploading' ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-[180px] rounded-full bg-surface-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blade-verification transition-all duration-150"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-text-tertiary">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-text-tertiary">{formatFileSize(file.size)}</p>
                  )}
                </div>

                {/* Evidence type tag */}
                <select
                  value={file.evidenceType}
                  onChange={(e) => setFileType(file.id, e.target.value as EvidenceType)}
                  className="hidden sm:block h-8 max-w-[150px] rounded-lg border bg-surface-elevated px-2 text-xs text-text-secondary outline-none cursor-pointer focus:border-blade-verification"
                  aria-label="Evidence type"
                >
                  {[...new Set([...evidenceTypes, 'other' as EvidenceType])].map((t) => (
                    <option key={t} value={t}>
                      {EVIDENCE_LABELS[t] || t}
                    </option>
                  ))}
                </select>

                {/* Status */}
                {file.status === 'uploading' ? (
                  <Loader2 className="h-4 w-4 text-blade-verification animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-blade-resolution shrink-0" />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-text-tertiary hover:text-destructive cursor-pointer"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Summary bar */}
        {files.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-surface-secondary/50 px-3.5 py-2.5 text-xs text-text-secondary">
            <span>
              <span className="font-semibold text-text-primary">{files.length}</span> file
              {files.length > 1 ? 's' : ''} · {formatFileSize(totalSize)} total
            </span>
            <span className="inline-flex items-center gap-1 text-text-tertiary">
              <Lock className="h-3 w-3" />
              Encrypted in transit & at rest
            </span>
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-4">
            <ShieldCheck className="h-5 w-5 mx-auto text-text-tertiary mb-2" />
            <p className="text-xs text-text-tertiary">
              No files uploaded yet. All evidence is encrypted in transit and at rest.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
