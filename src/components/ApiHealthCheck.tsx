import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiCall } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const ApiHealthCheck = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setStatus('loading');
    setError(null);
    
    try {
      const data = await apiCall(API_ENDPOINTS.HEALTH);
      setHealthData(data);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">API Health Check</h3>
        <Button variant="outline" size="sm" onClick={checkHealth}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {status === 'loading' && (
            <Badge variant="secondary">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Checking...
            </Badge>
          )}
          {status === 'success' && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Failed
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">API URL:</span>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {API_ENDPOINTS.HEALTH}
          </code>
        </div>

        {healthData && (
          <div className="text-xs text-muted-foreground">
            <div>Message: {healthData.message}</div>
            <div>Environment: {healthData.environment}</div>
            <div>Version: {healthData.version}</div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Error: {error}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ApiHealthCheck;