'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGoals, createGoal, updateGoalProgress, deleteGoal, getMyHeadedDepartments, getLeaderboard, GoalInput,
} from '@/services/supabase/goals-services'

export function useGoals(periodStart: string) {
  return useQuery({
    queryKey: ['goals', periodStart],
    queryFn: () => getGoals(periodStart),
    enabled: !!periodStart,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: GoalInput) => createGoal(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

export function useUpdateGoalProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newValue }: { id: string; newValue: number }) => updateGoalProgress(id, newValue),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })
}

export function useMyHeadedDepartments(userId: string) {
  return useQuery({
    queryKey: ['headed-departments', userId],
    queryFn: () => getMyHeadedDepartments(userId),
    enabled: !!userId,
  })
}

export function useLeaderboard(monthStart: string, monthEnd: string) {
  return useQuery({
    queryKey: ['leaderboard', monthStart, monthEnd],
    queryFn: () => getLeaderboard(monthStart, monthEnd),
    enabled: !!monthStart && !!monthEnd,
  })
}
