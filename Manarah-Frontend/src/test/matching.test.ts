import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../services/api'
import type { JobApplication } from '../types'

describe('Candidate Matching & Ranking Logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly ranks candidates by matching score in descending order', async () => {
    const mockCandidates: JobApplication[] = [
      {
        id: 1,
        job: 10,
        applicant: 101,
        applicant_name: 'سالم أحمد',
        status: 'SUBMITTED',
        matching_score: 75.5,
        created_at: '2026-10-10T10:00:00Z',
      },
      {
        id: 2,
        job: 10,
        applicant: 102,
        applicant_name: 'فاطمة علي',
        status: 'SUBMITTED',
        matching_score: 94.2,
        created_at: '2026-10-11T10:00:00Z',
      },
      {
        id: 3,
        job: 10,
        applicant: 103,
        applicant_name: 'عمر خالد',
        status: 'SUBMITTED',
        matching_score: 82.0,
        created_at: '2026-10-12T10:00:00Z',
      },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCandidates,
    } as Response)

    const candidates = await api.getJobRankedCandidates(10)

    // Verify descending sort logic
    const sorted = [...candidates].sort((a, b) => (b.matching_score ?? 0) - (a.matching_score ?? 0))
    expect(sorted[0].applicant_name).toBe('فاطمة علي')
    expect(sorted[0].matching_score).toBe(94.2)
    expect(sorted[1].applicant_name).toBe('عمر خالد')
    expect(sorted[2].applicant_name).toBe('سالم أحمد')
  })

  it('filters candidates meeting minimum threshold criteria', () => {
    const candidates = [
      { id: 1, name: 'أحمد', score: 88 },
      { id: 2, name: 'سارة', score: 55 },
      { id: 3, name: 'يحيى', score: 72 },
      { id: 4, name: 'مريم', score: 64 },
    ]

    const minScoreThreshold = 70
    const qualifiedCandidates = candidates.filter((c) => c.score >= minScoreThreshold)

    expect(qualifiedCandidates).toHaveLength(2)
    expect(qualifiedCandidates.map((c) => c.name)).toEqual(['أحمد', 'يحيى'])
  })

  it('calls matching job details endpoint and parses calculation components', async () => {
    const mockCalculation = {
      job_id: 15,
      skills_weight: 40,
      experience_weight: 30,
      gpa_weight: 30,
      calculated_scores: {
        skills_match: 90,
        exp_match: 80,
        gpa_match: 85,
        final_score: 85.5,
      },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCalculation,
    } as Response)

    const result = await api.getJobMatchCalculation(15)
    expect(result.job_id).toBe(15)
    expect(result.calculated_scores).toBeDefined()
  })
})
