'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { friendsService, Friend } from '@/lib/supabase/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Button from '@/components/ui/Button'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  Gift,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'

// 🔍 CONCEPT: Advanced State Management
interface FiltersState {
  search: string
  sortBy: 'name' | 'birthday' | 'created'
  sortOrder: 'asc' | 'desc'
  upcomingOnly: boolean
}

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    upcomingOnly: false
  })

  // 📊 CONCEPT: Data Loading with Error Handling
  const loadFriends = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const friendsData = await friendsService.getFriends()
      setFriends(friendsData)
      setFilteredFriends(friendsData)
    } catch (err: any) {
      console.error('Error loading friends:', err)
      setError(err.message || 'Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFriends()
  }, [user])

  // 🔍 CONCEPT: Advanced Filtering and Sorting
  useEffect(() => {
    let filtered = [...friends]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(friend =>
        friend.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        friend.interests.some(interest => 
          interest.toLowerCase().includes(filters.search.toLowerCase())
        )
      )
    }

    // Upcoming birthdays filter
    if (filters.upcomingOnly) {
      filtered = filtered.filter(friend => friend.days_until_birthday! <= 30)
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'birthday':
          comparison = (a.days_until_birthday || 0) - (b.days_until_birthday || 0)
          break
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredFriends(filtered)
  }, [friends, filters])

  // 🗑️ CONCEPT: Delete Confirmation Pattern
  const handleDeleteFriend = async () => {
    if (!selectedFriend) return
    
    try {
      await friendsService.deleteFriend(selectedFriend.id)
      await loadFriends() // Refresh the list
      setShowDeleteModal(false)
      setSelectedFriend(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete friend')
    }
  }

  const openDeleteModal = (friend: Friend) => {
    setSelectedFriend(friend)
    setShowDeleteModal(true)
  }

  // 📅 CONCEPT: Date Formatting Utilities
  const formatBirthday = (birthday: string) => {
    return new Date(birthday).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getBirthdayStatus = (daysUntil: number) => {
    if (daysUntil === 0) return { text: 'Today!', color: 'text-green-400' }
    if (daysUntil === 1) return { text: 'Tomorrow', color: 'text-yellow-400' }
    if (daysUntil <= 7) return { text: `${daysUntil} days`, color: 'text-orange-400' }
    if (daysUntil <= 30) return { text: `${daysUntil} days`, color: 'text-blue-400' }
    return { text: `${daysUntil} days`, color: 'text-gray-400' }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 📋 CONCEPT: Page Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Friends</h1>
            <p className="text-gray-400 mt-1">
              Manage your friends and their birthday information
            </p>
          </div>
          <Button href="/dashboard/add-friend">
            <Plus className="h-4 w-4 mr-2" />
            Add Friend
          </Button>
        </div>

        {/* 📊 CONCEPT: Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Total Friends</p>
                <p className="text-xl font-bold text-white">{friends.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-xl font-bold text-white">
                  {friends.filter(f => f.days_until_birthday! <= 30).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center">
              <Gift className="h-6 w-6 text-purple-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">This Week</p>
                <p className="text-xl font-bold text-white">
                  {friends.filter(f => f.days_until_birthday! <= 7).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-red-400 mr-3" />
              <div>
                <p className="text-sm text-gray-400">Today</p>
                <p className="text-xl font-bold text-white">
                  {friends.filter(f => f.days_until_birthday === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 CONCEPT: Advanced Filters and Search */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="birthday">Sort by Birthday</option>
              <option value="created">Sort by Added Date</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="flex items-center justify-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, upcomingOnly: !prev.upcomingOnly }))}
              className={`flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
                filters.upcomingOnly
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Upcoming Only
            </button>
          </div>
        </div>

        {/* 📋 CONCEPT: Friends List with Actions */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">
              All Friends ({filteredFriends.length})
            </h2>
          </div>

          <div className="p-6">
            {error ? (
              <div className="text-center py-8">
                <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
                <Button onClick={loadFriends}>Try Again</Button>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading friends...</p>
              </div>
            ) : filteredFriends.length > 0 ? (
              <div className="space-y-4">
                {filteredFriends.map((friend) => {
                  const birthdayStatus = getBirthdayStatus(friend.days_until_birthday || 0)
                  
                  return (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {friend.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Friend Info */}
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-lg">{friend.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatBirthday(friend.birthday)}
                            </span>
                            {friend.phone && (
                              <span className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {friend.phone}
                              </span>
                            )}
                            {friend.interests.length > 0 && (
                              <span className="flex items-center">
                                <Gift className="h-4 w-4 mr-1" />
                                {friend.interests.slice(0, 2).join(', ')}
                                {friend.interests.length > 2 && ' +more'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Birthday Countdown */}
                        <div className="text-right">
                          <p className={`font-medium ${birthdayStatus.color}`}>
                            {birthdayStatus.text}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Remind {friend.reminder_days_before} days before
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          href={`/dashboard/friends/edit/${friend.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteModal(friend)}
                          className="border-red-700 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">
                  {filters.search || filters.upcomingOnly ? 'No friends found' : 'No friends yet'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {filters.search || filters.upcomingOnly 
                    ? 'Try adjusting your search or filters'
                    : 'Add your first friend to start tracking birthdays!'
                  }
                </p>
                {!filters.search && !filters.upcomingOnly && (
                  <Button href="/dashboard/add-friend">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Friend
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🗑️ CONCEPT: Delete Confirmation Modal */}
        {showDeleteModal && selectedFriend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Friend</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong>{selectedFriend.name}</strong>? 
                This will remove all their information and reminder settings.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedFriend(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteFriend}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
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
