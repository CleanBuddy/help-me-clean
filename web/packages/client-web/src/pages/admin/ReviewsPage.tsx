import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Star, Trash2, MessageSquare, ChevronLeft, ChevronRight, ClipboardList, User, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ALL_REVIEWS, DELETE_REVIEW } from '@/graphql/operations';

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const reviewTypeBadge: Record<string, { label: string; variant: 'default' | 'info' }> = {
  CLIENT_REVIEW: { label: 'Client', variant: 'info' },
  COMPANY_REVIEW: { label: 'Companie', variant: 'default' },
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewType: string;
  createdAt: string;
  booking: { id: string; referenceCode: string } | null;
  reviewer: { id: string; fullName: string } | null;
}

// ─── Stars Component ────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? 'h-4 w-4 fill-accent text-accent'
              : 'h-4 w-4 text-gray-300'
          }
        />
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [page, setPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; reviewId: string }>({
    open: false,
    reviewId: '',
  });

  const variables = {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, loading } = useQuery(ALL_REVIEWS, { variables });

  const [deleteReview, { loading: deleting }] = useMutation(DELETE_REVIEW, {
    refetchQueries: [{ query: ALL_REVIEWS, variables }],
  });

  const reviews: Review[] = data?.allReviews?.reviews ?? [];
  const totalCount: number = data?.allReviews?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleDelete = async () => {
    if (!deleteModal.reviewId) return;
    await deleteReview({ variables: { id: deleteModal.reviewId } });
    setDeleteModal({ open: false, reviewId: '' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recenzii</h1>
            <p className="text-gray-500 mt-1">Moderare recenzii ale platformei.</p>
          </div>
          {totalCount > 0 && (
            <Badge variant="info">{totalCount} recenzii</Badge>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && reviews.length === 0 && (
        <Card>
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nu exista recenzii.</h3>
            <p className="text-gray-500">Recenziile vor aparea aici dupa ce clientii evalueaza serviciile.</p>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => {
            const typeBadge = reviewTypeBadge[review.reviewType] ?? {
              label: review.reviewType,
              variant: 'default' as const,
            };

            return (
              <Card key={review.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
                      <MessageSquare className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Top row: Reviewer name + Rating + Type badge */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {review.reviewer && (
                          <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                            <User className="h-3.5 w-3.5 text-gray-400" />
                            {review.reviewer.fullName}
                          </span>
                        )}
                        <StarRating rating={review.rating} />
                        <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {review.comment}
                        </p>
                      )}

                      {/* Meta row: Booking ref + Date */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        {review.booking && (
                          <span className="flex items-center gap-1">
                            <ClipboardList className="h-3.5 w-3.5" />
                            {review.booking.referenceCode}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(review.createdAt).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-gray-400 hover:text-danger"
                    onClick={() => setDeleteModal({ open: true, reviewId: review.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            {totalCount} {totalCount === 1 ? 'recenzie gasita' : 'recenzii gasite'}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-gray-700">
              Pagina {page + 1} din {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Urmator
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, reviewId: '' })}
        title="Sterge recenzie"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Esti sigur ca vrei sa stergi aceasta recenzie?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ open: false, reviewId: '' })}
            >
              Anuleaza
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Sterge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
