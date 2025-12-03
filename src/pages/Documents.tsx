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
  Clock
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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function Documents() {
  const { documents, isLoading, uploadDocument, deleteDocument, getDownloadUrl } = useDocuments();
  const { vendors } = useVendors();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
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
    return matchesSearch && matchesType && matchesStatus;
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

    await uploadDocument.mutateAsync({
      file: selectedFile,
      vendorId: uploadData.vendorId,
      name: uploadData.name,
      type: uploadData.type,
      expirationDate: uploadData.expirationDate || undefined,
    });

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
          <p className="text-muted-foreground">Manage and organize vendor compliance documents</p>
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
              <DialogDescription>Upload a new compliance document to the vault</DialogDescription>
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
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
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
                    style={{ position: 'relative' }}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={handleUpload}
                disabled={uploadDocument.isPending}
              >
                {uploadDocument.isPending ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
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
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent rounded">
                          <FileText className="h-4 w-4 text-secondary" />
                        </div>
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{documentTypeLabels[doc.type] || doc.type}</TableCell>
                    <TableCell>{format(new Date(doc.upload_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {doc.expiration_date 
                        ? format(new Date(doc.expiration_date), 'MMM d, yyyy')
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('gap-1', status.class)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteDocument.mutate(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
