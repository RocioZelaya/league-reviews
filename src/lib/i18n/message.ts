export type PluralForms = {
  one: string;
  other: string;
};

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/** Replaces `{name}` tokens; unknown tokens are left as-is so a typo is visible, not silent. */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(PLACEHOLDER_PATTERN, (token, name: string) =>
    name in values ? String(values[name]) : token,
  );
}

// Exactly-one is the only cardinal distinction English and Spanish need
// here, and it is deterministic across server and browser ICU versions.
export function plural(count: number, forms: PluralForms): string {
  return count === 1 ? forms.one : forms.other;
}

export function formatCount(count: number, forms: PluralForms): string {
  return interpolate(plural(count, forms), { count });
}
