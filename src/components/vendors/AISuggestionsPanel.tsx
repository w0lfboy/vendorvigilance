import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Clock, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Vendor } from '@/hooks/useVendors';

interface Suggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface AISuggestionsPanelProps {
  vendor: Vendor;
}

export function AISuggestionsPanel({ vendor }: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-risk', {
        body: { vendor, type: 'suggestions' },
      });

      if (fnError) throw fnError;
      
      if (data?.error) {
        setError(data.error);
        return;
      }

      if (Array.isArray(data)) {
        setSuggestions(data);
      } else if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions([
          { title: 'Review security documentation', description: 'Ensure all compliance documents are up to date', priority: 'medium' },
          { title: 'Schedule risk assessment', description: 'Conduct regular vendor risk evaluations', priority: 'high' },
          { title: 'Update contact information', description: 'Verify vendor contacts are current', priority: 'low' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
      setError('Failed to load AI suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vendor) {
      fetchSuggestions();
    }
  }, [vendor.id]);

  const priorityIcons = {
    high: AlertCircle,
    medium: Clock,
    low: CheckCircle2,
  };

  const handleAccept = (suggestion: Suggestion) => {
    toast({
      title: 'Action accepted',
      description: `"${suggestion.title}" has been added to your tasks`,
    });
  };

  return (
    <div className="bg-gradient-to-br from-secondary to-primary rounded-lg shadow-card p-6 text-secondary-foreground">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg">AI Risk Suggestions</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-white/10"
          onClick={fetchSuggestions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Analyzing vendor risk...</span>
        </div>
      ) : error ? (
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <p className="text-sm opacity-80">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-secondary-foreground hover:bg-white/10"
            onClick={fetchSuggestions}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = priorityIcons[suggestion.priority];
            return (
              <div key={index} className="bg-white/10 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{suggestion.title}</p>
                    <p className="text-xs opacity-80 mt-1">{suggestion.description}</p>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="mt-2 h-7 text-xs bg-white/20 hover:bg-white/30 text-secondary-foreground"
                      onClick={() => handleAccept(suggestion)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
