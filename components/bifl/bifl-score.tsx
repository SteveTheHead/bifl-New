import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BiflScoreProps {
  totalScore: number
  subscores?: {
    durability: number
    repairability: number
    warranty: number
    sustainability: number
    social: number
  }
  showDetailed?: boolean
  compact?: boolean
  className?: string
}

export function BiflScore({
  totalScore,
  subscores,
  showDetailed = false,
  compact = false,
  className = ""
}: BiflScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-yellow-500"
    if (score >= 4) return "bg-orange-500"
    return "bg-red-500"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return "default" as const
    if (score >= 6) return "secondary" as const
    return "destructive" as const
  }

  // Compact mode for product cards
  if (compact && subscores) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">BIFL Scores</span>
          <Badge variant={getScoreBadgeVariant(totalScore)} className="text-xs font-bold px-2 py-1">
            {totalScore.toFixed(1)}
          </Badge>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[
            { key: 'D', label: 'Durability', value: subscores.durability },
            { key: 'R', label: 'Repairability', value: subscores.repairability },
            { key: 'W', label: 'Warranty', value: subscores.warranty },
            { key: 'S', label: 'Sustainability', value: subscores.sustainability },
            { key: 'I', label: 'Social Impact', value: subscores.social }
          ].map(({ key, label, value }) => (
            <div key={key} className="text-center" title={`${label}: ${value.toFixed(1)}`}>
              <div className={`w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center ${getScoreColor(value)}`}>
                {key}
              </div>
              <div className="text-xs text-gray-500 mt-1">{value.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!showDetailed) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getScoreBadgeVariant(totalScore)} className="text-sm font-bold">
          {totalScore.toFixed(1)}/10
        </Badge>
        <span className="text-sm text-muted-foreground">BIFL Score</span>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>BIFL Score</span>
          <Badge variant={getScoreBadgeVariant(totalScore)} className="text-lg font-bold">
            {totalScore.toFixed(1)}/10
          </Badge>
        </CardTitle>
      </CardHeader>
      {subscores && (
        <CardContent className="space-y-3">
          {[
            { key: 'durability', label: 'Durability', value: subscores.durability },
            { key: 'repairability', label: 'Repairability', value: subscores.repairability },
            { key: 'warranty', label: 'Warranty', value: subscores.warranty },
            { key: 'sustainability', label: 'Sustainability', value: subscores.sustainability },
            { key: 'social', label: 'Social Impact', value: subscores.social }
          ].map(({ key, label, value }) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value.toFixed(1)}</span>
              </div>
              <Progress
                value={value * 10}
                className={`h-2 ${getScoreColor(value)}`}
              />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}