interface Props {
  title: string;
  subtitle?: string;
  scenario: string;
  value: string;
}

export function PageHeader({ title, subtitle, scenario, value }: Props) {
  return (
    <div className="mb-6 space-y-3">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="grid gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-base">📌</span>
          <div>
            <span className="font-semibold">什么时候用</span>
            <span className="text-[var(--color-muted-foreground)]">
              {" · "}
              {scenario}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-base">💡</span>
          <div>
            <span className="font-semibold">能帮你</span>
            <span className="text-[var(--color-muted-foreground)]">
              {" · "}
              {value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
