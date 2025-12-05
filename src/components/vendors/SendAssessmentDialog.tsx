import { useState } from 'react';
import { Send, Copy, Check, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAssessments, useTemplates } from '@/hooks/useAssessments';
import type { Vendor } from '@/hooks/useVendors';

interface SendAssessmentDialogProps {
  vendor: Vendor;
  trigger?: React.ReactNode;
}

export function SendAssessmentDialog({ vendor, trigger }: SendAssessmentDialogProps) {
  const { toast } = useToast();
  const { createAssessment } = useAssessments();
  const { templates } = useTemplates();
  
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');
  const [title, setTitle] = useState(`Security Assessment - ${vendor.name}`);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // Default 2 weeks
    return date.toISOString().split('T')[0];
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('quarterly');
  const [assessmentLink, setAssessmentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!templateId) {
      toast({ title: 'Error', description: 'Please select a questionnaire template', variant: 'destructive' });
      return;
    }

    try {
      const result = await createAssessment.mutateAsync({
        vendor_id: vendor.id,
        template_id: templateId,
        title,
        due_date: new Date(dueDate).toISOString(),
        status: 'pending',
        is_recurring: isRecurring,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
      });

      // Generate the portal link
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/portal?token=${result.access_token}`;
      setAssessmentLink(link);
      
      toast({ 
        title: 'Assessment Created', 
        description: 'Copy the link below to send to the vendor.' 
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCopyLink = async () => {
    if (assessmentLink) {
      await navigator.clipboard.writeText(assessmentLink);
      setCopied(true);
      toast({ title: 'Link Copied', description: 'Assessment link copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAssessmentLink(null);
    setTemplateId('');
    setTitle(`Security Assessment - ${vendor.name}`);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Send className="h-4 w-4 mr-2" />
            Send Assessment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Assessment to {vendor.name}</DialogTitle>
          <DialogDescription>
            Create a security questionnaire and send the link to your vendor contact.
          </DialogDescription>
        </DialogHeader>

        {!assessmentLink ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assessment Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q1 2024 Security Assessment"
              />
            </div>

            <div className="space-y-2">
              <Label>Questionnaire Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                        {template.framework && (
                          <span className="text-xs text-muted-foreground">{template.framework}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {templates.length === 0 && (
                    <SelectItem value="none" disabled>
                      No templates available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="font-medium">Recurring Assessment</Label>
                <p className="text-sm text-muted-foreground">Automatically schedule follow-ups</p>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label>Recurrence Interval</Label>
                <Select value={recurrenceInterval} onValueChange={setRecurrenceInterval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annually">Semi-annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
              <p className="text-sm font-medium text-success mb-2">Assessment Created Successfully!</p>
              <p className="text-sm text-muted-foreground">
                Share this link with {vendor.contact_name || 'the vendor contact'} to complete the questionnaire.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Assessment Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={assessmentLink}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {vendor.contact_email && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const subject = encodeURIComponent(title);
                  const body = encodeURIComponent(
                    `Hello ${vendor.contact_name || ''},\n\nPlease complete the following security assessment:\n\n${assessmentLink}\n\nDue Date: ${new Date(dueDate).toLocaleDateString()}\n\nThank you.`
                  );
                  window.open(`mailto:${vendor.contact_email}?subject=${subject}&body=${body}`);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Email Client
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          {!assessmentLink ? (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createAssessment.isPending || !templateId}>
                {createAssessment.isPending ? 'Creating...' : 'Create & Get Link'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
