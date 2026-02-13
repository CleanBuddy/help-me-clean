package personality

// Question represents a single IPIP-NEO personality assessment item.
// Source: International Personality Item Pool (public domain).
// Romanian translations from bigfive-test.com open source (MIT license).
type Question struct {
	Number         int
	FacetCode      string // A1, A2, A3, C2, C3, C5, C6
	TextRO         string
	IsReverseKeyed bool
}

// FacetInfo describes a personality facet being assessed.
type FacetInfo struct {
	Code   string
	NameRO string
	NameEN string
	Domain string // "integrity" or "work_quality"
}

// Facets lists all 7 assessed facets.
var Facets = []FacetInfo{
	{Code: "A1", NameRO: "Încredere", NameEN: "Trust", Domain: "integrity"},
	{Code: "A2", NameRO: "Moralitate", NameEN: "Morality", Domain: "integrity"},
	{Code: "A3", NameRO: "Altruism", NameEN: "Altruism", Domain: "integrity"},
	{Code: "C2", NameRO: "Ordine", NameEN: "Orderliness", Domain: "work_quality"},
	{Code: "C3", NameRO: "Responsabilitate", NameEN: "Dutifulness", Domain: "work_quality"},
	{Code: "C5", NameRO: "Autodisciplină", NameEN: "Self-Discipline", Domain: "work_quality"},
	{Code: "C6", NameRO: "Prudență", NameEN: "Cautiousness", Domain: "work_quality"},
}

// Questions contains the 28 IPIP-NEO items (7 facets x 4 items).
// Questions are interleaved by facet so respondents don't see patterns.
var Questions = []Question{
	// Round 1: one from each facet
	{1, "A1", "Am încredere în ceilalți.", false},
	{2, "A2", "Profit de ceilalți pentru binele meu.", true},
	{3, "A3", "Iubesc să îi ajut pe ceilalți.", false},
	{4, "C2", "Îmi place să fac ordine.", false},
	{5, "C3", "Îmi țin promisiunile.", false},
	{6, "C5", "Sunt mereu pregătit.", false},
	{7, "C6", "Fac lucruri fără a mă gândi înainte.", true},

	// Round 2
	{8, "A1", "Consider că oamenii au intenții bune.", false},
	{9, "A2", "Trișez pentru beneficiul personal.", true},
	{10, "A3", "Îmi pasă de ceilalți.", false},
	{11, "C2", "Deseori uit să pun lucrurile înapoi la locul lor.", true},
	{12, "C3", "Spun adevărul.", false},
	{13, "C5", "Îmi îndeplinesc planurile.", false},
	{14, "C6", "Iau decizii pripite.", true},

	// Round 3
	{15, "A1", "Am încredere în ce spun oamenii.", false},
	{16, "A2", "Profit de ceilalți.", true},
	{17, "A3", "Sunt indiferent/ă față de sentimentele altora.", true},
	{18, "C2", "Camera mea este dezordonată.", true},
	{19, "C3", "Încalc regulile.", true},
	{20, "C5", "Pierd timpul.", true},
	{21, "C6", "Mă grăbesc în a face lucruri.", true},

	// Round 4
	{22, "A1", "Nu am încredere în oameni.", true},
	{23, "A2", "Sabotez planurile altora.", true},
	{24, "A3", "Nu am timp pentru ceilalți.", true},
	{25, "C2", "Îmi rătăcesc lucrurile.", true},
	{26, "C3", "Nu-mi țin promisiunile.", true},
	{27, "C5", "Îmi este dificil să încep activități.", true},
	{28, "C6", "Acționez fără să gândesc.", true},
}

// LikertLabelsRO are the 5-point Likert scale labels in Romanian.
var LikertLabelsRO = [5]string{
	"Dezacord total",
	"Dezacord",
	"Nici acord, nici dezacord",
	"Acord",
	"Acord total",
}

// GetQuestionByNumber returns the question with the given number, or nil.
func GetQuestionByNumber(num int) *Question {
	if num < 1 || num > len(Questions) {
		return nil
	}
	return &Questions[num-1]
}
