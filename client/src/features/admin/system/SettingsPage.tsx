import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemApi } from '@/api/system';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/store/toastStore';

const FIELDS = [
  { key: 'companyName', label: 'Website / Company Name', placeholder: 'Bhutan Cherapunji Lottery', hint: 'Shown across the website — landing page, login, sidebars — and on every printed ticket.' },
  { key: 'supportWhatsapp', label: 'Support WhatsApp Number', placeholder: '+975...' },
  { key: 'supportEmail', label: 'Support Email', placeholder: 'support@example.com' },
];

export function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['app-settings'], queryFn: systemApi.settings });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const map: Record<string, string> = {};
    (data as any[]).forEach((s) => (map[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value)));
    setValues(map);
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (key: string) => systemApi.upsertSetting(key, values[key] ?? ''),
    onSuccess: (_data, key) => {
      qc.invalidateQueries({ queryKey: ['app-settings'] });
      if (key === 'companyName') qc.invalidateQueries({ queryKey: ['public-settings'] });
      toast.success('Setting saved');
    },
  });

  return (
    <div>
      <PageHeader title="Settings" description="Platform-wide configuration." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          {FIELDS.map((f) => (
            <FormField key={f.key} label={f.label} hint={f.hint}>
              <div className="flex gap-2">
                <Input placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                <Button size="sm" loading={saveMut.isPending} onClick={() => saveMut.mutate(f.key)}>
                  Save
                </Button>
              </div>
            </FormField>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
