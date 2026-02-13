import { Shield, Sparkles, AlertTriangle, Info } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@helpmeclean/shared';

interface PersonalityFacetScore {
  facetCode: string;
  facetName: string;
  score: number;
  maxScore: number;
  isFlagged: boolean;
}

interface PersonalityAssessment {
  id: string;
  cleanerId: string;
  facetScores: PersonalityFacetScore[];
  integrityAvg: number;
  workQualityAvg: number;
  hasConcerns: boolean;
  flaggedFacets: string[];
  completedAt: string;
}

interface PersonalityScoreCardProps {
  assessment: PersonalityAssessment | null | undefined;
  compact?: boolean;
}

export default function PersonalityScoreCard({ assessment, compact = false }: PersonalityScoreCardProps) {
  if (!assessment) {
    return (
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              În așteptarea testului de personalitate
            </p>
            <p className="text-sm text-blue-700">
              Curatorul trebuie să completeze testul de personalitate înainte de activare.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        {/* Domain Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-700">Integritate</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {assessment.integrityAvg.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">/ 20</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-medium text-gray-700">Calitate Muncă</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {assessment.workQualityAvg.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">/ 20</span>
            </p>
          </div>
        </div>

        {/* Facet Score Bars */}
        {!compact && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">Scoruri detaliate:</p>
            {assessment.facetScores.map((facet) => (
              <div key={facet.facetCode}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {facet.facetName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 tabular-nums">
                      {facet.score} / {facet.maxScore}
                    </span>
                    {facet.isFlagged && (
                      <Badge variant="danger">Risc</Badge>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      facet.isFlagged ? 'bg-red-500' : 'bg-blue-600',
                    )}
                    style={{ width: `${(facet.score / facet.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Concerns Warning */}
        {assessment.hasConcerns && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Atenție: Scoruri scăzute detectate
                </p>
                <p className="text-sm text-amber-800 mb-2">
                  Domeniile marcate: {assessment.flaggedFacets.join(', ')}
                </p>
                <p className="text-sm text-amber-700">
                  Revizuiește cu atenție înainte de aprobare.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Date */}
        <div className="text-xs text-gray-400">
          Completat la:{' '}
          {new Date(assessment.completedAt).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </Card>
  );
}
