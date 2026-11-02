export interface InstanceTypeSpec {
  vcpus: number;
  memoryGiB: number;
}

// Only Graviton types that support hibernation (ADR-0003). Memory sizes the
// hibernation root volume, so a type can't be added without its spec.
export const INSTANCE_TYPES = {
  't4g.large': { vcpus: 2, memoryGiB: 8 },
  't4g.xlarge': { vcpus: 4, memoryGiB: 16 },
  'm7g.large': { vcpus: 2, memoryGiB: 8 },
  'm7g.xlarge': { vcpus: 4, memoryGiB: 16 },
  'm8g.large': { vcpus: 2, memoryGiB: 8 },
  'm8g.xlarge': { vcpus: 4, memoryGiB: 16 },
} as const satisfies Record<string, InstanceTypeSpec>;

export type InstanceType = keyof typeof INSTANCE_TYPES;

export const INSTANCE_TYPE_NAMES = Object.keys(INSTANCE_TYPES) as [
  InstanceType,
  ...InstanceType[],
];

// Space for the OS, packages and Docker images, on top of the RAM image.
export const ROOT_OS_GIB = 20;

// Hibernation writes RAM to the root volume, so it must hold the OS plus all
// of memory. Derived, never configured, so the two can't drift apart.
export function hibernationRootVolumeGiB(instanceType: InstanceType): number {
  return ROOT_OS_GIB + INSTANCE_TYPES[instanceType].memoryGiB;
}
