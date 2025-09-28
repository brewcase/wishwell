'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { profileService, Profile } from '@/lib/supabase/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Button from '@/components/ui/Button'
import { User, Mail, Phone, Clock, Save, ArrowLeft } from 'lucide-react'

// 🎯 CONCEPT: Settings Form Data Interface
interface SettingsFormData {
  firstName: string
  lastName: string
  phone: string
  timezone: string
  reminderPreferences: {
    voice_enabled: boolean
    email_enabled: boolean
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    timezone: 'America/New_York',
    reminderPreferences: {
      voice_enabled: true,
      email_enabled: true
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 📊 CONCEPT: Load User Profile Data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        const profile = await profileService.getProfile()
        if (profile) {
          setFormData({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            phone: profile.phone || '',
            timezone: profile.timezone || 'America/New_York',
            reminderPreferences: profile.reminder_preferences || {
              voice_enabled: true,
              email_enabled: true
            }
          })
        }
      } catch (err: any) {
        console.error('Error loading profile:', err)
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // 🔄 CONCEPT: Form Change Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData(prev => ({
        ...prev,
        reminderPreferences: {
          ...prev.reminderPreferences,
          [name]: checkbox.checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  // ✅ CONCEPT: Form Validation
  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    
    if (formData.firstName.trim().length < 2) {
      setError('First name must be at least 2 characters')
      return false
    }
    
    if (formData.lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters')
      return false
    }
    
    return true
  }

  // 💾 CONCEPT: Update Profile Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      await profileService.updateProfile({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        timezone: formData.timezone,
        reminder_preferences: formData.reminderPreferences
      })
      
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* 🔙 CONCEPT: Navigation Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm"
            href="/dashboard"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
        </div>

        {/* 📝 CONCEPT: Settings Form */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white ml-3">Loading settings...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Account Information
                </h3>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Preferences
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Anchorage">Alaska Time (AT)</option>
                      <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Reminder Methods
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="voice_enabled"
                          checked={formData.reminderPreferences.voice_enabled}
                          onChange={handleChange}
                          className="rounded border-gray-700 text-white focus:ring-white focus:ring-offset-gray-800"
                        />
                        <span className="ml-2 text-gray-300">Voice calls (via Twilio)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="email_enabled"
                          checked={formData.reminderPreferences.email_enabled}
                          onChange={handleChange}
                          className="rounded border-gray-700 text-white focus:ring-white focus:ring-offset-gray-800"
                        />
                        <span className="ml-2 text-gray-300">Email notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-800">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
