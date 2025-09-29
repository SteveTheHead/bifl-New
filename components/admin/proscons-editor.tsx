'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'

interface ProsConsEditorProps {
  productId: string
}

export function ProsConsEditor({ productId }: ProsConsEditorProps) {
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProsConsData()
  }, [productId])

  const fetchProsConsData = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.product.pros_cons) {
          setPros(data.product.pros_cons.pros || [])
          setCons(data.product.pros_cons.cons || [])
        }
      }
    } catch (error) {
      console.error('Error fetching pros/cons:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPro = () => setPros([...pros, ''])
  const addCon = () => setCons([...cons, ''])

  const removePro = (index: number) => setPros(pros.filter((_, i) => i !== index))
  const removeCon = (index: number) => setCons(cons.filter((_, i) => i !== index))

  const updatePro = (index: number, value: string) => {
    const updated = [...pros]
    updated[index] = value
    setPros(updated)
  }

  const updateCon = (index: number, value: string) => {
    const updated = [...cons]
    updated[index] = value
    setCons(updated)
  }

  const saveProsConsList = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}/proscons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pros: pros.filter(p => p.trim()),
          cons: cons.filter(c => c.trim())
        })
      })

      if (response.ok) {
        alert('Pros and Cons saved successfully!')
      } else {
        alert('Failed to save Pros and Cons')
      }
    } catch (error) {
      console.error('Error saving pros/cons:', error)
      alert('Error saving Pros and Cons')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading Pros & Cons...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Pros & Cons</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros Column */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-700">Pros</h4>
            <button
              onClick={addPro}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus className="w-3 h-3" />
              Add Pro
            </button>
          </div>

          <div className="space-y-2">
            {pros.map((pro, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={pro}
                  onChange={(e) => updatePro(index, e.target.value)}
                  placeholder="Enter a pro..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                  onClick={() => removePro(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {pros.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No pros added yet
              </div>
            )}
          </div>
        </div>

        {/* Cons Column */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-red-700">Cons</h4>
            <button
              onClick={addCon}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Plus className="w-3 h-3" />
              Add Con
            </button>
          </div>

          <div className="space-y-2">
            {cons.map((con, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={con}
                  onChange={(e) => updateCon(index, e.target.value)}
                  placeholder="Enter a con..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                  onClick={() => removeCon(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {cons.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No cons added yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveProsConsList}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Pros & Cons'}
        </button>
      </div>
    </div>
  )
}