import { supabase } from './client'

// 🎯 CONCEPT: Service Layer Pattern
// Centralized database operations for better organization and reusability

// 📊 TYPES: Database Types
export interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone?: string
  timezone?: string
  reminder_preferences?: {
    voice_enabled: boolean
    email_enabled: boolean
  }
  created_at: string
  updated_at: string
}

export interface Friend {
  id: string
  user_id: string
  name: string
  birthday: string
  phone?: string
  email?: string
  interests: string[]
  reminder_days_before: number
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  days_until_birthday?: number
}

export interface Reminder {
  id: string
  friend_id: string
  user_id: string
  reminder_date: string
  status: 'pending' | 'sent' | 'failed'
  reminder_type: 'voice' | 'email' | 'sms'
  created_at: string
  sent_at?: string
}

// 👤 PROFILE OPERATIONS
export const profileService = {
  // Get current user's profile
  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  },

  // Update user profile
  async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    return data
  }
}

// 🎂 FRIENDS OPERATIONS
export const friendsService = {
  // Get all friends for current user
  async getFriends(): Promise<Friend[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching friends:', error)
      throw error
    }

    // Calculate days until birthday for each friend
    return data.map(friend => ({
      ...friend,
      days_until_birthday: calculateDaysUntilBirthday(friend.birthday)
    }))
  },

  // Get upcoming birthdays (next 30 days)
  async getUpcomingBirthdays(days: number = 30): Promise<Friend[]> {
    const friends = await this.getFriends()
    return friends
      .filter(friend => friend.days_until_birthday! <= days)
      .sort((a, b) => a.days_until_birthday! - b.days_until_birthday!)
  },

  // Add new friend
  async addFriend(friendData: Omit<Friend, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Friend> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('friends')
      .insert({
        ...friendData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding friend:', error)
      throw error
    }

    return {
      ...data,
      days_until_birthday: calculateDaysUntilBirthday(data.birthday)
    }
  },

  // Update friend
  async updateFriend(friendId: string, updates: Partial<Friend>): Promise<Friend> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('friends')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', friendId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating friend:', error)
      throw error
    }

    return {
      ...data,
      days_until_birthday: calculateDaysUntilBirthday(data.birthday)
    }
  },

  // Delete friend (soft delete)
  async deleteFriend(friendId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('friends')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', friendId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting friend:', error)
      throw error
    }
  },

  // Get friend by ID
  async getFriend(friendId: string): Promise<Friend | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('id', friendId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching friend:', error)
      return null
    }

    return {
      ...data,
      days_until_birthday: calculateDaysUntilBirthday(data.birthday)
    }
  }
}

// 📞 REMINDERS OPERATIONS
export const remindersService = {
  // Get reminders for a friend
  async getFriendReminders(friendId: string): Promise<Reminder[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('friend_id', friendId)
      .eq('user_id', user.id)
      .order('reminder_date', { ascending: false })

    if (error) {
      console.error('Error fetching reminders:', error)
      throw error
    }

    return data
  },

  // Create reminder
  async createReminder(reminderData: Omit<Reminder, 'id' | 'user_id' | 'created_at'>): Promise<Reminder> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        ...reminderData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reminder:', error)
      throw error
    }

    return data
  }
}

// 🔧 UTILITY FUNCTIONS
export function calculateDaysUntilBirthday(birthday: string): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Parse birthday
  const birthDate = new Date(birthday)
  let birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate())
  
  // If birthday already passed this year, calculate for next year
  if (birthdayThisYear < today) {
    birthdayThisYear = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate())
  }
  
  // Calculate difference in days
  const diffTime = birthdayThisYear.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 📊 CONCEPT: Real-time Subscriptions (for future use)
export const subscribeToFriends = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('friends-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friends',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}
