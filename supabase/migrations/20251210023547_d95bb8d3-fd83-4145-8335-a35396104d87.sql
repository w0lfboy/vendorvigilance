-- Enable realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Enable realtime for vendor_assessments table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_assessments;

-- Enable realtime for vendors table
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;