'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { friendsService } from '@/lib/supabase/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Button from '@/components/ui/Button'
import { ArrowLeft, Calendar, User, Phone, Heart } from 'lucide-react'

// 🎂 CONCEPT: Form State Management for Complex Forms
interface FriendFormData {
  name: string
  birthday: string
  phone: string
  interests: string[]
  reminderDays: number
}

export default function AddFriendPage() {
  const [formData, setFormData] = useState<FriendFormData>({
    name: '',
    birthday: '',
    phone: '',
    interests: [],
    reminderDays: 7
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interestInput, setInterestInput] = useState('')
  
  const router = useRouter()

  // 🔄 CONCEPT: Controlled Form Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) setError(null)
  }

  // 🏷️ CONCEPT: Dynamic Array Management
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
    
    // Check if birthday is in the future (reasonable check)
    const birthdayDate = new Date(formData.birthday)
    const today = new Date()
    if (birthdayDate > today) {
      setError('Birthday cannot be in the future')
      return false
    }
    
    return true
  }

  // 💾 CONCEPT: Real Database Integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)
    
    try {
      // 📊 CONCEPT: Service Layer Usage
      await friendsService.addFriend({
        name: formData.name,
        birthday: formData.birthday,
        phone: formData.phone || undefined,
        email: undefined, // We'll add email field later
        interests: formData.interests,
        reminder_days_before: formData.reminderDays,
        notes: undefined,
        is_active: true
      })
      
      // 🎉 CONCEPT: Success Redirect with State
      router.push('/dashboard?success=friend-added')
    } catch (err: any) {
      console.error('Error adding friend:', err)
      setError(err.message || 'Failed to add friend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* 🔙 CONCEPT: Navigation Breadcrumbs */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Add New Friend</h1>
          <p className="text-gray-400">Set up birthday reminders for someone special</p>
        </div>

        {/* 📝 CONCEPT: Multi-Section Form */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
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

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number (Optional)
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
                <p className="text-sm text-gray-400 mt-1">
                  Phone number for voice reminders (optional)
                </p>
              </div>
            </div>

            {/* Interests Section */}
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
                    placeholder="Add an interest (e.g., books, music, sports)"
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
                
                <p className="text-sm text-gray-400">
                  Add interests to help AI generate personalized gift suggestions
                </p>
              </div>
            </div>

            {/* Reminder Settings Section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Reminder Settings
              </h3>
              
              <div>
                <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-300 mb-2">
                  Remind me how many days before?
                </label>
                <select
                  id="reminderDays"
                  name="reminderDays"
                  value={formData.reminderDays}
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
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Adding Friend...' : 'Add Friend'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
