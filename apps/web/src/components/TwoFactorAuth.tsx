/**
 * Two-Factor Authentication Settings Component
 *
 * - Enable 2FA with QR code setup
 * - Disable 2FA
 * - Regenerate backup codes
 * - View backup codes status
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiSmartphone,
  FiKey,
  FiCheckCircle,
  FiX,
  FiCopy,
  FiDownload,
  FiAlertTriangle,
  FiLoader,
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TwoFactorAuthProps {
  onClose?: () => void;
}

interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  enabledAt: string | null;
  remainingBackupCodes: number;
}

interface SetupData {
  secret: string;
  qrCode: string; // Data URL
  backupCodes: string[];
}

export default function TwoFactorAuth({ onClose }: TwoFactorAuthProps) {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'scan' | 'verify' | 'backup'>('scan');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Load 2FA status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/2fa/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 'success') {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
      toast.error('Failed to load 2FA status');
    } finally {
      setIsLoading(false);
    }
  };

  // Start 2FA setup
  const startSetup = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/2fa/setup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setSetupData(response.data.data);
        setShowSetup(true);
        setStep('scan');
      }
    } catch (error: any) {
      console.error('Failed to start 2FA setup:', error);
      toast.error(error.response?.data?.message || 'Failed to start 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify and enable 2FA
  const verifyAndEnable = async () => {
    try {
      if (!verificationCode || verificationCode.length !== 6) {
        toast.error('Please enter a valid 6-digit code');
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/2fa/verify`,
        { token: verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('2FA enabled successfully!');
        setStep('backup');
      }
    } catch (error: any) {
      console.error('2FA verification failed:', error);
      toast.error(error.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    try {
      if (!password) {
        toast.error('Please enter your password');
        return;
      }

      if (!confirm('Are you sure you want to disable 2FA? Your account will be less secure.')) {
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/2fa/disable`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('2FA disabled');
        setPassword('');
        await loadStatus();
      }
    } catch (error: any) {
      console.error('Failed to disable 2FA:', error);
      toast.error(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    try {
      if (!password) {
        toast.error('Please enter your password');
        return;
      }

      if (!confirm('This will invalidate your existing backup codes. Continue?')) {
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/2fa/regenerate-backup-codes`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        toast.success('New backup codes generated!');
        setSetupData({
          secret: '',
          qrCode: '',
          backupCodes: response.data.backupCodes,
        });
        setShowSetup(true);
        setStep('backup');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Failed to regenerate backup codes:', error);
      toast.error(error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy backup codes
  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      toast.success('Backup codes copied to clipboard');
    }
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const content = `Education Platform - 2FA Backup Codes\n\n${setupData.backupCodes.join('\n')}\n\n⚠️ Store these codes in a safe place!\n⚠️ Each code can only be used once.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '2fa-backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup codes downloaded');
    }
  };

  if (isLoading && !status) {
    return (
      <div className="flex items-center justify-center p-8">
        <FiLoader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FiShield className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-text-primary">
            Two-Factor Authentication
          </h2>
        </div>
        <p className="text-text-secondary">
          Add an extra layer of security to your account by requiring a code from your phone in addition to your password.
        </p>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && setupData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => step === 'backup' && setShowSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Step 1: Scan QR Code */}
              {step === 'scan' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">
                      Scan QR Code
                    </h3>
                    <button
                      onClick={() => setShowSetup(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      1. Download an authenticator app like{' '}
                      <strong>Google Authenticator</strong> or <strong>Authy</strong>
                    </p>
                    <p className="text-sm text-text-secondary">
                      2. Scan this QR code with your app:
                    </p>

                    {/* QR Code */}
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img
                        src={setupData.qrCode}
                        alt="2FA QR Code"
                        className="w-64 h-64"
                      />
                    </div>

                    {/* Manual Entry */}
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary-500 hover:text-primary-600">
                        Can't scan? Enter code manually
                      </summary>
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs break-all">
                        {setupData.secret}
                      </div>
                    </details>

                    <button
                      onClick={() => setStep('verify')}
                      className="w-full btn-primary"
                    >
                      Next: Verify Code
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Verify Code */}
              {step === 'verify' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">
                      Verify Code
                    </h3>
                    <button
                      onClick={() => setShowSetup(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      Enter the 6-digit code from your authenticator app:
                    </p>

                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      placeholder="000000"
                      className="w-full text-center text-3xl font-bold tracking-widest px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      maxLength={6}
                      autoFocus
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep('scan')}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        onClick={verifyAndEnable}
                        disabled={verificationCode.length !== 6 || isLoading}
                        className="flex-1 btn-primary disabled:opacity-50"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Backup Codes */}
              {step === 'backup' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <FiCheckCircle className="text-green-500" />
                      Backup Codes
                    </h3>
                    <button
                      onClick={() => {
                        setShowSetup(false);
                        loadStatus();
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex gap-2">
                        <FiAlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Save these codes now!</strong> Each code can only be used once. Store them in a safe place.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">
                      {setupData.backupCodes.map((code, index) => (
                        <div key={index} className="text-center py-1">
                          {code}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={copyBackupCodes}
                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                      >
                        <FiCopy /> Copy
                      </button>
                      <button
                        onClick={downloadBackupCodes}
                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                      >
                        <FiDownload /> Download
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setShowSetup(false);
                        loadStatus();
                      }}
                      className="w-full btn-primary"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {status?.twoFactorEnabled ? (
        /* 2FA Enabled State */
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  2FA is Active
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your account is protected with two-factor authentication.
                  {status.enabledAt && ` Enabled on ${new Date(status.enabledAt).toLocaleDateString()}.`}
                </p>
              </div>
            </div>
          </div>

          {/* Backup Codes Status */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiKey className="w-5 h-5 text-gray-500" />
                <h4 className="font-semibold text-text-primary">Backup Codes</h4>
              </div>
              <span className="text-sm text-text-secondary">
                {status.remainingBackupCodes} remaining
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-3">
              Regenerate backup codes if you've used them or lost access.
            </p>
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={regenerateBackupCodes}
                disabled={!password || isLoading}
                className="w-full btn-secondary disabled:opacity-50"
              >
                Regenerate Backup Codes
              </button>
            </div>
          </div>

          {/* Disable 2FA */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-text-primary mb-2">Disable 2FA</h4>
            <p className="text-sm text-text-secondary mb-3">
              This will make your account less secure. Only do this if you no longer have access to your authenticator app.
            </p>
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={disable2FA}
                disabled={!password || isLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2FA Disabled State */
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  2FA is Not Enabled
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your account is only protected by your password. Enable 2FA for extra security.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <FiSmartphone className="w-8 h-8 text-primary-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-text-primary mb-2">
                  How it works
                </h4>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>You'll scan a QR code with your phone's authenticator app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Each time you log in, you'll enter a 6-digit code from the app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>You'll also receive backup codes for emergencies</span>
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={startSetup}
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
