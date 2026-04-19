'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Mail, MapPin, Pencil, Save, User, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import {
  BasicDetailsData,
  getSettingsBasicDetails,
  updateSettingsBasicDetails,
} from '@/lib/api';
import { toastApiError, toastApiSuccess } from '@/lib/toast';

type EditableField =
  | 'fullName'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'dateOfBirth'
  | 'gender'
  | 'maritalStatus'
  | 'occupation'
  | 'country'
  | 'address'
  | 'pan';

type FieldType = 'text' | 'date' | 'select' | 'textarea';

type FieldConfig = {
  key: EditableField;
  label: string;
  help: string;
  type: FieldType;
  options?: string[];
};

const personalFields: FieldConfig[] = [
  { key: 'fullName', label: 'Full name', help: 'Display name used across the platform.', type: 'text' },
  { key: 'firstName', label: 'First name', help: 'Preferred first name for greetings.', type: 'text' },
  { key: 'lastName', label: 'Last name', help: 'Preferred surname for statements.', type: 'text' },
  { key: 'phone', label: 'Mobile number', help: 'Used for secure sign-in and alerts.', type: 'text' },
  { key: 'dateOfBirth', label: 'Date of birth', help: 'Required for compliance and risk checks.', type: 'date' },
  { key: 'gender', label: 'Gender', help: 'Optional personal preference.', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  { key: 'maritalStatus', label: 'Marital status', help: 'Optional profile detail.', type: 'select', options: ['Single', 'Married', 'Divorced', 'Prefer not to say'] },
];

const identityFields: FieldConfig[] = [
  { key: 'occupation', label: 'Occupation', help: 'Shown in your profile summary.', type: 'text' },
  { key: 'country', label: 'Country', help: 'Country used for taxation and support.', type: 'text' },
  { key: 'address', label: 'Address', help: 'Used for statements and account verification.', type: 'textarea' },
  { key: 'pan', label: 'PAN / Tax ID', help: 'Used for tax reporting and compliance.', type: 'text' },
];

const formatLastUpdated = (value: string) => {
  if (!value) {
    return 'Unknown';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

type EditableRowProps = {
  field: FieldConfig;
  value: string;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
};

function EditableRow({ field, value, editing, saving, onEdit, onCancel, onChange }: EditableRowProps) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-950 dark:text-white">{field.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{field.help}</p>
        </div>

        {editing ? null : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="mt-4">
        {editing ? (
          <>
            {field.type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            ) : field.type === 'select' ? (
              <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {(field.options || []).map((option) => (
                  <option key={option} value={option} className="bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                type={field.type}
                className="h-10 rounded-xl border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-200">{value || 'Not available'}</p>
        )}
      </div>
    </div>
  );
}

export default function BasicDetails() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['settings', 'basic-details'],
    queryFn: getSettingsBasicDetails,
  });

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState<BasicDetailsData | null>(null);

  const mutation = useMutation({
    mutationFn: updateSettingsBasicDetails,
    onSuccess: (response) => {
      queryClient.setQueryData(['settings', 'basic-details'], response);
      setDraft(null);
      setEditingField(null);
      toastApiSuccess(response, 'Basic details updated successfully.');
    },
    onError: (error) => {
      toastApiError(error, 'Failed to update basic details.');
    },
  });

  const details = query.data?.data;
  const formData = draft || details;

  const initials = useMemo(() => {
    const source = details?.fullName || details?.email || 'SS';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0] || '')
      .join('')
      .toUpperCase() || 'SS';
  }, [details?.email, details?.fullName]);

  const startEdit = (field: EditableField) => {
    if (!details) {
      return;
    }

    setEditingField(field);
    setDraft(details);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraft(null);
  };

  const saveDraft = async () => {
    if (!details && !draft) {
      return;
    }

    await mutation.mutateAsync(draft || details!);
  };

  const updateDraft = (field: EditableField, value: string) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-none dark:border-slate-800 dark:bg-slate-950">
          <LoadingSkeleton className="h-5 w-40" />
          <LoadingSkeleton className="mt-2.5 h-3.5 w-64" />
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            <LoadingSkeleton className="h-44 w-full rounded-[18px]" />
            <LoadingSkeleton className="h-44 w-full rounded-[18px]" />
          </div>
        </div>
      </div>
    );
  }

  if (query.isError || !details) {
    return (
      <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
        Failed to load basic details.
      </div>
    );
  }

  const renderField = (field: FieldConfig) => {
    const isEditing = editingField === field.key;
    const currentValue = formData?.[field.key] ?? '';
    const value = String(currentValue || '');

    return (
      <EditableRow
        key={field.key}
        field={field}
        value={value}
        editing={isEditing}
        saving={mutation.isPending}
        onEdit={() => startEdit(field.key)}
        onCancel={cancelEdit}
        onChange={(nextValue) => updateDraft(field.key, nextValue)}
      />
    );
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
      className="space-y-4"
    >
      <Card className="rounded-[24px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="mt-0 text-xl text-slate-950 dark:text-white">Basic details</CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Keep your personal information accurate so account statements, compliance, and support stay in sync.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{details.fullName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Last updated {formatLastUpdated(details.lastUpdated)}</p>
              </div>
              </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <section className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Personal information</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Your primary identity and contact details.</p>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    Email address
                  </div>
                  <p className="mt-2 text-sm text-slate-950 dark:text-white">{details.email}</p>
                </div>

                {personalFields.map((field) => renderField(field))}
              </div>
            </section>

            <section className="space-y-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Identity and compliance</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">These fields are used for tax, KYC, and support checks.</p>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    KYC status
                  </div>
                  <p className="mt-2 text-sm text-slate-950 dark:text-white">{details.kycStatus}</p>
                </div>

                <div className="rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CalendarDays className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    Account created / updated
                  </div>
                  <p className="mt-2 text-sm text-slate-950 dark:text-white">{formatLastUpdated(details.lastUpdated)}</p>
                </div>

                {identityFields.map((field) => renderField(field))}

                <div className="rounded-[18px] border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    Profile location
                  </div>
                  <p className="mt-2 text-sm text-slate-950 dark:text-white">{details.country} · {details.address}</p>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      {editingField ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          <span>Editing {personalFields.concat(identityFields).find((field) => field.key === editingField)?.label || 'field'}.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
            >
              <Save className="h-3.5 w-3.5" />
              {mutation.isPending ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
