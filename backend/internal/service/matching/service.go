package matching

import (
	"fmt"
)

const (
	// HourMicros is the number of microseconds in one hour.
	HourMicros = int64(3_600_000_000)
	// MinuteMicros is the number of microseconds in one minute.
	MinuteMicros = int64(60_000_000)
	// BufferMicros is the default buffer time between jobs (15 minutes).
	BufferMicros = 15 * MinuteMicros
)

// TimeSlot represents a client-provided preferred time window.
type TimeSlot struct {
	StartMicros int64
	EndMicros   int64
}

// FreeInterval represents an available time block in a cleaner's day.
type FreeInterval struct {
	Start int64
	End   int64
}

// BookingSlot represents an existing booking's occupied time.
type BookingSlot struct {
	StartMicros int64
	EndMicros   int64
}

// PlacementResult represents the system-decided optimal job placement.
type PlacementResult struct {
	StartMicros int64
	EndMicros   int64
	SlotIndex   int     // which client time slot was used (0-based)
	GapScoreH   float64 // total surrounding gap in hours (lower = tighter packing)
	Found       bool
}

// MicrosToHHMM converts microseconds since midnight to "HH:MM" format.
func MicrosToHHMM(us int64) string {
	hours := us / HourMicros
	minutes := (us % HourMicros) / MinuteMicros
	return fmt.Sprintf("%02d:%02d", hours, minutes)
}

// HHMMToMicros parses "HH:MM" to microseconds since midnight.
func HHMMToMicros(s string) int64 {
	var h, m int
	fmt.Sscanf(s, "%d:%d", &h, &m)
	return int64(h)*HourMicros + int64(m)*MinuteMicros
}

// ComputeFreeIntervals calculates free time blocks within an availability window
// by subtracting existing bookings (with buffer time between jobs).
// Bookings must be sorted by start time.
func ComputeFreeIntervals(availStart, availEnd int64, bookings []BookingSlot, buffer int64) []FreeInterval {
	if availStart >= availEnd {
		return nil
	}

	var intervals []FreeInterval
	cursor := availStart

	for _, b := range bookings {
		busyStart := b.StartMicros - buffer
		busyEnd := b.EndMicros + buffer

		// Clamp to availability window.
		if busyStart < availStart {
			busyStart = availStart
		}
		if busyEnd > availEnd {
			busyEnd = availEnd
		}

		// Free time before this booking's buffer zone.
		if cursor < busyStart {
			intervals = append(intervals, FreeInterval{Start: cursor, End: busyStart})
		}

		// Advance cursor past this booking's buffer zone.
		if busyEnd > cursor {
			cursor = busyEnd
		}
	}

	// Remaining free time after last booking.
	if cursor < availEnd {
		intervals = append(intervals, FreeInterval{Start: cursor, End: availEnd})
	}

	return intervals
}

type placementCandidate struct {
	startMicros int64
	endMicros   int64
	slotIndex   int
	minGap      int64 // min(gap to left edge, gap to right edge) of free interval
	totalGap    int64 // sum of both gaps within the free interval
}

// FindOptimalPlacement finds the best position for a job within free intervals,
// considering the client's preferred time slots. For each valid intersection of
// a client slot with a free interval, it tries left-pack (flush with preceding
// booking) and right-pack (flush with following booking), then picks the
// placement that minimizes surrounding gaps for tightest daily packing.
func FindOptimalPlacement(freeIntervals []FreeInterval, clientSlots []TimeSlot, jobDurationMicros int64) PlacementResult {
	var best *placementCandidate

	for slotIdx, clientSlot := range clientSlots {
		for _, free := range freeIntervals {
			// Intersection of client slot and free interval.
			intStart := max(clientSlot.StartMicros, free.Start)
			intEnd := min(clientSlot.EndMicros, free.End)

			if intEnd-intStart < jobDurationMicros {
				continue // intersection too small for the job
			}

			// Left-pack: job starts at beginning of intersection.
			evaluatePlacement(&best, free, intStart, intStart+jobDurationMicros, slotIdx)

			// Right-pack: job ends at end of intersection.
			rightStart := intEnd - jobDurationMicros
			if rightStart != intStart { // avoid duplicate when exact fit
				evaluatePlacement(&best, free, rightStart, intEnd, slotIdx)
			}
		}
	}

	if best == nil {
		return PlacementResult{Found: false}
	}

	return PlacementResult{
		StartMicros: best.startMicros,
		EndMicros:   best.endMicros,
		SlotIndex:   best.slotIndex,
		GapScoreH:   float64(best.totalGap) / float64(HourMicros),
		Found:       true,
	}
}

func evaluatePlacement(best **placementCandidate, free FreeInterval, jobStart, jobEnd int64, slotIdx int) {
	gapBefore := jobStart - free.Start
	gapAfter := free.End - jobEnd
	minGap := min(gapBefore, gapAfter)
	totalGap := gapBefore + gapAfter

	candidate := &placementCandidate{
		startMicros: jobStart,
		endMicros:   jobEnd,
		slotIndex:   slotIdx,
		minGap:      minGap,
		totalGap:    totalGap,
	}

	if *best == nil || isBetterPlacement(candidate, *best) {
		*best = candidate
	}
}

// isBetterPlacement returns true if a is a better placement than b.
// Priority: 1) smaller min gap (prefer flush with edge), 2) smaller total gap
// (prefer tighter intervals), 3) earlier client slot index.
func isBetterPlacement(a, b *placementCandidate) bool {
	if a.minGap != b.minGap {
		return a.minGap < b.minGap
	}
	if a.totalGap != b.totalGap {
		return a.totalGap < b.totalGap
	}
	return a.slotIndex < b.slotIndex
}
