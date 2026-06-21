import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbMocks = vi.hoisted(() => {
  const limit = vi.fn()
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))
  const updateWhere = vi.fn()
  const set = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set }))
  return { limit, where, from, select, update, set, updateWhere }
})

vi.mock('@/db/client', () => ({ db: dbMocks }))

import { getPropertyByCode, saveExperiencesGuide } from '@/db/queries'

describe('database query helpers', () => {
  beforeEach(() => {
    Object.values(dbMocks).forEach((mock) => mock.mockClear())
    dbMocks.where.mockImplementation(() => ({ limit: dbMocks.limit }))
    dbMocks.from.mockImplementation(() => ({ where: dbMocks.where }))
    dbMocks.select.mockImplementation(() => ({ from: dbMocks.from }))
    dbMocks.update.mockImplementation(() => ({ set: dbMocks.set }))
    dbMocks.set.mockImplementation(() => ({ where: dbMocks.updateWhere }))
  })

  it('normalizes lowercase and padded property codes', async () => {
    dbMocks.limit.mockResolvedValueOnce([{ code: 'FLN001' }])
    await expect(getPropertyByCode('  fln001  ')).resolves.toEqual({ code: 'FLN001' })
    expect(dbMocks.limit).toHaveBeenCalledWith(1)
    expect(dbMocks.where).toHaveBeenCalled()
  })

  it('returns null when no property is found', async () => {
    dbMocks.limit.mockResolvedValueOnce([])
    await expect(getPropertyByCode('XXX999')).resolves.toBeNull()
  })

  it('uppercases the code when saving a guide', async () => {
    dbMocks.updateWhere.mockResolvedValueOnce(undefined)
    await saveExperiencesGuide('fln001', {
      welcome_message: 'Olá', restaurants: [], attractions: [], essentials: [], seasonal_tips: 'Dica',
    })
    expect(dbMocks.update).toHaveBeenCalled()
    expect(dbMocks.updateWhere).toHaveBeenCalled()
  })
})
