export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={className} role="img" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating) + '☆'.repeat(5 - rating)}
    </span>
  );
}
