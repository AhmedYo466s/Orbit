export default function HomePage() {
  return (
    <main className="container" style={{ paddingBlock: "var(--space-12)" }}>
      <h1
        style={{
          fontSize: "var(--text-3xl)",
          margin: 0,
          color: "var(--color-accent)",
        }}
      >
        ORBIT
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        المشروع قيد الإنشاء.
      </p>
    </main>
  );
}
