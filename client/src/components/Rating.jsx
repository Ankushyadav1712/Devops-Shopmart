import './Rating.css';

export default function Rating({ value, showValue = true }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`rating-star ${i <= Math.round(value) ? '' : 'empty'}`}>
        ★
      </span>
    );
  }

  return (
    <div className="rating">
      {stars}
      {showValue && <span className="rating-value">{value}</span>}
    </div>
  );
}
