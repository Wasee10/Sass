'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card, { CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { User, Building, Mail, Lock, CheckCircle2, AlertCircle, ShieldAlert, Trash2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, profile, isConfigured, updateProfile, updatePassword, deleteAccount } = useAuth();

  const [fullName, setFullName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || ''
  );
  const [companyName, setCompanyName] = useState(
    profile?.company_name || user?.user_metadata?.company_name || ''
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await updateProfile({
        full_name: fullName,
        company_name: companyName,
      });

      if (res?.error) {
        setProfileError(res.error.message);
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 4000);
      }
    } catch (err) {
      setProfileError('Failed to save profile changes.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await updatePassword(newPassword);
      if (res?.error) {
        setPasswordError(res.error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 4000);
      }
    } catch (err) {
      setPasswordError('Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const result = await deleteAccount();
      if (result?.error) {
        setDeleteError(result.error.message);
      } else {
        setDeleteModalOpen(false);
      }
    } catch {
      setDeleteError('Account deletion failed. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Manage your personal details, workspace company, and authentication security.
        </p>
      </div>

      {/* Profile Details Form */}
      <Card style={{ padding: '2rem' }}>
        <CardTitle style={{ marginBottom: '0.35rem' }}>Personal Profile</CardTitle>
        <CardDescription style={{ marginBottom: '1.5rem' }}>
          Your identity details associated with team workspaces and billing receipts.
        </CardDescription>

        {profileSuccess && (
          <div className="alert alert-success animate-fade-in">
            <CheckCircle2 size={18} />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        {profileError && (
          <div className="alert alert-error animate-fade-in">
            <AlertCircle size={18} />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Full Name"
              id="settings-name"
              icon={User}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Company or Organization"
              id="settings-company"
              icon={Building}
              value={companyName}
              placeholder="e.g. Acme Corp"
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <Input
            label="Email Address"
            id="settings-email"
            icon={Mail}
            value={user?.email || ''}
            disabled
            hint="Account email is managed through your authentication provider."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" variant="primary" loading={profileLoading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Password */}
      <Card style={{ padding: '2rem' }}>
        <CardTitle style={{ marginBottom: '0.35rem' }}>Security & Password</CardTitle>
        <CardDescription style={{ marginBottom: '1.5rem' }}>
          Ensure your account uses a strong, unique password to prevent unauthorized access.
        </CardDescription>

        {passwordSuccess && (
          <div className="alert alert-success animate-fade-in">
            <CheckCircle2 size={18} />
            <span>Your password has been changed successfully.</span>
          </div>
        )}

        {passwordError && (
          <div className="alert alert-error animate-fade-in">
            <AlertCircle size={18} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="New Password"
              id="settings-new-password"
              type="password"
              icon={Lock}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              id="settings-confirm-password"
              type="password"
              icon={Lock}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button type="submit" variant="secondary" loading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card style={{ padding: '2rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={20} color="var(--danger)" />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--danger)', fontWeight: 600 }}>Danger Zone</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {isConfigured
            ? 'Permanently delete your account and associated profile, subscription, and invoice records.'
            : 'Clear this local demo session. No account data is stored in the demo.'}
        </p>

        <Button
          variant="danger"
          icon={Trash2}
          onClick={() => {
            setDeleteConfirmation('');
            setDeleteError(null);
            setDeleteModalOpen(true);
          }}
        >
          Delete Account
        </Button>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteConfirmation('');
            setDeleteModalOpen(false);
          }
        }}
        title="Confirm Account Deletion"
        description={isConfigured
          ? 'This permanently deletes your account and associated profile, subscription, and invoice records. Type DELETE to confirm.'
          : 'This clears the local demo session from this browser. Type DELETE to confirm.'}
      >
        {deleteError && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={18} />
            <span>{deleteError}</span>
          </div>
        )}
        <Input
          label="Confirmation"
          id="delete-account-confirmation"
          value={deleteConfirmation}
          onChange={(event) => setDeleteConfirmation(event.target.value)}
          placeholder="Type DELETE"
          autoComplete="off"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button
            variant="secondary"
            disabled={deleteLoading}
            onClick={() => {
              setDeleteConfirmation('');
              setDeleteModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteLoading}
            disabled={deleteConfirmation !== 'DELETE'}
            onClick={handleDeleteAccount}
          >
            Yes, Permanently Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
