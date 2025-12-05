import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';

export function AddVendorDialog() {
  const { createVendor } = useVendors();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    category: '',
    annual_value: '',
    contact_name: '',
    contact_email: '',
    risk_tier: 'medium' as 'critical' | 'high' | 'medium' | 'low',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createVendor.mutateAsync({
      name: formData.name,
      website: formData.website || null,
      category: formData.category,
      annual_value: parseFloat(formData.annual_value) || 0,
      contact_name: formData.contact_name || null,
      contact_email: formData.contact_email || null,
      risk_tier: formData.risk_tier,
      risk_score: formData.risk_tier === 'critical' ? 9 : formData.risk_tier === 'high' ? 7 : formData.risk_tier === 'medium' ? 5 : 2,
    });

    setOpen(false);
    setFormData({
      name: '',
      website: '',
      category: '',
      annual_value: '',
      contact_name: '',
      contact_email: '',
      risk_tier: 'medium',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>Add a new third-party vendor to your risk management portfolio</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vendor Name *</Label>
              <Input 
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input 
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="acme.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cloud Infrastructure">Cloud Infrastructure</SelectItem>
                  <SelectItem value="Payment Processing">Payment Processing</SelectItem>
                  <SelectItem value="Data Storage">Data Storage</SelectItem>
                  <SelectItem value="Identity Management">Identity Management</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="Software Development">Software Development</SelectItem>
                  <SelectItem value="Network Services">Network Services</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Risk Tier</Label>
              <Select 
                value={formData.risk_tier} 
                onValueChange={(v: any) => setFormData(prev => ({ ...prev, risk_tier: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Annual Contract Value ($)</Label>
            <Input 
              type="number"
              value={formData.annual_value}
              onChange={(e) => setFormData(prev => ({ ...prev, annual_value: e.target.value }))}
              placeholder="100000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input 
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input 
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="john@acme.com"
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full bg-secondary hover:bg-secondary/90 text-white"
            disabled={createVendor.isPending || !formData.name || !formData.category}
          >
            {createVendor.isPending ? 'Adding...' : 'Add Vendor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
