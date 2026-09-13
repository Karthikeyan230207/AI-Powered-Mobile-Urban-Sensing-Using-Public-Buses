export default function AlertPopup({ message = "New incident detected" }) {
  return (
    <div className="alert-popup" role="status">
      <span className="alert-popup__icon">!</span>
      <div>
        <strong>Live Alert</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}
