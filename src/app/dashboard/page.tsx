'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { friendsService, Friend, profileService, Profile } from '@/lib/supabase/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Button from '@/components/ui/Button'
import { Calendar, Users, Gift, Plus, Clock } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔄 CONCEPT: Real Data Loading from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        // 📊 CONCEPT: Service Layer Usage
        const [friendsData, profileData] = await Promise.all([
          friendsService.getFriends(),
          profileService.getProfile()
        ])
        setFriends(friendsData)
        setProfile(profileData)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const upcomingBirthdays = friends.filter(friend => friend.days_until_birthday! <= 30)
  const userName = profile?.first_name || 'there'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 👋 CONCEPT: Welcome Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-300">
            You have {upcomingBirthdays.length} birthdays coming up in the next 30 days
          </p>
        </div>

        {/* 📊 CONCEPT: Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Friends</p>
                <p className="text-2xl font-bold text-white">{friends.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Upcoming (30 days)</p>
                <p className="text-2xl font-bold text-white">{upcomingBirthdays.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Reminders Set</p>
                <p className="text-2xl font-bold text-white">{friends.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎂 CONCEPT: Upcoming Birthdays Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Upcoming Birthdays</h2>
            <Button href="/dashboard/add-friend" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading birthdays...</p>
              </div>
            ) : upcomingBirthdays.length > 0 ? (
              <div className="space-y-4">
                {upcomingBirthdays.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {friend.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{friend.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(friend.birthday).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {friend.days_until_birthday === 0 ? 'Today!' : 
                           friend.days_until_birthday === 1 ? 'Tomorrow' : 
                           `${friend.days_until_birthday} days`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Interests: {friend.interests.join(', ')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Gift className="h-4 w-4 mr-2" />
                        Get Ideas
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">No upcoming birthdays</h3>
                <p className="text-gray-400 mb-4">Add some friends to start tracking birthdays!</p>
                <Button href="/dashboard/add-friend">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Friend
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 🚀 CONCEPT: Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-white text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button href="/dashboard/add-friend" variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-3" />
                Add New Friend
              </Button>
              <Button href="/dashboard/settings" variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-3" />
                Set Reminder Preferences
              </Button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-white text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-3 text-gray-400">
              <p className="text-sm">• Welcome to WishWell! 🎉</p>
              <p className="text-sm">• Set up your first birthday reminder</p>
              <p className="text-sm">• Explore AI gift suggestions</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
