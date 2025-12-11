import { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSearch,
  MessageSquare,
  Flag,
  MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDocuments, type Document } from '@/hooks/useDocuments';
import { useVendors } from '@/hooks/useVendors';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const documentTypeLabels: Record<string, string> = {
  soc2_report: 'SOC 2 Report',
  iso_certificate: 'ISO Certificate',
  policy: 'Policy Document',
  contract: 'Contract',
};

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle2, class: 'bg-success/10 text-success' },
  expired: { label: 'Expired', icon: AlertCircle, class: 'bg-destructive/10 text-destructive' },
  expiring_soon: { label: 'Expiring Soon', icon: Clock, class: 'bg-warning/10 text-warning' },
};

const reviewStatusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending Analysis', class: 'bg-muted text-muted-foreground' },
  analyzed: { label: 'Analyzed', class: 'bg-blue-500/10 text-blue-600' },
  reviewed: { label: 'Reviewed', class: 'bg-success/10 text-success' },
  flagged: { label: 'Flagged', class: 'bg-destructive/10 text-destructive' },
};

export default function Documents() {
  const { 
    documents, 
    isLoading, 
    uploadDocument, 
    analyzeDocument,
    updateReviewStatus,
    deleteDocument, 
    getDownloadUrl 
  } = useDocuments();
  const { vendors } = useVendors();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [uploadData, setUploadData] = useState({
    vendorId: '',
    name: '',
    type: 'policy' as Document['type'],
    expirationDate: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesReview = reviewFilter === 'all' || doc.review_status === reviewFilter;
    return matchesSearch && matchesType && matchesStatus && matchesReview;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadData(prev => ({ ...prev, name: files[0].name }));
      setIsUploadOpen(true);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadData(prev => ({ ...prev, name: files[0].name }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.vendorId || !uploadData.name) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const result = await uploadDocument.mutateAsync({
      file: selectedFile,
      vendorId: uploadData.vendorId,
      name: uploadData.name,
      type: uploadData.type,
      expirationDate: uploadData.expirationDate || undefined,
    });

    // Auto-trigger AI analysis after upload
    if (result) {
      toast({ title: 'Analyzing...', description: 'AI is analyzing your document' });
      analyzeDocument.mutate(result as unknown as Document);
    }

    setIsUploadOpen(false);
    setSelectedFile(null);
    setUploadData({ vendorId: '', name: '', type: 'policy', expirationDate: '' });
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.file_path) return;
    const url = await getDownloadUrl(doc.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleAnalyze = (doc: Document) => {
    toast({ title: 'Analyzing...', description: 'AI is analyzing your document' });
    analyzeDocument.mutate(doc);
  };

  const handleReviewStatusChange = (docId: string, status: string) => {
    updateReviewStatus.mutate({ docId, status, notes: reviewNotes });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || 'Unknown Vendor';
  };

  // Stats
  const totalDocs = documents.length;
  const analyzedDocs = documents.filter(d => d.analyzed_at).length;
  const pendingReview = documents.filter(d => d.review_status === 'analyzed').length;
  const flaggedDocs = documents.filter(d => d.review_status === 'flagged').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
          <p className="text-muted-foreground">AI-powered document analysis and compliance tracking</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a document for AI analysis and compliance review</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select value={uploadData.vendorId} onValueChange={(v) => setUploadData(prev => ({ ...prev, vendorId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Document Name *</Label>
                <Input 
                  value={uploadData.name}
                  onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., SOC 2 Type II Report 2024"
                />
              </div>

              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select value={uploadData.type} onValueChange={(v: Document['type']) => setUploadData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soc2_report">SOC 2 Report</SelectItem>
                    <SelectItem value="iso_certificate">ISO Certificate</SelectItem>
                    <SelectItem value="policy">Policy Document</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expiration Date (optional)</Label>
                <Input 
                  type="date"
                  value={uploadData.expirationDate}
                  onChange={(e) => setUploadData(prev => ({ ...prev, expirationDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>File *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-6 w-6 text-secondary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click or drag file to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                </div>
              </div>

              <div className="bg-secondary/10 rounded-lg p-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-secondary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">AI Analysis Enabled</p>
                  <p className="text-muted-foreground">Your document will be automatically analyzed for compliance, risks, and key findings.</p>
                </div>
              </div>

              <Button 
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={handleUpload}
                disabled={uploadDocument.isPending || analyzeDocument.isPending}
              >
                {uploadDocument.isPending ? 'Uploading...' : analyzeDocument.isPending ? 'Analyzing...' : 'Upload & Analyze'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analyzedDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{flaggedDocs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all',
          isDragging ? 'border-secondary bg-secondary/5' : 'border-border'
        )}
      >
        <Upload className={cn('h-10 w-10 mx-auto mb-3', isDragging ? 'text-secondary' : 'text-muted-foreground')} />
        <p className="text-muted-foreground">
          Drop files here or click <span className="text-secondary font-medium">Upload Document</span> to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOC, DOCX, XLS, XLSX</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="soc2_report">SOC 2 Report</SelectItem>
            <SelectItem value="iso_certificate">ISO Certificate</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reviewFilter} onValueChange={setReviewFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Review Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending Analysis</SelectItem>
            <SelectItem value="analyzed">Analyzed</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Review</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                  <p className="text-sm text-muted-foreground">Upload your first document to get started</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const status = statusConfig[doc.status];
                const reviewStatus = reviewStatusConfig[doc.review_status || 'pending'];
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedDocument(doc)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent rounded">
                          <FileText className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <span className="font-medium block">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getVendorName(doc.vendor_id)}</TableCell>
                    <TableCell>{documentTypeLabels[doc.type] || doc.type}</TableCell>
                    <TableCell>
                      <Badge className={cn('gap-1', status.class)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={reviewStatus.class}>
                        {doc.analyzed_at && <Sparkles className="h-3 w-3 mr-1" />}
                        {reviewStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(doc.upload_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedDocument(doc); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {!doc.analyzed_at && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAnalyze(doc); }}>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Analyze with AI
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteDocument.mutate(doc); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Document Details Sheet */}
      <Sheet open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
        <SheetContent className="sm:max-w-xl">
          {selectedDocument && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-secondary" />
                  {selectedDocument.name}
                </SheetTitle>
                <SheetDescription>
                  {documentTypeLabels[selectedDocument.type]} • {getVendorName(selectedDocument.vendor_id)}
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="analysis" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    {selectedDocument.analyzed_at ? (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-secondary" />
                              AI Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {selectedDocument.ai_summary || 'No summary available'}
                            </p>
                          </CardContent>
                        </Card>

                        {Array.isArray(selectedDocument.key_findings) && selectedDocument.key_findings.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <FileSearch className="h-4 w-4 text-blue-500" />
                                Key Findings
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {(selectedDocument.key_findings as string[]).map((finding, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {Array.isArray(selectedDocument.risk_flags) && selectedDocument.risk_flags.length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Flag className="h-4 w-4 text-destructive" />
                                Risk Flags
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {(selectedDocument.risk_flags as Array<{ severity: string; description: string }>).map((flag, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <Badge 
                                      className={cn(
                                        'text-xs',
                                        flag.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                                        flag.severity === 'medium' ? 'bg-warning/10 text-warning' :
                                        'bg-muted text-muted-foreground'
                                      )}
                                    >
                                      {flag.severity}
                                    </Badge>
                                    <span>{flag.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {selectedDocument.compliance_mapping && typeof selectedDocument.compliance_mapping === 'object' && Object.keys(selectedDocument.compliance_mapping as Record<string, unknown>).length > 0 && (
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Compliance Mapping</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {Object.entries(selectedDocument.compliance_mapping as Record<string, string[]>).map(([framework, controls]) => (
                                  <div key={framework}>
                                    <p className="text-sm font-medium">{framework}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Array.isArray(controls) && controls.map((control, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">{control}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Analyzed {format(new Date(selectedDocument.analyzed_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Document not yet analyzed</p>
                        <Button 
                          className="mt-4 bg-secondary hover:bg-secondary/90"
                          onClick={() => handleAnalyze(selectedDocument)}
                          disabled={analyzeDocument.isPending}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {analyzeDocument.isPending ? 'Analyzing...' : 'Analyze with AI'}
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">Document Type</Label>
                        <p className="font-medium">{documentTypeLabels[selectedDocument.type]}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">File Size</Label>
                        <p className="font-medium">{formatFileSize(selectedDocument.size)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Uploaded</Label>
                        <p className="font-medium">{format(new Date(selectedDocument.upload_date), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Expires</Label>
                        <p className="font-medium">
                          {selectedDocument.expiration_date 
                            ? format(new Date(selectedDocument.expiration_date), 'MMM d, yyyy')
                            : 'No expiration'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload(selectedDocument)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="review" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Current Status</Label>
                      <Badge className={cn('mt-1', reviewStatusConfig[selectedDocument.review_status || 'pending'].class)}>
                        {reviewStatusConfig[selectedDocument.review_status || 'pending'].label}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label>Update Review Status</Label>
                      <Select 
                        value={selectedDocument.review_status || 'pending'} 
                        onValueChange={(v) => handleReviewStatusChange(selectedDocument.id, v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Analysis</SelectItem>
                          <SelectItem value="analyzed">Analyzed</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="flagged">Flagged for Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reviewer Notes</Label>
                      <Textarea 
                        placeholder="Add notes about this document..."
                        value={reviewNotes || selectedDocument.reviewer_notes || ''}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={4}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateReviewStatus.mutate({ 
                          docId: selectedDocument.id, 
                          status: selectedDocument.review_status || 'pending',
                          notes: reviewNotes 
                        })}
                        disabled={updateReviewStatus.isPending}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
