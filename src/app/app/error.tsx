"use client";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p className="alert alert--danger" role="alert">
        حدث خطأ غير متوقع.
      </p>
      <p>
        <button className="btn btn--ghost" type="button" onClick={reset}>
          إعادة المحاولة
        </button>
      </p>
    </div>
  );
}
