'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { friendsService, Friend } from '@/lib/supabase/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Button from '@/components/ui/Button'
import { ArrowLeft, Calendar, User, Phone, Heart, Save, Trash2 } from 'lucide-react'

// 🎯 CONCEPT: Edit Form Data Interface
interface EditFriendFormData {
  name: string
  birthday: string
  phone: string
  email: string
  interests: string[]
  reminder_days_before: number
  notes: string
}

export default function EditFriendPage() {
  const [formData, setFormData] = useState<EditFriendFormData>({
    name: '',
    birthday: '',
    phone: '',
    email: '',
    interests: [],
    reminder_days_before: 7,
    notes: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interestInput, setInterestInput] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [originalFriend, setOriginalFriend] = useState<Friend | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const friendId = params.id as string

  // 📊 CONCEPT: Load Existing Friend Data
  useEffect(() => {
    const loadFriend = async () => {
      if (!friendId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const friend = await friendsService.getFriend(friendId)
        if (!friend) {
          setError('Friend not found')
          return
        }
        
        setOriginalFriend(friend)
        setFormData({
          name: friend.name,
          birthday: friend.birthday,
          phone: friend.phone || '',
          email: friend.email || '',
          interests: friend.interests,
          reminder_days_before: friend.reminder_days_before,
          notes: friend.notes || ''
        })
      } catch (err: any) {
        console.error('Error loading friend:', err)
        setError(err.message || 'Failed to load friend data')
      } finally {
        setLoading(false)
      }
    }

    loadFriend()
  }, [friendId])

  // 🔄 CONCEPT: Form Change Handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reminder_days_before' ? parseInt(value) : value
    }))
    if (error) setError(null)
  }

  // 🏷️ CONCEPT: Interest Management
  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }))
      setInterestInput('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  // ✅ CONCEPT: Form Validation
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    
    if (!formData.birthday) {
      setError('Birthday is required')
      return false
    }
    
    const birthdayDate = new Date(formData.birthday)
    const today = new Date()
    if (birthdayDate > today) {
      setError('Birthday cannot be in the future')
      return false
    }
    
    return true
  }

  // 💾 CONCEPT: Update Friend Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    setError(null)
    
    try {
      await friendsService.updateFriend(friendId, {
        name: formData.name,
        birthday: formData.birthday,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        interests: formData.interests,
        reminder_days_before: formData.reminder_days_before,
        notes: formData.notes || undefined,
      })
      
      router.push('/dashboard/friends?success=friend-updated')
    } catch (err: any) {
      console.error('Error updating friend:', err)
      setError(err.message || 'Failed to update friend')
    } finally {
      setSaving(false)
    }
  }

  // 🗑️ CONCEPT: Delete Friend
  const handleDelete = async () => {
    try {
      await friendsService.deleteFriend(friendId)
      router.push('/dashboard/friends?success=friend-deleted')
    } catch (err: any) {
      setError(err.message || 'Failed to delete friend')
    }
  }

  // 🔄 CONCEPT: Reset Form
  const resetForm = () => {
    if (originalFriend) {
      setFormData({
        name: originalFriend.name,
        birthday: originalFriend.birthday,
        phone: originalFriend.phone || '',
        email: originalFriend.email || '',
        interests: originalFriend.interests,
        reminder_days_before: originalFriend.reminder_days_before,
        notes: originalFriend.notes || ''
      })
      setError(null)
    }
  }

  // 📊 CONCEPT: Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-white ml-3">Loading friend data...</span>
        </div>
      </DashboardLayout>
    )
  }

  // ❌ CONCEPT: Error State
  if (error && !originalFriend) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-lg">
            <h3 className="font-medium mb-2">Error Loading Friend</h3>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => router.push('/dashboard/friends')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Friends
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* 🔙 CONCEPT: Navigation Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard/friends')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Friends
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Edit Friend</h1>
              <p className="text-gray-400">Update {originalFriend?.name}'s information</p>
            </div>
            
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="outline"
              className="border-red-700 text-red-400 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* 📝 CONCEPT: Edit Form */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Enter friend's name"
                  />
                </div>

                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-300 mb-2">
                    Birthday *
                  </label>
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    required
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="friend@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Interests & Hobbies
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Add an interest"
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    Add
                  </Button>
                </div>
                
                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-2 text-blue-200 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Any additional notes about this friend..."
              />
            </div>

            {/* Reminder Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Reminder Settings
              </h3>
              
              <div>
                <label htmlFor="reminder_days_before" className="block text-sm font-medium text-gray-300 mb-2">
                  Remind me how many days before?
                </label>
                <select
                  id="reminder_days_before"
                  name="reminder_days_before"
                  value={formData.reminder_days_before}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before</option>
                  <option value={7}>1 week before</option>
                  <option value={14}>2 weeks before</option>
                  <option value={30}>1 month before</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Reset Changes
              </Button>
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
        </div>

        {/* 🗑️ CONCEPT: Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Friend</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong>{formData.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
