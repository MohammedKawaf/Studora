function NotificationBanner({ successMessage, errorMessage }) {
  return (
    <>
      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="error-banner">{errorMessage}</div>
      )}
    </>
  );
}

export default NotificationBanner;