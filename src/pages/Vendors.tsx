import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X, ExternalLink, MoreHorizontal, Mail, FileText, Loader2, Trash2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useVendors, type Vendor } from '@/hooks/useVendors';
import { AddVendorDialog } from '@/components/vendors/AddVendorDialog';
import { format } from 'date-fns';

const riskTierStyles = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-info text-info-foreground',
  low: 'bg-success text-success-foreground',
};

const riskBorderStyles = {
  critical: 'border-l-destructive',
  high: 'border-l-warning',
  medium: 'border-l-info',
  low: 'border-l-success',
};

const statusStyles = {
  active: 'bg-success/10 text-success border-success/30',
  pending: 'bg-warning/10 text-warning border-warning/30',
  offboarded: 'bg-muted text-muted-foreground border-muted-foreground/30',
};

export default function Vendors() {
  const { vendors, isLoading, deleteVendor } = useVendors();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk_score');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const filteredVendors = vendors
    .filter((vendor) => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'all' || vendor.risk_tier === riskFilter;
      const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
      return matchesSearch && matchesRisk && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'risk_score') return (b.risk_score || 0) - (a.risk_score || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'last_assessment') {
        const dateA = a.last_assessment ? new Date(a.last_assessment).getTime() : 0;
        const dateB = b.last_assessment ? new Date(b.last_assessment).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === 'annual_value') return (b.annual_value || 0) - (a.annual_value || 0);
      return 0;
    });

  const addFilter = (type: string, value: string) => {
    const filterKey = `${type}:${value}`;
    if (!activeFilters.includes(filterKey) && value !== 'all') {
      setActiveFilters([...activeFilters.filter(f => !f.startsWith(`${type}:`)), filterKey]);
    } else if (value === 'all') {
      setActiveFilters(activeFilters.filter(f => !f.startsWith(`${type}:`)));
    }
    if (type === 'risk') setRiskFilter(value);
    if (type === 'status') setStatusFilter(value);
  };

  const removeFilter = (filterKey: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filterKey));
    const [type] = filterKey.split(':');
    if (type === 'risk') setRiskFilter('all');
    if (type === 'status') setStatusFilter('all');
  };

  const handleDeleteVendor = async () => {
    if (vendorToDelete) {
      await deleteVendor.mutateAsync(vendorToDelete.id);
      setVendorToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <p className="text-muted-foreground">Manage and monitor your third-party vendors</p>
        </div>
        <AddVendorDialog />
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={riskFilter} onValueChange={(v) => addFilter('risk', v)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => addFilter('status', v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="offboarded">Offboarded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk_score">Risk Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="last_assessment">Last Assessment</SelectItem>
                <SelectItem value="annual_value">Annual Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => {
              const [type, value] = filter.split(':');
              return (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="bg-secondary/20 text-secondary hover:bg-secondary/30 cursor-pointer"
                >
                  {type}: {value}
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={() => removeFilter(filter)}
                  />
                </Badge>
              );
            })}
            <button
              className="text-sm text-secondary hover:text-secondary/80"
              onClick={() => {
                setActiveFilters([]);
                setRiskFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Vendor Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center shadow-card">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-4">
              {vendors.length === 0 
                ? 'Get started by adding your first vendor'
                : 'Try adjusting your search or filters'
              }
            </p>
            {vendors.length === 0 && <AddVendorDialog />}
          </div>
        ) : (
          filteredVendors.map((vendor, index) => (
            <VendorCard 
              key={vendor.id} 
              vendor={vendor} 
              index={index} 
              onDelete={() => setVendorToDelete(vendor)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredVendors.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!vendorToDelete} onOpenChange={() => setVendorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{vendorToDelete?.name}"? This action cannot be undone and will remove all associated assessments, documents, and issues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVendor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function VendorCard({ vendor, index, onDelete }: { vendor: Vendor; index: number; onDelete: () => void }) {
  return (
    <div
      className={cn(
        'bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200 border-l-4 p-5 animate-fade-in',
        riskBorderStyles[vendor.risk_tier]
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/vendors/${vendor.id}`}
              className="text-lg font-semibold text-card-foreground hover:text-secondary transition-colors"
            >
              {vendor.name}
            </Link>
            <Badge className={cn('text-xs', riskTierStyles[vendor.risk_tier])}>
              {vendor.risk_tier.toUpperCase()} ({(vendor.risk_score || 0).toFixed(1)})
            </Badge>
            <Badge variant="outline" className={cn('text-xs', statusStyles[vendor.status])}>
              {vendor.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-card-foreground">{vendor.category}</span>
            <span>•</span>
            <span>${(vendor.annual_value || 0).toLocaleString()}/year</span>
            {vendor.website && (
              <>
                <span>•</span>
                <a
                  href={`https://${vendor.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-secondary hover:text-secondary/80"
                >
                  {vendor.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Last Assessment</p>
              <p className="text-sm font-medium text-card-foreground">
                {vendor.last_assessment 
                  ? format(new Date(vendor.last_assessment), 'MMM d, yyyy')
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Issues</p>
              <p className={cn(
                'text-sm font-medium',
                (vendor.open_issues || 0) > 0 ? 'text-warning' : 'text-success'
              )}>
                {vendor.open_issues || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="text-sm font-medium text-card-foreground">{vendor.documents_count || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/vendors/${vendor.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Vendor
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Request Assessment
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vendor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
