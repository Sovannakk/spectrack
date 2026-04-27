"use client";

import { Select } from "@/components/ui/select";
import type { ApiVersion } from "@/lib/types";

interface Props {
  versions: ApiVersion[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  exclude?: string;
}

export function VersionSelector({
  versions,
  value,
  onChange,
  placeholder,
  exclude,
}: Props) {
  const options = versions
    .filter((v) => v.id !== exclude)
    .map((v) => ({ value: v.id, label: `${v.name} (${v.status})` }));
  return (
    <Select
      options={options}
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
    />
  );
}
