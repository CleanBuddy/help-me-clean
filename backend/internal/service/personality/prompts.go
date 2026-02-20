package personality

import "fmt"

// buildAnalysisPrompt creates a Romanian prompt for analyzing personality assessment results
func buildAnalysisPrompt(facetScores map[string]int, integrityAvg, workQualityAvg float64, flaggedFacets []string) string {
	return fmt.Sprintf(`Ești un psiholog organizațional specializat în evaluarea personalității pentru industria de curățenie din România.

Analizează următoarele rezultate ale testului de personalitate pentru un curator/îngrijitor care aplică pentru o poziție în echipa de curățenie.

## Context despre industrie:
- Curățenia profesională necesită **integritate înaltă** (onestitate, moralitate, altruism)
- Este esențială **calitatea muncii** (ordine, responsabilitate, autodisciplină, prudență)
- Lucrează adesea nesupravegheați în locuințele clienților
- Reprezintă compania și brandul de curățenie

## Rezultate test (scală 4-20, prag concern: <10):

**Domeniul Integritate** (media %.2f/20):
- A1 Încredere (Trust): %d/20 %s
- A2 Moralitate (Morality): %d/20 %s
- A3 Altruism (Altruism): %d/20 %s

**Domeniul Calitate Muncă** (media %.2f/20):
- C2 Ordine (Orderliness): %d/20 %s
- C3 Responsabilitate (Dutifulness): %d/20 %s
- C5 Autodisciplină (Self-Discipline): %d/20 %s
- C6 Prudență (Cautiousness): %d/20 %s

Aspecte marcate pentru atenție: %v

## Instrucțiuni:

Generează o analiză detaliată în JSON cu următoarele câmpuri:

{
  "summary": "Rezumat de 2-3 propoziții despre profilul de personalitate și potrivirea pentru rolul de curator",
  "strengths": ["3-4 puncte forte relevante pentru industria de curățenie"],
  "concerns": ["Zone de atenție sau riscuri potențiale, dacă există"],
  "teamFitAnalysis": "Evaluare detaliată (3-4 propoziții) despre cât de bine se potrivește persoana într-o echipă de curățenie profesională",
  "recommendedAction": "approve" SAU "review_carefully" SAU "reject",
  "confidence": "high" SAU "medium" SAU "low"
}

**Criterii de decizie:**
- "approve": Scoruri peste 12 la toate aspectele critice, fără flag-uri majore
- "review_carefully": Scoruri 10-12 sau flag-uri la 1-2 aspecte non-critice
- "reject": Scoruri sub 10 la aspecte critice (A2 Moralitate, C3 Responsabilitate) sau multiple flag-uri

Răspunde DOAR cu JSON valid, fără text suplimentar.`,
		integrityAvg,
		facetScores["A1"], getFlagEmoji(facetScores["A1"]),
		facetScores["A2"], getFlagEmoji(facetScores["A2"]),
		facetScores["A3"], getFlagEmoji(facetScores["A3"]),
		workQualityAvg,
		facetScores["C2"], getFlagEmoji(facetScores["C2"]),
		facetScores["C3"], getFlagEmoji(facetScores["C3"]),
		facetScores["C5"], getFlagEmoji(facetScores["C5"]),
		facetScores["C6"], getFlagEmoji(facetScores["C6"]),
		flaggedFacets,
	)
}

func getFlagEmoji(score int) string {
	if score < 10 {
		return "⚠️ RISC"
	}
	return "✅"
}
