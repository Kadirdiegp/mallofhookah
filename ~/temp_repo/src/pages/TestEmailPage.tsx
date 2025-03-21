import { useState } from 'react';
import { checkEmailConfirmationSettings, sendTestEmail } from '../hooks/useAuth';

interface EmailSettings {
  [key: string]: unknown;
}

const TestEmailPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailSettings | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await checkEmailConfirmationSettings();
      setResult(settings);
    } catch (e) {
      setError('Failed to check email settings. See console for details.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await sendTestEmail(email);
      if (success) {
        setResult(`Test email sent to ${email}. Check your inbox and spam folder.`);
      } else {
        setError('Failed to send test email. See console for details.');
      }
    } catch (e) {
      setError('An error occurred while sending the test email.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-purple-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <div className="uppercase tracking-wide text-sm text-indigo-600 font-bold mb-1">
              Email Configuration Test
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Test Supabase Email Settings
            </h1>
            
            <div className="mb-8">
              <button
                onClick={handleCheckSettings}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mb-4"
              >
                {loading ? 'Checking...' : 'Check Email Settings'}
              </button>
            </div>
            
            <div className="mb-8">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address for Testing
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleSendTestEmail}
                disabled={loading || !email}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {loading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {result && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <pre className="whitespace-pre-wrap text-sm">
                  {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
                </pre>
              </div>
            )}
            
            <div className="mt-8 text-sm text-gray-600">
              <h3 className="font-bold mb-2">Troubleshooting:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure your Supabase project has email configured in the Auth settings.</li>
                <li>The free tier of Supabase has email sending limitations.</li>
                <li>Check your spam/junk folder for confirmation emails.</li>
                <li>Verify the email address you're using is valid and accessible.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmailPage;
