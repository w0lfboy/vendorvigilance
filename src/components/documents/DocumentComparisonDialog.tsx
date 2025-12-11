import { useState, useMemo } from 'react';
import { GitCompare, FileText, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Minus, Sparkles, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Document } from '@/hooks/useDocuments';
import { format } from 'date-fns';

interface DocumentComparisonDialogProps {
  documents: Document[];
  vendors: { id: string; name: string }[];
}

interface ComparisonResult {
  riskChange: 'improved' | 'worsened' | 'unchanged';
  newFindings: string[];
  resolvedFindings: string[];
  newRisks: { severity: string; description: string }[];
  resolvedRisks: { severity: string; description: string }[];
  complianceChanges: { framework: string; added: string[]; removed: string[] }[];
}

export function DocumentComparisonDialog({ documents, vendors }: DocumentComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [doc1Id, setDoc1Id] = useState<string>('');
  const [doc2Id, setDoc2Id] = useState<string>('');

  // Filter documents that have been analyzed and belong to selected vendor
  const vendorDocuments = useMemo(() => {
    if (!selectedVendor) return [];
    return documents
      .filter(d => d.vendor_id === selectedVendor && d.analyzed_at)
      .sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());
  }, [documents, selectedVendor]);

  const doc1 = documents.find(d => d.id === doc1Id);
  const doc2 = documents.find(d => d.id === doc2Id);

  const comparison = useMemo<ComparisonResult | null>(() => {
    if (!doc1 || !doc2) return null;

    const doc1Findings = Array.isArray(doc1.key_findings) ? doc1.key_findings as string[] : [];
    const doc2Findings = Array.isArray(doc2.key_findings) ? doc2.key_findings as string[] : [];
    
    const doc1Risks = Array.isArray(doc1.risk_flags) ? doc1.risk_flags as { severity: string; description: string }[] : [];
    const doc2Risks = Array.isArray(doc2.risk_flags) ? doc2.risk_flags as { severity: string; description: string }[] : [];

    const doc1Compliance = doc1.compliance_mapping && typeof doc1.compliance_mapping === 'object' 
      ? doc1.compliance_mapping as Record<string, string[]> 
      : {};
    const doc2Compliance = doc2.compliance_mapping && typeof doc2.compliance_mapping === 'object' 
      ? doc2.compliance_mapping as Record<string, string[]> 
      : {};

    // Compare findings
    const newFindings = doc2Findings.filter(f => !doc1Findings.includes(f));
    const resolvedFindings = doc1Findings.filter(f => !doc2Findings.includes(f));

    // Compare risks
    const doc1RiskDescs = doc1Risks.map(r => r.description);
    const doc2RiskDescs = doc2Risks.map(r => r.description);
    const newRisks = doc2Risks.filter(r => !doc1RiskDescs.includes(r.description));
    const resolvedRisks = doc1Risks.filter(r => !doc2RiskDescs.includes(r.description));

    // Determine risk change
    const doc1HighRisks = doc1Risks.filter(r => r.severity === 'high').length;
    const doc2HighRisks = doc2Risks.filter(r => r.severity === 'high').length;
    let riskChange: 'improved' | 'worsened' | 'unchanged' = 'unchanged';
    if (doc2HighRisks < doc1HighRisks || (doc2Risks.length < doc1Risks.length && doc2HighRisks <= doc1HighRisks)) {
      riskChange = 'improved';
    } else if (doc2HighRisks > doc1HighRisks || doc2Risks.length > doc1Risks.length) {
      riskChange = 'worsened';
    }

    // Compare compliance mappings
    const allFrameworks = new Set([...Object.keys(doc1Compliance), ...Object.keys(doc2Compliance)]);
    const complianceChanges: { framework: string; added: string[]; removed: string[] }[] = [];
    allFrameworks.forEach(framework => {
      const oldControls = doc1Compliance[framework] || [];
      const newControls = doc2Compliance[framework] || [];
      const added = newControls.filter(c => !oldControls.includes(c));
      const removed = oldControls.filter(c => !newControls.includes(c));
      if (added.length > 0 || removed.length > 0) {
        complianceChanges.push({ framework, added, removed });
      }
    });

    return {
      riskChange,
      newFindings,
      resolvedFindings,
      newRisks,
      resolvedRisks,
      complianceChanges,
    };
  }, [doc1, doc2]);

  const getVendorName = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId)?.name || 'Unknown';
  };

  const hasComparison = doc1 && doc2 && comparison;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <GitCompare className="h-4 w-4" />
          Compare Documents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-secondary" />
            Document Version Comparison
          </DialogTitle>
          <DialogDescription>
            Compare AI analysis between different versions of vendor documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Vendor Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Vendor</label>
            <Select value={selectedVendor} onValueChange={(v) => {
              setSelectedVendor(v);
              setDoc1Id('');
              setDoc2Id('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVendor && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Older Document (Baseline)</label>
                <Select value={doc1Id} onValueChange={setDoc1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorDocuments.filter(d => d.id !== doc2Id).map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex flex-col">
                          <span>{d.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(d.upload_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Newer Document (Compare To)</label>
                <Select value={doc2Id} onValueChange={setDoc2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorDocuments.filter(d => d.id !== doc1Id).map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex flex-col">
                          <span>{d.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(d.upload_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {vendorDocuments.length === 0 && selectedVendor && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No analyzed documents found for this vendor</p>
              <p className="text-sm">Upload and analyze documents to enable comparison</p>
            </div>
          )}

          {hasComparison && (
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-6">
                {/* Document Headers */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{doc1.name}</span>
                    <Badge variant="outline">{format(new Date(doc1.upload_date), 'MMM d, yyyy')}</Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-secondary" />
                    <span className="font-medium">{doc2.name}</span>
                    <Badge variant="outline">{format(new Date(doc2.upload_date), 'MMM d, yyyy')}</Badge>
                  </div>
                </div>

                <Separator />

                {/* Overall Risk Change */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {comparison.riskChange === 'improved' && (
                        <>
                          <TrendingDown className="h-4 w-4 text-success" />
                          <span className="text-success">Risk Profile Improved</span>
                        </>
                      )}
                      {comparison.riskChange === 'worsened' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">Risk Profile Worsened</span>
                        </>
                      )}
                      {comparison.riskChange === 'unchanged' && (
                        <>
                          <Minus className="h-4 w-4 text-muted-foreground" />
                          <span>Risk Profile Unchanged</span>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* New Findings */}
                {comparison.newFindings.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        New Findings ({comparison.newFindings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparison.newFindings.map((finding, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-success">+</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Resolved Findings */}
                {comparison.resolvedFindings.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        Findings No Longer Present ({comparison.resolvedFindings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparison.resolvedFindings.map((finding, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <span>−</span>
                            <span className="line-through">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* New Risks */}
                {comparison.newRisks.length > 0 && (
                  <Card className="border-destructive/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        New Risks Identified ({comparison.newRisks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparison.newRisks.map((risk, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <Badge 
                              className={cn(
                                'text-xs flex-shrink-0',
                                risk.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                                risk.severity === 'medium' ? 'bg-warning/10 text-warning' :
                                'bg-muted text-muted-foreground'
                              )}
                            >
                              {risk.severity}
                            </Badge>
                            <span>{risk.description}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Resolved Risks */}
                {comparison.resolvedRisks.length > 0 && (
                  <Card className="border-success/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-success">
                        <Flag className="h-4 w-4" />
                        Risks Resolved ({comparison.resolvedRisks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparison.resolvedRisks.map((risk, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {risk.severity}
                            </Badge>
                            <span className="line-through">{risk.description}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Changes */}
                {comparison.complianceChanges.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Compliance Mapping Changes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {comparison.complianceChanges.map((change, i) => (
                          <div key={i}>
                            <p className="text-sm font-medium mb-2">{change.framework}</p>
                            <div className="space-y-1">
                              {change.added.map((c, j) => (
                                <div key={`add-${j}`} className="text-sm flex items-center gap-2">
                                  <span className="text-success">+</span>
                                  <Badge variant="outline" className="text-xs">{c}</Badge>
                                </div>
                              ))}
                              {change.removed.map((c, j) => (
                                <div key={`rem-${j}`} className="text-sm flex items-center gap-2 text-muted-foreground">
                                  <span>−</span>
                                  <Badge variant="outline" className="text-xs line-through">{c}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Changes */}
                {comparison.newFindings.length === 0 && 
                 comparison.resolvedFindings.length === 0 && 
                 comparison.newRisks.length === 0 && 
                 comparison.resolvedRisks.length === 0 && 
                 comparison.complianceChanges.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Minus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No significant changes detected between documents</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
